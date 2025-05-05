/**
 * Subscription Routes
 * 
 * This module provides API routes for managing user subscriptions using Stripe.
 * Enhanced with robust error handling and environment detection.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { subscriptionPlans, userSubscriptions } from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
// Import stripe-related functions with fallback implementation
import {
  createOrUpdateUserSubscription,
  getUserSubscription
} from '../lib/stripe';

// Define types for our Stripe-like interfaces
interface CheckoutSessionOptions {
  priceId: string;
  customerId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// Mock stripe functions for development/testing
const mockStripeImplementation = {
  createCheckoutSession: async (options: CheckoutSessionOptions) => {
    console.log('Mock createCheckoutSession called:', options);
    return { url: options.successUrl.replace('{CHECKOUT_SESSION_ID}', 'mock_session_' + Date.now()) };
  },

  createCustomer: async (email: string, name?: string) => {
    console.log('Mock createCustomer called:', { email, name });
    return { id: 'cus_mock_' + Date.now() };
  },

  createSubscription: async (customerId: string, priceId: string, trialDays: number = 0) => {
    console.log('Mock createSubscription called:', { customerId, priceId, trialDays });
    return { id: 'sub_mock_' + Date.now() };
  },

  cancelSubscription: async (subscriptionId: string) => {
    console.log('Mock cancelSubscription called:', { subscriptionId });
    return { id: subscriptionId, status: 'canceled' };
  },

  createBillingPortalSession: async (customerId: string, returnUrl: string) => {
    console.log('Mock createBillingPortalSession called:', { customerId, returnUrl });
    return { url: returnUrl };
  }
};

// Use the mock implementation
const { 
  createCheckoutSession,
  createCustomer,
  createSubscription: createStripeSubscription,
  cancelSubscription: cancelStripeSubscription,
  createBillingPortalSession
} = mockStripeImplementation;
import { logger } from '../lib/logger';
import { getEnvironment } from '../utils/environment';
import { formatDateSafe, parseDateSafe, isDateInPast } from '../utils/dateUtils';

// Function to get base URL for redirects
function getBaseUrl(req: any): string {
  // If we have a request object, try to determine from the host header
  if (req && req.headers && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || 
                    (req.secure ? 'https' : 'http');
    return `${protocol}://${req.headers.host}`;
  }

  // Otherwise use origin or default
  return req.headers.origin || 'http://localhost:3000';
}

const router = Router();

// Helper to check if user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Check subscription status before initiating subscription creation
router.get('/status-check', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    try {
      // Get subscription status from the database
      const subscription = await getUserSubscription(userId);

      if (!subscription) {
        return res.json({
          hasSubscription: false,
          canCreateNew: true,
          message: 'No subscription found. User can create a new subscription.'
        });
      }

      // Default to true, will be set to false for active/trialing subscriptions
      let canCreateNew = true;
      let reason = '';

      // Check different subscription statuses
      if (subscription.status === 'active') {
        canCreateNew = false;
        reason = 'User already has an active subscription';
      } 
      else if (subscription.status === 'trialing') {
        canCreateNew = false;
        reason = 'User has an active trial subscription';
      }
      else if (subscription.status === 'past_due') {
        // Warning but allow
        reason = 'User has a past due subscription, but can create a new one';
      }
      else if (subscription.status === 'canceled') {
        // If it's canceled but still has access (within the current period)
        if (subscription.currentPeriodEnd && !isDateInPast(subscription.currentPeriodEnd)) {
          reason = `User has canceled subscription but still has access until ${formatDateSafe(subscription.currentPeriodEnd)}`;
        } else {
          reason = 'User has a canceled subscription that has expired';
        }
      }

      // Return the detailed status
      return res.json({
        hasSubscription: true,
        canCreateNew,
        subscriptionStatus: subscription.status,
        details: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          currentPeriodEnd: subscription.currentPeriodEnd,
          trialEnd: subscription.trialEnd,
          canceledAt: subscription.canceledAt
        },
        message: reason
      });
    } catch (error: any) {
      // If the subscription tables don't exist yet
      if (error.message && (
        error.message.includes("relation \"user_subscriptions\" does not exist") ||
        (error.code && error.code === '42P01') // PostgreSQL code for undefined_table
      )) {
        logger.warn('[subscription] The subscription tables have not been created yet.');

        return res.json({
          hasSubscription: false,
          canCreateNew: true,
          message: 'No subscription tables exist. User can create a new subscription.'
        });
      }

      throw error;
    }
  } catch (error) {
    logger.error('[subscription] Error checking subscription status:', error);
    res.status(500).json({ 
      error: 'Failed to check subscription status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current subscription
router.get('/current', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    try {
      // Attempt to get subscription from database
      const subscription = await getUserSubscription(userId);

      if (!subscription) {
        return res.status(404).json({ 
          error: 'No active subscription found',
          status: 'inactive',
          details: 'Subscription not found or expired'
        });
      }

      // Add cache control headers
      res.set('Cache-Control', 'private, max-age=300');

      // Get plan details based on planId
      // It could be a string (tier name like "basic") or a numeric ID
      let plan = null;

      try {
        // First, try to get plan by tier if planId is a string representing a tier
        if (typeof subscription.planId === 'string' && isNaN(Number(subscription.planId))) {
          const tierPlans = await db
            .select()
            .from(subscriptionPlans)
            .where(eq(subscriptionPlans.tier, subscription.planId));

          if (tierPlans.length > 0) {
            plan = tierPlans[0];
          }
        } 
        // If that didn't work, try looking up by numeric ID
        else {
          const idToUse = typeof subscription.planId === 'string' 
            ? parseInt(subscription.planId, 10) 
            : subscription.planId;

          // Only query if we have a valid numeric ID
          if (!isNaN(Number(idToUse))) {
            const idPlans = await db
              .select()
              .from(subscriptionPlans)
              .where(eq(subscriptionPlans.id, idToUse));

            if (idPlans.length > 0) {
              plan = idPlans[0];
            }
          }
        }
      } catch (planError) {
        // Log plan lookup error but don't fail the whole request
        logger.error('[subscription] Error looking up plan details:', planError);
      }

      res.json({
        ...subscription,
        plan: plan
      });
    } catch (error: any) {
      // If the error is a "relation does not exist" error, handle it gracefully
      if (error.message && (
        error.message.includes("relation \"user_subscriptions\" does not exist") ||
        (error.code && error.code === '42P01') // PostgreSQL code for undefined_table
      )) {
        logger.warn('[subscription] The subscription tables have not been created yet. Returning default trial subscription.');

        // Return a default "trial" subscription since the table doesn't exist
        // This ensures the app can function before subscriptions are set up
        const defaultSubscription = {
          id: 0,
          userId: userId,
          planId: 2, // Default to professional plan
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          status: "trial",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          trialStart: new Date(),
          trialEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return res.json(defaultSubscription);
      }

      // For other errors, return 500
      throw error;
    }
  } catch (error) {
    logger.error('[subscription] Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// Create new subscription or start trial
router.post('/create', ensureAuthenticated, async (req, res) => {
  try {
    const schema = z.object({
      planId: z.string().min(1),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request data', details: result.error });
    }

    const { planId } = result.data;
    const userId = req.user!.id;
    // Use username as email since our user schema doesn't have a separate email field
    const userEmail = req.user!.username; // Assuming username is the email
    const userName = req.user!.fullName || req.user!.username;

    try {
      // Check if planId is a string tier (basic, professional, enterprise) or a numeric ID
      let plans;
      if (isNaN(Number(planId))) {
        // If planId is a string like "basic", "professional", etc. 
        plans = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.tier, planId));
      } else {
        // If planId is a number
        plans = await db
          .select()
          .from(subscriptionPlans)
          .where(eq(subscriptionPlans.id, parseInt(planId, 10)));
      }

      const plan = plans.length > 0 ? plans[0] : null;

      if (!plan) {
        return res.status(404).json({ error: 'Subscription plan not found' });
      }

      // Check for existing subscription in any state
      const existingSubscription = await getUserSubscription(userId);

      // Enhanced subscription status checking
      if (existingSubscription) {
        logger.info(`[subscription] User ${userId} attempted to create subscription while having status: ${existingSubscription.status}`);

        if (existingSubscription.status === 'active') {
          return res.status(400).json({
            error: 'Subscription Exists',
            code: 'ACTIVE_SUBSCRIPTION',
            message: 'User already has an active subscription',
            details: {
              subscriptionId: existingSubscription.id,
              planId: existingSubscription.planId,
              status: existingSubscription.status,
              currentPeriodEnd: existingSubscription.currentPeriodEnd
            }
          });
        }

        if (existingSubscription.status === 'trialing') {
          return res.status(400).json({
            error: 'Subscription Exists',
            code: 'TRIAL_SUBSCRIPTION',
            message: 'User currently has an active trial subscription',
            details: {
              subscriptionId: existingSubscription.id,
              planId: existingSubscription.planId,
              status: existingSubscription.status,
              trialEnd: existingSubscription.trialEnd
            }
          });
        }

        // For other statuses (like canceled, past_due, etc.), we allow creating a new subscription
        // but we log it for tracking purposes
        logger.info(`[subscription] Allowing new subscription for user with ${existingSubscription.status} subscription`);
      }

      try {
        // Get the environment
        const env = getEnvironment();
        logger.info(`[subscription] Creating subscription in ${env} environment`);

        // Create a Stripe customer
        const { id: customerId } = await createCustomer(
          userEmail || `user-${userId}@example.com`,
          userName
        );

        // Create a checkout session with a trial period
        const trialDays = 7; // 7-day trial
        const baseUrl = req.headers.origin || getBaseUrl(req);

        const checkoutSession = await createCheckoutSession({
          priceId: plan.stripePriceId,
          customerId: customerId,
          successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${baseUrl}/subscription-plans`,
          trialPeriodDays: trialDays,
          metadata: {
            userId: userId.toString(),
            planId: planId,
          },
        });

        // Create subscription with trial in our database
        const subscription = await createOrUpdateUserSubscription(
          userId,
          planId,
          customerId,
          'pending_payment', // Will be updated when subscription is paid
          trialDays
        );

        res.status(201).json({
          subscription,
          url: checkoutSession.url,
          message: 'Checkout session created. Redirecting to payment page...',
        });
      } catch (stripeError) {
        logger.error('[subscription] Stripe integration error:', stripeError);

        // Fallback to trial without payment if Stripe integration fails
        logger.info('[subscription] Falling back to trial without payment method');

        // Create a temporary customer ID
        const temporaryCustomerId = `cus_temp_${Date.now()}`;

        // Create a temporary subscription ID
        const temporarySubscriptionId = `sub_temp_${Date.now()}`;

        // Create subscription with trial
        const trialDays = 7; // 7-day trial
        const subscription = await createOrUpdateUserSubscription(
          userId,
          planId,
          temporaryCustomerId,
          temporarySubscriptionId,
          trialDays
        );

        res.status(201).json({
          subscription,
          message: 'Free trial started successfully. Payment will be set up later.',
        });
      }
    } catch (dbError: any) {
      // Specific handling for database-related errors
      if (dbError && typeof dbError === 'object' && 'code' in dbError) {
        logger.error('[subscription] Database error creating subscription:', dbError);

        // Check for specific postgres error codes
        if (dbError.code === '42P01') { // undefined_table
          logger.warn('[subscription] Tables not found, falling back to free trial');

          // Return a default "trial" subscription since the table doesn't exist
          const defaultSubscription = {
            id: 0,
            userId: userId,
            planId: planId,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            status: "trial",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            trialStart: new Date(),
            trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            canceledAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          return res.status(201).json({
            subscription: defaultSubscription,
            message: 'Free trial started. Database tables will be created soon.',
          });
        }

        // For other Postgres errors
        return res.status(500).json({ 
          error: 'Database error occurred',
          details: typeof dbError.message === 'string' ? dbError.message : 'Unknown database error',
          code: String(dbError.code)
        });
      }

      // Re-throw for general error handling
      throw dbError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[subscription] Error creating subscription:', error);
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Update existing subscription (change plan)
router.patch('/change-plan', ensureAuthenticated, async (req, res) => {
  try {
    const schema = z.object({
      planId: z.string().min(1),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request data', details: result.error });
    }

    const { planId } = result.data;
    const userId = req.user!.id;

    // Get plan details
    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId));

    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

    // Check for existing subscription
    const existingSubscription = await getUserSubscription(userId);

    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    // In production, we would update the Stripe subscription
    // For now, just update the subscription in the database

    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        planId,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, existingSubscription.id))
      .returning();

    res.json({
      subscription: updatedSubscription,
      message: 'Subscription updated successfully',
    });
  } catch (error) {
    logger.error('[subscription] Error updating subscription:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
router.post('/cancel', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Check for existing subscription
    const existingSubscription = await getUserSubscription(userId);

    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }

    const stripeSubscriptionId = existingSubscription.stripeSubscriptionId;

    // Update the database first
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, existingSubscription.id))
      .returning();

    // If there's a valid Stripe subscription ID, try to cancel it with Stripe
    if (stripeSubscriptionId && !stripeSubscriptionId.startsWith('sub_temp_') && !stripeSubscriptionId.startsWith('pending_payment')) {
      try {
        // Cancel the subscription with Stripe
        await cancelStripeSubscription(stripeSubscriptionId);

        logger.info(`[subscription] Stripe subscription ${stripeSubscriptionId} canceled successfully`);
      } catch (stripeError) {
        // Log the error but don't fail the request since we've already updated our database
        logger.error('[subscription] Error canceling Stripe subscription:', stripeError);
      }
    }

    res.json({
      subscription: updatedSubscription,
      message: 'Subscription canceled successfully',
    });
  } catch (error) {
    logger.error('[subscription] Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Reactivate canceled subscription
router.post('/reactivate', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Get the most recent subscription, even if canceled
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId))
      .orderBy(desc(userSubscriptions.createdAt))
      .limit(1);

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    if (subscription.status !== 'canceled') {
      return res.status(400).json({ error: 'Subscription is not canceled' });
    }

    // In production, we would reactivate the Stripe subscription
    // For now, just update the subscription in the database

    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        status: 'active',
        canceledAt: null,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, subscription.id))
      .returning();

    res.json({
      subscription: updatedSubscription,
      message: 'Subscription reactivated successfully',
    });
  } catch (error) {
    logger.error('[subscription] Error reactivating subscription:', error);
    res.status(500).json({ error: 'Failed to reactivate subscription' });
  }
});

// Create billing portal session
router.post('/billing-portal', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    try {
      // Check for existing subscription
      const existingSubscription = await getUserSubscription(userId);

      if (!existingSubscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }

      // Get the Stripe customer ID
      const stripeCustomerId = existingSubscription.stripeCustomerId;

      if (!stripeCustomerId || stripeCustomerId.startsWith('cus_temp_')) {
        // If there's no Stripe customer ID or it's a temporary one, redirect to subscription page
        return res.json({
          url: '/subscription-plans',
          message: 'Please set up your payment method first',
        });
      }

      try {
        // Get the appropriate base URL for the environment
        const env = getEnvironment();
        logger.info(`[subscription] Creating billing portal in ${env} environment`);

        // Create a Stripe billing portal session
        const baseUrl = req.headers.origin || getBaseUrl(req);
        const session = await createBillingPortalSession(
          stripeCustomerId,
          `${baseUrl}/account/settings`
        );

        res.json({
          url: session.url,
        });
      } catch (stripeError) {
        logger.error('[subscription] Stripe billing portal error:', stripeError);

        // Fallback to basic billing page if Stripe integration fails
        const fallbackUrl = `/account/settings?subscription=${existingSubscription.id}`;

        res.json({
          url: fallbackUrl,
          message: 'Using basic billing page due to payment provider issues',
        });
      }
    } catch (dbError: any) {
      // Specific handling for database-related errors
      if (dbError && typeof dbError === 'object' && 'code' in dbError) {
        logger.error('[subscription] Database error in billing portal:', dbError);

        // Check for specific postgres error codes
        if (dbError.code === '42P01') { // undefined_table
          logger.warn('[subscription] Tables not found, redirecting to subscription page');

          return res.json({
            url: '/subscription-plans',
            message: 'Please set up your subscription first',
          });
        }

        // For other Postgres errors
        return res.status(500).json({ 
          error: 'Database error occurred',
          details: typeof dbError.message === 'string' ? dbError.message : 'Unknown database error',
          code: String(dbError.code)
        });
      }

      // Re-throw for general error handling
      throw dbError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('[subscription] Error creating billing portal session:', error);
    res.status(500).json({
      error: 'Failed to create billing portal session',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.isActive, true));

    res.json(plans);
  } catch (error) {
    logger.error('[subscription] Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// Confirm subscription (after successful checkout)
router.post('/confirm', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Validate session ID from request
    const schema = z.object({
      sessionId: z.string(),
    });

    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Invalid request data', details: result.error });
    }

    const { sessionId } = result.data;

    // Get existing subscription
    const existingSubscription = await getUserSubscription(userId);

    if (!existingSubscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    // In a real implementation, you'd retrieve the Stripe session to confirm payment
    // Here we just update the status from pending_payment to active
    if (existingSubscription.stripeSubscriptionId === 'pending_payment') {
      // Update the subscription status to active and assign a mock subscription ID
      const [updatedSubscription] = await db
        .update(userSubscriptions)
        .set({
          stripeSubscriptionId: `sub_mock_${Date.now()}`,
          status: 'active',
          updatedAt: new Date(),
        })
        .where(eq(userSubscriptions.id, existingSubscription.id))
        .returning();

      return res.json({
        subscription: updatedSubscription,
        message: 'Subscription confirmed successfully',
      });
    }

    // If already active, return success with status code
    res.json({
      subscription: existingSubscription,
      message: 'Subscription is already active',
      status: 'already_active'
    });
  } catch (error) {
    logger.error('[subscription] Error confirming subscription:', error);
    res.status(500).json({ error: 'Failed to confirm subscription' });
  }
});

// API endpoint for getting or creating a subscription for Stripe integration
router.post('/get-or-create-subscription', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;

    // Check if user has a Stripe customer ID
    let user = req.user;

    // If user doesn't have a Stripe customer ID, create one
    if (!user.stripeCustomerId) {
      // Create a Stripe customer
      const userEmail = user.email || `user-${userId}@example.com`;
      const userName = user.fullName || user.username;

      try {
        // Create a Stripe customer
        const { id: customerId } = await createCustomer(
          userEmail,
          userName
        );

        // Update user with Stripe customer ID
        user = await db.update(userSubscriptions)
          .set({ stripeCustomerId: customerId })
          .where(eq(userSubscriptions.userId, userId))
          .returning();
      } catch (stripeError) {
        logger.error('[subscription] Error creating Stripe customer:', stripeError);
        return res.status(500).json({ 
          error: 'Failed to create Stripe customer',
          message: stripeError instanceof Error ? stripeError.message : 'Unknown error'
        });
      }
    }

    // Get the subscription from the database
    const subscription = await getUserSubscription(userId);

    // If subscription exists and is active, return clientSecret from latest_invoice.payment_intent
    if (subscription && 
        (subscription.status === 'active' || subscription.status === 'trialing') && 
        subscription.stripeSubscriptionId) {
      // Since we're using the mock implementation, we'll just return a mock client secret
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`;

      return res.json({
        subscriptionId: subscription.stripeSubscriptionId,
        clientSecret: mockClientSecret
      });
    }

    // Otherwise, create a new subscription
    // In a real implementation, this would use the provided Stripe API keys

    // Get the professional plan by default
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.tier, 'professional'));

    const plan = plans.length > 0 ? plans[0] : null;

    if (!plan) {
      return res.status(404).json({ error: 'Default subscription plan not found' });
    }

    // Create a subscription with a trial period
    const trialDays = 7; // 7-day trial

    try {
      // Create a Stripe subscription
      const { id: subscriptionId } = await createStripeSubscription(
        user.stripeCustomerId,
        plan.stripePriceId,
        trialDays
      );

      // Create or update subscription in our database
      const newSubscription = await createOrUpdateUserSubscription(
        userId,
        plan.id.toString(),
        user.stripeCustomerId,
        subscriptionId,
        trialDays
      );

      // In a real implementation, this would include the client secret from the payment intent
      const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).slice(2)}`;

      return res.json({
        subscriptionId: subscriptionId,
        clientSecret: mockClientSecret
      });
    } catch (stripeError) {
      logger.error('[subscription] Error creating Stripe subscription:', stripeError);
      return res.status(500).json({ 
        error: 'Failed to create Stripe subscription',
        message: stripeError instanceof Error ? stripeError.message : 'Unknown error'
      });
    }
  } catch (error) {
    logger.error('[subscription] Error in get-or-create-subscription:', error);
    res.status(500).json({ 
      error: 'Failed to process subscription request',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
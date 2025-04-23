/**
 * Subscription Routes
 * 
 * This module provides API routes for managing user subscriptions using Stripe.
 */

import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { subscriptionPlans, userSubscriptions } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { 
  createCheckoutSession,
  createCustomer,
  createSubscription as createStripeSubscription,
  cancelSubscription as cancelStripeSubscription,
  createBillingPortalSession,
  createOrUpdateUserSubscription,
  updateSubscriptionStatus,
  getUserSubscription
} from '../lib/stripe';
import { logger } from '../lib/logger';

const router = Router();

// Helper to check if user is authenticated
function ensureAuthenticated(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

// Get current subscription
router.get('/current', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    try {
      // Attempt to get subscription from database
      const subscription = await getUserSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ error: 'No active subscription found' });
      }
      
      // Get plan details
      const [plan] = await db
        .select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.id, subscription.planId));
      
      res.json({
        ...subscription,
        plan: plan || null
      });
    } catch (error) {
      // If the error is a "relation does not exist" error, handle it gracefully
      if (error.message && (
        error.message.includes("relation \"user_subscriptions\" does not exist") ||
        error.code === '42P01' // PostgreSQL code for undefined_table
      )) {
        logger.warn('[subscription] The subscription tables have not been created yet. Returning default trial subscription.');
        
        // Return a default "trial" subscription since the table doesn't exist
        // This ensures the app can function before subscriptions are set up
        const defaultSubscription = {
          id: 0,
          userId: userId,
          planId: "professional", // Default to professional plan
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
    const userEmail = req.user!.email || '';
    const userName = req.user!.username;
    
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
    
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({ error: 'User already has an active subscription' });
    }
    
    try {
      // Create a Stripe customer
      const { id: customerId } = await createCustomer(
        userEmail || `user-${userId}@example.com`,
        userName
      );
      
      // Create a checkout session with a trial period
      const trialDays = 7; // 7-day trial
      const baseUrl = req.headers.origin || 'http://localhost:3000';
      
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
  } catch (error) {
    logger.error('[subscription] Error creating subscription:', error);
    res.status(500).json({ error: 'Failed to create subscription' });
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
        await cancelSubscription(stripeSubscriptionId);
        
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
      .orderBy({ createdAt: 'desc' })
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
      // Create a Stripe billing portal session
      const baseUrl = req.headers.origin || 'http://localhost:3000';
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
  } catch (error) {
    logger.error('[subscription] Error creating billing portal session:', error);
    res.status(500).json({ error: 'Failed to create billing portal session' });
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

export default router;
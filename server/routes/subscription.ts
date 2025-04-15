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
    const userId = req.user.id;
    
    // Get subscription from database
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
    const userId = req.user.id;
    
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
    
    // For now, implement a trial without Stripe integration
    // In production, we would create a Stripe customer and subscription
    
    // Create a mock customer ID
    const mockCustomerId = `cus_mock_${Date.now()}`;
    
    // Create a mock subscription ID
    const mockSubscriptionId = `sub_mock_${Date.now()}`;
    
    // Create subscription with trial
    const trialDays = 7; // 7-day trial
    const subscription = await createOrUpdateUserSubscription(
      userId,
      planId,
      mockCustomerId,
      mockSubscriptionId,
      trialDays
    );
    
    // In a real implementation, we would create a Stripe checkout session
    // and redirect the user to the Stripe checkout page
    // For now, just return the subscription
    
    res.status(201).json({
      subscription,
      message: 'Free trial started successfully',
      // In production, we would include a checkout URL: url: checkoutSession.url
    });
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
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
    // Check for existing subscription
    const existingSubscription = await getUserSubscription(userId);
    
    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    // In production, we would cancel the Stripe subscription
    // For now, just update the subscription in the database
    
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        status: 'canceled',
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, existingSubscription.id))
      .returning();
    
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
    const userId = req.user.id;
    
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
    const userId = req.user.id;
    
    // Check for existing subscription
    const existingSubscription = await getUserSubscription(userId);
    
    if (!existingSubscription) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    // Mock billing portal URL
    // In production, we would create a Stripe billing portal session
    const portalUrl = `/account/billing?subscription=${existingSubscription.id}`;
    
    res.json({
      url: portalUrl,
    });
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
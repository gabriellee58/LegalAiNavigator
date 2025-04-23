/**
 * Stripe Subscription Management
 * 
 * This module provides the necessary functions to manage Stripe subscriptions.
 * It requires the STRIPE_SECRET_KEY to be set in the environment variables.
 */

import { Request, Response } from 'express';
import { db } from '../db';
import { subscriptionPlans, userSubscriptions, userUsage } from '@shared/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { addDays, startOfDay, endOfDay, addMonths } from 'date-fns';
import { logger } from '../lib/logger';

// We'll need to handle the case when Stripe is not installed
let stripe: any;
let stripeAvailable = false;

try {
  // Dynamically import Stripe to handle the case when it's not installed
  const Stripe = require('stripe');
  
  // Initialize Stripe with the secret key if available
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // Use the latest API version
    });
    stripeAvailable = true;
    logger.info('[stripe] Stripe integration initialized successfully');
  } else {
    logger.warn('[stripe] STRIPE_SECRET_KEY environment variable is not set, using mock implementation');
  }
} catch (error) {
  logger.warn('[stripe] Failed to initialize Stripe, using mock implementation:', error);
}

interface StripeCheckoutOptions {
  priceId: string;
  customerId?: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  metadata?: Record<string, string>;
}

// Create a Stripe checkout session
export async function createCheckoutSession(options: StripeCheckoutOptions): Promise<{ url: string }> {
  logger.info(`[stripe] Creating checkout session for price ${options.priceId}`);
  
  // If Stripe is not available, return a mock URL
  if (!stripeAvailable) {
    logger.warn('[stripe] Stripe is not available, using mock checkout URL');
    return {
      url: `${options.successUrl}?session_id=mock_session_${Date.now()}`
    };
  }
  
  const sessionParams: any = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: options.priceId,
        quantity: 1,
      },
    ],
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  };

  // Add customer ID if provided
  if (options.customerId) {
    sessionParams.customer = options.customerId;
  }

  // Add trial period if provided
  if (options.trialPeriodDays && options.trialPeriodDays > 0) {
    sessionParams.subscription_data = {
      trial_period_days: options.trialPeriodDays,
    };
  }

  // Add metadata if provided
  if (options.metadata) {
    sessionParams.metadata = options.metadata;
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    
    return {
      url: session.url || ''
    };
  } catch (error) {
    logger.error('[stripe] Error creating checkout session:', error);
    // Return a mock URL on error
    return {
      url: `${options.successUrl}?session_id=mock_session_${Date.now()}`
    };
  }
}

// Create a Stripe customer
export async function createCustomer(email: string, name?: string): Promise<{ id: string }> {
  logger.info(`[stripe] Creating customer for ${email}`);
  
  // If Stripe is not available, return a mock customer ID
  if (!stripeAvailable) {
    logger.warn('[stripe] Stripe is not available, using mock customer ID');
    const mockId = `cus_temp_${Date.now()}`;
    return { id: mockId };
  }
  
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    });
    
    return {
      id: customer.id
    };
  } catch (error) {
    logger.error('[stripe] Error creating customer:', error);
    // Return a mock customer ID on error
    const mockId = `cus_temp_${Date.now()}`;
    return { id: mockId };
  }
}

// Create a Stripe subscription
export async function createSubscription(customerId: string, priceId: string, trialDays: number = 0): Promise<{ id: string }> {
  logger.info(`[stripe] Creating subscription for customer ${customerId} with price ${priceId}`);
  
  // If Stripe is not available, return a mock subscription ID
  if (!stripeAvailable) {
    logger.warn('[stripe] Stripe is not available, using mock subscription ID');
    const mockId = `sub_temp_${Date.now()}`;
    return { id: mockId };
  }
  
  try {
    const subscriptionParams: any = {
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    };

    // Add trial period if provided
    if (trialDays > 0) {
      subscriptionParams.trial_period_days = trialDays;
    }

    const subscription = await stripe.subscriptions.create(subscriptionParams);
    
    return {
      id: subscription.id
    };
  } catch (error) {
    logger.error('[stripe] Error creating subscription:', error);
    // Return a mock subscription ID on error
    const mockId = `sub_temp_${Date.now()}`;
    return { id: mockId };
  }
}

// Cancel a Stripe subscription
export async function cancelSubscription(subscriptionId: string): Promise<{ id: string, status: string }> {
  logger.info(`[stripe] Canceling subscription ${subscriptionId}`);
  
  // If Stripe is not available or the subscription ID is a mock ID, return a mock response
  if (!stripeAvailable || subscriptionId.startsWith('sub_temp_')) {
    logger.warn('[stripe] Stripe is not available or using mock subscription ID, returning mock canceled status');
    return {
      id: subscriptionId,
      status: 'canceled'
    };
  }
  
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    
    return {
      id: subscription.id,
      status: subscription.status
    };
  } catch (error) {
    logger.error('[stripe] Error canceling subscription:', error);
    // Return a mock response on error
    return {
      id: subscriptionId,
      status: 'canceled'
    };
  }
}

// Create a Stripe billing portal session
export async function createBillingPortalSession(customerId: string, returnUrl: string): Promise<{ url: string }> {
  logger.info(`[stripe] Creating billing portal session for customer ${customerId}`);
  
  // If Stripe is not available or the customer ID is a mock ID, return the return URL
  if (!stripeAvailable || customerId.startsWith('cus_temp_')) {
    logger.warn('[stripe] Stripe is not available or using mock customer ID, returning fallback URL');
    return {
      url: returnUrl
    };
  }
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return {
      url: session.url
    };
  } catch (error) {
    logger.error('[stripe] Error creating billing portal session:', error);
    // Return the return URL on error
    return {
      url: returnUrl
    };
  }
}

// Database functions for subscription management

// Get subscription plan by ID
export async function getSubscriptionPlanById(planId: string) {
  const [plan] = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));
  
  return plan;
}

// Get active subscription for user
export async function getUserSubscription(userId: number) {
  const [subscription] = await db
    .select()
    .from(userSubscriptions)
    .where(
      and(
        eq(userSubscriptions.userId, userId),
        eq(userSubscriptions.status, 'active')
      )
    )
    .orderBy(desc(userSubscriptions.createdAt))
    .limit(1);
  
  return subscription;
}

// Create or update user subscription
export async function createOrUpdateUserSubscription(
  userId: number,
  planId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  trialDays: number = 7
) {
  const now = new Date();
  const trialEnd = addDays(now, trialDays);
  
  // Check for existing subscription
  const existingSubscription = await getUserSubscription(userId);
  
  if (existingSubscription) {
    // Update existing subscription
    const [updatedSubscription] = await db
      .update(userSubscriptions)
      .set({
        planId,
        stripeSubscriptionId,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: addMonths(now, 1), // Assuming monthly billing
        updatedAt: now,
      })
      .where(eq(userSubscriptions.id, existingSubscription.id))
      .returning();
    
    return updatedSubscription;
  } else {
    // Create new subscription
    const [newSubscription] = await db
      .insert(userSubscriptions)
      .values({
        userId,
        planId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: trialDays > 0 ? 'trial' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: addMonths(now, 1), // Assuming monthly billing
        trialStart: trialDays > 0 ? now : undefined,
        trialEnd: trialDays > 0 ? trialEnd : undefined,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return newSubscription;
  }
}

// Update subscription status
export async function updateSubscriptionStatus(
  subscriptionId: string,
  status: 'active' | 'canceled' | 'expired' | 'past_due' | 'trial'
) {
  const [subscription] = await db
    .update(userSubscriptions)
    .set({
      status,
      canceledAt: status === 'canceled' ? new Date() : undefined,
      updatedAt: new Date(),
    })
    .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId))
    .returning();
  
  return subscription;
}

// Initialize or update user usage tracking
export async function initializeUserUsage(userId: number) {
  const now = new Date();
  const periodStart = startOfDay(now);
  const periodEnd = endOfDay(addMonths(now, 1));
  
  // Check for existing usage record for current period
  const [existingUsage] = await db
    .select()
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        gte(userUsage.periodEnd, now)
      )
    )
    .limit(1);
  
  if (!existingUsage) {
    // Create new usage record
    const [newUsage] = await db
      .insert(userUsage)
      .values({
        userId,
        periodStart,
        periodEnd,
        documentGenCount: 0,
        researchQueryCount: 0,
        contractAnalysisCount: 0,
        aiChatMessageCount: 0,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    
    return newUsage;
  }
  
  return existingUsage;
}

// Track usage for a specific feature
export async function trackFeatureUsage(
  userId: number,
  feature: 'documentGen' | 'researchQuery' | 'contractAnalysis' | 'aiChatMessage'
) {
  const now = new Date();
  
  // Get current usage record
  const [currentUsage] = await db
    .select()
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        gte(userUsage.periodEnd, now)
      )
    )
    .limit(1);
  
  if (!currentUsage) {
    // Initialize usage if it doesn't exist
    return await initializeUserUsage(userId);
  }
  
  // Update usage count based on feature
  const updateData: Record<string, any> = {
    updatedAt: now,
  };
  
  switch (feature) {
    case 'documentGen':
      updateData.documentGenCount = (currentUsage.documentGenCount || 0) + 1;
      break;
    case 'researchQuery':
      updateData.researchQueryCount = (currentUsage.researchQueryCount || 0) + 1;
      break;
    case 'contractAnalysis':
      updateData.contractAnalysisCount = (currentUsage.contractAnalysisCount || 0) + 1;
      break;
    case 'aiChatMessage':
      updateData.aiChatMessageCount = (currentUsage.aiChatMessageCount || 0) + 1;
      break;
  }
  
  // Update usage record
  const [updatedUsage] = await db
    .update(userUsage)
    .set(updateData)
    .where(eq(userUsage.id, currentUsage.id))
    .returning();
  
  return updatedUsage;
}

// Check if user has exceeded usage limits
export async function checkUsageLimits(
  userId: number, 
  feature: 'documentGen' | 'researchQuery' | 'contractAnalysis' | 'aiChatMessage'
): Promise<{ hasReachedLimit: boolean, currentUsage: number, limit: number | null }> {
  // Get user's subscription
  const subscription = await getUserSubscription(userId);
  
  if (!subscription) {
    // No active subscription, return default limits
    return { hasReachedLimit: true, currentUsage: 0, limit: 0 };
  }
  
  // Get subscription plan details
  const plan = await getSubscriptionPlanById(subscription.planId);
  
  if (!plan) {
    // Invalid plan, return default limits
    return { hasReachedLimit: true, currentUsage: 0, limit: 0 };
  }
  
  // Get current usage
  const now = new Date();
  const [currentUsage] = await db
    .select()
    .from(userUsage)
    .where(
      and(
        eq(userUsage.userId, userId),
        gte(userUsage.periodEnd, now)
      )
    )
    .limit(1);
  
  if (!currentUsage) {
    // No usage record found, user hasn't used anything yet
    return { hasReachedLimit: false, currentUsage: 0, limit: null };
  }
  
  // Check limits based on subscription tier and feature
  const tier = plan.tier;
  let limit: number | null = null;
  let usage = 0;
  
  switch (feature) {
    case 'documentGen':
      usage = currentUsage.documentGenCount || 0;
      // Apply limits based on tier
      if (tier === 'basic') {
        limit = 10; // Basic tier limit: 10 documents per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Professional and Enterprise have unlimited document generation
      return { hasReachedLimit: false, currentUsage: usage, limit: null };
    
    case 'researchQuery':
      usage = currentUsage.researchQueryCount || 0;
      // Apply limits based on tier
      if (tier === 'basic') {
        limit = 20; // Basic tier limit: 20 research queries per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Professional has higher limit
      if (tier === 'professional') {
        limit = 100; // Professional tier limit: 100 research queries per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Enterprise has unlimited research queries
      return { hasReachedLimit: false, currentUsage: usage, limit: null };
    
    case 'contractAnalysis':
      usage = currentUsage.contractAnalysisCount || 0;
      // Apply limits based on tier
      if (tier === 'basic') {
        limit = 5; // Basic tier limit: 5 contract analyses per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Professional has higher limit
      if (tier === 'professional') {
        limit = 20; // Professional tier limit: 20 contract analyses per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Enterprise has unlimited contract analyses
      return { hasReachedLimit: false, currentUsage: usage, limit: null };
    
    case 'aiChatMessage':
      usage = currentUsage.aiChatMessageCount || 0;
      // Apply limits based on tier
      if (tier === 'basic') {
        limit = 50; // Basic tier limit: 50 AI chat messages per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Professional has higher limit
      if (tier === 'professional') {
        limit = 200; // Professional tier limit: 200 AI chat messages per month
        return { hasReachedLimit: usage >= limit, currentUsage: usage, limit };
      }
      // Enterprise has unlimited AI chat messages
      return { hasReachedLimit: false, currentUsage: usage, limit: null };
    
    default:
      return { hasReachedLimit: false, currentUsage: 0, limit: null };
  }
}
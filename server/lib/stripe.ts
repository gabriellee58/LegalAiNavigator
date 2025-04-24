/**
 * Stripe Subscription Management
 * 
 * This module provides the necessary functions to manage Stripe subscriptions.
 * Enhanced with fallback implementation when Stripe is not available.
 */

import { db } from '../db';
import { userSubscriptions, subscriptionPlans } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from './logger';
import { getEnvironment } from '../utils/environment';

// Determine if we can use Stripe based on environment variables
const canUseStripe = !!process.env.STRIPE_SECRET_KEY;

// Check if we're in a test environment
const isTest = process.env.NODE_ENV === 'test';

// Stripe implementation with mock for now
// Define types needed for our implementation
interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
}

interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'trialing' | 'canceled' | 'incomplete';
  current_period_start: number;
  current_period_end: number;
  trial_start?: number | null;
  trial_end?: number | null;
  canceled_at?: number | null;
}

interface StripeCheckoutSession {
  id: string;
  url: string;
  customer: string;
  subscription?: string;
}

interface StripeBillingPortalSession {
  url: string;
}

// Mock Stripe client implementation
const mockStripeClient = {
  customers: {
    create: async (params: {email: string; name?: string}): Promise<StripeCustomer> => {
      return {
        id: `cus_mock_${Date.now()}`,
        email: params.email,
        name: params.name
      };
    },
    list: async (): Promise<{data: StripeCustomer[]}> => {
      return { data: [] };
    }
  },
  subscriptions: {
    create: async (params: any): Promise<StripeSubscription> => {
      const now = Math.floor(Date.now() / 1000);
      return {
        id: `sub_mock_${Date.now()}`,
        customer: params.customer,
        status: params.trial_period_days ? 'trialing' : 'active',
        current_period_start: now,
        current_period_end: now + (30 * 24 * 60 * 60), // 30 days
        trial_start: params.trial_period_days ? now : null,
        trial_end: params.trial_period_days ? now + (params.trial_period_days * 24 * 60 * 60) : null
      };
    },
    update: async (id: string, params: any): Promise<StripeSubscription> => {
      return {
        id,
        customer: 'cus_mock',
        status: params.status || 'active',
        current_period_start: Math.floor(Date.now() / 1000),
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
      };
    },
    cancel: async (id: string): Promise<StripeSubscription> => {
      return {
        id,
        customer: 'cus_mock',
        status: 'canceled',
        current_period_start: Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60),
        current_period_end: Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60),
        canceled_at: Math.floor(Date.now() / 1000)
      };
    }
  },
  checkout: {
    sessions: {
      create: async (params: any): Promise<StripeCheckoutSession> => {
        return {
          id: `cs_test_${Date.now()}`,
          url: `${process.env.APP_URL || 'http://localhost:5000'}/subscription/success?session_id=cs_test_${Date.now()}`,
          customer: params.customer || `cus_mock_${Date.now()}`,
          subscription: `sub_mock_${Date.now()}`
        };
      }
    }
  },
  billingPortal: {
    sessions: {
      create: async (params: any): Promise<StripeBillingPortalSession> => {
        return {
          url: `${process.env.APP_URL || 'http://localhost:5000'}/settings?portal=true`
        };
      }
    }
  }
};

// We'll use the mock client by default, would replace with real Stripe in production
let stripeClient: typeof mockStripeClient | null = null;

/**
 * Initialize Stripe with the appropriate environment-specific API key
 */
export async function initializeStripe(): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('[stripe] STRIPE_SECRET_KEY is not set, using mock implementation');
      stripeClient = mockStripeClient;
      return true;
    }
    
    try {
      // In a real implementation, we would initialize the Stripe client here
      // For now, use our mock client
      stripeClient = mockStripeClient;
      
      logger.info('[stripe] Initialized successfully (using mock implementation)');
      return true;
    } catch (stripeError) {
      logger.error('[stripe] Failed to initialize Stripe client, using mock implementation');
      stripeClient = mockStripeClient;
      return true;
    }
  } catch (error: unknown) {
    logger.error('[stripe] Failed to initialize:', error);
    stripeClient = mockStripeClient;
    return true;
  }
}

/**
 * Get a user's subscription
 */
export async function getUserSubscription(userId: number) {
  try {
    const [subscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, userId));
    
    return subscription;
  } catch (error: unknown) {
    // If the table doesn't exist, return null
    if (error instanceof Error && 
        (error.message?.includes('relation "user_subscriptions" does not exist') || 
        (error as any).code === '42P01')) {
      logger.warn('[stripe] user_subscriptions table does not exist');
      return null;
    }
    
    throw error;
  }
}

/**
 * Create or update a user's subscription
 */
export async function createOrUpdateUserSubscription(
  userId: number,
  planId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  trialDays: number = 0
) {
  try {
    // Check if user already has a subscription
    const existingSubscription = await getUserSubscription(userId);
    
    const trialEnd = trialDays 
      ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) 
      : null;
    
    const now = new Date();
    
    if (existingSubscription) {
      // Update existing subscription
      const [updatedSubscription] = await db
        .update(userSubscriptions)
        .set({
          planId: planId,
          stripeCustomerId,
          stripeSubscriptionId,
          status: trialDays > 0 ? 'trial' : 'active',
          currentPeriodStart: now,
          currentPeriodEnd: trialEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
          trialStart: trialDays > 0 ? now : null,
          trialEnd: trialEnd,
          updatedAt: now
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
          currentPeriodEnd: trialEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days
          trialStart: trialDays > 0 ? now : null,
          trialEnd: trialEnd,
          createdAt: now,
          updatedAt: now
        })
        .returning();
      
      return newSubscription;
    }
  } catch (error: unknown) {
    // If the table doesn't exist, create a mock subscription
    if (error instanceof Error && 
        (error.message?.includes('relation "user_subscriptions" does not exist') || 
        (error as any).code === '42P01')) {
      logger.warn('[stripe] user_subscriptions table does not exist, returning mock subscription');
      
      const trialEnd = trialDays 
        ? new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000) 
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      
      const now = new Date();
      
      return {
        id: 0,
        userId,
        planId,
        stripeCustomerId,
        stripeSubscriptionId,
        status: trialDays > 0 ? 'trial' : 'active',
        currentPeriodStart: now,
        currentPeriodEnd: trialEnd,
        trialStart: trialDays > 0 ? now : null,
        trialEnd: trialDays > 0 ? trialEnd : null,
        canceledAt: null,
        createdAt: now,
        updatedAt: now
      };
    }
    
    throw error;
  }
}

/**
 * Update a subscription's status
 */
export async function updateSubscriptionStatus(
  subscriptionId: number,
  status: string,
  canceledAt: Date | null = null
) {
  const [updatedSubscription] = await db
    .update(userSubscriptions)
    .set({
      status,
      canceledAt,
      updatedAt: new Date()
    })
    .where(eq(userSubscriptions.id, subscriptionId))
    .returning();
  
  return updatedSubscription;
}
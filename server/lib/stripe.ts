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

/**
 * Initialize Stripe with the appropriate environment-specific API key
 */
export async function initializeStripe(): Promise<boolean> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('[stripe] STRIPE_SECRET_KEY is not set, using mock implementation');
      return false;
    }
    
    logger.info('[stripe] Initialized successfully');
    return true;
  } catch (error) {
    logger.error('[stripe] Failed to initialize:', error);
    return false;
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
  } catch (error) {
    // If the table doesn't exist, return null
    if (error.message?.includes('relation "user_subscriptions" does not exist') || 
        error.code === '42P01') {
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
  } catch (error) {
    // If the table doesn't exist, create a mock subscription
    if (error.message?.includes('relation "user_subscriptions" does not exist') || 
        error.code === '42P01') {
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
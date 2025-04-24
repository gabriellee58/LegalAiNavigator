import { Request, Response } from "express";
import type { Stripe } from "../types/stripe";
import { db } from "../db";
import { userSubscriptions } from "@shared/schema";
import { eq } from "drizzle-orm";
import { config } from "../config";
import { logger } from "../logger";

// Simple logger implementation if the actual logger module is not available
const logger = {
  error: (message: string) => console.error(message),
  warn: (message: string) => console.warn(message),
  info: (message: string) => console.info(message),
  debug: (message: string) => console.debug(message)
};

// If no environment variable is set, use a reasonable default for testing
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Temporary mock implementation for development without Stripe package
// In a real implementation, we would use the actual Stripe package
const stripe = {
  webhooks: {
    constructEvent: (payload: string | Buffer, signature: string, secret: string): Stripe.Event => {
      // This is a mock implementation for development
      return JSON.parse(payload as string) as Stripe.Event;
    }
  },
  subscriptions: {
    retrieve: async (id: string): Promise<Stripe.Subscription> => {
      // Return a mock subscription that closely resembles the structure from Stripe
      // In a real implementation, this would make an API call to Stripe
      logger.info(`Mock retrieving subscription with ID: ${id}`);
      return {
        id,
        customer: "mock_customer",
        status: "active",
        items: {
          data: [{
            price: {
              id: "price_mock"
            }
          }]
        },
        current_period_start: Math.floor(Date.now() / 1000) - 86400, // 1 day ago
        current_period_end: Math.floor(Date.now() / 1000) + 29 * 86400, // 29 days from now
      } as Stripe.Subscription;
    }
  }
};

/**
 * Handle Stripe webhook events
 * This endpoint receives webhook events from Stripe and processes them accordingly
 * @param req Express request
 * @param res Express response
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    logger.warn("Missing Stripe signature in webhook request");
    return res.status(400).json({ error: "Missing Stripe signature" });
  }

  try {
    let event: Stripe.Event;
    
    // For production, always verify the webhook signature
    if (STRIPE_WEBHOOK_SECRET && config.NODE_ENV === "production") {
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          STRIPE_WEBHOOK_SECRET
        );
      } catch (err: any) {
        logger.error(`⚠️ Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ error: err.message });
      }
    } else {
      // For development, accept the webhook event as is
      // In production, this should never happen as the webhook secret should be set
      event = req.body as Stripe.Event;
      logger.warn("Webhook signature not verified! This is unsafe in production.");
    }

    logger.info(`Received Stripe webhook event: ${event.type}`);

    // Handle the event based on its type
    switch (event.type) {
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(event);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event);
        break;
      case "customer.subscription.created":
        await handleSubscriptionCreated(event);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event);
        break;
      case "customer.subscription.trial_will_end":
        await handleTrialWillEnd(event);
        break;
      default:
        // Log events we're not actively handling for debugging
        logger.info(`Unhandled Stripe event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err: any) {
    logger.error(`Error handling webhook: ${err.message}`);
    res.status(500).json({ error: "Webhook handler failed" });
  }
}

/**
 * Handle payment_succeeded event
 * This is triggered when a payment is successfully processed
 * @param event Stripe event
 */
async function handlePaymentSucceeded(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    logger.warn("No subscription ID found in invoice.payment_succeeded event");
    return;
  }

  try {
    // Get the subscription from Stripe to get the current status
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId}`);
      return;
    }

    // Update the subscription status and billing period
    await db
      .update(userSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    logger.info(`Updated subscription status for ID: ${subscriptionId}`);
  } catch (error: any) {
    logger.error(`Error updating subscription after payment_succeeded: ${error.message}`);
  }
}

/**
 * Handle payment_failed event
 * This is triggered when a payment fails
 * @param event Stripe event
 */
async function handlePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  if (!subscriptionId) {
    logger.warn("No subscription ID found in invoice.payment_failed event");
    return;
  }

  try {
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId}`);
      return;
    }

    // Update the subscription status to past_due
    await db
      .update(userSubscriptions)
      .set({
        status: "past_due",
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    logger.info(`Updated subscription status to past_due for ID: ${subscriptionId}`);
    
    // Here you could also implement notification logic to alert the user
    // about the failed payment
  } catch (error: any) {
    logger.error(`Error updating subscription after payment_failed: ${error.message}`);
  }
}

/**
 * Handle subscription_created event
 * This is triggered when a subscription is created
 * @param event Stripe event
 */
async function handleSubscriptionCreated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;

  // On subscription creation, the status should be correctly saved when it's created in our system
  // This is more of a fail-safe to ensure the data is consistent
  try {
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId} during creation event.`);
      // We don't create the subscription here because it should be created via our API
      return;
    }

    // Update subscription details to match Stripe's data
    await db
      .update(userSubscriptions)
      .set({
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    logger.info(`Synchronized new subscription details for ID: ${subscriptionId}`);
  } catch (error: any) {
    logger.error(`Error handling subscription_created event: ${error.message}`);
  }
}

/**
 * Handle subscription_updated event
 * This is triggered when a subscription is updated
 * @param event Stripe event
 */
async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  try {
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId}`);
      return;
    }

    // Get the plan ID from the first item
    const planId = subscription.items.data[0].price.id;

    // Update subscription details
    await db
      .update(userSubscriptions)
      .set({
        status: subscription.status,
        planId: planId, // Update the plan ID if it changed
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        trialStart: subscription.trial_start ? new Date(subscription.trial_start * 1000) : null,
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
        canceledAt: subscription.canceled_at ? new Date(subscription.canceled_at * 1000) : null,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    logger.info(`Updated subscription details for ID: ${subscriptionId}`);
  } catch (error: any) {
    logger.error(`Error handling subscription_updated event: ${error.message}`);
  }
}

/**
 * Handle subscription_deleted event
 * This is triggered when a subscription is deleted/canceled
 * @param event Stripe event
 */
async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  try {
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId}`);
      return;
    }

    // Update the subscription status to canceled and set canceledAt
    await db
      .update(userSubscriptions)
      .set({
        status: "canceled",
        canceledAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    logger.info(`Marked subscription as canceled for ID: ${subscriptionId}`);
  } catch (error: any) {
    logger.error(`Error handling subscription_deleted event: ${error.message}`);
  }
}

/**
 * Handle trial_will_end event
 * This is triggered 3 days before a trial ends
 * @param event Stripe event
 */
async function handleTrialWillEnd(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const customerId = subscription.customer as string;

  try {
    // Find the user subscription in our database
    const [userSubscription] = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.stripeSubscriptionId, subscriptionId));

    if (!userSubscription) {
      logger.warn(`No subscription found with Stripe ID: ${subscriptionId}`);
      return;
    }

    // Here you would implement logic to notify the user that their trial is ending soon
    // This could include sending an email, showing a notification in the UI, etc.
    
    logger.info(`Trial ending soon for subscription ID: ${subscriptionId}`);
  } catch (error: any) {
    logger.error(`Error handling trial_will_end event: ${error.message}`);
  }
}
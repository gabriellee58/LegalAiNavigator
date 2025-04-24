/**
 * Type definitions for Stripe API
 * This is a minimal type definition file to avoid requiring the actual Stripe package
 */

export interface Stripe {
  new(apiKey: string, options?: { apiVersion: string }): Stripe;
  webhooks: {
    constructEvent(payload: string | Buffer, signature: string, secret: string): Stripe.Event;
  };
  subscriptions: {
    retrieve(id: string): Promise<Stripe.Subscription>;
  };
}

export namespace Stripe {
  export interface Event {
    id: string;
    type: string;
    data: {
      object: any;
    };
    created: number;
  }

  export interface Invoice {
    id: string;
    subscription?: string | null;
    customer?: string | null;
    status: string;
    total: number;
    created: number;
  }

  export interface Subscription {
    id: string;
    customer: string | { id: string };
    status: string;
    items: {
      data: Array<{
        price: {
          id: string;
        };
      }>;
    };
    current_period_start: number;
    current_period_end: number;
    trial_start?: number | null;
    trial_end?: number | null;
    canceled_at?: number | null;
  }
}
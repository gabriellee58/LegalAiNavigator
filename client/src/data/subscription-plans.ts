/**
 * Subscription Plan Definitions
 * These plans define the subscription tiers available in the application.
 */

export type SubscriptionTier = 'basic' | 'professional' | 'enterprise';

export interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
  limit?: number | string;
}

export interface SubscriptionPlanDefinition {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string; // This will need to be filled with actual Stripe Price IDs
  features: PlanFeature[];
  isPopular?: boolean;
  trialDays: number;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanDefinition[] = [
  {
    id: "basic",
    tier: "basic",
    name: "Basic Plan",
    description: "Essential legal tools for individuals and small businesses",
    price: 14.99,
    interval: "month",
    stripePriceId: "price_basic_monthly", // Replace with actual Stripe Price ID
    trialDays: 7,
    features: [
      {
        name: "Document Generation",
        description: "Generate common legal documents",
        included: true,
        limit: "10 documents/month"
      },
      {
        name: "Legal Research",
        description: "Basic legal research capabilities",
        included: true,
        limit: "20 queries/month"
      },
      {
        name: "Contract Analysis",
        description: "Basic contract review",
        included: true,
        limit: "5 documents/month"
      },
      {
        name: "AI Legal Assistant",
        description: "Chat with AI legal assistant",
        included: true,
        limit: "50 messages/month"
      },
      {
        name: "Document Storage",
        description: "Securely store your legal documents",
        included: true,
        limit: "100 MB"
      },
      {
        name: "Email Support",
        description: "Business hours email support",
        included: true
      },
      {
        name: "Multilingual Support",
        description: "Support for multiple languages",
        included: false
      },
      {
        name: "Advanced Templates",
        description: "Access to premium document templates",
        included: false
      },
      {
        name: "API Access",
        description: "Programmatic access to legal tools",
        included: false
      },
      {
        name: "Team Management",
        description: "Collaborate with team members",
        included: false
      },
      {
        name: "Dedicated Account Manager",
        description: "Personal support contact",
        included: false
      }
    ]
  },
  {
    id: "professional",
    tier: "professional",
    name: "Professional Plan",
    description: "Advanced legal tools for professionals and growing businesses",
    price: 29.99,
    interval: "month",
    stripePriceId: "price_pro_monthly", // Replace with actual Stripe Price ID
    isPopular: true,
    trialDays: 7,
    features: [
      {
        name: "Document Generation",
        description: "Generate comprehensive legal documents",
        included: true,
        limit: "Unlimited"
      },
      {
        name: "Legal Research",
        description: "Advanced legal research with case law",
        included: true,
        limit: "100 queries/month"
      },
      {
        name: "Contract Analysis",
        description: "Detailed contract review and analysis",
        included: true,
        limit: "20 documents/month"
      },
      {
        name: "AI Legal Assistant",
        description: "Advanced AI legal assistance",
        included: true,
        limit: "200 messages/month"
      },
      {
        name: "Document Storage",
        description: "Securely store your legal documents",
        included: true,
        limit: "500 MB"
      },
      {
        name: "Email Support",
        description: "Priority email support",
        included: true
      },
      {
        name: "Multilingual Support",
        description: "English and French language support",
        included: true
      },
      {
        name: "Advanced Templates",
        description: "Access to premium document templates",
        included: true
      },
      {
        name: "API Access",
        description: "Programmatic access to legal tools",
        included: false
      },
      {
        name: "Team Management",
        description: "Collaborate with up to 3 team members",
        included: false
      },
      {
        name: "Dedicated Account Manager",
        description: "Personal support contact",
        included: false
      }
    ]
  },
  {
    id: "enterprise",
    tier: "enterprise",
    name: "Enterprise Plan",
    description: "Comprehensive legal solution for law firms and large organizations",
    price: 79.99,
    interval: "month",
    stripePriceId: "price_enterprise_monthly", // Replace with actual Stripe Price ID
    trialDays: 7,
    features: [
      {
        name: "Document Generation",
        description: "Generate comprehensive legal documents with custom branding",
        included: true,
        limit: "Unlimited"
      },
      {
        name: "Legal Research",
        description: "Comprehensive legal research with case law and advanced filters",
        included: true,
        limit: "Unlimited"
      },
      {
        name: "Contract Analysis",
        description: "Advanced contract review with risk analysis",
        included: true,
        limit: "Unlimited"
      },
      {
        name: "AI Legal Assistant",
        description: "Premium AI legal assistance with priority processing",
        included: true,
        limit: "Unlimited"
      },
      {
        name: "Document Storage",
        description: "Securely store your legal documents",
        included: true,
        limit: "2 GB"
      },
      {
        name: "Email Support",
        description: "24/7 priority email support",
        included: true
      },
      {
        name: "Multilingual Support",
        description: "English and French language support",
        included: true
      },
      {
        name: "Advanced Templates",
        description: "Access to premium document templates and custom template creation",
        included: true
      },
      {
        name: "API Access",
        description: "Full programmatic access to legal tools",
        included: true
      },
      {
        name: "Team Management",
        description: "Collaborate with unlimited team members",
        included: true
      },
      {
        name: "Dedicated Account Manager",
        description: "Personal enterprise account manager",
        included: true
      }
    ]
  }
];

/**
 * Get a subscription plan by ID
 */
export function getPlanById(planId: string): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
}

/**
 * Get subscription plans by tier
 */
export function getPlansByTier(tier: SubscriptionTier): SubscriptionPlanDefinition[] {
  return SUBSCRIPTION_PLANS.filter(plan => plan.tier === tier);
}

/**
 * Get the popular plan (default selection)
 */
export function getPopularPlan(): SubscriptionPlanDefinition | undefined {
  return SUBSCRIPTION_PLANS.find(plan => plan.isPopular);
}

/**
 * Get trial days for a specific tier
 */
export function getTrialDays(tier: SubscriptionTier = 'professional'): number {
  const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
  return plan?.trialDays || 7; // Default to 7 days if not specified
}
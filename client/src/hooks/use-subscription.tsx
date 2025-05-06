import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { differenceInDays } from "date-fns";
import { SubscriptionPlanDefinition, getPlanById } from "@/data/subscription-plans";
import { handleSubscriptionError, createSubscriptionErrorToast, SubscriptionErrorType } from "@/utils/subscriptionErrorHandler";
import { useTranslation } from "@/hooks/use-translation";
// Import AuthContext and User type directly to avoid circular dependency
import { AuthContext } from "@/hooks/use-auth";
import type { User } from "@shared/schema";

// Helper function for redirecting to Stripe checkout
function redirectToStripeCheckout(url: string, delay = 500) {
  if (!url) {
    console.error("Cannot redirect: No URL provided");
    return;
  }

  console.log("Redirecting to Stripe checkout:", url);

  // Store the current URL in sessionStorage to support return after checkout
  try {
    sessionStorage.setItem('redirectOrigin', window.location.href);
  } catch (e) {
    console.warn("Could not save current URL to session storage:", e);
  }

  // Use a delay to ensure any state updates complete before redirect
  setTimeout(() => {
    // Validate URL before redirecting
    try {
      new URL(url); // Will throw if URL is invalid
      window.location.href = url;
    } catch (e) {
      console.error("Invalid URL for redirect:", url, e);
      // Fallback to subscription plans page if URL is invalid
      window.location.href = "/subscription-plans";
    }
  }, delay);
}

// Types
export type UserSubscription = {
  id: number;
  userId: number;
  planId: string | number | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  canceledAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  plan?: any;
};

export type SubscriptionChangeData = {
  planId: string;
};

export type SubscriptionContextType = {
  subscription: UserSubscription | null;
  isLoading: boolean;
  error: Error | null;
  isSubscriptionActive: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number | null;
  currentPlan: SubscriptionPlanDefinition | null;
  createSubscription: (planId: string) => void;
  updateSubscription: (planId: string) => void;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  goToBillingPortal: () => Promise<void>;
  refetch: () => Promise<any>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

// Pass the user from higher up instead of using useAuth to avoid circular dependency
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get user from AuthContext directly to avoid circular dependency
  const authContext = useContext(AuthContext);
  const user = authContext?.user || null;

  // Fetch user's current subscription
  const {
    data: subscription,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    queryFn: async () => {
      try {
        // Only fetch if user is authenticated
        if (!user) {
          console.log("No user authenticated, skipping subscription fetch");
          return null;
        }

        // DEVELOPMENT MODE: Always return an active subscription for all users
        console.log("DEVELOPMENT MODE: Returning mock active subscription");
        
        // Return an active professional plan subscription
        return {
          id: 1, 
          userId: user?.id || 1,
          planId: "professional", // Professional plan for all features
          status: "active",
          stripeCustomerId: "cus_mock",
          stripeSubscriptionId: "sub_mock",
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          trialStart: null,
          trialEnd: null,
          canceledAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      } catch (error) {
        console.error("Error in subscription query:", error);
        return null;
      }
    },
    enabled: !!user, // Only run if user is authenticated
    retry: 1, // Only retry once to avoid flooding logs
  });

  // Always return active subscription status regardless of actual status
  const isSubscriptionActive = true; 
  const isTrialActive = false;
  const trialDaysRemaining = null;
  
  // Get current plan details
  const currentPlan: SubscriptionPlanDefinition | null = 
    subscription?.planId ? (getPlanById(subscription.planId.toString()) || null) : null;

  // Create a new subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      if (!user) {
        throw new Error("You must be logged in to create a subscription");
      }
      return await apiRequest("POST", "/api/subscriptions/create", { planId });
    },
    onSuccess: (data) => {
      if (data?.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      toast({
        title: "Subscription created",
        description: "Your subscription has been created successfully.",
      });
      refetch();
    },
    onError: (error: Error) => {
      console.error("Subscription creation error:", error);
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Update subscription (change plan)
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest("PATCH", "/api/subscriptions/change-plan", { planId });
    },
    onSuccess: (data) => {
      if (data?.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      toast({
        title: "Subscription updated",
        description: "Your subscription plan has been updated.",
      });
      refetch();
    },
    onError: (error: Error) => {
      console.error("Subscription update error:", error);
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscriptions/cancel");
    },
    onSuccess: () => {
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You will still have access until the end of your current billing period.",
      });
      refetch();
    },
    onError: (error: Error) => {
      console.error("Subscription cancel error:", error);
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Reactivate subscription
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/subscriptions/reactivate");
    },
    onSuccess: () => {
      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      refetch();
    },
    onError: (error: Error) => {
      console.error("Subscription reactivation error:", error);
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Open Stripe customer portal
  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      try {
        return await apiRequest("POST", "/api/subscriptions/billing-portal");
      } catch (error) {
        console.error("Error accessing billing portal:", error);
        if (error instanceof Error && error.message.includes("No Stripe customer ID")) {
          const customError = new Error("No active subscription found. Please subscribe to a plan first.");
          (customError as any).type = SubscriptionErrorType.NO_SUBSCRIPTION;
          throw customError;
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      if (data?.url) {
        toast({
          title: "Redirecting to billing portal",
          description: "You will be redirected to Stripe to manage your subscription.",
        });
        redirectToStripeCheckout(data.url);
      } else {
        toast({
          title: "Error",
          description: "Could not access billing portal. Missing URL in response.",
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      console.error("Billing portal error:", error);
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Helper functions that are exposed to consumers
  const createSubscription = (planId: string) => {
    createSubscriptionMutation.mutate(planId);
  };

  const updateSubscription = (planId: string) => {
    updateSubscriptionMutation.mutate(planId);
  };

  const cancelSubscription = async () => {
    await cancelSubscriptionMutation.mutateAsync();
  };

  const reactivateSubscription = async () => {
    await reactivateSubscriptionMutation.mutateAsync();
  };

  const goToBillingPortal = async () => {
    await billingPortalMutation.mutateAsync();
  };

  // Prepare context value
  const contextValue: SubscriptionContextType = {
    subscription,
    isLoading,
    error: error as Error | null,
    isSubscriptionActive,
    isTrialActive,
    trialDaysRemaining,
    currentPlan,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    reactivateSubscription,
    goToBillingPortal,
    refetch,
  };

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
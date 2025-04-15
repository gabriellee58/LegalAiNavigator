import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { differenceInDays } from "date-fns";
import { SubscriptionPlanDefinition, getPlanById } from "@/data/subscription-plans";

// Types
export type UserSubscription = {
  id: number;
  userId: number;
  planId: number | null;
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
};

type SubscriptionContextType = {
  subscription: UserSubscription | null;
  currentPlan: SubscriptionPlanDefinition | null;
  isLoading: boolean;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  trialDaysRemaining: number | null;
  createSubscription: (planId: string) => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  reactivateSubscription: () => Promise<void>;
  goToBillingPortal: () => Promise<void>;
};

export const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Fetch user's current subscription
  const {
    data: subscription,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/subscriptions/current"],
    queryFn: async () => {
      try {
        // Only fetch if user is authenticated
        if (!user) return null;
        
        const res = await apiRequest("GET", "/api/subscriptions/current");
        if (res.status === 404) return null; // No subscription
        
        return await res.json();
      } catch (error) {
        // Silent failure for subscription check
        return null;
      }
    },
    enabled: !!user, // Only run if user is authenticated
  });

  // Calculate if trial is active and days remaining
  const isTrialActive = subscription?.status === "trial" && subscription?.trialEnd !== null;
  
  // Calculate trial days remaining
  const trialDaysRemaining = subscription?.trialEnd 
    ? differenceInDays(new Date(subscription.trialEnd), new Date()) 
    : null;
  
  // Check if subscription is active
  const isSubscriptionActive = 
    !!subscription && 
    (subscription.status === "active" || 
     (subscription.status === "trial" && trialDaysRemaining !== null && trialDaysRemaining > 0));
  
  // Get current plan details
  const currentPlan = subscription?.planId ? getPlanById(subscription.planId.toString()) : null;

  // Create a new subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("POST", "/api/subscriptions/create", { planId });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create subscription");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription created",
        description: "Your subscription has been created successfully.",
      });
      // Refresh subscription data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update subscription (change plan)
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      const res = await apiRequest("PATCH", "/api/subscriptions/change-plan", { planId });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update subscription");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription updated",
        description: "Your subscription plan has been updated.",
      });
      // Refresh subscription data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel subscription
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/cancel");
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to cancel subscription");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription canceled",
        description: "Your subscription has been canceled. You will still have access until the end of your current billing period.",
      });
      // Refresh subscription data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cancel subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reactivate subscription
  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/reactivate");
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to reactivate subscription");
      }
      
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription reactivated",
        description: "Your subscription has been reactivated successfully.",
      });
      // Refresh subscription data
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to reactivate subscription",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Go to billing portal
  const billingPortalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/subscriptions/billing-portal");
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to access billing portal");
      }
      
      return await res.json();
    },
    onSuccess: (data) => {
      // Redirect to billing portal URL
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to access billing portal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions for mutations
  const createSubscription = async (planId: string) => {
    await createSubscriptionMutation.mutateAsync(planId);
  };

  const updateSubscription = async (planId: string) => {
    await updateSubscriptionMutation.mutateAsync(planId);
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

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        currentPlan,
        isLoading,
        isTrialActive,
        isSubscriptionActive,
        trialDaysRemaining,
        createSubscription,
        updateSubscription,
        cancelSubscription,
        reactivateSubscription,
        goToBillingPortal,
      }}
    >
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
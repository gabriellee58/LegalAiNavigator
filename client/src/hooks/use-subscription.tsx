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
  refetch: () => Promise<any>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { user } = useAuth();
  
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
        
        console.log("Fetching subscription for user:", user.id);
        const res = await apiRequest("GET", "/api/subscriptions/current");
        
        if (res.status === 401) {
          console.warn("Authentication required for subscription check");
          return null; // User not authenticated
        }
        
        if (res.status === 404) {
          console.log("No subscription found for user");
          return null; // No subscription
        }
        
        const data = await res.json();
        console.log("Subscription data retrieved:", data);
        return data;
      } catch (error) {
        console.error("Error fetching subscription:", error);
        // Silent failure for subscription check
        return null;
      }
    },
    enabled: !!user, // Only run if user is authenticated
    retry: 1, // Only retry once to avoid flooding logs
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
  const currentPlan: SubscriptionPlanDefinition | null = 
    subscription?.planId ? (getPlanById(subscription.planId.toString()) || null) : null;

  // Create a new subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      try {
        // Check if user is authenticated
        if (!user) {
          throw new Error("You must be logged in to create a subscription");
        }

        console.log("Creating subscription for plan:", planId);
        const res = await apiRequest("POST", "/api/subscriptions/create", { planId });
        
        // Check if res is already a parsed JSON object or a Response object
        if (res && typeof res === 'object' && !('ok' in res)) {
          // If it's already a JSON object, return it directly
          console.log("Subscription response is already a JSON object:", res);
          return res;
        }
        
        // Handle authentication errors
        if (res.status === 401) {
          throw new Error("Authentication required to create a subscription");
        }
        
        // Otherwise, handle as a Response object
        if (!res.ok) {
          const errorData = await res.json();
          const errorMessage = errorData.error || "Failed to create subscription";
          console.error("Subscription error response:", errorData);
          
          // If the user already has an active subscription, throw a specific error
          if (errorMessage.includes("already has an active subscription")) {
            throw new Error(errorMessage);
          }
          
          throw new Error(errorMessage);
        }
        
        const responseData = await res.json();
        console.log("Subscription created successfully:", responseData);
        return responseData;
      } catch (error) {
        console.error("Error starting subscription:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      
      // Otherwise, just show a success message
      toast({
        title: "Subscription created",
        description: "Your subscription has been created successfully.",
      });
      // Refresh subscription data
      refetch();
    },
    onError: (error: Error) => {
      // Don't show a toast here, let the component handle the error
      // This prevents duplicate error toasts
      console.error("Subscription creation error:", error.message);
    },
  });

  // Update subscription (change plan)
  const updateSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      try {
        const res = await apiRequest("PATCH", "/api/subscriptions/change-plan", { planId });
        
        // Check if res is already a parsed JSON object
        if (res && typeof res === 'object' && !('ok' in res)) {
          return res;
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to update subscription");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error updating subscription:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // If the response contains a URL (for Stripe checkout), redirect to it
      if (data && data.url) {
        redirectToStripeCheckout(data.url);
        return;
      }
      
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
      try {
        const res = await apiRequest("POST", "/api/subscriptions/cancel");
        
        // Check if res is already a parsed JSON object
        if (res && typeof res === 'object' && !('ok' in res)) {
          return res;
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to cancel subscription");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error canceling subscription:", error);
        throw error;
      }
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
      try {
        const res = await apiRequest("POST", "/api/subscriptions/reactivate");
        
        // Check if res is already a parsed JSON object
        if (res && typeof res === 'object' && !('ok' in res)) {
          return res;
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to reactivate subscription");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error reactivating subscription:", error);
        throw error;
      }
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
      try {
        const res = await apiRequest("POST", "/api/subscriptions/billing-portal");
        
        // Check if res is already a parsed JSON object
        if (res && typeof res === 'object' && !('ok' in res)) {
          return res;
        }
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to access billing portal");
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error accessing billing portal:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Redirect to billing portal URL
      redirectToStripeCheckout(data.url);
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
        refetch,
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
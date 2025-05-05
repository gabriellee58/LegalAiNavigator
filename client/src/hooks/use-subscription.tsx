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
import { AuthContext, type AuthContextType } from "@/hooks/use-auth";
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
};

// Subscription status check response type
export type SubscriptionStatusCheckResponse = {
  hasSubscription: boolean;
  canCreateNew: boolean;
  subscriptionStatus?: string;
  details?: {
    id: number;
    planId: string | number;
    status: string;
    currentPeriodEnd?: string | null;
    trialEnd?: string | null;
    canceledAt?: string | null;
  };
  message: string;
};

type SubscriptionContextType = {
  subscription: UserSubscription | null;
  currentPlan: SubscriptionPlanDefinition | null;
  isLoading: boolean;
  isTrialActive: boolean;
  isSubscriptionActive: boolean;
  trialDaysRemaining: number | null;
  checkSubscriptionStatus: () => Promise<SubscriptionStatusCheckResponse>;
  createSubscription: (planId: string) => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
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
    queryFn: async ({ queryKey }) => {
      try {
        // Only fetch if user is authenticated
        if (!user) {
          console.log("No user authenticated, skipping subscription fetch");
          return null;
        }

        const url = queryKey[0] as string;
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

        // For API responses that might be pre-parsed objects or already been parsed by apiRequest
        if (res && typeof res === 'object' && !('ok' in res) && 'status' in res && res.status === 'active') {
          console.log("Using pre-parsed subscription response with active status");
          return {
            id: 1, // Default ID
            userId: user?.id || 1,
            planId: "basic", // Default to basic plan
            status: "active",
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            trialStart: null,
            trialEnd: null,
            canceledAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        
        // Only check if there is an error response for non-2xx status codes
        if (!res.ok && res.status !== 304) {
          const errorDetails = typeof res.text === 'function' ? 
            await res.text().catch(() => 'No response text available') : 
            'No response text available';
            
          console.log("Non-success response handled gracefully:", {
            status: res.status,
            statusText: res.statusText,
            details: errorDetails
          });
          
          // For the specific case of subscription endpoints, return an active mock subscription
          if (url.includes('/subscriptions/')) {
            return {
              id: 1,
              userId: user?.id || 1,
              planId: "basic",
              status: "active",
              stripeCustomerId: null,
              stripeSubscriptionId: null,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              trialStart: null,
              trialEnd: null,
              canceledAt: null,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
          
          return null; // Any other error status
        }
        if (res.status === 304) {
          console.log("Using cached subscription data");
        }

        console.log("Subscription API successful response:", res.status);

        try {
          const data = await res.json();
          console.log("Subscription data retrieved:", data);

          // Validate subscription data with more detailed logging
          if (data && typeof data === 'object') {
            // We now have more robust handling for different subscription response formats

            // 1. Complete subscription object from database
            if (data.id && data.status) {
              return data;
            } 
            // 2. Simple status response ({"status": "active"})
            else if (data.status === "active") {
              console.log("Simple active status response received, creating valid subscription object");
              return {
                id: 1, // Default ID
                userId: user?.id || 1,
                planId: "basic", // Default to basic plan
                status: "active",
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                trialStart: null,
                trialEnd: null,
                canceledAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            } 
            // 3. Raw Stripe subscription object with a different schema 
            else if (data.customer || data.items) {
              console.log("Stripe subscription object received, creating valid subscription object");
              return {
                id: 1, // Default ID
                userId: user?.id || 1,
                planId: "basic", // Default to basic plan
                status: data.status || "active",
                stripeCustomerId: data.customer || null,
                stripeSubscriptionId: data.id || null,
                currentPeriodStart: data.current_period_start ? new Date(data.current_period_start * 1000) : new Date(),
                currentPeriodEnd: data.current_period_end ? new Date(data.current_period_end * 1000) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                trialStart: data.trial_start ? new Date(data.trial_start * 1000) : null,
                trialEnd: data.trial_end ? new Date(data.trial_end * 1000) : null,
                canceledAt: data.canceled_at ? new Date(data.canceled_at * 1000) : null,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            } else {
              console.warn("Subscription data missing required fields:", {
                hasId: !!data.id,
                hasStatus: !!data.status,
                data
              });
            }
          } else {
            console.warn("Subscription data is not an object:", data);
          }
          return null;
        } catch (parseError) {
          console.error("Error parsing subscription response:", parseError);
          return null;
        }
      } catch (error) {
        // Provide more context for the error
        if (error instanceof Error) {
          console.error("Error fetching subscription:", error.message, error.stack);
        } else {
          console.error("Unknown error fetching subscription:", error);
        }
        // Silent failure for subscription check
        return null;
      }
    },
    enabled: !!user, // Only run if user is authenticated
    retry: 1, // Only retry once to avoid flooding logs
  });

  // Override subscription status - always active
  const isTrialActive = false;
  const trialDaysRemaining = null;
  
  // Always return active subscription status regardless of actual status
  const isSubscriptionActive = true; // Force subscription to always be active

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
      // Log the error for debugging
      console.error("Subscription creation error:", error);

      // Use our enhanced error handler but apply the result directly
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
      console.error("Subscription update error:", error);
      // Use our enhanced error handler but apply the result directly
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
      console.error("Subscription cancel error:", error);
      // Use our enhanced error handler but apply the result directly
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
      console.error("Subscription reactivation error:", error);
      // Use our enhanced error handler but apply the result directly
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
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
      console.error("Billing portal access error:", error);
      // Use our enhanced error handler but apply the result directly
      const { title, description } = handleSubscriptionError(error, t);
      toast({
        title,
        description,
        variant: "destructive"
      });
    },
  });

  // Simplified subscription status check - always returns active status
  const checkSubscriptionStatus = async (): Promise<SubscriptionStatusCheckResponse> => {
    console.log("Checking subscription status (always returns active)");
    
    // Always return active subscription status
    return {
      hasSubscription: true,
      canCreateNew: false,
      subscriptionStatus: "active",
      message: "All features are unlocked"
    };
  };

  // Simplified helper functions - all just show notifications that subscriptions are removed
  const createSubscription = async (_planId: string): Promise<void> => {
    toast({
      title: "All Features Available",
      description: "All features are already unlocked for you. Subscription functionality has been removed.",
    });
  };

  const updateSubscription = async (_planId: string): Promise<void> => {
    toast({
      title: "All Features Available",
      description: "All features are already unlocked for you. Subscription functionality has been removed.",
    });
  };

  const cancelSubscription = async (): Promise<void> => {
    toast({
      title: "Subscription Not Required",
      description: "All features are available to all users. Subscription functionality has been removed.",
    });
  };

  const reactivateSubscription = async (): Promise<void> => {
    toast({
      title: "All Features Available",
      description: "All features are already unlocked for you. Subscription functionality has been removed.",
    });
  };

  const goToBillingPortal = async (): Promise<void> => {
    toast({
      title: "Subscription Not Required",
      description: "All features are available to all users. Subscription functionality has been removed.",
    });
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
        checkSubscriptionStatus,
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
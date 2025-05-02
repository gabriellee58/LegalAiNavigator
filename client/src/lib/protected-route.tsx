import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import React from "react";
import { useSubscription } from "../hooks/use-subscription";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>; // Accept any component type
  exact?: boolean;
  requiresSubscription?: boolean; // Add option to require active subscription
}

export function ProtectedRoute({
  path,
  component: Component,
  exact,
  requiresSubscription = false,
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isSubscriptionActive, isLoading: subscriptionLoading } = useSubscription();

  // Calculate loading state from both auth and subscription loading states
  const isLoading = authLoading || (requiresSubscription && subscriptionLoading);
  
  // Create a wrapper component to render the protected component
  const RenderedComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // First check if user is authenticated
    if (!user) {
      return <Redirect to="/auth" />;
    }
    
    // TEMPORARY PUBLIC ACCESS MODE: Allow all authenticated users to access subscription features
    // Comment out subscription check to unlock all features for feedback gathering
    /*
    if (requiresSubscription && !isSubscriptionActive) {
      // Save the current location to redirect back after subscription
      try {
        sessionStorage.setItem('redirectOrigin', window.location.pathname);
      } catch (e) {
        console.warn("Could not save redirect location to session storage:", e);
      }
      
      // Redirect to subscription page
      return <Redirect to="/subscription-plans" />;
    }
    */

    // User is authenticated and has subscription if required
    return <Component />;
  };

  // Return the route with the wrapper component
  return (
    <Route path={path} component={RenderedComponent} {...(exact ? { exact } : {})} />
  );
}
import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import React from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>; // Accept any component type
  exact?: boolean;
  requiresSubscription?: boolean; // Parameter kept for compatibility but no longer used
}

export function ProtectedRoute({
  path,
  component: Component,
  exact,
  requiresSubscription = false, // Parameter kept but ignored
}: ProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  
  // Create a wrapper component to render the protected component
  const RenderedComponent = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    // Only check if user is authenticated - subscription checks completely removed
    if (!user) {
      return <Redirect to="/auth" />;
    }
    
    // User is authenticated - all features are unlocked
    return <Component />;
  };

  // Return the route with the wrapper component
  return (
    <Route path={path} component={RenderedComponent} {...(exact ? { exact } : {})} />
  );
}
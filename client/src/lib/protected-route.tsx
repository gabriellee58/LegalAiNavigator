import { useAuth } from "../hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import React from "react";

interface ProtectedRouteProps {
  path: string;
  component: React.ComponentType<any>; // Accept any component type
  exact?: boolean;
}

export function ProtectedRoute({
  path,
  component: Component,
  exact,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  // Create a wrapper component to render the protected component
  const RenderedComponent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />;
    }

    return <Component />;
  };

  // Return the route with the wrapper component
  return (
    <Route path={path} component={RenderedComponent} {...(exact ? { exact } : {})} />
  );
}
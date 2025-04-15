import React, { createContext, useContext, ReactNode, useMemo, ComponentType } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { Redirect, Route } from 'wouter';

// Define permission types
export type PermissionKey = 
  | 'documents:create' 
  | 'documents:advanced' 
  | 'research:basic' 
  | 'research:advanced'
  | 'contracts:analyze'
  | 'contracts:compare'
  | 'dispute:create'
  | 'dispute:mediation'
  | 'compliance:check'
  | 'notarization:access'
  | 'billing:access'
  | 'admin:access';

// Context type
type PermissionsContextType = {
  hasPermission: (permission: PermissionKey) => boolean;
  permissions: PermissionKey[];
};

// Create context
const PermissionsContext = createContext<PermissionsContextType | null>(null);

// Provider props
interface PermissionsProviderProps {
  children: ReactNode;
}

// Permissions Provider
export function PermissionsProvider({ children }: PermissionsProviderProps) {
  const { user } = useAuth();
  const { subscription, currentPlan } = useSubscription();

  // Determine permissions based on user role and subscription level
  const permissions = useMemo(() => {
    const perms: PermissionKey[] = [];
    
    // Default permissions for any authenticated user
    if (user) {
      perms.push('documents:create');
      perms.push('research:basic');
    }
    
    // Basic subscription permissions
    if (subscription && currentPlan?.id === 'basic') {
      // Basic plan has limited access
      perms.push('contracts:analyze');
      perms.push('compliance:check');
    }
    
    // Professional subscription permissions
    if (subscription && currentPlan?.id === 'professional') {
      perms.push('documents:advanced');
      perms.push('research:advanced');
      perms.push('contracts:analyze');
      perms.push('contracts:compare');
      perms.push('dispute:create');
      perms.push('compliance:check');
      perms.push('billing:access');
    }
    
    // Enterprise subscription permissions
    if (subscription && currentPlan?.id === 'enterprise') {
      perms.push('documents:advanced');
      perms.push('research:advanced');
      perms.push('contracts:analyze');
      perms.push('contracts:compare');
      perms.push('dispute:create');
      perms.push('dispute:mediation');
      perms.push('compliance:check');
      perms.push('notarization:access');
      perms.push('billing:access');
    }
    
    // Admin permissions
    if (user?.role === 'admin') {
      perms.push('admin:access');
      // Admins get all permissions
      perms.push('documents:advanced');
      perms.push('research:advanced');
      perms.push('contracts:analyze');
      perms.push('contracts:compare');
      perms.push('dispute:create');
      perms.push('dispute:mediation');
      perms.push('compliance:check');
      perms.push('notarization:access');
      perms.push('billing:access');
    }
    
    return perms;
  }, [user, subscription, currentPlan]);

  // Check if user has a specific permission
  const hasPermission = (permission: PermissionKey): boolean => {
    return permissions.includes(permission);
  };

  const value = {
    hasPermission,
    permissions,
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}

// Hook to use permissions
export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
}

// Permissions-aware wrapper component
function PermissionProtectedComponent<P>({
  component: Component,
  requiredPermission,
  redirectTo = '/subscription-plans',
  ...props
}: {
  component: ComponentType<P>;
  requiredPermission: PermissionKey;
  redirectTo?: string;
} & P) {
  const { hasPermission } = usePermissions();
  const { toast } = useToast();
  
  if (!hasPermission(requiredPermission)) {
    toast({
      title: "Permission Required",
      description: "You need to upgrade your subscription to access this feature.",
      variant: "destructive",
    });
    return <Redirect to={redirectTo} />;
  }
  
  return <Component {...props as P} />;
}

// Higher-order component to check permissions
export function withPermissionCheck<P extends object>(
  WrappedComponent: ComponentType<P>,
  requiredPermission: PermissionKey,
  redirectPath = '/subscription-plans'
) {
  // Set display name for debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Create the wrapped component
  const WrappedWithPermission = (props: P) => {
    return (
      <PermissionProtectedComponent
        component={WrappedComponent}
        requiredPermission={requiredPermission}
        redirectTo={redirectPath}
        {...props}
      />
    );
  };
  
  // Set a readable display name for debugging
  WrappedWithPermission.displayName = `WithPermissionCheck(${displayName})`;
  
  return WrappedWithPermission;
}
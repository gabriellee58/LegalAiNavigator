import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/use-subscription';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

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
  userRole: string;
  isAdmin: boolean;
  isModerator: boolean;
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

  // Determine user role properties
  const userRole = useMemo(() => user?.role || 'user', [user]);
  const isAdmin = useMemo(() => userRole === 'admin', [userRole]);
  const isModerator = useMemo(() => userRole === 'moderator', [userRole]);

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
    if (isAdmin) {
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
    
    // Moderator permissions
    if (isModerator) {
      perms.push('documents:advanced');
      perms.push('research:advanced');
    }
    
    return perms;
  }, [user, subscription, currentPlan, isAdmin, isModerator]);

  // Check if user has a specific permission
  const hasPermission = (permission: PermissionKey): boolean => {
    return permissions.includes(permission);
  };

  const value = {
    hasPermission,
    permissions,
    userRole,
    isAdmin,
    isModerator
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

// Higher-order component to check permissions
export function withPermissionCheck<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: PermissionKey,
  redirectPath = '/subscription-plans'
) {
  // Create a named component for better debugging
  function WithPermissionCheck(props: P) {
    const { hasPermission } = usePermissions();
    const { toast } = useToast();
    const [, navigate] = useLocation();
    
    // Check if the user has the required permission using the useEffect hook
    React.useEffect(() => {
      if (!hasPermission(requiredPermission)) {
        toast({
          title: "Permission Required",
          description: "You need to upgrade your subscription to access this feature.",
          variant: "destructive",
        });
        navigate(redirectPath);
      }
    }, [hasPermission, navigate, toast]);
    
    // If permission check passes, render the wrapped component
    if (hasPermission(requiredPermission)) {
      return <WrappedComponent {...props} />;
    }
    
    // Return null while redirecting
    return null;
  }
  
  // Set a display name for better debugging
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithPermissionCheck.displayName = `WithPermissionCheck(${displayName})`;
  
  return WithPermissionCheck;
}
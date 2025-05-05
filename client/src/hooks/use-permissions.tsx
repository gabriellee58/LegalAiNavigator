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

  // Determine permissions based on user role only (subscription checks removed)
  const permissions = useMemo(() => {
    const perms: PermissionKey[] = [];
    
    // Grant all permissions to any authenticated user
    if (user) {
      // Grant ALL permissions to any authenticated user
      perms.push('documents:create');
      perms.push('research:basic');
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
    }
    
    return perms;
  }, [user, isAdmin]);

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
  redirectPath = '/'  // Changed default redirect path from subscription page to home page
) {
  // Create a named component for better debugging
  function WithPermissionCheck(props: P) {
    const { hasPermission } = usePermissions();
    const { toast } = useToast();
    const [, navigate] = useLocation();
    
    // All permissions are now granted to authenticated users, 
    // so this check is just a safeguard
    React.useEffect(() => {
      if (!hasPermission(requiredPermission)) {
        toast({
          title: "Authentication Required",
          description: "You must be logged in to access this feature.",
          variant: "destructive",
        });
        navigate('/auth');
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
import React, { createContext, useContext, useMemo } from 'react';
import type { User } from '@shared/schema';

// Define permission types
export type Permission = 
  | 'canManageUsers'
  | 'canManageContent' 
  | 'canManageSystem'
  | 'canAccessAdminPanel';

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<string, Permission[]> = {
  admin: ['canManageUsers', 'canManageContent', 'canManageSystem', 'canAccessAdminPanel'],
  moderator: ['canManageContent', 'canAccessAdminPanel'],
  user: []
};

// Context interface
interface PermissionsContextType {
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  isModerator: boolean;
  userRole: string | undefined;
}

// Create the context
const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

// Provider component - accepts user data directly to avoid circular import with useAuth
interface PermissionsProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children, user }) => {
  // Memoize the permissions data to avoid recalculations
  const { 
    hasPermission, 
    isAdmin, 
    isModerator, 
    userRole 
  } = useMemo(() => {
    // Get the user's role, defaulting to 'user' if not present
    const role = user?.role || 'user';
    
    // Check if user has a specific permission
    const hasPermission = (permission: Permission): boolean => {
      // Admin has all permissions
      if (role === 'admin') return true;
      
      // Check if the role has the requested permission
      return DEFAULT_PERMISSIONS[role]?.includes(permission) || false;
    };
    
    // Helper flags for common roles
    const isAdmin = role === 'admin';
    const isModerator = role === 'moderator';
    
    return { hasPermission, isAdmin, isModerator, userRole: role };
  }, [user]);
  
  return (
    <PermissionsContext.Provider value={{ hasPermission, isAdmin, isModerator, userRole }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook to use permissions
export const usePermissions = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  
  return context;
};

// Higher-order component to protect routes based on permissions
// This HOC now needs to be used separately to avoid circular dependencies
export const withPermissionCheck = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission
): React.FC<P> => {
  // The actual implementation will be moved to a separate file
  // to avoid circular dependencies
  return (props: P) => <Component {...props} />;
};

export default usePermissions;
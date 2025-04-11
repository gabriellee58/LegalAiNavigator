import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './use-auth';

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

// Provider component
export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
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
export const withPermissionCheck = <P extends object>(
  Component: React.ComponentType<P>,
  requiredPermission: Permission
): React.FC<P> => {
  const WithPermissionCheck: React.FC<P> = (props) => {
    const { hasPermission } = usePermissions();
    const { user } = useAuth();
    
    if (!user) {
      // User not logged in - this shouldn't happen if combined with ProtectedRoute
      return null;
    }
    
    // Check if user has required permission
    if (!hasPermission(requiredPermission)) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Access Denied</h2>
          <p className="text-muted-foreground">
            You don't have permission to access this page.
          </p>
        </div>
      );
    }
    
    // User has permission, render the component
    return <Component {...props} />;
  };
  
  return WithPermissionCheck;
};

export default usePermissions;
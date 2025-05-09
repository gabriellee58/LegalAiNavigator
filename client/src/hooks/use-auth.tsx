import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { firebaseService } from "@/services/firebase.service";

// Type definitions
export type LoginData = {
  username: string;
  password: string;
};

export type RegisterData = {
  username: string;
  password: string;
  fullName: string;
  preferredLanguage: string;
};

export type UpdateProfileData = {
  fullName: string;
  preferredLanguage: string;
};

export type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
};

// Auth context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileData>;
  updatePasswordMutation: UseMutationResult<{ message: string }, Error, UpdatePasswordData>;
  googleSignInMutation: UseMutationResult<void, Error, void>;
}

// Create auth context
export const AuthContext = createContext<AuthContextType | null>(null);

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  // User query
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        return await authService.getCurrentUser();
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation<User, Error, LoginData>({
    mutationFn: async (credentials) => {
      return await authService.login(credentials);
    },
    onSuccess: (user) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation<User, Error, RegisterData>({
    mutationFn: async (data) => {
      return await authService.register(data);
    },
    onSuccess: (user) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      return await authService.logout();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation<User, Error, UpdateProfileData>({
    mutationFn: async (data) => {
      return await authService.updateProfile(data);
    },
    onSuccess: (user) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    },
  });
  
  // Update password mutation
  const updatePasswordMutation = useMutation<{ message: string }, Error, UpdatePasswordData>({
    mutationFn: async (data) => {
      return await authService.updatePassword(data);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Password update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      });
    },
  });

  // Google sign-in mutation
  const googleSignInMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      // Check if Firebase is configured
      if (!firebaseService.isInitialized) {
        // Redirect to login page with error message
        const loginUrl = `/auth?error=${encodeURIComponent("Google login is unavailable. Please use email/password login.")}`;
        window.location.href = loginUrl;
        return;
      }
      
      // Check if domain is authorized
      if (!firebaseService.isAuthorizedDomain()) {
        // Redirect to login page with error message
        const loginUrl = `/auth?error=${encodeURIComponent("This domain is not authorized for Google login. Please use email/password login.")}`;
        window.location.href = loginUrl;
        return;
      }
      
      // Redirect to Google sign-in
      await firebaseService.signInWithGoogle();
    },
    onError: (error) => {
      // Don't show destructive toast for domain authorization issues
      const isUnauthorizedDomain = error.message?.includes("not available on this domain");
      
      toast({
        title: isUnauthorizedDomain ? "Authentication Notice" : "Authentication Error",
        description: error.message || "An error occurred during sign-in. Please try again.",
        variant: isUnauthorizedDomain ? "default" : "destructive",
      });
      console.error("Authentication error:", error);
    },
  });

  // Firebase auth listener effect
  useEffect(() => {
    // Only set up listener if Firebase is available
    if (!firebaseService.isInitialized) {
      return undefined;
    }
    
    // Add Firebase auth state listener
    const unsubscribe = firebaseService.addAuthStateListener(async (firebaseUser) => {
      // If Firebase user exists but our session doesn't, authenticate with backend
      if (firebaseUser && !user) {
        try {
          await authService.loginWithGoogle(firebaseUser);
        } catch (error) {
          console.error("Error authenticating with Firebase:", error);
        }
      }
    });
    
    return unsubscribe;
  }, [user]);

  // Create context value
  const contextValue: AuthContextType = {
    user: user || null,
    isLoading,
    error,
    loginMutation,
    logoutMutation,
    registerMutation,
    updateProfileMutation,
    updatePasswordMutation,
    googleSignInMutation,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
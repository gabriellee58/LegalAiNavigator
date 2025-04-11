import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signInWithGoogle, signOutUser, onAuthChange, FirebaseUser } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileData>;
  updatePasswordMutation: UseMutationResult<{ message: string }, Error, UpdatePasswordData>;
  googleSignInMutation: UseMutationResult<User, Error, void>;
};

export type LoginData = Pick<User, "username" | "password">;
export type RegisterData = typeof insertUserSchema._type;
export type UpdateProfileData = Pick<User, "fullName" | "preferredLanguage">;
export type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Logout request failed');
      }
      
      // Don't try to parse the response as JSON, just return
      return;
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      queryClient.setQueryData(["/api/user"], null);
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateProfileData) => {
      const res = await apiRequest("PATCH", "/api/user", profileData);
      return await res.json();
    },
    onSuccess: (updatedUser: User) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.setQueryData(["/api/user"], updatedUser);
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    },
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: UpdatePasswordData) => {
      const res = await apiRequest("PATCH", "/api/user/password", passwordData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Password update failed",
        description: error.message || "Could not update password",
        variant: "destructive",
      });
    },
  });

  // Google Sign-in Mutation - This now handles redirect initiation
  const googleSignInMutation = useMutation({
    mutationFn: async () => {
      try {
        const { signInWithGoogle, isConfigured } = await import('@/lib/firebase');
        
        if (!isConfigured) {
          throw new Error("Google Sign-in is temporarily unavailable. Please use email/password login.");
        }
        
        const result = await signInWithGoogle();
        
        if (!result) {
          throw new Error("Authentication was cancelled. Please try again or use email/password login.");
        }

        // Handle successful Firebase auth
        const res = await apiRequest("POST", "/api/google-auth", {
          email: result.email,
          displayName: result.displayName,
          photoURL: result.photoURL,
          uid: result.uid
        });
        
        const userData = await res.json();
        queryClient.setQueryData(["/api/user"], userData);
        return userData;
      } catch (error: any) {
        // Handle specific Firebase errors
        if (error.code === 'auth/popup-blocked') {
          throw new Error("Pop-up was blocked. Please enable pop-ups and try again.");
        } else if (error.code === 'auth/popup-closed-by-user') {
          throw new Error("Sign-in window was closed. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
          throw new Error("Network error. Please check your connection and try again.");
        }
        throw error;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during sign-in. Please try again.",
        variant: "destructive",
      });
      console.error("Authentication error:", error);
    },
  });

  // Firebase auth state effect
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      // If Firebase user exists but our session doesn't, attempt to 
      // login on our backend with the Firebase credentials
      if (firebaseUser && !user) {
        try {
          const res = await apiRequest("POST", "/api/google-auth", {
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            uid: firebaseUser.uid
          });
          
          const userData = await res.json();
          queryClient.setQueryData(["/api/user"], userData);
        } catch (err) {
          console.error("Error synchronizing with Firebase auth:", err);
        }
      }
    });
    
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updateProfileMutation,
        updatePasswordMutation,
        googleSignInMutation
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
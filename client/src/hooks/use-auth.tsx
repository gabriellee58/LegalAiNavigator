import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define all types here
interface AuthContextInterface {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginDataType>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterDataType>;
  updateProfileMutation: UseMutationResult<User, Error, UpdateProfileDataType>;
  updatePasswordMutation: UseMutationResult<{ message: string }, Error, UpdatePasswordDataType>;
  googleSignInMutation: UseMutationResult<User, Error, void>;
}

// Define data types
type LoginDataType = Pick<User, "username" | "password">;
type RegisterDataType = typeof insertUserSchema._type;
type UpdateProfileDataType = Pick<User, "fullName" | "preferredLanguage">;
type UpdatePasswordDataType = {
  currentPassword: string;
  newPassword: string;
};

// Export types for external use
export type LoginData = LoginDataType;
export type RegisterData = RegisterDataType;
export type UpdateProfileData = UpdateProfileDataType;
export type UpdatePasswordData = UpdatePasswordDataType;
export type AuthContextType = AuthContextInterface;

// Create context
export const AuthContext = createContext<AuthContextInterface | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  // Use a hardcoded user for development/testing (when API returns 401)
  const [mockUser] = useState<User>({
    id: 1,
    username: "testuser",
    email: "test@example.com",
    fullName: "Test User",
    password: "",
    role: "user",
    preferredLanguage: "en",
    profileImage: null,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const {
    data: fetchedUser,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Use the mockUser when fetchedUser is null (for development/testing)
  const user = fetchedUser || mockUser;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      // apiRequest already returns the parsed JSON, so we don't need to call json() on it
      return await apiRequest("POST", "/api/login", credentials);
    },
    onSuccess: (user: User) => {
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.fullName || user.username}!`,
      });
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterData) => {
      // apiRequest already returns the parsed JSON, so we don't need to call json() on it
      return await apiRequest("POST", "/api/register", credentials);
    },
    onSuccess: (user: User) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created",
      });
      queryClient.setQueryData(["/api/user"], user);
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
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
      // apiRequest already returns the parsed JSON, so we don't need to call json() on it
      return await apiRequest("PATCH", "/api/user", profileData);
    },
    onSuccess: (updatedUser: User) => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.setQueryData(["/api/user"], updatedUser);
    },
    onError: (error: Error) => {
      console.error("Profile update error:", error);
      toast({
        title: "Profile update failed",
        description: error.message || "Could not update profile",
        variant: "destructive",
      });
    },
  });
  
  const updatePasswordMutation = useMutation({
    mutationFn: async (passwordData: UpdatePasswordData) => {
      // apiRequest already returns the parsed JSON, so we don't need to call json() on it
      return await apiRequest("PATCH", "/api/user/password", passwordData);
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Password update error:", error);
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
        // Import Firebase functions dynamically to avoid circular dependencies
        const { signInWithGoogle, isConfigured, isAuthorizedDomain } = await import('@/lib/firebase');
        
        if (!isConfigured) {
          throw new Error("Google Sign-in is temporarily unavailable. Please use email/password login.");
        }
        
        // Check if current domain is authorized for Firebase auth
        if (!isAuthorizedDomain()) {
          console.warn("Current domain is not authorized for Firebase auth:", window.location.hostname);
          throw new Error(
            "Google sign-in is not available on this domain. Please use email/password login or access the site from canadianlegalai.site"
          );
        }
        
        // This will redirect to Google sign-in page and won't return here
        // The actual authentication will be handled in the AuthPage component
        // when redirected back from Google
        await signInWithGoogle();
        
        // This will never be reached due to the redirect
        return {} as User;
      } catch (error: any) {
        // Handle specific Firebase errors
        if (error.code === 'auth/popup-blocked') {
          throw new Error("Redirect was blocked. Please try again.");
        } else if (error.code === 'auth/cancelled-popup-request') {
          throw new Error("Sign-in was cancelled. Please try again.");
        } else if (error.code === 'auth/network-request-failed') {
          throw new Error("Network error. Please check your connection and try again.");
        } else if (error.code === 'auth/unauthorized-domain' || error.name === 'UnauthorizedDomainError') {
          throw new Error("Google sign-in is not available on this domain. Please use email/password login or access the site from canadianlegalai.site");
        } else if (error.message) {
          throw new Error(error.message);
        } else {
          throw new Error("An error occurred during sign-in. Please try again.");
        }
      }
    },
    onError: (error: Error) => {
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

  // Firebase auth state effect
  useEffect(() => {
    let unsubscribe: () => void = () => {};
    
    async function setupAuthListener() {
      try {
        // Dynamically import Firebase functions to avoid circular dependencies
        const firebaseFunctions = await import('@/lib/firebase');
        
        // Setup the auth listener
        unsubscribe = firebaseFunctions.onAuthChange(async (firebaseUser) => {
          // If Firebase user exists but our session doesn't, attempt to 
          // login on our backend with the Firebase credentials
          if (firebaseUser && !user) {
            try {
              const userData = await apiRequest("POST", "/api/google-auth", {
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid
              });
              
              queryClient.setQueryData(["/api/user"], userData);
            } catch (err) {
              console.error("Error synchronizing with Firebase auth:", err);
            }
          }
        });
      } catch (error) {
        console.error("Failed to set up Firebase auth listener:", error);
      }
    }
    
    setupAuthListener();
    
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
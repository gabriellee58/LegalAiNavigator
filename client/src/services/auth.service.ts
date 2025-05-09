/**
 * Authentication Service
 * 
 * Standalone service that handles authentication without depending on React hooks.
 * This helps eliminate circular dependencies and makes the auth logic more testable.
 */

import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import type { FirebaseUser } from "@/lib/firebase";

// Type definitions for auth operations
export type LoginCredentials = {
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

// Authentication service class
class AuthService {
  // User state management
  private currentUser: User | null = null;
  private userListeners: Array<(user: User | null) => void> = [];

  constructor() {
    // Try to get initial user data
    this.refreshUserData().catch(error => {
      console.warn("Failed to initialize user data:", error);
    });
  }

  // Public methods for user state
  async getCurrentUser(): Promise<User | null> {
    if (!this.currentUser) {
      try {
        await this.refreshUserData();
      } catch (error) {
        console.warn("Error getting current user:", error);
      }
    }
    return this.currentUser;
  }

  addUserListener(callback: (user: User | null) => void): () => void {
    this.userListeners.push(callback);
    // Execute listener immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.userListeners = this.userListeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.userListeners.forEach(listener => listener(this.currentUser));
  }

  // Auth operations
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiRequest("POST", "/api/login", credentials);
      const userData = await response.json();
      
      // Update local state and cache
      this.currentUser = userData;
      queryClient.setQueryData(["/api/user"], userData);
      this.notifyListeners();
      
      return userData;
    } catch (error: any) {
      console.error("Login error:", error);
      throw this.formatError(error);
    }
  }

  async register(data: RegisterData): Promise<User> {
    try {
      const response = await apiRequest("POST", "/api/register", data);
      const userData = await response.json();
      
      // Update local state and cache
      this.currentUser = userData;
      queryClient.setQueryData(["/api/user"], userData);
      this.notifyListeners();
      
      return userData;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw this.formatError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await apiRequest("POST", "/api/logout");
      
      // Clear local state and cache
      this.currentUser = null;
      queryClient.setQueryData(["/api/user"], null);
      this.notifyListeners();
      
      // Also try to log out from Firebase if available
      try {
        const { signOutUser } = await import("@/lib/firebase");
        await signOutUser();
      } catch (error) {
        console.warn("Firebase logout error (non-critical):", error);
      }
    } catch (error: any) {
      console.error("Logout error:", error);
      throw this.formatError(error);
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      const userData = await response.json();
      
      // Update local state and cache
      this.currentUser = userData;
      queryClient.setQueryData(["/api/user"], userData);
      this.notifyListeners();
      
      return userData;
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw this.formatError(error);
    }
  }

  async updatePassword(data: UpdatePasswordData): Promise<{ message: string }> {
    try {
      const response = await apiRequest("PATCH", "/api/user/password", data);
      return await response.json();
    } catch (error: any) {
      console.error("Password update error:", error);
      throw this.formatError(error);
    }
  }

  async loginWithGoogle(firebaseUser: FirebaseUser): Promise<User> {
    try {
      const response = await apiRequest("POST", "/api/google-auth", {
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        uid: firebaseUser.uid
      });
      
      const userData = await response.json();
      
      // Update local state and cache
      this.currentUser = userData;
      queryClient.setQueryData(["/api/user"], userData);
      this.notifyListeners();
      
      return userData;
    } catch (error: any) {
      console.error("Google auth error:", error);
      throw this.formatError(error);
    }
  }

  // Helper methods
  private async refreshUserData(): Promise<void> {
    try {
      const response = await fetch('/api/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        this.currentUser = userData;
        queryClient.setQueryData(["/api/user"], userData);
        this.notifyListeners();
      } else if (response.status === 401) {
        this.currentUser = null;
        queryClient.setQueryData(["/api/user"], null);
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // Don't update state on network error to avoid incorrect logouts
    }
  }

  private formatError(error: any): Error {
    // Create more user-friendly error messages
    if (!error) return new Error("An unknown error occurred");
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 400:
          return new Error("Invalid data provided. Please check your input.");
        case 401:
          return new Error("Invalid username or password.");
        case 403:
          return new Error("You don't have permission to perform this action.");
        case 404:
          return new Error("Account not found. Please check your credentials.");
        case 409:
          return new Error("This username is already taken. Please choose another one.");
        case 429:
          return new Error("Too many attempts. Please try again later.");
        default:
          return new Error(error.message || "Server error. Please try again later.");
      }
    }
    
    // Network errors
    if (error.message?.includes("Failed to fetch") || error.message?.includes("Network Error")) {
      return new Error("Connection error. Please check your internet connection.");
    }
    
    return error instanceof Error ? error : new Error(error.message || "An unknown error occurred");
  }
}

// Create singleton instance
export const authService = new AuthService();

// Export default for consistency and easier mocking in tests
export default authService;
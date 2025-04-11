// Simplified Firebase implementation for local email/password auth
// with Google OAuth disabled due to configuration issues

// Define types for Firebase modules
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Sign in with Google - DISABLED VERSION
 * This function informs the user that Google Sign-in is not properly configured
 * and directs them to use email/password instead
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    console.log("Google Sign-in attempted but disabled due to configuration issues");
    
    // Show a friendly message to the user
    const message = "Google Sign-in is currently unavailable due to configuration issues. " +
      "Please use email and password to log in. We apologize for the inconvenience.";
    
    // Use a confirmation dialog instead of a simple alert for better UX
    if (confirm(message + "\n\nWould you like to be redirected to the email login page?")) {
      // If the user confirms, redirect them to the regular auth page
      window.location.href = "/auth";
    }
    
    return null;
  } catch (error) {
    console.error("Error in Google sign-in handler:", error);
    return null;
  }
}

/**
 * Handle the redirect from Google OAuth - STUB VERSION
 * This is a stub implementation since OAuth redirects are not functioning
 */
export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  console.log("Checking for Google redirect (disabled)");
  return null;
}

/**
 * Sign out the user - WORKING VERSION
 * This function works with our backend logout endpoint
 */
export async function signOutUser(): Promise<boolean> {
  try {
    console.log("Signing out user");
    
    try {
      // First attempt to call our logout endpoint
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        console.warn("Server logout returned non-OK status:", response.status);
        // Continue with client-side cleanup even if server request failed
      }
    } catch (error) {
      console.warn("Error calling logout endpoint, continuing with client-side cleanup:", error);
      // Continue with client-side cleanup even if server request failed
    }
    
    // Clear storage and cookies regardless of API success
    localStorage.removeItem('user');
    
    // Clear auth cookies (connect.sid is the express session cookie)
    document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Clear URL hash if it contains OAuth data
    if (window.location.hash.includes('access_token')) {
      window.location.hash = '';
    }
    
    return true;
  } catch (error) {
    console.error("Error in signOutUser:", error);
    return false;
  }
}

/**
 * No-op auth state change listener
 * In our implementation, we don't have a persistent auth state
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  // This is intentionally a no-op function since we're not using Firebase auth
  return () => {}; 
}

// Stub auth object for compatibility with existing code
export const auth = {
  currentUser: null
};

// Export an isConfigured flag to check if Firebase is properly configured
export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

// Log configuration status
console.log('Firebase auth configuration status:', isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED');

// Add error handler for fetch failures that might affect auth
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && typeof event.reason.message === 'string' && 
      event.reason.message.includes('Failed to fetch')) {
    console.warn('Network request failed - this may affect authentication:', event.reason);
  }
});
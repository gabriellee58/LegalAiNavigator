// Firebase Types
// Since we're having issues with the Firebase package, we'll define our own interfaces
// to match what we need from Firebase

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Check if Firebase config is set
const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

console.log(`Firebase config status: ${isFirebaseConfigured ? 'Configured' : 'Not configured'}`);

// Mock Firebase auth object for compatibility
const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return empty unsubscribe function
    return () => {};
  },
  signOut: async () => {}
};

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Alternative implementation for Google sign-in without Firebase SDK
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    // Since we don't have Firebase SDK working, we'll use a different approach
    // Redirect user to Google OAuth URL with proper scopes
    const redirectUrl = `${window.location.origin}/auth`;
    
    // For now, we'll just redirect to the Google sign-in page on our production site
    window.location.href = `https://canadianlegalai.site/auth?redirect_uri=${encodeURIComponent(redirectUrl)}`;
    
    // This will never execute due to the redirect, but needed for TypeScript
    return null;
  } catch (error) {
    console.error("Error initiating Google sign-in:", error);
    throw error;
  }
}

// Handle redirect after Google sign-in
export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  try {
    // In a real implementation, this would parse the token from the URL
    // For now, we'll just return null as we can't complete the flow
    console.log("Redirect handling not fully implemented yet");
    return null;
  } catch (error) {
    console.error("Error handling Google redirect:", error);
    throw error;
  }
}

// Sign out user 
export async function signOutUser(): Promise<boolean> {
  try {
    // Clear local storage and cookies
    localStorage.removeItem('user');
    document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Call backend logout
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    return true;
  } catch (error) {
    console.error("Error in signOutUser:", error);
    return false;
  }
}

// Mock auth state change 
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  // Since we don't have real Firebase auth, just return a no-op function
  callback(null);
  return () => {};
}

export { auth };

// Check if Firebase is configured
export const isConfigured = isFirebaseConfigured;

console.log('Firebase auth configuration status:', isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED');

window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && typeof event.reason.message === 'string' && 
      event.reason.message.includes('Failed to fetch')) {
    console.warn('Network request failed - this may affect authentication:', event.reason);
  }
});
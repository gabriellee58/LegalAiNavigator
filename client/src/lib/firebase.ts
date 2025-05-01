// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  User as FirebaseAuthUser
} from "firebase/auth";

// Export our own user interface that matches what we need
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Initialize Firebase with config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if all required Firebase config values are present
export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

console.log(`Firebase config status: ${isConfigured ? 'Configured' : 'Not configured'}`);

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase auth
const auth = getAuth(app);
// Set persistence to local (persists even when browser is closed)
setPersistence(auth, browserLocalPersistence).catch(error => {
  console.error("Firebase persistence setting failed:", error);
});
export { auth };

// Create Google Auth provider
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Check if the current domain is in the list of authorized domains for Firebase
export function isAuthorizedDomain(): boolean {
  const authorizedDomains = [
    'canadianlegalai.firebaseapp.com',
    'canadianlegalai.web.app',
    'canadianlegalai.site',
    'www.canadianlegalai.site'
  ];
  
  const currentDomain = window.location.hostname;
  return authorizedDomains.includes(currentDomain);
}

// Sign in with Google function
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    // Check if the current domain is authorized for Firebase auth
    if (!isAuthorizedDomain()) {
      console.warn("Current domain is not authorized for Firebase auth:", window.location.hostname);
      throw new Error("auth/unauthorized-domain");
    }
    
    console.log("Starting Google sign-in with redirect...");
    // Using redirect for better mobile experience
    await signInWithRedirect(auth, googleProvider);
    // This will never be reached due to the redirect
    return null;
  } catch (error: any) {
    console.error("Error initiating Google sign-in:", error);
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`);
    } else if (error.message === "auth/unauthorized-domain") {
      // Custom error when running on unauthorized domain
      const customError = new Error(
        "Google sign-in is not available on this domain. Please use email/password login or access the site from canadianlegalai.site"
      );
      customError.name = "UnauthorizedDomainError";
      throw customError;
    }
    throw error;
  }
}

// Handle the redirect result from Google sign-in
export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  try {
    console.log("Starting handleGoogleRedirect, checking for redirect results...");
    
    // Get the result of the redirect sign-in
    const result = await getRedirectResult(auth);
    
    console.log("Redirect result received:", result ? "Success" : "No result");
    
    if (!result) {
      console.log("No redirect result found");
      return null;
    }
    
    // Convert Firebase user to our FirebaseUser interface
    const user = result.user;
    console.log("Firebase user details:", { 
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL ? "has photo" : "no photo" 
    });
    
    // Validate required fields to avoid downstream errors
    if (!user.uid) {
      throw new Error("Firebase user is missing UID");
    }
    
    // Store Firebase auth information in localStorage as a backup
    try {
      localStorage.setItem('firebaseAuthUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      console.log("Firebase auth user stored in localStorage as backup");
    } catch (storageError) {
      console.warn("Could not store auth user in localStorage:", storageError);
    }
    
    if (!user.email) {
      console.warn("Firebase user is missing email, this might cause issues with account creation");
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error("Error handling Google redirect:", error);
    
    // Enhanced error logging and handling for Firebase errors
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`);
      
      // Provide more specific error messages based on Firebase error codes
      switch (error.code) {
        case 'auth/account-exists-with-different-credential':
          throw new Error('An account already exists with the same email address but different sign-in credentials. Please sign in using your original method.');
        case 'auth/cancelled-popup-request':
        case 'auth/popup-closed-by-user':
          throw new Error('Sign-in was cancelled. Please try again.');
        case 'auth/network-request-failed':
          throw new Error('Network error. Please check your internet connection and try again.');
        case 'auth/popup-blocked':
          throw new Error('Sign-in popup was blocked by your browser. Please enable popups for this site.');
        case 'auth/unauthorized-domain':
          throw new Error('This domain is not authorized for Firebase authentication. Please try a different sign-in method.');
        default:
          throw new Error(`Authentication error: ${error.message || 'Unknown error'}`);
      }
    }
    
    throw error;
  }
}

// Sign out user
export async function signOutUser(): Promise<boolean> {
  try {
    console.log("Starting sign-out process...");
    
    // Sign out from Firebase
    await signOut(auth);
    
    // Also call backend logout to clear server-side session
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    console.log("Sign-out completed successfully");
    return true;
  } catch (error: any) {
    console.error("Error in signOutUser:", error);
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`);
    }
    return false;
  }
}

// Listen for auth state changes
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      });
    } else {
      callback(null);
    }
  });
}

// Log errors for debugging
window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && typeof event.reason.message === 'string' && 
      event.reason.message.includes('Failed to fetch')) {
    console.warn('Network request failed - this may affect authentication:', event.reason);
  }
});
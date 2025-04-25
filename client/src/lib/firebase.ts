// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
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
export { auth };

// Create Google Auth provider
const googleProvider = new GoogleAuthProvider();

// Configure Google Auth provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign in with Google function
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    console.log("Starting Google sign-in with redirect...");
    // Using redirect for better mobile experience
    await signInWithRedirect(auth, googleProvider);
    // This will never be reached due to the redirect
    return null;
  } catch (error: any) {
    console.error("Error initiating Google sign-in:", error);
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`);
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
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error("Error handling Google redirect:", error);
    // Log specific Firebase errors for debugging
    if (error && error.code) {
      console.error(`Firebase error code: ${error.code}`);
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
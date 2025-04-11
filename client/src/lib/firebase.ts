import { getAuth, signInWithPopup, GoogleAuthProvider, getRedirectResult, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
}

export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      };
    }
    return null;
  } catch (error) {
    console.error("Error handling Google redirect:", error);
    throw error;
  }
}

export async function signOutUser(): Promise<boolean> {
  try {
    await auth.signOut();

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

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return auth.onAuthStateChanged((user) => {
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

export { auth };

export const isConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID
);

console.log('Firebase auth configuration status:', isConfigured ? 'CONFIGURED' : 'NOT CONFIGURED');

window.addEventListener('unhandledrejection', function(event) {
  if (event.reason && typeof event.reason.message === 'string' && 
      event.reason.message.includes('Failed to fetch')) {
    console.warn('Network request failed - this may affect authentication:', event.reason);
  }
});
// Firebase configuration for Google Authentication
// Mock implementation for development since we don't have the firebase package installed

// Define types for Firebase modules
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Log that we're using a mock implementation
console.log('Using mock Firebase implementation with config:', {
  apiKey: '[REDACTED]',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

// Sign in with Google - Mock implementation
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  console.warn('Using mock Google sign-in');
  try {
    // Generate a random mock user
    const mockUser: FirebaseUser = {
      uid: 'mock-uid-' + Date.now(),
      email: 'mock-user@example.com',
      displayName: 'Mock User',
      photoURL: null
    };
    
    // Call our backend API directly 
    const response = await fetch('/api/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: mockUser.email,
        displayName: mockUser.displayName,
        uid: mockUser.uid
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with backend');
    }
    
    return mockUser;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    return null;
  }
}

// Sign out function - Mock implementation
export async function signOutUser(): Promise<boolean> {
  console.warn('Using mock sign-out');
  try {
    // Call our logout endpoint
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
}

// Listen to auth state changes - Mock implementation
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  console.warn('Using mock auth state change listener');
  // Initially call with null
  callback(null);
  // Return noop function for unsubscribe
  return () => {}; 
}

// Mock auth object for compatibility
export const auth = {
  currentUser: null
};
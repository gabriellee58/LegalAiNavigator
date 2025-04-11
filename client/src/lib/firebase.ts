// Firebase implementation using standard web redirection flow

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

// Log that we're using the standard redirect-based Google Sign-In 
console.log('Using Google Sign-In configuration:', {
  apiKey: '[REDACTED]',
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
});

/**
 * Sign in with Google using redirect flow
 * This function initiates the OAuth flow by redirecting to Google's authentication page
 */
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    // Get the current URL to use as the redirect URI
    const redirectUri = encodeURIComponent(window.location.origin + '/auth');
    const clientId = firebaseConfig.apiKey;
    const scope = encodeURIComponent('email profile');
    
    // Construct the Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scope}`;
    
    // Redirect the user to Google's authentication page
    window.location.href = googleAuthUrl;
    
    // This function will not return anything as the page is redirecting
    return null;
  } catch (error) {
    console.error("Error initiating Google sign-in:", error);
    return null;
  }
}

/**
 * Handle the redirect from Google OAuth
 * This function should be called when the page loads to check for OAuth response data
 */
export async function handleGoogleRedirect(): Promise<FirebaseUser | null> {
  try {
    // Check if we have a token in the URL fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (!accessToken) {
      return null;
    }
    
    // Exchange the token for user info
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info from Google');
    }
    
    const userData = await response.json();
    
    // Construct a FirebaseUser-like object from the response
    const user: FirebaseUser = {
      uid: userData.sub,
      email: userData.email || null,
      displayName: userData.name || null,
      photoURL: userData.picture || null
    };
    
    // Call our backend API to register/login the user
    await authenticateWithBackend(user);
    
    return user;
  } catch (error) {
    console.error("Error handling Google redirect:", error);
    return null;
  }
}

/**
 * Authenticate with our backend after Google sign-in
 */
async function authenticateWithBackend(user: FirebaseUser): Promise<void> {
  try {
    const response = await fetch('/api/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to authenticate with backend');
    }
  } catch (error) {
    console.error("Error authenticating with backend:", error);
    throw error;
  }
}

/**
 * Sign out the user
 */
export async function signOutUser(): Promise<boolean> {
  try {
    // Call our logout endpoint
    await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    
    // Clear URL hash if it contains OAuth data
    if (window.location.hash.includes('access_token')) {
      window.location.hash = '';
    }
    
    return true;
  } catch (error) {
    console.error("Error signing out:", error);
    return false;
  }
}

/**
 * Placeholder for auth state change listener
 * In a redirect-based flow, we don't have a persistent auth state
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  // Check for redirect response when initialized
  handleGoogleRedirect()
    .then(user => {
      if (user) {
        callback(user);
      }
    })
    .catch(err => {
      console.error("Error in auth change handler:", err);
    });
  
  // Return noop function for unsubscribe
  return () => {}; 
}

// Auth object for compatibility
export const auth = {
  currentUser: null
};
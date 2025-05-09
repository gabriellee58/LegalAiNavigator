/**
 * Firebase Authentication Service
 * 
 * Standalone service that handles Firebase authentication without React hooks.
 * This service properly handles missing Firebase configuration.
 */

import { initializeApp, type FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged,
  browserLocalPersistence,
  setPersistence,
  type Auth,
  type User as FirebaseAuthUser
} from "firebase/auth";

// User interface that matches what we need from Firebase
export interface FirebaseUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Firebase configuration singleton
class FirebaseService {
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private googleProvider: GoogleAuthProvider | null = null;
  private initialized = false;
  private authListeners: Array<(user: FirebaseUser | null) => void> = [];
  
  // List of authorized domains for Firebase auth
  private authorizedDomains = [
    'canadianlegalai.firebaseapp.com',
    'canadianlegalai.web.app',
    'canadianlegalai.site',
    'www.canadianlegalai.site',
    // Development domains
    'p8bj18kje6z4.riker.replit.dev',
    'riker.replit.dev',
    'replit.dev',
    'replit.app',
    // Always include current hostname
    window.location.hostname
  ];
  
  constructor() {
    // Initialize Firebase lazily to avoid startup errors
    this.initializeFirebase();
  }
  
  // Public getter for checking if Firebase is configured
  get isConfigured(): boolean {
    return Boolean(
      import.meta.env.VITE_FIREBASE_API_KEY && 
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN &&
      import.meta.env.VITE_FIREBASE_PROJECT_ID &&
      import.meta.env.VITE_FIREBASE_APP_ID
    );
  }
  
  // Public getter for checking if Firebase is properly initialized
  get isInitialized(): boolean {
    return this.initialized && !!this.app && !!this.auth;
  }
  
  // Initialize Firebase if it hasn't been initialized yet
  private initializeFirebase(): void {
    if (this.initialized) return;
    
    try {
      // Only initialize Firebase if all required config is available
      if (this.isConfigured) {
        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 
            `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
        };

        // Initialize Firebase app
        this.app = initializeApp(firebaseConfig);
        
        // Initialize Firebase auth
        this.auth = getAuth(this.app);
        
        // Set persistence to local (persists even when browser is closed)
        if (this.auth) {
          setPersistence(this.auth, browserLocalPersistence).catch(error => {
            console.error("Firebase persistence setting failed:", error);
          });
        }
        
        // Initialize Google provider
        this.googleProvider = new GoogleAuthProvider();
        if (this.googleProvider) {
          this.googleProvider.setCustomParameters({
            prompt: 'select_account'
          });
        }
        
        // Add listener for auth state changes
        if (this.auth) {
          onAuthStateChanged(this.auth, (firebaseUser) => {
            if (firebaseUser) {
              const user: FirebaseUser = {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName,
                photoURL: firebaseUser.photoURL
              };
              
              this.notifyListeners(user);
            } else {
              this.notifyListeners(null);
            }
          });
        }
        
        this.initialized = true;
        console.log(`Firebase config status: Configured`);
      } else {
        console.log(`Firebase config status: Not configured`);
        this.initialized = false;
      }
    } catch (error) {
      console.error("Error initializing Firebase:", error);
      console.log(`Firebase config status: Error`);
      this.app = null;
      this.auth = null;
      this.googleProvider = null;
      this.initialized = false;
    }
  }
  
  // Check if the current domain is authorized for Firebase auth
  isAuthorizedDomain(): boolean {
    return this.authorizedDomains.includes(window.location.hostname);
  }
  
  // Add a listener for auth state changes
  addAuthStateListener(callback: (user: FirebaseUser | null) => void): () => void {
    this.authListeners.push(callback);
    
    // If auth is not initialized, immediately call with null
    if (!this.isInitialized) {
      callback(null);
    }
    
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter(listener => listener !== callback);
    };
  }
  
  // Notify all listeners of auth state changes
  private notifyListeners(user: FirebaseUser | null): void {
    this.authListeners.forEach(listener => listener(user));
  }
  
  // Sign in with Google
  async signInWithGoogle(): Promise<void> {
    // Make sure Firebase is initialized
    if (!this.isInitialized || !this.auth || !this.googleProvider) {
      throw new Error("Firebase authentication is not available");
    }
    
    // Check if the current domain is authorized for Firebase auth
    if (!this.isAuthorizedDomain()) {
      console.warn("Current domain is not authorized for Firebase auth:", window.location.hostname);
      throw new Error("auth/unauthorized-domain");
    }
    
    console.log("Starting Google sign-in with redirect...");
    // Using redirect for better mobile experience
    await signInWithRedirect(this.auth, this.googleProvider);
  }
  
  // Handle the redirect result from Google sign-in
  async handleGoogleRedirect(): Promise<FirebaseUser | null> {
    // Make sure Firebase is initialized
    if (!this.isInitialized || !this.auth) {
      console.warn("Firebase auth is not initialized");
      return null;
    }
    
    // Get the result of the redirect sign-in
    const result = await getRedirectResult(this.auth);
    
    if (!result) {
      console.log("No redirect result found");
      return null;
    }
    
    // Convert Firebase user to our FirebaseUser interface
    const user = result.user;
    
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
    } catch (storageError) {
      console.warn("Could not store auth user in localStorage:", storageError);
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
  
  // Sign out user
  async signOut(): Promise<void> {
    // Make sure Firebase is initialized
    if (!this.isInitialized || !this.auth) {
      console.warn("Firebase auth is not initialized");
      return;
    }
    
    await signOut(this.auth);
  }
  
  // Get the current Firebase user synchronously
  getCurrentUser(): FirebaseUser | null {
    // Make sure Firebase is initialized
    if (!this.isInitialized || !this.auth) {
      return null;
    }
    
    const user = this.auth.currentUser;
    
    if (!user) {
      return null;
    }
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
}

// Create singleton instance
export const firebaseService = new FirebaseService();

// Export default for consistency and easier mocking in tests
export default firebaseService;
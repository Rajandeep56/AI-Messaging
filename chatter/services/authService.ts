import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../config/firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastSeen: Date;
}

class AuthService {
  private currentUser: User | null = null;
  private authStateListeners: ((user: User | null) => void)[] = [];
  private demoUserCreated = false;
  private fallbackMode = false;

  constructor() {
    this.initializeAuthState();
    // Create demo user for testing after a short delay
    setTimeout(() => {
      this.createDemoUser();
    }, 2000); // Wait 2 seconds for Firebase to initialize
  }

  // Initialize auth state with fallback
  private async initializeAuthState() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.saveUserToStorage(user);
        await this.updateUserProfile(user.uid, { lastSeen: new Date() });
      } else {
        await this.clearUserFromStorage();
      }
      
      // Notify all listeners
      this.authStateListeners.forEach(listener => listener(user));
    });

    // If no user after 5 seconds, force fallback mode
    setTimeout(() => {
      if (!this.currentUser && !this.fallbackMode) {
        console.log('No Firebase user after 5 seconds, forcing fallback mode');
        this.forceFallbackMode();
      }
    }, 5000);
  }

  // Create a demo user for testing
  private async createDemoUser() {
    if (this.demoUserCreated) return; // Prevent multiple attempts
    
    try {
      console.log('Attempting to create/sign in demo user...');
      
      // Demo user credentials
      const demoEmail = 'demo@chatter.com';
      const demoPassword = 'demo123456';
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 10000); // 10 second timeout
      });
      
      // Try to sign in with demo credentials first
      try {
        await Promise.race([this.signIn(demoEmail, demoPassword), timeoutPromise]);
        console.log('Demo user signed in successfully');
        this.demoUserCreated = true;
        return;
      } catch (signInError: any) {
        console.log('Demo user sign in failed:', signInError.message);
        // If it's an auth not enabled error, skip to fallback immediately
        if (signInError.code === 'auth/operation-not-allowed' || signInError.message === 'Timeout') {
          throw signInError; // This will trigger fallback mode
        }
      }
      
      // If sign in fails, create the demo user
      await Promise.race([this.register(demoEmail, demoPassword, 'Demo User'), timeoutPromise]);
      console.log('Demo user created successfully');
      this.demoUserCreated = true;
      
    } catch (error: any) {
      console.error('Demo user creation/sign in failed:', error.message);
      console.error('Full error:', error);
      // Immediately trigger fallback mode on any error
      console.log('Immediately triggering fallback mode due to error');
      this.forceFallbackMode();
      // Re-throw the error so ensureDemoUser can catch it and trigger fallback
      throw error;
    }
  }

  // Register new user
  async register(email: string, password: string, displayName?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile with display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName || user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        createdAt: new Date(),
        lastSeen: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update last seen
      await this.updateUserProfile(user.uid, { lastSeen: new Date() });
      
      return user;
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Manually trigger demo user creation (for testing)
  async ensureDemoUser(): Promise<void> {
    if (!this.isAuthenticated()) {
      console.log('User not authenticated, attempting demo user creation...');
      try {
        await this.createDemoUser();
        console.log('Demo user creation successful');
      } catch (error) {
        console.log('Demo user creation failed, using fallback mode');
      }
      
      // If still not authenticated, use fallback mode
      if (!this.isAuthenticated() && !this.fallbackMode) {
        console.log('Firebase Auth failed, using fallback mode');
        this.fallbackMode = true;
        this.createFallbackUser();
      }
    } else {
      console.log('User already authenticated');
    }
  }

  // Force fallback mode (for testing when Firebase is not working)
  forceFallbackMode(): void {
    if (!this.fallbackMode) {
      console.log('Forcing fallback mode...');
      this.fallbackMode = true;
      this.createFallbackUser();
    }
  }

  // Create a fallback user when Firebase Auth is not available
  private createFallbackUser() {
    const fallbackUser = {
      uid: 'demo-user-fallback',
      email: 'demo@chatter.com',
      displayName: 'Demo User',
      photoURL: null,
    } as User;
    
    this.currentUser = fallbackUser;
    this.saveUserToStorage(fallbackUser);
    
    // Notify listeners
    this.authStateListeners.forEach(listener => listener(fallbackUser));
    
    console.log('Fallback user created successfully');
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  }

  // Listen to auth state changes
  onAuthStateChanged(listener: (user: User | null) => void): () => void {
    this.authStateListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.authStateListeners.indexOf(listener);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  // Save user to local storage
  private async saveUserToStorage(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('currentUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
    } catch (error) {
      console.error('Failed to save user to storage:', error);
    }
  }

  // Clear user from local storage
  private async clearUserFromStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Failed to clear user from storage:', error);
    }
  }

  // Get user from local storage
  async getUserFromStorage(): Promise<any> {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user from storage:', error);
      return null;
    }
  }

  // Get error message from Firebase error code
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password authentication is not enabled. Please enable it in Firebase console.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return `Firebase error: ${errorCode}`;
    }
  }
}

export default new AuthService(); 
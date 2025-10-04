import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  AuthError,
  AuthErrorCodes,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  DocumentData,
  DocumentReference,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebase';

type AuthResponse = {
  success: boolean;
  user?: FirebaseUser | null;
  error?: string;
};

export type UserPreferences = {
  theme: 'light' | 'dark' | 'system';
  autoplay: boolean;
  explicitContent: boolean;
  language: string;
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  bio?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  autoplay: true,
  explicitContent: false,
  language: 'en',
};

class FirebaseAuthService {
  private currentUser: FirebaseUser | null = null;
  private isInitialized: boolean = false;

  constructor() {
    if (!this.isInitialized) {
      this.setupAuthStateListener();
      this.isInitialized = true;
    }
  }

  private setupAuthStateListener() {
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;

      if (user) {
        // Store user token for API calls
        const token = await user.getIdToken();
        await AsyncStorage.setItem('firebaseToken', token);
        await AsyncStorage.setItem('userId', user.uid);

        // Create or update user profile in Firestore
        await this.ensureUserProfile(user);
      } else {
        // Clear stored tokens
        await AsyncStorage.removeItem('firebaseToken');
        await AsyncStorage.removeItem('userId');
      }
    });
  }

  private async ensureUserProfile(user: FirebaseUser): Promise<void> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        const userProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'User',
          photoURL: user.photoURL || null,
          preferences: { ...DEFAULT_PREFERENCES },
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await setDoc(userRef, userProfile);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error ensuring user profile:', errorMessage);
      throw new Error(`Failed to ensure user profile: ${errorMessage}`);
    }
  }

  async signUp(email: string, password: string, displayName?: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const { user } = userCredential;
      const userRef = doc(db, 'users', user.uid);

      const userProfile: Partial<UserProfile> = {
        displayName: displayName || email.split('@')[0],
        updatedAt: new Date(),
      };

      await updateDoc(userRef, userProfile);

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      console.error('Sign up error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      return {
        success: true,
        user: userCredential.user,
      };
    } catch (error) {
      const errorMessage = this.getAuthErrorMessage(error);
      console.error('Sign in error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async signOutUser(): Promise<{ success: boolean; error?: string }> {
    try {
      await firebaseSignOut(auth);
      await AsyncStorage.multiRemove(['firebaseToken', 'userId']);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign out';
      console.error('Sign out error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.currentUser;
  }

  async getUserProfile(userId?: string): Promise<UserProfile | null> {
    try {
      const uid = userId || this.currentUser?.uid;
      if (!uid) {
        return null;
      }

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

  async updateUserProfile(
    updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'email'>>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const uid = this.currentUser?.uid;
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(db, 'users', uid) as DocumentReference<UserProfile>;

      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      console.error('Error updating profile:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async updateUserPreferences(
    preferences: Partial<UserPreferences>,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const uid = this.currentUser?.uid;
      if (!uid) {
        throw new Error('User not authenticated');
      }

      const userRef = doc(db, 'users', uid);

      await updateDoc(userRef, {
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...preferences,
        },
        updatedAt: new Date(),
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      console.error('Error updating preferences:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  async getIdToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.currentUser) {
      return null;
    }

    try {
      return await this.currentUser.getIdToken(forceRefresh);
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  private getAuthErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const authError = error as AuthError;

      switch (authError.code) {
        case AuthErrorCodes.EMAIL_EXISTS:
          return 'This email is already in use. Please use a different email.';
        case AuthErrorCodes.INVALID_EMAIL:
          return 'The email address is not valid.';
        case AuthErrorCodes.USER_DELETED:
        case AuthErrorCodes.INVALID_PASSWORD:
          return 'Invalid email or password.';
        case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
          return 'Too many unsuccessful login attempts. Please try again later.';
        case AuthErrorCodes.NETWORK_REQUEST_FAILED:
          return 'Network error. Please check your internet connection.';
        default:
          return authError.message || 'An error occurred. Please try again.';
      }
    }

    return 'An unknown error occurred. Please try again.';
  }
}

// Export singleton instance
export const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;

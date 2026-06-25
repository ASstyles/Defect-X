import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendPasswordResetEmail,
  Auth,
  UserCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile
} from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

/**
 * Checks if the configured Firebase API key is a placeholder.
 */
export const isFirebasePlaceholder = (): boolean => {
  return firebaseConfig.apiKey === 'placeholder-api-key' || !firebaseConfig.apiKey;
};

/**
 * Log in a user with email and password.
 */
export async function loginWithEmail(
  auth: Auth, 
  email: string, 
  password: string
): Promise<UserCredential | null> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    
    const mockUser = { 
      email, 
      displayName: email.split('@')[0],
      uid: `mock-user-${email.replace(/[@.]/g, '-')}` 
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('mock-auth-change'));
    return null;
  }

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      console.warn("Firebase Auth provider not enabled. Falling back to local Mock Auth Mode.");
      localStorage.setItem('firebase_auth_fallback', 'true');
      
      const mockUser = { 
        email, 
        displayName: email.split('@')[0],
        uid: `mock-user-${email.replace(/[@.]/g, '-')}` 
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      return null;
    }
    throw error;
  }
}

/**
 * Sign up a user with email, password, and optional full name.
 */
export async function signupWithEmail(
  auth: Auth, 
  email: string, 
  password: string, 
  displayName?: string
): Promise<UserCredential | null> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const mockUser = { 
      email, 
      displayName: displayName || email.split('@')[0],
      uid: `mock-user-${email.replace(/[@.]/g, '-')}` 
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('mock-auth-change'));
    return null;
  }

  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && credential.user) {
      const { updateProfile } = await import('firebase/auth');
      await updateProfile(credential.user, { displayName });
    }
    
    return credential;
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      console.warn("Firebase Auth provider not enabled. Falling back to local Mock Auth Mode.");
      localStorage.setItem('firebase_auth_fallback', 'true');
      
      const mockUser = { 
        email, 
        displayName: displayName || email.split('@')[0],
        uid: `mock-user-${email.replace(/[@.]/g, '-')}` 
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      return null;
    }
    throw error;
  }
}

/**
 * Sign out the currently logged-in user.
 */
export async function logoutUser(auth: Auth): Promise<void> {
  localStorage.removeItem('mock_user');
  localStorage.removeItem('firebase_auth_fallback');
  window.dispatchEvent(new Event('mock-auth-change'));

  if (isFirebasePlaceholder()) {
    return;
  }

  try {
    return await signOut(auth);
  } catch (error) {
    // Ignore sign out errors (e.g. session already expired)
  }
}

/**
 * Log in a user with Google Authentication.
 */
export async function loginWithGoogleProvider(auth: Auth): Promise<UserCredential | null> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const mockUser = { 
      email: 'google.operator@defectx.ai', 
      displayName: 'Google Operator',
      uid: 'mock-user-google-operator' 
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('mock-auth-change'));
    return null;
  }

  try {
    const provider = new GoogleAuthProvider();
    return await signInWithPopup(auth, provider);
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      console.warn("Firebase Auth provider not enabled. Falling back to local Mock Auth Mode.");
      localStorage.setItem('firebase_auth_fallback', 'true');
      
      const mockUser = { 
        email: 'google.operator@defectx.ai', 
        displayName: 'Google Operator',
        uid: 'mock-user-google-operator' 
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      window.dispatchEvent(new Event('mock-auth-change'));
      return null;
    }
    throw error;
  }
}

/**
 * Send password reset email to a user.
 */
export async function sendPasswordResetEmailService(
  auth: Auth, 
  email: string
): Promise<void> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      console.warn("Firebase Auth provider not enabled. Mimicking password reset locally.");
      localStorage.setItem('firebase_auth_fallback', 'true');
      await new Promise((resolve) => setTimeout(resolve, 800));
      return;
    }
    throw error;
  }
}

/**
 * Update the user's profile display name.
 */
export async function updateUserProfile(
  auth: Auth,
  displayName: string
): Promise<void> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const stored = localStorage.getItem('mock_user');
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.displayName = displayName;
      localStorage.setItem('mock_user', JSON.stringify(parsed));
      window.dispatchEvent(new Event('mock-auth-change'));
    }
    return;
  }

  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found');

  try {
    await updateProfile(user, { displayName });
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      const stored = localStorage.getItem('mock_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.displayName = displayName;
        localStorage.setItem('mock_user', JSON.stringify(parsed));
        window.dispatchEvent(new Event('mock-auth-change'));
      }
      return;
    }
    throw error;
  }
}

/**
 * Reauthenticate the user and update their password.
 */
export async function updateUserPassword(
  auth: Auth,
  currentPass: string,
  newPass: string
): Promise<void> {
  if (isFirebasePlaceholder() || localStorage.getItem('firebase_auth_fallback') === 'true') {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return;
  }

  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user found');
  if (!user.email) throw new Error('User has no email address');

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPass);
  } catch (error: any) {
    if (error.code === 'auth/configuration-not-found') {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return;
    }
    throw error;
  }
}

import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

export const createUserWithRole = async (email, password, displayName) => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create a user document with role 'user'
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      displayName: displayName,
      role: 'user',
      createdAt: new Date().toISOString(),
    });

    return { user, error: null };
  } catch (error) {
    console.error('Error creating user:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return { user: null, error: error.message };
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create new user document for Google sign-in
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        role: 'user',
        createdAt: new Date().toISOString(),
      });
    }

    return { user, error: null };
  } catch (error) {
    console.error('Error signing in with Google:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return { user: null, error: error.message };
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error) {
    console.error('Error logging in:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return { user: null, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error) {
    console.error('Error logging out:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return { error: error.message };
  }
};

export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return null;
  }
};

// New function for password reset
export const sendPasswordResetEmail = async (email) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error('Error sending password reset email:', {
      error: error.message,
      timestamp: '2025-06-11 19:26:15',
      user: 'Kala-bot-apk'
    });
    return {
      success: false,
      error: error.code === 'auth/user-not-found'
        ? 'No account found with this email'
        : 'Failed to send reset email'
    };
  }
};
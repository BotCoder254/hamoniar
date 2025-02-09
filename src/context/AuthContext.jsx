import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db
} from '../config/firebase.config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Create user document in Firestore
  const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();

      try {
        await setDoc(userRef, {
          uid: user.uid,
          email,
          displayName,
          photoURL,
          createdAt,
          stats: {
            uploads: 0,
            likes: 0,
            followers: 0,
            plays: 0
          },
          preferredGenres: [],
          bio: '',
          location: '',
          website: '',
          ...additionalData
        });
      } catch (error) {
        console.error('Error creating user document:', error);
      }
    }
  };

  // Sign up function
  const signup = async (email, password, displayName) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName });
      await createUserDocument(user);
      return user;
    } catch (error) {
      throw error;
    }
  };

  // Sign in function
  const signin = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign out function
  const signout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      // Clear any local storage or state that needs to be cleared
      localStorage.removeItem('user');
      localStorage.removeItem('userPreferences');
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Update profile
  const updateUserProfile = async (profile) => {
    if (!currentUser) return;
    
    try {
      await updateProfile(currentUser, profile);
      await setDoc(doc(db, 'users', currentUser.uid), {
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      throw error;
    }
  };

  // Google sign in
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await createUserDocument(user);
          setCurrentUser(user);
          // Store minimal user info in localStorage
          localStorage.setItem('user', JSON.stringify({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          }));
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        setCurrentUser(null);
        localStorage.removeItem('user');
      }
      setLoading(false);
      setInitialized(true);
    });

    // Check for stored user on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && !currentUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    return () => unsubscribe();
  }, []);

  const value = {
    currentUser,
    loading,
    initialized,
    signup,
    signin,
    signout,
    resetPassword,
    updateUserProfile,
    signInWithGoogle,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
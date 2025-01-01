import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from '../config/firebase';

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from '../config/firebase';

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
  const signout = () => {
    return signOut(auth);
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
        } catch (error) {
          console.error("Error in auth state change:", error);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
      setInitialized(true);
    });

    return unsubscribe;
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
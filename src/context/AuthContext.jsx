import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { db } from '../config/firebase.config';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { app } from '../config/firebase.config';

const AuthContext = createContext();
const auth = getAuth(app);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  async function signup(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName });
      await createUserDocument(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await createUserDocument(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await createUserDocument(result.user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    return firebaseSignOut(auth);
  }

  async function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  async function updateUserProfile(data) {
    if (!auth.currentUser) return;

    try {
      // Update auth profile
      await updateProfile(auth.currentUser, {
        displayName: data.displayName,
        photoURL: data.photoURL
      });

      // Update Firestore document
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Update local state
      setCurrentUser(prev => ({
        ...prev,
        ...data
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (user) {
        await createUserDocument(user);
      }
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loginWithGoogle,
    resetPassword,
    updateUserProfile,
    createUserDocument
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 
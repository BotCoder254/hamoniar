import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase.config';
import { 
  collection, query, where, getDocs, 
  onSnapshot, doc 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to following list
    const followingRef = collection(db, 'users', currentUser.uid, 'following');
    const unsubFollowing = onSnapshot(followingRef, (snapshot) => {
      setFollowing(snapshot.docs.map(doc => doc.id));
    });

    // Subscribe to followers list
    const followersRef = collection(db, 'users', currentUser.uid, 'followers');
    const unsubFollowers = onSnapshot(followersRef, (snapshot) => {
      setFollowers(snapshot.docs.map(doc => doc.id));
    });

    return () => {
      unsubFollowing();
      unsubFollowers();
    };
  }, [currentUser]);

  const value = {
    following,
    followers,
    recommendations
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 
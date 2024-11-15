import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  db,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  deleteDoc
} from '../config/firebase';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activities, setActivities] = useState([]);

  // Real-time user profile updates
  useEffect(() => {
    if (!currentUser?.uid) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserProfile(doc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time followers updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    const followersRef = collection(db, 'followers');
    const q = query(followersRef, where('followingId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const followersData = [];
      for (const doc of snapshot.docs) {
        const userData = await getDoc(doc.data().followerId);
        if (userData.exists()) {
          followersData.push({
            id: doc.id,
            ...userData.data()
          });
        }
      }
      setFollowers(followersData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time following updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    const followingRef = collection(db, 'followers');
    const q = query(followingRef, where('followerId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const followingData = [];
      for (const doc of snapshot.docs) {
        const userData = await getDoc(doc.data().followingId);
        if (userData.exists()) {
          followingData.push({
            id: doc.id,
            ...userData.data()
          });
        }
      }
      setFollowing(followingData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Real-time activities updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activitiesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activitiesData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Update profile function
  const updateProfile = async (data) => {
    if (!currentUser) throw new Error('No user logged in');

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });

    // Add to activities
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      userId: currentUser.uid,
      type: 'PROFILE_UPDATE',
      timestamp: serverTimestamp(),
      details: { updatedFields: Object.keys(data) }
    });
  };

  // Follow user function
  const followUser = async (targetUserId) => {
    if (!currentUser) throw new Error('No user logged in');
    if (targetUserId === currentUser.uid) throw new Error('Cannot follow yourself');

    const followRef = collection(db, 'followers');
    await addDoc(followRef, {
      followerId: currentUser.uid,
      followingId: targetUserId,
      timestamp: serverTimestamp()
    });

    // Update follower count
    const targetUserRef = doc(db, 'users', targetUserId);
    await updateDoc(targetUserRef, {
      'stats.followers': increment(1)
    });

    // Add to activities
    const activityRef = collection(db, 'activities');
    await addDoc(activityRef, {
      userId: currentUser.uid,
      targetUserId,
      type: 'FOLLOW',
      timestamp: serverTimestamp()
    });
  };

  // Unfollow user function
  const unfollowUser = async (targetUserId) => {
    if (!currentUser) throw new Error('No user logged in');

    const followRef = collection(db, 'followers');
    const q = query(
      followRef,
      where('followerId', '==', currentUser.uid),
      where('followingId', '==', targetUserId)
    );

    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref);

      // Update follower count
      const targetUserRef = doc(db, 'users', targetUserId);
      await updateDoc(targetUserRef, {
        'stats.followers': increment(-1)
      });

      // Add to activities
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        userId: currentUser.uid,
        targetUserId,
        type: 'UNFOLLOW',
        timestamp: serverTimestamp()
      });
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences) => {
    if (!currentUser) throw new Error('No user logged in');

    const userRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp()
    });
  };

  // Get user stats
  const getUserStats = async (userId = currentUser?.uid) => {
    if (!userId) throw new Error('No user ID provided');

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) throw new Error('User not found');
    
    return userDoc.data().stats;
  };

  const value = {
    userProfile,
    loading,
    followers,
    following,
    activities,
    updateProfile,
    followUser,
    unfollowUser,
    updatePreferences,
    getUserStats
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase.config';
import { 
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
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const { currentUser, initialized } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activities, setActivities] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Optimized real-time user profile updates with simpler queries
  useEffect(() => {
    if (!initialized) return;
    if (!currentUser?.uid) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setUserProfile(doc.data());
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error in user profile listener:", error);
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser, initialized]);

  // Optimized followers fetch with simplified indexing
  const fetchFollowersData = useCallback(async (snapshot) => {
    try {
      const followersData = [];
      const batch = [];
      
      snapshot.docs.forEach(doc => {
        const followerId = doc.data().followerId;
        if (followerId) {
          batch.push(getDoc(doc(db, 'users', followerId)));
        }
      });

      const results = await Promise.all(batch);
      results.forEach(userDoc => {
        if (userDoc.exists()) {
          followersData.push({
            id: userDoc.id,
            ...userDoc.data()
          });
        }
      });

      setFollowers(followersData);
    } catch (error) {
      console.error("Error fetching followers data:", error);
    }
  }, []);

  // Optimized following fetch with simplified indexing
  const fetchFollowingData = useCallback(async (snapshot) => {
    try {
      const followingData = [];
      const batch = [];
      
      snapshot.docs.forEach(doc => {
        const followingId = doc.data().followingId;
        if (followingId) {
          batch.push(getDoc(doc(db, 'users', followingId)));
        }
      });

      const results = await Promise.all(batch);
      results.forEach(userDoc => {
        if (userDoc.exists()) {
          followingData.push({
            id: userDoc.id,
            ...userDoc.data()
          });
        }
      });

      setFollowing(followingData);
    } catch (error) {
      console.error("Error fetching following data:", error);
    }
  }, []);

  // Real-time followers updates with simplified indexing
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const followersRef = collection(db, 'followers');
    const q = query(
      followersRef,
      where('followingId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, fetchFollowersData);
    return () => unsubscribe();
  }, [currentUser, initialized, fetchFollowersData]);

  // Real-time following updates with simplified indexing
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const followingRef = collection(db, 'followers');
    const q = query(
      followingRef,
      where('followerId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, fetchFollowingData);
    return () => unsubscribe();
  }, [currentUser, initialized, fetchFollowingData]);

  // Optimized activities updates with simplified indexing
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error processing activities data:", error);
      }
    });

    return () => unsubscribe();
  }, [currentUser, initialized]);

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
    if (!currentUser) {
      toast.error('Please log in to follow users');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Add to following
      await updateDoc(userRef, {
        following: arrayUnion(targetUserId)
      });

      // Add to followers
      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUser.uid),
        followerCount: increment(1)
      });

      // Create activity
      const activityRef = collection(db, 'activities');
      await addDoc(activityRef, {
        type: 'follow',
        userId: currentUser.uid,
        targetUserId: targetUserId,
        timestamp: serverTimestamp(),
        read: false
      });

      toast.success('Successfully followed user');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
      throw error;
    }
  };

  // Unfollow user function
  const unfollowUser = async (targetUserId) => {
    if (!currentUser) {
      toast.error('Please log in to unfollow users');
      return;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      // Remove from following
      await updateDoc(userRef, {
        following: arrayRemove(targetUserId)
      });

      // Remove from followers
      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUser.uid),
        followerCount: increment(-1)
      });

      toast.success('Successfully unfollowed user');
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
      throw error;
    }
  };

  // Check if following a user
  const isFollowing = async (targetUserId) => {
    if (!currentUser) return false;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) return false;

      const userData = userDoc.data();
      return userData.following?.includes(targetUserId) || false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
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
    error,
    isMobile,
    updateProfile,
    followUser,
    unfollowUser,
    isFollowing,
    updatePreferences,
    getUserStats
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
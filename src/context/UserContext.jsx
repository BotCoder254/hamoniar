import React, { createContext, useContext, useState, useEffect } from 'react';
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
  deleteDoc
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

  // Real-time user profile updates
  useEffect(() => {
    if (!initialized) return;
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
    }, (error) => {
      console.error("Error in user profile listener:", error);
      setError(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, initialized]);

  // Real-time followers updates
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const followersRef = collection(db, 'followers');
    const q = query(followersRef, where('followingId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const followersData = [];
        for (const docSnap of snapshot.docs) {
          try {
            const userRef = doc(db, 'users', docSnap.data().followerId);
            const userData = await getDoc(userRef);
            if (userData.exists()) {
              followersData.push({
                id: docSnap.id,
                ...userData.data()
              });
            }
          } catch (error) {
            console.error("Error fetching follower user data:", error);
          }
        }
        setFollowers(followersData);
      } catch (error) {
        console.error("Error in followers listener:", error);
      }
    });

    return () => unsubscribe();
  }, [currentUser, initialized]);

  // Real-time following updates
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const followingRef = collection(db, 'followers');
    const q = query(followingRef, where('followerId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const followingData = [];
        for (const docSnap of snapshot.docs) {
          try {
            const userRef = doc(db, 'users', docSnap.data().followingId);
            const userData = await getDoc(userRef);
            if (userData.exists()) {
              followingData.push({
                id: docSnap.id,
                ...userData.data()
              });
            }
          } catch (error) {
            console.error("Error fetching following user data:", error);
          }
        }
        setFollowing(followingData);
      } catch (error) {
        console.error("Error in following listener:", error);
      }
    });

    return () => unsubscribe();
  }, [currentUser, initialized]);

  // Real-time activities updates
  useEffect(() => {
    if (!initialized || !currentUser?.uid) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(activitiesRef, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const activitiesData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis());
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
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

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }) {
  const { currentUser, initialized } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [activities, setActivities] = useState([]);

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
        for (const doc of snapshot.docs) {
          try {
            const userData = await getDoc(doc(db, 'users', doc.data().followerId));
            if (userData.exists()) {
              followersData.push({
                id: doc.id,
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
    }, (error) => {
      console.error("Followers listener error:", error);
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
        for (const doc of snapshot.docs) {
          try {
            const userData = await getDoc(doc(db, 'users', doc.data().followingId));
            if (userData.exists()) {
              followingData.push({
                id: doc.id,
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
    }, (error) => {
      console.error("Following listener error:", error);
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
        const activitiesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setActivities(activitiesData);
      } catch (error) {
        console.error("Error processing activities data:", error);
      }
    }, (error) => {
      console.error("Activities listener error:", error);
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
    if (!currentUser) throw new Error('No user logged in');
    if (targetUserId === currentUser.uid) throw new Error('Cannot follow yourself');

    try {
      // Add follow relationship
      const followRef = collection(db, 'followers');
      await addDoc(followRef, {
        followerId: currentUser.uid,
        followingId: targetUserId,
        timestamp: serverTimestamp()
      });

      // Update user stats
      const userRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      await updateDoc(userRef, {
        'stats.following': increment(1)
      });

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

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  };

  // Unfollow user function
  const unfollowUser = async (targetUserId) => {
    if (!currentUser) throw new Error('No user logged in');
    if (targetUserId === currentUser.uid) throw new Error('Cannot unfollow yourself');

    try {
      // Find and remove follow relationship
      const followRef = collection(db, 'followers');
      const q = query(
        followRef,
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', targetUserId)
      );

      const querySnapshot = await getDocs(q);
      const followDoc = querySnapshot.docs[0];

      if (followDoc) {
        await deleteDoc(followDoc.ref);

        // Update user stats
        const userRef = doc(db, 'users', currentUser.uid);
        const targetUserRef = doc(db, 'users', targetUserId);

        await updateDoc(userRef, {
          'stats.following': increment(-1)
        });

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

        return true;
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  };

  // Check if following a user
  const isFollowing = async (targetUserId) => {
    if (!currentUser) return false;
    
    try {
      const followRef = collection(db, 'followers');
      const q = query(
        followRef,
        where('followerId', '==', currentUser.uid),
        where('followingId', '==', targetUserId)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
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
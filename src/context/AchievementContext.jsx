import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { BADGES, checkBadgeEligibility } from '../config/badges';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase.config';
import BadgeNotification from '../components/Badges/BadgeNotification';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { success } = useToast();
  const [userStats, setUserStats] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [newBadge, setNewBadge] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  // Load user stats and earned badges
  useEffect(() => {
    if (currentUser?.uid) {
      loadUserStats();
      loadEarnedBadges();
    }
  }, [currentUser]);

  const loadUserStats = async () => {
    if (!currentUser?.uid) return;
    
    const statsRef = doc(db, 'userStats', currentUser.uid);
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      setUserStats(statsDoc.data());
    } else {
      // Initialize user stats if they don't exist
      const initialStats = {
        totalUploads: 0,
        totalListenMinutes: 0,
        uniqueGenresListened: [],
        trendingTracksCount: 0,
        followersCount: 0,
        popularPlaylistsCount: 0,
        totalPlaylistFollowers: 0,
        isEarlyUploader: false,
        isBetaUser: false,
        isVerified: false,
        lastUpdated: new Date().toISOString()
      };
      await setDoc(statsRef, initialStats);
      setUserStats(initialStats);
    }
  };

  const loadEarnedBadges = async () => {
    if (!currentUser?.uid) return;
    
    const badgesRef = doc(db, 'userBadges', currentUser.uid);
    const badgesDoc = await getDoc(badgesRef);
    
    if (badgesDoc.exists()) {
      setEarnedBadges(badgesDoc.data().badges || []);
    }
  };

  const updateUserStats = async (newStats) => {
    if (!currentUser?.uid) return;

    try {
      const statsRef = doc(db, 'userStats', currentUser.uid);
      await updateDoc(statsRef, {
        ...newStats,
        lastUpdated: new Date().toISOString()
      });

      // Check for new badges
      const updatedStats = { ...userStats, ...newStats };
      const newEarnedBadge = checkBadgeEligibility(updatedStats, earnedBadges);
      
      if (newEarnedBadge) {
        const badgesRef = doc(db, 'userBadges', currentUser.uid);
        await updateDoc(badgesRef, {
          badges: [...earnedBadges, newEarnedBadge]
        });
        
        setNewBadge(newEarnedBadge);
        setShowNotification(true);
        success(`New badge earned: ${newEarnedBadge.name}!`);
      }

      setUserStats(updatedStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  return (
    <AchievementContext.Provider value={{ userStats, earnedBadges, updateUserStats }}>
      {children}
      {showNotification && newBadge && (
        <BadgeNotification
          badge={newBadge}
          onClose={() => setShowNotification(false)}
        />
      )}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
};

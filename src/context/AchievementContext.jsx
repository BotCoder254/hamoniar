import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { BADGES, checkBadgeEligibility } from '../config/badges';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
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
    } else {
      await setDoc(badgesRef, { badges: [] });
      setEarnedBadges([]);
    }
  };

  const updateUserStats = async (newStats) => {
    if (!currentUser?.uid || !userStats) return;

    const updatedStats = {
      ...userStats,
      ...newStats,
      lastUpdated: new Date().toISOString()
    };

    const statsRef = doc(db, 'userStats', currentUser.uid);
    await updateDoc(statsRef, updatedStats);
    setUserStats(updatedStats);

    // Check for new badges
    checkForNewBadges(updatedStats);
  };

  const checkForNewBadges = async (stats) => {
    const allBadges = Object.values(BADGES);
    const newEarnedBadges = [];

    for (const badge of allBadges) {
      if (!earnedBadges.includes(badge.id) && checkBadgeEligibility(badge, stats)) {
        newEarnedBadges.push(badge.id);
        // Show notification for the first new badge
        if (!newBadge) {
          setNewBadge(badge);
          setShowNotification(true);
          success(`New Badge Earned: ${badge.name}!`);
        }
      }
    }

    if (newEarnedBadges.length > 0) {
      const badgesRef = doc(db, 'userBadges', currentUser.uid);
      const updatedBadges = [...earnedBadges, ...newEarnedBadges];
      await updateDoc(badgesRef, { badges: updatedBadges });
      setEarnedBadges(updatedBadges);
    }
  };

  const closeNotification = () => {
    setShowNotification(false);
    setNewBadge(null);
  };

  const value = {
    userStats,
    earnedBadges,
    updateUserStats,
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
      <BadgeNotification
        badge={newBadge}
        isVisible={showNotification}
        onClose={closeNotification}
      />
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

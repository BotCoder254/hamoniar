import { useState, useEffect } from 'react';
import { BADGES } from '../config/badges';

const useAchievements = (userData) => {
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [recentlyEarned, setRecentlyEarned] = useState(null);

  const checkAchievements = () => {
    const newEarnedBadges = [];

    Object.values(BADGES).forEach(badge => {
      const { requirement } = badge;
      let earned = false;

      // Check each type of requirement
      if (requirement.uploads && userData.totalUploads >= requirement.uploads) {
        earned = true;
      }
      if (requirement.popularUploads && userData.popularTracks >= requirement.popularUploads) {
        earned = true;
      }
      if (requirement.listenTime && userData.totalListenTime >= requirement.listenTime) {
        earned = true;
      }
      if (requirement.uniqueGenres && userData.genresListened >= requirement.uniqueGenres) {
        earned = true;
      }
      if (requirement.trendingTracks && userData.trendingTracks >= requirement.trendingTracks) {
        earned = true;
      }
      if (requirement.totalLikes && userData.receivedLikes >= requirement.totalLikes) {
        earned = true;
      }
      if (requirement.popularPlaylists && userData.popularPlaylists >= requirement.popularPlaylists) {
        earned = true;
      }
      if (requirement.playlistFollowers && userData.playlistFollowers >= requirement.playlistFollowers) {
        earned = true;
      }
      if (requirement.joinedFirst && userData.isEarlyAdopter) {
        earned = true;
      }
      if (requirement.verified && userData.isVerified) {
        earned = true;
      }

      if (earned) {
        newEarnedBadges.push(badge);
      }
    });

    // Check for newly earned badges
    const previousBadgeIds = earnedBadges.map(badge => badge.id);
    const newBadge = newEarnedBadges.find(badge => !previousBadgeIds.includes(badge.id));
    
    if (newBadge) {
      setRecentlyEarned(newBadge);
      // Reset recently earned after 5 seconds
      setTimeout(() => setRecentlyEarned(null), 5000);
    }

    setEarnedBadges(newEarnedBadges);
  };

  useEffect(() => {
    if (userData) {
      checkAchievements();
    }
  }, [userData]);

  return {
    earnedBadges,
    recentlyEarned,
    totalBadges: Object.keys(BADGES).length,
    progress: (earnedBadges.length / Object.keys(BADGES).length) * 100
  };
};

export default useAchievements;

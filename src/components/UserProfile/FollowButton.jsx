import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { UilUserPlus, UilUserMinus } from '@iconscout/react-unicons';
import { toast } from 'react-hot-toast';

const FollowButton = ({ targetUserId, className = '' }) => {
  const { followUser, unfollowUser, isFollowing } = useUser();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const status = await isFollowing(targetUserId);
        setFollowing(status);
        setLoading(false);
      } catch (error) {
        console.error('Error checking follow status:', error);
        setLoading(false);
      }
    };

    checkFollowStatus();
  }, [targetUserId, isFollowing]);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      if (following) {
        await unfollowUser(targetUserId);
        toast.success('Unfollowed successfully');
        setFollowing(false);
      } else {
        await followUser(targetUserId);
        toast.success('Following successfully');
        setFollowing(true);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(error.message || 'Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <motion.button
        className={`px-4 py-2 bg-dark/50 rounded-full text-white opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleFollowToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
        following
          ? 'bg-dark/50 text-white hover:bg-red-500/20'
          : 'bg-primary text-white hover:bg-primary/90'
      } ${className}`}
    >
      {following ? (
        <>
          <UilUserMinus className="w-5 h-5" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UilUserPlus className="w-5 h-5" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  );
};

export default FollowButton; 
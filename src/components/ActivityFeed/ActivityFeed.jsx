import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilMusic, UilHeart, UilListUl, UilUser,
  UilClock, UilRefresh, UilFilter, UilSpinner
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  limit, getDocs, onSnapshot
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const ActivityItem = ({ activity }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'upload':
        return <UilMusic className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <UilHeart className="w-5 h-5 text-red-500" />;
      case 'playlist':
        return <UilListUl className="w-5 h-5 text-green-500" />;
      case 'follow':
        return <UilUser className="w-5 h-5 text-purple-500" />;
      default:
        return <UilMusic className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityMessage = () => {
    switch (activity.type) {
      case 'upload':
        return `uploaded "${activity.trackName}"`;
      case 'like':
        return `liked "${activity.trackName}"`;
      case 'playlist':
        return `added "${activity.trackName}" to ${activity.playlistName}`;
      case 'follow':
        return `started following ${activity.targetUserName}`;
      default:
        return activity.message;
    }
  };

  const getFormattedTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    // Check if timestamp is a Firebase Timestamp
    if (timestamp.toDate) {
      return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
    }
    
    // If it's a regular Date object or timestamp number
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex space-x-3 p-4 bg-dark/50 rounded-lg group"
    >
      <img
        src={activity.userPhotoURL || '/default-avatar.png'}
        alt={activity.userName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-medium text-sm">{activity.userName}</span>
            <p className="text-sm mt-1 text-lightest">{activity.text}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <UilClock className="w-3 h-3 text-lightest" />
          <span className="text-xs text-lightest">
            {getFormattedTime(activity.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();
  const [followedUsers, setFollowedUsers] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // Fetch followed users first
    const fetchFollowedUsers = async () => {
      try {
        const followingSnapshot = await getDocs(
          collection(db, 'users', currentUser.uid, 'following')
        );
        const followingIds = followingSnapshot.docs.map(doc => doc.id);
        setFollowedUsers([...followingIds, currentUser.uid]);
      } catch (error) {
        console.error('Error fetching followed users:', error);
        setFollowedUsers([currentUser.uid]); // Fallback to just current user
      }
    };

    fetchFollowedUsers();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !followedUsers.length) return;

    try {
      // Build query based on filter
      let activitiesQuery = query(
        collection(db, 'activities'),
        where('userId', 'in', followedUsers),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      // Add type filter if not 'all'
      if (filter !== 'all') {
        activitiesQuery = query(
          collection(db, 'activities'),
          where('userId', 'in', followedUsers),
          where('type', '==', filter),
          orderBy('timestamp', 'desc'),
          limit(50)
        );
      }

      const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
        const newActivities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date() // Provide fallback date
        }));
        setActivities(newActivities);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching activities:', error);
        setLoading(false);
        setActivities([]); // Reset activities on error
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up activity listener:', error);
      setLoading(false);
      setActivities([]); // Reset activities on error
    }
  }, [currentUser, followedUsers, filter]);

  const activityTypes = [
    { id: 'all', label: 'All Activities' },
    { id: 'upload', label: 'Uploads' },
    { id: 'like', label: 'Likes' },
    { id: 'playlist', label: 'Playlists' },
    { id: 'follow', label: 'Follows' }
  ];

  if (!currentUser) {
    return (
      <div className="text-center py-12 bg-light/20 rounded-lg">
        <p className="text-lightest">Please log in to view activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity Feed</h2>
        <div className="flex items-center space-x-4">
          <UilFilter className="w-5 h-5 text-lightest" />
          <div className="flex space-x-2">
            {activityTypes.map(type => (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(type.id)}
                className={`px-4 py-2 rounded-full text-sm
                  ${filter === type.id ? 
                    'bg-primary text-white' : 
                    'bg-light text-lightest hover:bg-light/70'}`}
              >
                {type.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <UilSpinner className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
          {activities.length === 0 && (
            <div className="text-center py-12 bg-light/20 rounded-lg">
              <p className="text-lightest">No activities to show</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 
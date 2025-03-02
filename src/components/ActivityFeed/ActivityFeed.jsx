import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilMusic, UilHeart, UilListUl, UilUser,
  UilClock, UilRefresh, UilFilter, UilSpinner,
  UilCheck, UilTrashAlt, UilEye, UilUserPlus, UilCheckCircle
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  getDocs, onSnapshot, updateDoc, doc,
  deleteDoc, writeBatch, serverTimestamp, getDoc,
  limit
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import DefaultUserIcon from '../icons/DefaultUserIcon';

const ActivityItem = ({ activity, onMarkRead, onDelete, isSelected, onSelect }) => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userRef = doc(db, 'users', activity.userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [activity.userId]);

  const getActivityIcon = () => {
    switch (activity.type) {
      case 'follow':
        return <UilUserPlus className="w-5 h-5 text-primary" />;
      case 'like':
        return <UilHeart className="w-5 h-5 text-red-500" />;
      case 'upload':
        return <UilMusic className="w-5 h-5 text-green-500" />;
      default:
        return <UilMusic className="w-5 h-5 text-primary" />;
    }
  };

  const getActivityMessage = () => {
    switch (activity.type) {
      case 'follow':
        return 'started following you';
      case 'like':
        return `liked your track "${activity.trackName}"`;
      case 'upload':
        return `uploaded a new track "${activity.trackName}"`;
      default:
        return 'performed an action';
    }
  };

  const getFormattedTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center p-4 rounded-lg ${
        activity.read ? 'bg-dark/30' : 'bg-dark/50'
      } hover:bg-light/5 transition-colors relative group max-w-full overflow-hidden sm:overflow-visible`}
    >
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(activity.id, e.target.checked)}
          className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <Link to={`/profile/${activity.userId}`} className="flex items-center space-x-4 flex-1 min-w-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-light/10 flex-shrink-0">
          {userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt={userData.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <DefaultUserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/50" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 truncate">
          <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap">
            <span className="font-medium text-white text-sm sm:text-base truncate">
              {userData?.displayName || 'User'}
            </span>
            <span className="text-white/50 text-sm sm:text-base truncate">
              {getActivityMessage()}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white/40 truncate">
            {getFormattedTime(activity.timestamp)}
          </p>
        </div>
      </Link>

      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
        {getActivityIcon()}
        {!activity.read && (
          <button
            onClick={() => onMarkRead(activity.id)}
            className="p-1 sm:p-2 hover:bg-light/10 rounded-full transition-colors"
          >
            <UilCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </button>
        )}
        <button
          onClick={() => onDelete(activity.id)}
          className="p-1 sm:p-2 hover:bg-red-500/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
        >
          <UilTrashAlt className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
        </button>
      </div>
    </motion.div>
  );
};

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { currentUser } = useAuth();
  const [selectedActivities, setSelectedActivities] = useState(new Set());

  useEffect(() => {
    if (!currentUser) return;

    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('targetUserId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const activitiesData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis())
          .slice(0, 20);
        setActivities(activitiesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activities:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkRead = async (activityId) => {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await updateDoc(activityRef, {
        read: true
      });
    } catch (error) {
      console.error('Error marking activity as read:', error);
    }
  };

  const handleDelete = async (activityId) => {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await deleteDoc(activityRef);
    } catch (error) {
      console.error('Error deleting activity:', error);
    }
  };

  const handleBulkAction = async (action) => {
    try {
      const batch = writeBatch(db);
      selectedActivities.forEach(activityId => {
        const activityRef = doc(db, 'activities', activityId);
        if (action === 'delete') {
          batch.delete(activityRef);
        } else if (action === 'markRead') {
          batch.update(activityRef, { read: true });
        }
      });
      await batch.commit();
      setSelectedActivities(new Set());
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  const toggleSelectActivity = (activityId, selected) => {
    const newSelected = new Set(selectedActivities);
    if (selected) {
      newSelected.add(activityId);
    } else {
      newSelected.delete(activityId);
    }
    setSelectedActivities(newSelected);
  };

  const selectAll = () => {
    if (selectedActivities.size === activities.length) {
      setSelectedActivities(new Set());
    } else {
      setSelectedActivities(new Set(activities.map(a => a.id)));
    }
  };

  const activityTypes = [
    { id: 'all', label: 'All' },
    { id: 'upload', label: 'Uploads' },
    { id: 'like', label: 'Likes' },
    { id: 'comment', label: 'Comments' },
    { id: 'playlist', label: 'Playlists' }
  ];

  const filteredActivities = activities.filter(activity => 
    filter === 'all' ? true : activity.type === filter
  );

  if (!currentUser) {
    return (
      <div className="text-center py-12 bg-light/20 rounded-lg">
        <p className="text-white/70">Please log in to view activities</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <h2 className="text-xl sm:text-2xl font-bold">Activity Feed</h2>
          {selectedActivities.size > 0 && (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('markRead')}
                className="px-2 sm:px-3 py-1 bg-primary text-white rounded-full text-xs sm:text-sm"
              >
                Mark Read
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('delete')}
                className="px-2 sm:px-3 py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm"
              >
                Delete
              </motion.button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {activityTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
                filter === type.id
                  ? 'bg-primary text-white'
                  : 'bg-light/10 text-white/70 hover:bg-light/20'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <UilSpinner className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredActivities.length === 0 ? (
        <div className="text-center py-8 bg-light/5 rounded-lg">
          <p className="text-white/50">No activities to display</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredActivities.map((activity) => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              isSelected={selectedActivities.has(activity.id)}
              onSelect={toggleSelectActivity}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 
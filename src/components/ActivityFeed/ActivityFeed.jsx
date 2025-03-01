import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilMusic, UilHeart, UilListUl, UilUser,
  UilClock, UilRefresh, UilFilter, UilSpinner,
  UilCheck, UilTrashAlt, UilEye
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  getDocs, onSnapshot, updateDoc, doc,
  deleteDoc, writeBatch, serverTimestamp
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const ActivityItem = ({ activity, onMarkRead, onDelete, isSelected, onSelect }) => {
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
    try {
      if (timestamp.toDate) {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex space-x-3 p-4 rounded-lg group relative ${
        activity.read ? 'bg-dark/30' : 'bg-dark/50'
      } ${isSelected ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="absolute top-2 right-2 flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => onSelect(activity.id, e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
      </div>
      
      <img
        src={activity.userPhotoURL || '/default-avatar.png'}
        alt={activity.userName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-medium text-sm text-white">{activity.userName}</span>
            <p className="text-sm mt-1 text-white/90">{activity.text}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <UilClock className="w-3 h-3 text-white/70" />
          <span className="text-xs text-white/70">
            {getFormattedTime(activity.timestamp)}
          </span>
          {!activity.read && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary text-white">
              New
            </span>
          )}
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
        {!activity.read && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onMarkRead(activity.id)}
            className="p-1 hover:bg-light/30 rounded-full text-white/70 hover:text-white"
          >
            <UilEye className="w-4 h-4" />
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(activity.id)}
          className="p-1 hover:bg-light/30 rounded-full text-white/70 hover:text-red-500"
        >
          <UilTrashAlt className="w-4 h-4" />
        </motion.button>
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

    const q = query(
      collection(db, 'activities'),
      where('userId', '==', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const activityList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setActivities(activityList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleMarkRead = async (activityId) => {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await updateDoc(activityRef, {
        read: true,
        readAt: serverTimestamp()
      });
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking activity as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (activityId) => {
    try {
      await deleteDoc(doc(db, 'activities', activityId));
      toast.success('Activity deleted');
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Failed to delete activity');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedActivities.size === 0) return;

    const batch = writeBatch(db);
    const selectedIds = Array.from(selectedActivities);

    try {
      for (const id of selectedIds) {
        const activityRef = doc(db, 'activities', id);
        if (action === 'read') {
          batch.update(activityRef, {
            read: true,
            readAt: serverTimestamp()
          });
        } else if (action === 'delete') {
          batch.delete(activityRef);
        }
      }

      await batch.commit();
      setSelectedActivities(new Set());
      toast.success(`${action === 'read' ? 'Marked selected as read' : 'Deleted selected activities'}`);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      toast.error(`Failed to ${action} selected activities`);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Activity Feed</h2>
          {selectedActivities.size > 0 && (
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('read')}
                className="px-3 py-1 bg-primary text-white rounded-full text-sm"
              >
                Mark Read
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 bg-red-500 text-white rounded-full text-sm"
              >
                Delete
              </motion.button>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={selectAll}
            className="px-3 py-1 bg-light text-white/70 hover:text-white rounded-full text-sm"
          >
            {selectedActivities.size === activities.length ? 'Deselect All' : 'Select All'}
          </motion.button>
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
                    'bg-light text-white/70 hover:text-white hover:bg-light/70'}`}
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
          {filteredActivities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              isSelected={selectedActivities.has(activity.id)}
              onSelect={(selected) => toggleSelectActivity(activity.id, selected)}
            />
          ))}
          {filteredActivities.length === 0 && (
            <div className="text-center py-12 bg-light/20 rounded-lg">
              <p className="text-white/70">No activities to show</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed; 
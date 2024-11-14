import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UilUserPlus, UilMusic, UilHeart, 
  UilUsersAlt, UilSpinner 
} from '@iconscout/react-unicons';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, getDocs, 
  limit, orderBy, doc, getDoc 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';

const RecommendedUsers = ({ onFollow, currentFollowing }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Get users with similar music preferences
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userGenres = userDoc.data()?.preferredGenres || [];

        // Query users with similar genres who aren't already followed
        const usersQuery = query(
          collection(db, 'users'),
          where('preferredGenres', 'array-contains-any', userGenres),
          where('uid', 'not-in', [...currentFollowing, currentUser.uid]),
          orderBy('stats.followers', 'desc'),
          limit(5)
        );

        const usersSnapshot = await getDocs(usersQuery);
        const recommendedUsers = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setRecommendations(recommendedUsers);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setLoading(false);
      }
    };

    if (currentUser && currentFollowing) {
      fetchRecommendations();
    }
  }, [currentUser, currentFollowing]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <UilSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold mb-4">Recommended Users</h3>
      {recommendations.map(user => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-light/50 p-4 rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h4 className="font-medium">{user.displayName}</h4>
              <div className="flex items-center space-x-4 text-sm text-lightest">
                <div className="flex items-center space-x-1">
                  <UilMusic className="w-4 h-4" />
                  <span>{user.stats?.uploads || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UilHeart className="w-4 h-4" />
                  <span>{user.stats?.likes || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <UilUsersAlt className="w-4 h-4" />
                  <span>{user.stats?.followers || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onFollow(user)}
            className="px-4 py-2 bg-primary text-white rounded-full flex items-center space-x-2"
          >
            <UilUserPlus className="w-5 h-5" />
            <span>Follow</span>
          </motion.button>
        </motion.div>
      ))}

      {recommendations.length === 0 && (
        <div className="text-center py-8 bg-light/20 rounded-lg">
          <p className="text-lightest">No recommendations available</p>
        </div>
      )}
    </div>
  );
};

export default RecommendedUsers; 
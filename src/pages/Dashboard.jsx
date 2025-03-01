import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase.config';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { UilMusic, UilHeart, UilPlay, UilUsersAlt } from '@iconscout/react-unicons';
import { formatDuration } from '../utils/formatTime';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalPlays: 0,
    totalLikes: 0,
    totalFollowers: 0
  });
  const [recentTracks, setRecentTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user stats
  useEffect(() => {
    if (!currentUser) return;

    const userRef = collection(db, 'users');
    const userQuery = query(userRef, where('uid', '==', currentUser.uid));

    const unsubscribe = onSnapshot(userQuery, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        setStats({
          totalTracks: userData.stats?.uploads || 0,
          totalPlays: userData.stats?.plays || 0,
          totalLikes: userData.stats?.likes || 0,
          totalFollowers: userData.stats?.followers || 0
        });
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch recent tracks
  useEffect(() => {
    if (!currentUser) return;

    const tracksRef = collection(db, 'tracks');
    const recentQuery = query(
      tracksRef,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(recentQuery, (snapshot) => {
      const tracks = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
        .slice(0, 5);
      setRecentTracks(tracks);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Fetch top tracks
  useEffect(() => {
    if (!currentUser) return;

    const tracksRef = collection(db, 'tracks');
    const topQuery = query(
      tracksRef,
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(topQuery, (snapshot) => {
      const tracks = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => (b.plays || 0) - (a.plays || 0))
        .slice(0, 5);
      setTopTracks(tracks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Please login to view your dashboard</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <UilMusic className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-sm text-gray-400">Total Tracks</h3>
              <p className="text-2xl font-bold">{stats.totalTracks}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <UilPlay className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-sm text-gray-400">Total Plays</h3>
              <p className="text-2xl font-bold">{stats.totalPlays}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <UilHeart className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-sm text-gray-400">Total Likes</h3>
              <p className="text-2xl font-bold">{stats.totalLikes}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <div className="flex items-center space-x-4">
            <UilUsersAlt className="w-8 h-8 text-primary" />
            <div>
              <h3 className="text-sm text-gray-400">Followers</h3>
              <p className="text-2xl font-bold">{stats.totalFollowers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent and Top Tracks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Tracks */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <h2 className="text-xl font-bold mb-4">Recent Tracks</h2>
          <div className="space-y-4">
            {recentTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 rounded hover:bg-light/5"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={track.coverUrl || '/default-cover.jpg'}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-gray-400">{formatDuration(track.duration || 0)}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(track.createdAt?.toDate()).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Tracks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-dark/50 p-6 rounded-lg"
        >
          <h2 className="text-xl font-bold mb-4">Top Tracks</h2>
          <div className="space-y-4">
            {topTracks.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2 rounded hover:bg-light/5"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={track.coverUrl || '/default-cover.jpg'}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-gray-400">{track.plays || 0} plays</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <UilHeart className="w-4 h-4" />
                  <span>{track.likes || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard; 
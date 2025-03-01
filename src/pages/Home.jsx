import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../config/firebase.config';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { UilPlay } from '@iconscout/react-unicons';
import { useMusic } from '../context/MusicContext';
import NowPlaying from '../components/NowPlaying';
import TrendingSection from '../components/TrendingSection/TrendingSection';
import RecentActivity from '../components/ActivityFeed/ActivityFeed';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const [trendingTracks, setTrendingTracks] = useState([]);
  const [recentTracks, setRecentTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useMusic();

  // Fetch trending tracks (most played)
  useEffect(() => {
    const tracksRef = collection(db, 'tracks');
    const trendingQuery = query(
      tracksRef,
      orderBy('plays', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(trendingQuery, (snapshot) => {
      const tracks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTrendingTracks(tracks);
    });

    return () => unsubscribe();
  }, []);

  // Fetch recent tracks
  useEffect(() => {
    const tracksRef = collection(db, 'tracks');
    const recentQuery = query(
      tracksRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(recentQuery, (snapshot) => {
      const tracks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRecentTracks(tracks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePlay = (track) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: track });
    dispatch({ type: 'SET_PLAYLIST', payload: recentTracks });
    dispatch({ type: 'TOGGLE_PLAYING', payload: true });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/20 to-dark p-8 rounded-xl"
      >
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {currentUser?.displayName}!
        </h1>
        <p className="text-lightest">
          Discover new music, follow your favorite artists, and create your perfect playlist.
        </p>
      </motion.div>

      {/* Now Playing */}
      <section>
        <NowPlaying />
      </section>

      {/* Trending Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingTracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark/50 rounded-lg overflow-hidden group"
            >
              <div className="relative">
                <img
                  src={track.coverUrl || '/default-cover.jpg'}
                  alt={track.title}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => handlePlay(track)}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <UilPlay className="w-12 h-12 text-white" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-1">{track.title}</h3>
                <p className="text-gray-400">{track.artist}</p>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <span>{track.plays || 0} plays</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
        <RecentActivity />
      </section>
    </div>
  );
};

export default Home; 
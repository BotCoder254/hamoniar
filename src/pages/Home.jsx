import React from 'react';
import { motion } from 'framer-motion';
import NowPlaying from '../components/NowPlaying';
import TrendingSection from '../components/TrendingSection/TrendingSection';
import RecentActivity from '../components/ActivityFeed/ActivityFeed';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Home = () => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

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
      <section>
        <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
        <TrendingSection />
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
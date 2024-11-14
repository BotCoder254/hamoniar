import React from 'react';
import { motion } from 'framer-motion';
import NowPlaying from '../components/NowPlaying';
import TrendingSection from '../components/TrendingSection/TrendingSection';
import RecentActivity from '../components/ActivityFeed/ActivityFeed';
import RecommendedUsers from '../components/UserFollowing/RecommendedUsers';
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

      {/* Activity and Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <RecentActivity />
        </div>

        {/* Recommended Users */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Recommended Users</h2>
          <RecommendedUsers 
            onFollow={(user) => {
              addToast(`Started following ${user.displayName}`, 'success');
            }}
            currentFollowing={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Home; 
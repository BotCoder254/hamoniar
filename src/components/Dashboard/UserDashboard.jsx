import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilChart, UilHistory, UilHeart, UilMusic,
  UilUpload, UilUsers, UilPlay, UilClock,
  UilTrophy, UilFire, UilBullseye, UilAnalysis
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  limit, getDocs, getDoc, doc, onSnapshot
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import DashboardStats from './DashboardStats';
import { useUserStats } from '../../hooks/useUserStats';

const QuickStatsCard = ({ icon: Icon, label, value, change, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light p-6 rounded-xl relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full`} />
    <div className="flex justify-between items-start">
      <div>
        <p className="text-lightest text-sm mb-1">{label}</p>
        <h3 className="text-3xl font-bold">{value}</h3>
        <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const TopTrackCard = ({ track, rank, onPlay }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-light/50 p-4 rounded-lg flex items-center space-x-4 cursor-pointer"
    onClick={() => onPlay(track)}
  >
    <span className="text-2xl font-bold text-primary w-8">{rank}</span>
    <img 
      src={track.albumArt || "/default-album-art.jpg"}
      alt={track.title}
      className="w-12 h-12 rounded-lg object-cover"
    />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium truncate">{track.title}</h4>
      <p className="text-sm text-lightest truncate">{track.artist}</p>
    </div>
    <div className="flex items-center space-x-3 text-lightest">
      <div className="flex items-center space-x-1">
        <UilPlay className="w-4 h-4" />
        <span className="text-sm">{track.plays || 0}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UilHeart className="w-4 h-4" />
        <span className="text-sm">{track.likes?.length || 0}</span>
      </div>
    </div>
  </motion.div>
);

const RecentActivityCard = ({ activity }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-light/30 p-4 rounded-lg flex items-center space-x-4"
  >
    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
      {activity.icon}
    </div>
    <div className="flex-1">
      <p className="text-sm">{activity.text}</p>
      <p className="text-xs text-lightest">
        {formatDistanceToNow(activity.timestamp.toDate(), { addSuffix: true })}
      </p>
    </div>
  </motion.div>
);

const RecommendationCard = ({ track, onPlay }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light rounded-xl overflow-hidden"
  >
    <div className="relative aspect-square">
      <img
        src={track.albumArt || "/default-album-art.jpg"}
        alt={track.title}
        className="w-full h-full object-cover"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPlay(track)}
        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 
                  transition-opacity flex items-center justify-center"
      >
        <UilPlay className="w-12 h-12 text-white" />
      </motion.button>
    </div>
    <div className="p-4">
      <h4 className="font-medium truncate">{track.title}</h4>
      <p className="text-sm text-lightest truncate">{track.artist}</p>
    </div>
  </motion.div>
);

const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { stats, loading } = useUserStats(currentUser?.uid);
  const [activities, setActivities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [topTracks, setTopTracks] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser) return;

      try {
        // Fetch recent activities without complex indexing
        const activitiesQuery = query(
          collection(db, 'activities'),
          where('userId', '==', currentUser.uid),
          limit(20)
        );

        const activitiesSnapshot = await getDocs(activitiesQuery);
        const activitiesList = activitiesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis())
          .slice(0, 5);
        setActivities(activitiesList);

        // Fetch top tracks without complex indexing
        const tracksQuery = query(
          collection(db, 'music'),
          where('uploadedBy', '==', currentUser.uid),
          limit(20)
        );

        const tracksSnapshot = await getDocs(tracksQuery);
        const tracksList = tracksSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => (b.plays || 0) - (a.plays || 0))
          .slice(0, 5);
        setTopTracks(tracksList);

        // Fetch user preferences and recommendations
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userGenres = userDoc.data()?.preferredGenres || [];
        
        // Fetch recommendations without complex indexing
        const recommendationsQuery = query(
          collection(db, 'music'),
          limit(50)
        );
        const recommendationsSnapshot = await getDocs(recommendationsQuery);
        const allTracks = recommendationsSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(track => track.uploadedBy !== currentUser.uid);

        // Filter and sort recommendations based on user preferences
        const recommendationsList = userGenres.length > 0
          ? allTracks
              .filter(track => userGenres.includes(track.genre))
              .sort(() => Math.random() - 0.5)
              .slice(0, 5)
          : allTracks
              .sort(() => Math.random() - 0.5)
              .slice(0, 5);

        setRecommendations(recommendationsList);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();

    // Set up real-time listeners for updates
    const unsubscribeActivities = onSnapshot(
      query(
        collection(db, 'activities'),
        where('userId', '==', currentUser.uid),
        limit(20)
      ),
      (snapshot) => {
        const updatedActivities = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis())
          .slice(0, 5);
        setActivities(updatedActivities);
      }
    );

    const unsubscribeTracks = onSnapshot(
      query(
        collection(db, 'music'),
        where('uploadedBy', '==', currentUser.uid),
        limit(20)
      ),
      (snapshot) => {
        const updatedTracks = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .sort((a, b) => (b.plays || 0) - (a.plays || 0))
          .slice(0, 5);
        setTopTracks(updatedTracks);
      }
    );

    return () => {
      unsubscribeActivities();
      unsubscribeTracks();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-lightest">
          Last updated: {formatDistanceToNow(new Date(), { addSuffix: true })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <QuickStatsCard
          icon={UilTrophy}
          label="Total Plays"
          value={stats.totalPlays.toLocaleString()}
          change={12}
          color="bg-blue-500"
        />
        <QuickStatsCard
          icon={UilFire}
          label="Active Streak"
          value={`${stats.activeStreak} days`}
          change={5}
          color="bg-red-500"
        />
        <QuickStatsCard
          icon={UilBullseye}
          label="Engagement Rate"
          value={`${stats.engagementRate}%`}
          change={8}
          color="bg-green-500"
        />
        <QuickStatsCard
          icon={UilAnalysis}
          label="Growth"
          value={`${stats.growth}%`}
          change={15}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <DashboardStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Tracks */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center">
            <UilTrophy className="w-5 h-5 mr-2 text-yellow-500" />
            Your Top Tracks
          </h2>
          <div className="space-y-4">
            {topTracks.map((track, index) => (
              <TopTrackCard
                key={track.id}
                track={track}
                rank={index + 1}
                onPlay={() => {}}
              />
            ))}
            {topTracks.length === 0 && (
              <div className="text-center py-8 bg-light/20 rounded-lg">
                <p className="text-lightest">No tracks uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center">
            <UilHistory className="w-5 h-5 mr-2 text-blue-500" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {activities.map(activity => (
              <RecentActivityCard
                key={activity.id}
                activity={activity}
              />
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 bg-light/20 rounded-lg">
                <p className="text-lightest">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center">
          <UilFire className="w-5 h-5 mr-2 text-red-500" />
          Recommended for You
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommendations.map(track => (
            <RecommendationCard
              key={track.id}
              track={track}
              onPlay={() => {}}
            />
          ))}
          {recommendations.length === 0 && (
            <div className="col-span-full text-center py-8 bg-light/20 rounded-lg">
              <p className="text-lightest">No recommendations available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 
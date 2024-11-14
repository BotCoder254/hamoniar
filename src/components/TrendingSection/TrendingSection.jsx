import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilFire, UilChart, UilTrophy, UilHeadphones,
  UilPlay, UilHeart, UilClock, UilArrowRight
} from '@iconscout/react-unicons';
import { db } from '../../config/firebase.config';
import { 
  collection, query, orderBy, limit, 
  where, getDocs, Timestamp 
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useMusic } from '../../context/MusicContext';
import { useNavigate } from 'react-router-dom';

const TrendingCard = ({ track, rank, onPlay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className="bg-light/30 p-4 rounded-lg flex items-center space-x-4"
  >
    <span className="text-2xl font-bold text-primary w-8">{rank}</span>
    <div className="relative group">
      <img 
        src={track.albumArt || "/default-album-art.jpg"}
        alt={track.title}
        className="w-16 h-16 rounded-lg object-cover"
      />
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPlay(track)}
        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                  rounded-lg flex items-center justify-center transition-opacity"
      >
        <UilPlay className="w-8 h-8 text-white" />
      </motion.button>
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-medium truncate">{track.title}</h3>
      <p className="text-sm text-lightest truncate">{track.artist}</p>
    </div>
    <div className="flex items-center space-x-4 text-lightest">
      <div className="flex items-center space-x-1">
        <UilHeadphones className="w-4 h-4" />
        <span className="text-sm">{track.plays?.toLocaleString()}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UilHeart className="w-4 h-4" />
        <span className="text-sm">{track.likes?.length || 0}</span>
      </div>
    </div>
  </motion.div>
);

const TrendingArtistCard = ({ artist }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light/30 p-4 rounded-lg text-center"
  >
    <img 
      src={artist.photoURL || "/default-avatar.png"}
      alt={artist.displayName}
      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
    />
    <h3 className="font-medium">{artist.displayName}</h3>
    <p className="text-sm text-lightest mt-1">{artist.totalPlays} plays</p>
    <div className="flex items-center justify-center space-x-2 mt-2">
      <UilHeart className="w-4 h-4 text-primary" />
      <span className="text-sm">{artist.followers} followers</span>
    </div>
  </motion.div>
);

const TrendingSection = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [weeklyTop, setWeeklyTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useMusic();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        // Get top tracks of all time
        const topTracksQuery = query(
          collection(db, 'music'),
          orderBy('plays', 'desc'),
          limit(10)
        );
        const topTracksSnapshot = await getDocs(topTracksQuery);
        const topTracksList = topTracksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTopTracks(topTracksList);

        // Get weekly top tracks
        const oneWeekAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
        const weeklyTopQuery = query(
          collection(db, 'music'),
          where('uploadedAt', '>', oneWeekAgo),
          orderBy('uploadedAt', 'desc'),
          orderBy('plays', 'desc'),
          limit(5)
        );
        const weeklyTopSnapshot = await getDocs(weeklyTopQuery);
        const weeklyTopList = weeklyTopSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWeeklyTop(weeklyTopList);

        // Get trending artists
        const artistsQuery = query(
          collection(db, 'users'),
          orderBy('stats.followers', 'desc'),
          limit(5)
        );
        const artistsSnapshot = await getDocs(artistsQuery);
        const artistsList = artistsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTrendingArtists(artistsList);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  const handlePlay = (track) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: track });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Top 10 All Time */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UilTrophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Top 10 All Time</h2>
          </div>
          <motion.button
            whileHover={{ x: 5 }}
            onClick={() => navigate('/trending')}
            className="flex items-center space-x-2 text-primary"
          >
            <span>View All</span>
            <UilArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
        <div className="space-y-4">
          {topTracks.map((track, index) => (
            <TrendingCard
              key={track.id}
              track={track}
              rank={index + 1}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </section>

      {/* Trending This Week */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <UilFire className="w-6 h-6 text-red-500" />
          <h2 className="text-2xl font-bold">Trending This Week</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyTop.map((track, index) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-light/30 rounded-lg overflow-hidden"
            >
              <img 
                src={track.albumArt || "/default-album-art.jpg"}
                alt={track.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-4">
                <h3 className="font-medium truncate">{track.title}</h3>
                <p className="text-sm text-lightest truncate">{track.artist}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-2 text-lightest">
                    <UilClock className="w-4 h-4" />
                    <span className="text-sm">
                      {formatDistanceToNow(track.uploadedAt?.toDate(), { addSuffix: true })}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handlePlay(track)}
                    className="p-2 bg-primary rounded-full"
                  >
                    <UilPlay className="w-5 h-5 text-white" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trending Artists */}
      <section>
        <div className="flex items-center space-x-2 mb-6">
          <UilChart className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold">Trending Artists</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {trendingArtists.map((artist, index) => (
            <TrendingArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrendingSection; 
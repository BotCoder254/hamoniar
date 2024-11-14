import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilFire, UilChart, UilTrophy, UilHeadphones,
  UilPlay, UilHeart, UilClock, UilFilter,
  UilMusic, UilUsersAlt, UilArrowUp, UilGlobe
} from '@iconscout/react-unicons';
import { db } from '../config/firebase.config';
import { 
  collection, query, orderBy, limit, 
  where, getDocs, Timestamp 
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { useMusic } from '../context/MusicContext';
import LikeButton from '../components/LikeButton/LikeButton';

const TimeFilter = ({ active, onChange }) => {
  const timeRanges = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'allTime', label: 'All Time' }
  ];

  return (
    <div className="flex space-x-2">
      {timeRanges.map(range => (
        <motion.button
          key={range.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(range.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium
            ${active === range.id ? 'bg-primary text-white' : 'bg-light text-lightest hover:bg-light/70'}`}
        >
          {range.label}
        </motion.button>
      ))}
    </div>
  );
};

const TrendingTrackCard = ({ track, rank, onPlay }) => (
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
      <h4 className="font-medium truncate">{track.title}</h4>
      <p className="text-sm text-lightest truncate">{track.artist}</p>
    </div>
    <div className="flex items-center space-x-6 text-lightest">
      <div className="flex items-center space-x-1">
        <UilHeadphones className="w-4 h-4" />
        <span className="text-sm">{track.plays?.toLocaleString()}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UilArrowUp className="w-4 h-4" />
        <span className="text-sm text-green-500">+{track.growth}%</span>
      </div>
      <LikeButton trackId={track.id} />
    </div>
  </motion.div>
);

const TrendingArtistCard = ({ artist, rank }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light/30 p-6 rounded-xl text-center relative overflow-hidden"
  >
    <div className="absolute top-2 left-2">
      <span className="text-xl font-bold text-primary">#{rank}</span>
    </div>
    <img 
      src={artist.photoURL || "/default-avatar.png"}
      alt={artist.displayName}
      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
    />
    <h3 className="font-bold text-lg mb-2">{artist.displayName}</h3>
    <div className="flex items-center justify-center space-x-4 text-sm text-lightest">
      <div className="flex items-center space-x-1">
        <UilMusic className="w-4 h-4" />
        <span>{artist.stats?.uploads || 0}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UilHeart className="w-4 h-4" />
        <span>{artist.stats?.likes || 0}</span>
      </div>
      <div className="flex items-center space-x-1">
        <UilUsersAlt className="w-4 h-4" />
        <span>{artist.stats?.followers || 0}</span>
      </div>
    </div>
    <div className="mt-4 text-sm">
      <span className="text-green-500 flex items-center justify-center space-x-1">
        <UilArrowUp className="w-4 h-4" />
        <span>+{artist.growth}% this week</span>
      </span>
    </div>
  </motion.div>
);

const TrendingGenreCard = ({ genre, rank }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light/30 p-6 rounded-xl relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full
      ${rank % 4 === 0 ? 'bg-blue-500' : 
        rank % 4 === 1 ? 'bg-purple-500' : 
        rank % 4 === 2 ? 'bg-green-500' : 'bg-red-500'}`}
    />
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-bold text-xl mb-2">{genre.name}</h3>
        <div className="flex items-center space-x-4 text-sm text-lightest">
          <div className="flex items-center space-x-1">
            <UilMusic className="w-4 h-4" />
            <span>{genre.tracks} tracks</span>
          </div>
          <div className="flex items-center space-x-1">
            <UilGlobe className="w-4 h-4" />
            <span>{genre.listeners}k listeners</span>
          </div>
        </div>
      </div>
      <div className="text-2xl font-bold text-primary">#{rank}</div>
    </div>
  </motion.div>
);

const TrendingPage = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [topTracks, setTopTracks] = useState([]);
  const [trendingArtists, setTrendingArtists] = useState([]);
  const [trendingGenres, setTrendingGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useMusic();

  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        // Get time threshold based on selected range
        let timeThreshold = new Date();
        switch (timeRange) {
          case 'today':
            timeThreshold.setHours(timeThreshold.getHours() - 24);
            break;
          case 'week':
            timeThreshold.setDate(timeThreshold.getDate() - 7);
            break;
          case 'month':
            timeThreshold.setMonth(timeThreshold.getMonth() - 1);
            break;
          default:
            timeThreshold = null;
        }

        // Fetch top tracks
        let tracksQuery = query(
          collection(db, 'music'),
          orderBy('plays', 'desc'),
          limit(50)
        );

        if (timeThreshold) {
          tracksQuery = query(
            collection(db, 'music'),
            where('uploadedAt', '>', Timestamp.fromDate(timeThreshold)),
            orderBy('uploadedAt', 'desc'),
            orderBy('plays', 'desc'),
            limit(50)
          );
        }

        const tracksSnapshot = await getDocs(tracksQuery);
        setTopTracks(tracksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch trending artists
        const artistsQuery = query(
          collection(db, 'users'),
          orderBy('stats.followers', 'desc'),
          limit(20)
        );
        const artistsSnapshot = await getDocs(artistsQuery);
        setTrendingArtists(artistsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch trending genres
        const genresQuery = query(
          collection(db, 'genres'),
          orderBy('listeners', 'desc'),
          limit(12)
        );
        const genresSnapshot = await getDocs(genresQuery);
        setTrendingGenres(genresSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setLoading(false);
      }
    };

    fetchTrendingData();
  }, [timeRange]);

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
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <UilFire className="w-8 h-8 mr-2 text-red-500" />
            Trending Now
          </h1>
          <p className="text-lightest mt-2">
            Discover what's hot in the music world
          </p>
        </div>
        <TimeFilter active={timeRange} onChange={setTimeRange} />
      </div>

      {/* Top Tracks */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <UilTrophy className="w-6 h-6 mr-2 text-yellow-500" />
          Top 50 Tracks
        </h2>
        <div className="space-y-4">
          {topTracks.map((track, index) => (
            <TrendingTrackCard
              key={track.id}
              track={track}
              rank={index + 1}
              onPlay={handlePlay}
            />
          ))}
        </div>
      </section>

      {/* Trending Artists */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <UilUsersAlt className="w-6 h-6 mr-2 text-blue-500" />
          Trending Artists
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {trendingArtists.map((artist, index) => (
            <TrendingArtistCard
              key={artist.id}
              artist={artist}
              rank={index + 1}
            />
          ))}
        </div>
      </section>

      {/* Trending Genres */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <UilMusic className="w-6 h-6 mr-2 text-purple-500" />
          Trending Genres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingGenres.map((genre, index) => (
            <TrendingGenreCard
              key={genre.id}
              genre={genre}
              rank={index + 1}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default TrendingPage; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilPlay, UilHeart, UilShare, UilFilter,
  UilMusic, UilSpinner, UilCommentAlt,
  UilGrid, UilListUl, UilSort
} from '@iconscout/react-unicons';
import { useMusic } from '../../context/MusicContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, orderBy, 
  limit, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove 
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from '../LikeButton/LikeButton';
import Comments from '../Comments/Comments';
import DefaultAlbumIcon from '../icons/DefaultAlbumIcon';

const ViewToggle = ({ view, onViewChange }) => (
  <div className="bg-light rounded-lg p-1 flex space-x-1">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onViewChange('grid')}
      className={`p-2 rounded-lg ${view === 'grid' ? 'bg-primary text-white' : 'text-lightest'}`}
    >
      <UilGrid className="w-5 h-5" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onViewChange('list')}
      className={`p-2 rounded-lg ${view === 'list' ? 'bg-primary text-white' : 'text-lightest'}`}
    >
      <UilListUl className="w-5 h-5" />
    </motion.button>
  </div>
);

const SortDropdown = ({ sort, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'likes', label: 'Most Liked' }
  ];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-light px-4 py-2 rounded-lg"
      >
        <UilSort className="w-5 h-5" />
        <span>{sortOptions.find(option => option.value === sort)?.label}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 w-48 bg-dark rounded-lg shadow-xl z-10"
          >
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => {
                  onSortChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-light transition-colors
                  ${sort === option.value ? 'text-primary' : 'text-lightest'}`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MusicCard = ({ track, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { currentUser } = useAuth();

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/track/${track.id}`;
      await navigator.clipboard.writeText(shareUrl);
      // Show success toast
    } catch (error) {
      console.error('Error sharing track:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-light rounded-xl overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-dark flex items-center justify-center">
            <DefaultAlbumIcon className="w-32 h-32 text-white opacity-50" />
          </div>
        )}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex items-center justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onPlay(track)}
                className="w-16 h-16 bg-primary rounded-full flex items-center justify-center"
              >
                <UilPlay className="w-8 h-8 text-white" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white truncate">{track.title}</h3>
        <p className="text-sm text-lightest truncate">{track.artist}</p>
        
        <div className="flex items-center space-x-2 mt-2 text-xs text-lightest">
          <UilMusic className="w-4 h-4" />
          <span>{track.genre || 'Genre'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(track.uploadedAt?.toDate(), { addSuffix: true })}</span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LikeButton trackId={track.id} />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowComments(!showComments)}
              className="text-lightest hover:text-white"
            >
              <UilCommentAlt className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleShare}
              className="text-lightest hover:text-white"
            >
              <UilShare className="w-5 h-5" />
            </motion.button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-lightest">{track.plays || 0} plays</span>
          </div>
        </div>

        {showComments && (
          <Comments trackId={track.id} />
        )}
      </div>
    </motion.div>
  );
};

const MusicList = ({ track, onPlay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="bg-light p-4 rounded-lg hover:bg-light/70 transition-colors"
  >
    <div className="flex items-center space-x-4">
      <div className="relative group">
        {track.albumArt ? (
          <img
            src={track.albumArt}
            alt={track.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-dark flex items-center justify-center">
            <DefaultAlbumIcon className="w-10 h-10 text-white" />
          </div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onPlay(track)}
          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                    rounded-lg flex items-center justify-center transition-opacity"
        >
          <UilPlay className="w-6 h-6 text-white" />
        </motion.button>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-white truncate">{track.title}</h3>
        <p className="text-sm text-lightest truncate">{track.artist}</p>
        <div className="flex items-center space-x-2 mt-1 text-xs text-lightest">
          <UilMusic className="w-4 h-4" />
          <span>{track.genre || 'Genre'}</span>
          <span>•</span>
          <span>{formatDistanceToNow(track.uploadedAt?.toDate(), { addSuffix: true })}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <LikeButton trackId={track.id} />
        <span className="text-xs text-lightest">{track.plays || 0} plays</span>
      </div>
    </div>
  </motion.div>
);

const MusicFeed = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid');
  const [sort, setSort] = useState('recent');
  const [filter, setFilter] = useState('all');
  const { dispatch } = useMusic();
  const { currentUser } = useAuth();

  useEffect(() => {
    let q = collection(db, 'music');

    // Apply filters
    if (filter !== 'all') {
      q = query(q, where('genre', '==', filter));
    }

    // Apply sorting
    switch (sort) {
      case 'popular':
        q = query(q, orderBy('plays', 'desc'));
        break;
      case 'likes':
        q = query(q, orderBy('likes', 'desc'));
        break;
      default:
        q = query(q, orderBy('uploadedAt', 'desc'));
    }

    // Limit results
    q = query(q, limit(50));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newTracks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTracks(newTracks);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sort, filter]);

  const handlePlay = (track) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: track });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <UilSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <ViewToggle view={view} onViewChange={setView} />
          <SortDropdown sort={sort} onSortChange={setSort} />
        </div>
      </div>

      {/* Tracks Grid/List */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map(track => (
            <MusicCard
              key={track.id}
              track={track}
              onPlay={handlePlay}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map(track => (
            <MusicList
              key={track.id}
              track={track}
              onPlay={handlePlay}
            />
          ))}
        </div>
      )}

      {tracks.length === 0 && (
        <div className="text-center py-12 bg-light/20 rounded-lg">
          <UilMusic className="w-12 h-12 mx-auto text-lightest mb-4" />
          <h3 className="text-xl font-bold mb-2">No tracks found</h3>
          <p className="text-lightest">Try a different filter or upload some music</p>
        </div>
      )}
    </div>
  );
};

export default MusicFeed; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilPlay, UilHeart, UilShare, UilFilter,
  UilMusic, UilSpinner, UilCommentAlt
} from '@iconscout/react-unicons';
import { useUploadedTracks } from '../hooks/useUploadedTracks';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../utils/audio.utils';
import LikeButton from './LikeButton/LikeButton';
import Comments from './Comments/Comments';

const FilterButton = ({ active, onClick, children }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
      ${active ? 'bg-primary text-white' : 'bg-light text-lightest hover:bg-light/70'}`}
  >
    {children}
  </motion.button>
);

const MusicCard = ({ track, onPlay }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
        <img
          src={track.albumArt || "/default-album-art.jpg"}
          alt={track.title}
          className="w-full h-full object-cover"
        />
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
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <LikeButton trackId={track.id} />
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-lightest hover:text-white"
            >
              <UilCommentAlt className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-dark rounded-full transition-colors"
            >
              <UilHeart className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 hover:bg-dark rounded-full transition-colors"
            >
              <UilShare className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {showComments && (
          <Comments trackId={track.id} />
        )}
      </div>
    </motion.div>
  );
};

const MusicFeed = () => {
  const { tracks, loading } = useUploadedTracks();
  const { dispatch } = useMusic();
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('grid');

  const filteredTracks = tracks.filter(track => {
    if (filter === 'all') return true;
    return track.genre?.toLowerCase() === filter;
  });

  const genres = ['all', ...new Set(tracks.map(track => track.genre?.toLowerCase()).filter(Boolean))];

  const handlePlay = (track) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: track });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <UilSpinner className="w-8 h-8 animate-spin text-primary" />
          <p className="text-lightest">Loading amazing music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-x-auto pb-2">
          {genres.map(genre => (
            <FilterButton
              key={genre}
              active={filter === genre}
              onClick={() => setFilter(genre)}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </FilterButton>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          className="p-2 hover:bg-light rounded-full transition-colors"
        >
          <UilFilter className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Grid View */}
      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTracks.map(track => (
            <MusicCard
              key={track.id}
              track={track}
              onPlay={handlePlay}
            />
          ))}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredTracks.map(track => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 bg-light p-4 rounded-lg hover:bg-light/70 transition-colors"
            >
              <img
                src={track.albumArt || "/default-album-art.jpg"}
                alt={track.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-white">{track.title}</h3>
                <p className="text-sm text-lightest">{track.artist}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-lightest">{formatDuration(track.duration)}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePlay(track)}
                  className="p-3 bg-primary rounded-full"
                >
                  <UilPlay className="w-5 h-5 text-white" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredTracks.length === 0 && (
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
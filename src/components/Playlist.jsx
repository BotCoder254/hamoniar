import React from 'react';
import { motion } from 'framer-motion';
import { UilPlay, UilHeart, UilEllipsisH, UilSpinner, UilHeadphones } from '@iconscout/react-unicons';
import { useUploadedTracks } from '../hooks/useUploadedTracks';
import { useMusic } from '../context/MusicContext';
import { formatDuration } from '../utils/audio.utils';
import DefaultAlbumIcon from './icons/DefaultAlbumIcon';

const PlaylistItem = ({ song, isActive, index, onPlay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className={`flex items-center p-4 hover:bg-light rounded-lg transition-colors group ${
      isActive ? 'bg-light' : ''
    }`}
  >
    <motion.div
      whileHover={{ scale: 1.1 }}
      className="relative group cursor-pointer"
      onClick={() => onPlay(song)}
    >
      {song.albumArt ? (
        <img 
          src={song.albumArt} 
          alt="Album Art" 
          className="w-12 h-12 rounded-md shadow-md object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-md shadow-md bg-dark flex items-center justify-center">
          <DefaultAlbumIcon className="w-8 h-8 text-white" />
        </div>
      )}
      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 
                    transition-all duration-300 rounded-md flex items-center justify-center">
        <UilPlay className="w-5 h-5 text-white" />
      </div>
    </motion.div>

    <div className="flex-1 ml-4">
      <h3 className={`font-medium ${isActive ? 'text-primary' : 'text-white'}`}>
        {song.title}
      </h3>
      <div className="flex items-center space-x-2">
        <p className="text-sm text-lightest">{song.artist}</p>
        <span className="text-xs text-gray-500">•</span>
        <p className="text-sm text-lightest">{song.album}</p>
      </div>
    </div>

    <div className="flex items-center space-x-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <motion.button 
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
      >
        <UilHeart className="w-5 h-5" />
      </motion.button>
      <span className="text-sm text-lightest">{formatDuration(song.duration)}</span>
      <motion.button 
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 hover:bg-gray-700 rounded-full transition-colors"
      >
        <UilEllipsisH className="w-5 h-5" />
      </motion.button>
    </div>
  </motion.div>
);

const Playlist = () => {
  const { tracks, loading } = useUploadedTracks();
  const { state, dispatch } = useMusic();

  const handlePlay = (song) => {
    dispatch({ type: 'SET_CURRENT_SONG', payload: song });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <UilSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 bg-light/50 rounded-lg">
        <UilHeadphones className="w-12 h-12 mx-auto text-lightest mb-4" />
        <h3 className="text-xl font-bold mb-2">No tracks yet</h3>
        <p className="text-lightest">Upload some music to get started</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      {tracks.map((track, index) => (
        <PlaylistItem 
          key={track.id}
          song={track}
          isActive={state.currentSong?.id === track.id}
          index={index}
          onPlay={handlePlay}
        />
      ))}
    </motion.div>
  );
};

export default Playlist; 

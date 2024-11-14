import React from 'react';
import { motion } from 'framer-motion';
import { useMusic } from '../context/MusicContext';
import MusicVisualization from './MusicVisualization';

const NowPlaying = () => {
  const { state } = useMusic();
  const currentSong = state.currentSong;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-primary/10 to-dark p-6 rounded-xl"
    >
      <h2 className="text-2xl font-bold mb-4">Now Playing</h2>
      
      <div className="flex space-x-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative group w-64 h-64"
        >
          <img
            src={currentSong?.albumArt || "/default-album-art.jpg"}
            alt="Album Art"
            className="w-full h-full object-cover rounded-lg shadow-2xl"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                        transition-opacity rounded-lg flex items-center justify-center">
            <MusicVisualization className="w-full h-full" />
          </div>
        </motion.div>

        <div className="flex-1 space-y-4">
          <div>
            <motion.h3 
              whileHover={{ scale: 1.02 }}
              className="text-3xl font-bold"
            >
              {currentSong?.title || 'No Track Selected'}
            </motion.h3>
            <p className="text-xl text-lightest">{currentSong?.artist}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-lightest">From the album</p>
            <p className="text-lg font-medium">{currentSong?.album}</p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-primary/20 rounded-full text-primary text-sm">
              {currentSong?.genre || 'Genre'}
            </div>
            <div className="px-3 py-1 bg-light rounded-full text-sm">
              {currentSong?.year || 'Year'}
            </div>
          </div>

          {currentSong?.lyrics && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-2">Lyrics Preview</h4>
              <p className="text-lightest line-clamp-3">{currentSong.lyrics}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NowPlaying; 
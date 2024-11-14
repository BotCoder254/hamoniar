import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UilMusic, UilClock, UilCalendarAlt } from '@iconscout/react-unicons';
import { useMusic } from '../context/MusicContext';

const TrackDetails = ({ isExpanded, onClose }) => {
  const { state } = useMusic();
  const currentSong = state.currentSong;

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-dark p-8 rounded-2xl max-w-2xl w-full mx-4 space-y-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex space-x-8">
              {/* Album Art */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative group"
              >
                <img
                  src={currentSong?.albumArt || '/default-album-art.jpg'}
                  alt="Album Art"
                  className="w-64 h-64 rounded-lg shadow-2xl"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <UilMusic className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>

              {/* Track Information */}
              <div className="flex-1 space-y-4">
                <motion.h2 
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  className="text-3xl font-bold text-white"
                >
                  {currentSong?.title || 'No Track Selected'}
                </motion.h2>
                
                <motion.p 
                  initial={{ x: -20, delay: 0.1 }}
                  animate={{ x: 0 }}
                  className="text-xl text-lightest"
                >
                  {currentSong?.artist || 'Unknown Artist'}
                </motion.p>

                <div className="space-y-3 mt-6">
                  <div className="flex items-center space-x-3 text-lightest">
                    <UilCalendarAlt className="w-5 h-5" />
                    <span>Album: {currentSong?.album || 'Unknown Album'}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-lightest">
                    <UilClock className="w-5 h-5" />
                    <span>Duration: {currentSong?.duration || '0:00'}</span>
                  </div>
                </div>

                {currentSong?.lyrics && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Lyrics</h3>
                    <p className="text-lightest whitespace-pre-line">
                      {currentSong.lyrics}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TrackDetails; 
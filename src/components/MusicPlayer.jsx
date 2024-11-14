import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilPlay, UilPause, UilSkipForward, UilStepBackward,
  UilVolume, UilVolumeMute, UilHeart, UilRepeat, 
  UilImport, UilShuffle, UilInfoCircle, UilSlidersV,
  UilAngleDown, UilAngleUp
} from '@iconscout/react-unicons';
import { useMusic } from '../context/MusicContext';
import { useAuth } from '../context/AuthContext';
import MusicVisualization from './MusicVisualization';
import Equalizer from './Equalizer';
import TrackDetails from './TrackDetails';
import { db } from '../config/firebase.config';
import { doc, updateDoc, increment } from 'firebase/firestore';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showTrackDetails, setShowTrackDetails] = useState(false);
  const [showEqualizer, setShowEqualizer] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none'); // none, one, all
  const [prevVolume, setPrevVolume] = useState(1);
  const [isMinimized, setIsMinimized] = useState(false);

  const { state, dispatch } = useMusic();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.volume(volume);
      
      state.currentSong.howl.on('play', () => {
        setIsPlaying(true);
        updatePlayCount();
      });
      
      state.currentSong.howl.on('pause', () => {
        setIsPlaying(false);
      });
      
      state.currentSong.howl.on('end', () => {
        handleSongEnd();
      });

      state.currentSong.howl.on('load', () => {
        setDuration(state.currentSong.howl.duration());
      });
    }

    return () => {
      if (state.currentSong?.howl) {
        state.currentSong.howl.off();
      }
    };
  }, [state.currentSong]);

  const updatePlayCount = async () => {
    if (!currentUser || !state.currentSong?.id) return;
    
    try {
      await updateDoc(doc(db, 'music', state.currentSong.id), {
        plays: increment(1)
      });
    } catch (error) {
      console.error('Error updating play count:', error);
    }
  };

  const togglePlay = () => {
    if (!state.currentSong?.howl) return;
    
    if (isPlaying) {
      state.currentSong.howl.pause();
    } else {
      state.currentSong.howl.play();
    }
  };

  const handleTimeUpdate = () => {
    if (state.currentSong?.howl) {
      setCurrentTime(state.currentSong.howl.seek());
    }
  };

  const handleProgressClick = (e) => {
    if (!state.currentSong?.howl) return;
    
    const progressBar = e.currentTarget;
    const clickPosition = (e.pageX - progressBar.offsetLeft) / progressBar.offsetWidth;
    const seekTime = clickPosition * duration;
    state.currentSong.howl.seek(seekTime);
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    if (state.currentSong?.howl) {
      state.currentSong.howl.volume(value);
    }
    if (value > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      handleVolumeChange(prevVolume);
    } else {
      setPrevVolume(volume);
      handleVolumeChange(0);
    }
    setIsMuted(!isMuted);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleRepeat = () => {
    const modes = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      if (state.currentSong?.howl) {
        state.currentSong.howl.seek(0);
        state.currentSong.howl.play();
      }
    } else if (repeatMode === 'all' || state.queue.length > 0) {
      playNextSong();
    }
  };

  const playNextSong = () => {
    if (state.queue.length > 0) {
      const nextSong = state.queue[0];
      dispatch({ type: 'SET_CURRENT_SONG', payload: nextSong });
      dispatch({ type: 'REMOVE_FROM_QUEUE', payload: 0 });
    }
  };

  const playPreviousSong = () => {
    if (state.playHistory.length > 0) {
      const previousSong = state.playHistory[state.playHistory.length - 1];
      dispatch({ type: 'SET_CURRENT_SONG', payload: previousSong });
      dispatch({ type: 'REMOVE_FROM_HISTORY' });
    }
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-lg border-t border-light/10 z-50
                  transition-all duration-300 ease-in-out
                  ${isMinimized ? 'h-16' : 'h-auto'}`}
    >
      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMinimized(!isMinimized)}
        className="absolute -top-8 right-8 p-2 bg-dark/95 rounded-t-lg border-t border-l border-r border-light/10"
      >
        {isMinimized ? (
          <UilAngleUp className="w-5 h-5" />
        ) : (
          <UilAngleDown className="w-5 h-5" />
        )}
      </motion.button>

      <div className="w-full max-w-none px-8 py-4">
        {/* Progress Bar */}
        <div 
          className="progress-bar mb-2 cursor-pointer"
          onClick={handleProgressClick}
        >
          <motion.div 
            className="progress-bar-filled"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-xs text-lightest mb-2"
            >
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative group cursor-pointer"
              onClick={() => !isMinimized && setShowTrackDetails(true)}
            >
              <img 
                src={state.currentSong?.albumArt || "/default-album-art.jpg"} 
                alt="Album Art" 
                className={`object-cover rounded-lg shadow-lg ${isMinimized ? 'w-12 h-12' : 'w-16 h-16'}`}
              />
              {!isMinimized && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                            transition-all duration-300 rounded-lg flex items-center justify-center">
                  <UilInfoCircle className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white truncate">
                {state.currentSong?.title || 'No Track Selected'}
              </h3>
              <p className="text-sm text-lightest truncate">
                {state.currentSong?.artist || 'Unknown Artist'}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsLiked(!isLiked)}
              className={`p-2 rounded-full hover:bg-light/30
                ${isLiked ? 'text-primary' : 'text-white'}`}
            >
              <UilHeart className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Player Controls */}
          <div className="flex items-center space-x-6 flex-1 justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
              className={`p-2 hover:bg-light/30 rounded-full
                ${state.isShuffled ? 'text-primary' : 'text-white'}`}
            >
              <UilShuffle className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={playPreviousSong}
              className="p-2 hover:bg-light/30 rounded-full"
            >
              <UilStepBackward className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="p-3 bg-primary hover:bg-primary/90 rounded-full text-white"
            >
              {isPlaying ? (
                <UilPause className="w-6 h-6" />
              ) : (
                <UilPlay className="w-6 h-6" />
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={playNextSong}
              className="p-2 hover:bg-light/30 rounded-full"
            >
              <UilSkipForward className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleRepeat}
              className={`p-2 hover:bg-light/30 rounded-full relative
                ${repeatMode !== 'none' ? 'text-primary' : 'text-white'}`}
            >
              <UilRepeat className="w-5 h-5" />
              {repeatMode === 'one' && (
                <span className="absolute -top-1 -right-1 text-xs bg-primary rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </motion.button>
          </div>

          {/* Volume & Additional Controls */}
          <div className="flex items-center space-x-4 flex-1 justify-end">
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center space-x-2"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleMute}
                    className="p-2 hover:bg-light/30 rounded-full"
                  >
                    {isMuted || volume === 0 ? (
                      <UilVolumeMute className="w-5 h-5" />
                    ) : (
                      <UilVolume className="w-5 h-5" />
                    )}
                  </motion.button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-24"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => !isMinimized && setShowEqualizer(!showEqualizer)}
              className={`p-2 hover:bg-light/30 rounded-full
                ${showEqualizer ? 'text-primary' : 'text-white'}`}
            >
              <UilSlidersV className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showEqualizer && !isMinimized && (
          <Equalizer onClose={() => setShowEqualizer(false)} />
        )}
      </AnimatePresence>

      <TrackDetails 
        isExpanded={showTrackDetails && !isMinimized}
        onClose={() => setShowTrackDetails(false)}
      />

      {/* Music Visualization */}
      {isPlaying && !isMinimized && <MusicVisualization />}
    </motion.div>
  );
};

export default MusicPlayer; 
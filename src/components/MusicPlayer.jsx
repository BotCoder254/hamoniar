import React, { useState, useEffect, useRef } from 'react';
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
import DefaultAlbumIcon from './icons/DefaultAlbumIcon';

const MusicPlayer = () => {
  const audioRef = useRef(null);
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
  const [isFloating, setIsFloating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playHistory, setPlayHistory] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);

  const { state, dispatch } = useMusic();
  const { currentUser } = useAuth();

  const updateProgress = () => {
    if (state.currentSong?.howl && isPlaying) {
      const seek = state.currentSong.howl.seek() || 0;
      setCurrentTime(seek);
      requestAnimationFrame(updateProgress);
    }
  };

  useEffect(() => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.volume(volume);
      
      state.currentSong.howl.on('play', () => {
        setIsPlaying(true);
        updatePlayCount();
        requestAnimationFrame(updateProgress);
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

  useEffect(() => {
    let animationFrameId;
    
    const updateProgress = () => {
      if (state.currentSong?.howl && isPlaying) {
        const seek = state.currentSong.howl.seek() || 0;
        setCurrentTime(seek);
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, state.currentSong]);

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
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress(audioRef.current.currentTime / audioRef.current.duration);
    }
  };

  const handleProgressClick = (e) => {
    if (!audioRef.current) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - bounds.left) / bounds.width;
    const newTime = percent * audioRef.current.duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    setProgress(percent);
  };

  const handleProgressHover = (e) => {
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const hoverPosition = ((e.clientX - rect.left) / rect.width) * 100;
    progressBar.style.setProperty('--progress-position', `${hoverPosition}%`);
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
    if (state.repeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      playNextSong();
    }
  };

  const playPreviousSong = () => {
    if (!playHistory.length || currentSongIndex <= 0) return;
    const previousIndex = currentSongIndex - 1;
    const previousSong = playHistory[previousIndex];
    if (previousSong) {
      setCurrentSongIndex(previousIndex);
      dispatch({ type: 'SET_CURRENT_SONG', payload: previousSong });
    }
  };

  const playNextSong = () => {
    if (!playHistory.length || currentSongIndex >= playHistory.length - 1) return;
    const nextIndex = currentSongIndex + 1;
    const nextSong = playHistory[nextIndex];
    if (nextSong) {
      setCurrentSongIndex(nextIndex);
      dispatch({ type: 'SET_CURRENT_SONG', payload: nextSong });
    }
  };

  useEffect(() => {
    if (state.currentSong) {
      if (!playHistory.some(song => song.id === state.currentSong.id)) {
        setPlayHistory(prev => [...prev, state.currentSong]);
        setCurrentSongIndex(playHistory.length);
      }
    }
  }, [state.currentSong]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-lg border-t border-light/10">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={state.currentSong?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleSongEnd}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
      />

      {/* Player Controls */}
      <div className="container mx-auto px-4 py-4">
        {/* Floating Progress Circle */}
        {state.currentSong && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed bottom-48 right-8 w-16 h-16 -m-2 z-[55]"
          >
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                className="text-primary transform -rotate-90 origin-center"
                strokeDasharray={`${(currentTime / duration) * 283} 283`}
              />
            </svg>
          </motion.div>
        )}

        {/* Floating Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsFloating(!isFloating)}
          className="fixed bottom-48 right-8 p-3 bg-primary rounded-full shadow-lg z-[60]"
        >
          {isFloating ? (
            <UilAngleDown className="w-5 h-5 text-white" />
          ) : (
            <UilAngleUp className="w-5 h-5 text-white" />
          )}
        </motion.button>

        <motion.div
          initial={{ y: 100 }}
          animate={{ y: isFloating ? 100 : 0 }}
          className="fixed bottom-0 left-0 right-0 bg-dark/95 backdrop-blur-lg border-t border-light/10 z-50
                    transition-all duration-300 ease-in-out
                    ${isMinimized ? 'h-16' : 'h-auto'}"
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
              onMouseMove={handleProgressHover}
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
                  {state.currentSong?.albumArt ? (
                    <img 
                      src={state.currentSong.albumArt} 
                      alt="Album Art" 
                      className={`object-cover rounded-lg shadow-lg ${isMinimized ? 'w-12 h-12' : 'w-16 h-16'}`}
                    />
                  ) : (
                    <div className={`bg-light rounded-lg shadow-lg flex items-center justify-center
                                  ${isMinimized ? 'w-12 h-12' : 'w-16 h-16'}`}>
                      <DefaultAlbumIcon className={isMinimized ? 'w-8 h-8' : 'w-10 h-10'} />
                    </div>
                  )}
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
        </motion.div>

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
      </div>
    </div>
  );
};

export default MusicPlayer; 

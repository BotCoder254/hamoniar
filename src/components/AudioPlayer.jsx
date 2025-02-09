import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UilPlay, UilPause, UilSkipForward, UilVolume, UilVolumeMute,
  UilSkipBackward, UilRepeat, UilShuffle, UilHeart 
} from '@iconscout/react-unicons';
import { formatTime } from '../utils/formatTime';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase.config';
import { doc, updateDoc, increment } from 'firebase/firestore';

const AudioPlayer = ({ currentTrack, onNext, onPrevious, tracks }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  const audioRef = useRef(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentTrack) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.load();
      setIsPlaying(true);
      audioRef.current.play().catch(error => {
        console.error("Playback failed:", error);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleTrackEnd = async () => {
    if (currentTrack) {
      try {
        // Update play count
        const trackRef = doc(db, 'tracks', currentTrack.id);
        await updateDoc(trackRef, {
          plays: increment(1)
        });

        if (isRepeat) {
          audioRef.current.currentTime = 0;
          audioRef.current.play();
        } else if (isShuffle && tracks.length > 1) {
          let nextIndex;
          do {
            nextIndex = Math.floor(Math.random() * tracks.length);
          } while (tracks[nextIndex].id === currentTrack.id);
          onNext(nextIndex);
        } else {
          onNext();
        }
      } catch (error) {
        console.error('Error updating play count:', error);
      }
    }
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleLike = async () => {
    if (!currentUser || !currentTrack) return;

    try {
      const trackRef = doc(db, 'tracks', currentTrack.id);
      await updateDoc(trackRef, {
        likes: increment(isLiked ? -1 : 1)
      });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error updating like count:', error);
    }
  };

  if (!currentTrack) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 bg-dark/90 backdrop-blur-lg p-4 border-t border-gray-800"
    >
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleTrackEnd}
        onLoadedMetadata={handleTimeUpdate}
      />

      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Track Info */}
        <div className="flex items-center space-x-4 w-1/4">
          <img
            src={currentTrack.coverUrl || '/default-cover.jpg'}
            alt={currentTrack.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-medium truncate">{currentTrack.title}</h3>
            <p className="text-sm text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center w-2/4">
          <div className="flex items-center space-x-4 mb-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsShuffle(!isShuffle)}
              className={`p-2 rounded-full ${isShuffle ? 'text-primary' : ''}`}
            >
              <UilShuffle className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrevious}
              className="p-2 rounded-full hover:bg-light/50"
            >
              <UilSkipBackward className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-primary hover:bg-primary/90"
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
              onClick={onNext}
              className="p-2 rounded-full hover:bg-light/50"
            >
              <UilSkipForward className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRepeat(!isRepeat)}
              className={`p-2 rounded-full ${isRepeat ? 'text-primary' : ''}`}
            >
              <UilRepeat className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="w-full flex items-center space-x-4">
            <span className="text-sm">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={(currentTime / duration) * 100 || 0}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume Controls */}
        <div className="flex items-center space-x-4 w-1/4 justify-end">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLike}
            className={`p-2 rounded-full ${isLiked ? 'text-red-500' : ''}`}
          >
            <UilHeart className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className="p-2 rounded-full hover:bg-light/50"
          >
            {isMuted ? (
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
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default AudioPlayer; 
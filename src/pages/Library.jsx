import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useMusic } from '../context/MusicContext';
import { db, storage } from '../config/firebase.config';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { UilPlay, UilTrashAlt, UilHeart } from '@iconscout/react-unicons';
import { useToast } from '../context/ToastContext';
import { formatDuration } from '../utils/formatTime';

const Library = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const { state, dispatch } = useMusic();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'tracks'),
      where('userId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const trackList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          plays: doc.data().plays || 0,
          likes: doc.data().likes || 0,
          duration: doc.data().duration || 0
        }));
        
        setTracks(trackList);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching tracks:', error);
        showError('Failed to load your tracks');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handlePlay = (track) => {
    try {
      // Set the current track and playlist
      dispatch({ type: 'SET_PLAYLIST', payload: tracks });
      dispatch({ type: 'SET_CURRENT_SONG', payload: track });
      dispatch({ type: 'TOGGLE_PLAY', payload: true });
    } catch (error) {
      console.error('Error playing track:', error);
      showError('Failed to play track');
    }
  };

  const handleDelete = async (track) => {
    if (!window.confirm('Are you sure you want to delete this track?')) return;

    try {
      // Delete from Storage
      if (track.fileName) {
        const storageRef = ref(storage, `audio/${currentUser.uid}/${track.fileName}`);
        try {
          await deleteObject(storageRef);
        } catch (storageError) {
          console.error('Storage delete error:', storageError);
          // Continue with Firestore deletion even if storage deletion fails
        }
      }

      // Delete from Firestore
      if (track.id) {
        const trackRef = doc(db, 'tracks', track.id);
        await deleteDoc(trackRef);

        // If this was the current playing track, stop it
        if (state.currentSong?.id === track.id) {
          dispatch({ type: 'SET_CURRENT_SONG', payload: null });
        }

        success('Track deleted successfully');
      } else {
        showError('Invalid track ID');
      }
    } catch (error) {
      console.error('Error deleting track:', error);
      showError('Failed to delete track');
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Please login to view your library</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-8"></div>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-700 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Library</h1>

      {tracks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl text-gray-400 mb-4">No tracks in your library</h2>
          <p className="text-gray-500">Upload some tracks to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tracks.map((track) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark/50 rounded-lg p-4 flex items-center justify-between group hover:bg-light/5"
            >
              <div className="flex items-center space-x-4 flex-1">
                <img
                  src={track.coverUrl || '/default-cover.jpg'}
                  alt={track.title}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{track.title}</h3>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{formatDuration(track.duration || 0)}</span>
                <span>{track.plays || 0} plays</span>
                <span className="flex items-center">
                  <UilHeart className="w-4 h-4 mr-1" />
                  {track.likes || 0}
                </span>
              </div>

              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handlePlay(track)}
                  className="p-2 rounded-full bg-primary hover:bg-primary/90"
                >
                  <UilPlay className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(track)}
                  className="p-2 rounded-full hover:bg-red-500/20 text-red-500"
                >
                  <UilTrashAlt className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Library; 
import { useCallback } from 'react';
import { db } from '../config/firebase.config';
import { 
  doc, updateDoc, arrayUnion, arrayRemove, 
  increment 
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useUserInteractions = () => {
  const { currentUser } = useAuth();

  const likeTrack = useCallback(async (trackId) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const trackRef = doc(db, 'music', trackId);

    try {
      await updateDoc(userRef, {
        likedTracks: arrayUnion(trackId)
      });

      await updateDoc(trackRef, {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking track:', error);
    }
  }, [currentUser]);

  const unlikeTrack = useCallback(async (trackId) => {
    if (!currentUser) return;

    const userRef = doc(db, 'users', currentUser.uid);
    const trackRef = doc(db, 'music', trackId);

    try {
      await updateDoc(userRef, {
        likedTracks: arrayRemove(trackId)
      });

      await updateDoc(trackRef, {
        likes: increment(-1)
      });
    } catch (error) {
      console.error('Error unliking track:', error);
    }
  }, [currentUser]);

  const addToPlaylist = useCallback(async (trackId, playlistId) => {
    if (!currentUser) return;

    const playlistRef = doc(db, 'playlists', playlistId);

    try {
      await updateDoc(playlistRef, {
        tracks: arrayUnion(trackId)
      });
    } catch (error) {
      console.error('Error adding to playlist:', error);
    }
  }, [currentUser]);

  return {
    likeTrack,
    unlikeTrack,
    addToPlaylist
  };
}; 
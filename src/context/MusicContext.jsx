import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '../config/firebase.config';
import { 
  collection, addDoc, serverTimestamp, doc, 
  deleteDoc, onSnapshot, query, orderBy, 
  getDocs, limit, updateDoc, increment 
} from 'firebase/firestore';
import AudioEngine from '../services/AudioEngine';
import { updateMediaMetadata } from '../services/MediaSession';
import { useAuth } from './AuthContext';

const MusicContext = createContext();

const initialState = {
  currentSong: null,
  playlist: [],
  isPlaying: false,
  volume: 1,
  currentTime: 0,
  duration: 0,
  repeat: 'none', // none, one, all
  shuffle: false,
  queue: [],
  history: [],
  playlists: [],
  userPreferences: {
    preferredGenres: [],
    theme: 'dark',
    visualizerEnabled: true,
  },
  trendingArtists: [],
  trendingGenres: [],
  currentTrack: null,
};

async function trackActivity(type, data) {
  try {
    await addDoc(collection(db, 'activities'), {
      ...data,
      type,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}

const musicReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      if (state.currentSong?.howl) {
        state.currentSong.howl.unload();
      }
      const howl = action.payload ? AudioEngine.loadTrack(action.payload) : null;
      updateMediaMetadata(action.payload);
      
      if (action.payload) {
        trackActivity('play', {
          trackId: action.payload.id,
          trackName: action.payload.title,
          artistName: action.payload.artist
        });
      }

      return { 
        ...state, 
        currentSong: action.payload ? { ...action.payload, howl } : null,
        isPlaying: action.payload !== null 
      };

    case 'TOGGLE_LIKE':
      trackActivity('like', {
        trackId: action.payload.trackId,
        trackName: action.payload.trackName
      });
      return state;

    case 'ADD_TO_PLAYLIST':
      trackActivity('playlist_add', {
        trackId: action.payload.trackId,
        trackName: action.payload.trackName,
        playlistId: action.payload.playlistId,
        playlistName: action.payload.playlistName
      });
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.playlistId
            ? { ...playlist, songs: [...playlist.songs, action.payload.trackId] }
            : playlist
        )
      };

    case 'CREATE_PLAYLIST':
      trackActivity('playlist_create', {
        playlistId: action.payload.id,
        playlistName: action.payload.name
      });
      return {
        ...state,
        playlists: [...state.playlists, action.payload]
      };

    case 'DELETE_PLAYLIST':
      try {
        deleteDoc(doc(db, 'playlists', action.payload));
        trackActivity('playlist_delete', {
          playlistId: action.payload
        });
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
      return {
        ...state,
        playlists: state.playlists.filter(playlist => playlist.id !== action.payload)
      };

    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    case 'RENAME_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map(playlist =>
          playlist.id === action.payload.id
            ? { ...playlist, name: action.payload.name }
            : playlist
        )
      };

    case 'SET_TRENDING_ARTISTS':
      return {
        ...state,
        trendingArtists: action.payload
      };

    case 'SET_TRENDING_GENRES':
      return {
        ...state,
        trendingGenres: action.payload
      };

    case 'SET_CURRENT_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true
      };

    case 'TOGGLE_PLAY':
      return {
        ...state,
        isPlaying: action.payload !== undefined ? action.payload : !state.isPlaying
      };

    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload
      };

    case 'SET_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload
      };

    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };

    case 'TOGGLE_REPEAT':
      const repeatStates = ['none', 'one', 'all'];
      const repeatIndex = repeatStates.indexOf(state.repeat);
      const nextIndex = (repeatIndex + 1) % repeatStates.length;
      return {
        ...state,
        repeat: repeatStates[nextIndex]
      };

    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        shuffle: !state.shuffle,
        queue: !state.shuffle ? 
          [...state.playlist].sort(() => Math.random() - 0.5) : 
          [...state.playlist]
      };

    case 'NEXT_TRACK':
      if (state.queue.length === 0) return state;
      const trackIndex = state.queue.findIndex(track => track.id === state.currentSong?.id);
      const nextTrack = state.queue[(trackIndex + 1) % state.queue.length];
      return {
        ...state,
        currentSong: nextTrack,
        isPlaying: true,
        history: [...state.history, state.currentSong].filter(Boolean)
      };

    case 'PREVIOUS_TRACK':
      if (state.history.length === 0) return state;
      const prevTrack = state.history[state.history.length - 1];
      return {
        ...state,
        currentSong: prevTrack,
        isPlaying: true,
        history: state.history.slice(0, -1)
      };

    case 'UPDATE_PLAY_COUNT':
      if (!state.currentSong) return state;
      try {
        const trackRef = doc(db, 'tracks', state.currentSong.id);
        updateDoc(trackRef, {
          plays: increment(1)
        });
      } catch (error) {
        console.error('Error updating play count:', error);
      }
      return state;

    default:
      return state;
  }
};

export const MusicProvider = ({ children }) => {
  const [state, dispatch] = useReducer(musicReducer, initialState);
  const { currentUser } = useAuth();

  // Subscribe to playlists
  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'playlists'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const playlists = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(playlist => playlist.userId === currentUser.uid);
      dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to trending artists
  useEffect(() => {
    const fetchTrendingArtists = async () => {
      const q = query(
        collection(db, 'artists'),
        orderBy('playCount', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const artists = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: 'SET_TRENDING_ARTISTS', payload: artists });
      });

      return () => unsubscribe();
    };

    fetchTrendingArtists();
  }, []);

  // Subscribe to trending genres
  useEffect(() => {
    const fetchTrendingGenres = async () => {
      const q = query(
        collection(db, 'genres'),
        orderBy('trackCount', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const genres = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        dispatch({ type: 'SET_TRENDING_GENRES', payload: genres });
      });

      return () => unsubscribe();
    };

    fetchTrendingGenres();
  }, []);

  // Handle playlist deletion
  const handleDeletePlaylist = async (playlistId) => {
    try {
      await deleteDoc(doc(db, 'playlists', playlistId));
    } catch (error) {
      console.error('Error deleting playlist:', error);
      throw error;
    }
  };

  // Handle track end
  useEffect(() => {
    if (!state.currentSong) return;

    const handleTrackEnd = () => {
      if (state.repeat === 'one') {
        // Replay the current track
        dispatch({ type: 'SET_CURRENT_TIME', payload: 0 });
        dispatch({ type: 'TOGGLE_PLAY', payload: true });
      } else if (state.repeat === 'all' || state.queue.length > 0) {
        // Play next track
        dispatch({ type: 'NEXT_TRACK' });
      } else {
        // Stop playing
        dispatch({ type: 'SET_CURRENT_SONG', payload: null });
      }
      // Update play count
      dispatch({ type: 'UPDATE_PLAY_COUNT' });
    };

    const audio = document.querySelector('audio');
    if (audio) {
      audio.addEventListener('ended', handleTrackEnd);
      return () => audio.removeEventListener('ended', handleTrackEnd);
    }
  }, [state.currentSong, state.repeat, state.queue]);

  return (
    <MusicContext.Provider value={{ state, dispatch, handleDeletePlaylist }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}; 
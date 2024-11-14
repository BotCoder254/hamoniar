import React, { createContext, useContext, useReducer } from 'react';
import { db } from '../config/firebase.config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AudioEngine from '../services/AudioEngine';
import { updateMediaMetadata } from '../services/MediaSession';

const MusicContext = createContext();

const initialState = {
  currentSong: null,
  playlist: [],
  queue: [],
  isShuffled: false,
  repeatMode: 'none',
  playHistory: [],
  volume: 1,
  isPlaying: false,
  playlists: [],
  userPreferences: {
    preferredGenres: [],
    theme: 'dark',
    visualizerEnabled: true,
  }
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

function musicReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_SONG':
      if (state.currentSong?.howl) {
        state.currentSong.howl.unload();
      }
      const howl = AudioEngine.loadTrack(action.payload);
      updateMediaMetadata(action.payload);
      
      // Track play activity
      trackActivity('play', {
        trackId: action.payload.id,
        trackName: action.payload.title,
        artistName: action.payload.artist
      });

      return { 
        ...state, 
        currentSong: { ...action.payload, howl },
        isPlaying: true 
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

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload
        }
      };

    // Add other cases as needed...

    default:
      return state;
  }
}

export function MusicProvider({ children }) {
  const [state, dispatch] = useReducer(musicReducer, initialState);

  return (
    <MusicContext.Provider value={{ state, dispatch }}>
      {children}
    </MusicContext.Provider>
  );
}

export const useMusic = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AudioEngine from '../services/AudioEngine';
import { updateMediaMetadata } from '../services/MediaSession';

const PlayerContext = createContext();

const initialState = {
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  muted: false,
  repeat: 'none', // none, one, all
  shuffle: false,
  queue: [],
  history: [],
  duration: 0,
  currentTime: 0,
  buffered: 0,
  equalizer: {
    bass: 0,
    mid: 0,
    treble: 0,
    reverb: 0
  }
};

function playerReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACK':
      return {
        ...state,
        currentTrack: action.payload,
        isPlaying: true
      };
    case 'TOGGLE_PLAY':
      return {
        ...state,
        isPlaying: !state.isPlaying
      };
    case 'SET_VOLUME':
      return {
        ...state,
        volume: action.payload,
        muted: action.payload === 0
      };
    case 'TOGGLE_MUTE':
      return {
        ...state,
        muted: !state.muted
      };
    case 'SET_TIME':
      return {
        ...state,
        currentTime: action.payload
      };
    case 'SET_DURATION':
      return {
        ...state,
        duration: action.payload
      };
    case 'SET_EQUALIZER':
      return {
        ...state,
        equalizer: {
          ...state.equalizer,
          ...action.payload
        }
      };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(playerReducer, initialState);

  useEffect(() => {
    if (state.currentTrack) {
      updateMediaMetadata(state.currentTrack);
    }
  }, [state.currentTrack]);

  useEffect(() => {
    AudioEngine.setVolume(state.muted ? 0 : state.volume);
  }, [state.volume, state.muted]);

  useEffect(() => {
    AudioEngine.setEQ(
      state.equalizer.bass,
      state.equalizer.mid,
      state.equalizer.treble
    );
    AudioEngine.setReverb(state.equalizer.reverb);
  }, [state.equalizer]);

  return (
    <PlayerContext.Provider value={{ state, dispatch }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}; 
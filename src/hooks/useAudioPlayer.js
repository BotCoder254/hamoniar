import { useState, useEffect, useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import AudioEngine from '../services/AudioEngine';

export const useAudioPlayer = () => {
  const { state, dispatch } = useMusic();
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const play = useCallback(() => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.play();
      dispatch({ type: 'SET_PLAYING', payload: true });
    }
  }, [state.currentSong, dispatch]);

  const pause = useCallback(() => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.pause();
      dispatch({ type: 'SET_PLAYING', payload: false });
    }
  }, [state.currentSong, dispatch]);

  const seek = useCallback((position) => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.seek(position * duration);
    }
  }, [state.currentSong, duration]);

  const setVolume = useCallback((value) => {
    if (state.currentSong?.howl) {
      state.currentSong.howl.volume(value);
      dispatch({ type: 'SET_VOLUME', payload: value });
    }
  }, [state.currentSong, dispatch]);

  useEffect(() => {
    if (state.currentSong?.howl) {
      const updateProgress = () => {
        const seek = state.currentSong.howl.seek() || 0;
        setProgress(seek);
      };

      state.currentSong.howl.on('play', () => {
        setIsReady(true);
        setDuration(state.currentSong.howl.duration());
        requestAnimationFrame(updateProgress);
      });

      state.currentSong.howl.on('end', () => {
        dispatch({ type: 'SONG_ENDED' });
      });

      return () => {
        state.currentSong.howl.off();
      };
    }
  }, [state.currentSong, dispatch]);

  return {
    isReady,
    progress,
    duration,
    play,
    pause,
    seek,
    setVolume
  };
}; 
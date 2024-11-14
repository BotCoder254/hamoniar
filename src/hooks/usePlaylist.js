import { useCallback } from 'react';
import { useMusic } from '../context/MusicContext';
import { extractMetadata } from '../utils/audio.utils';

export const usePlaylist = () => {
  const { dispatch } = useMusic();

  const addSongs = useCallback(async (files) => {
    const processedSongs = await Promise.all(
      files.map(async (file) => {
        const metadata = await extractMetadata(file);
        return {
          id: Date.now() + Math.random(),
          url: URL.createObjectURL(file),
          ...metadata
        };
      })
    );

    dispatch({ type: 'ADD_SONGS', payload: processedSongs });
  }, [dispatch]);

  const createPlaylist = useCallback((name, songs = []) => {
    dispatch({
      type: 'CREATE_PLAYLIST',
      payload: {
        id: Date.now(),
        name,
        songs
      }
    });
  }, [dispatch]);

  const addToPlaylist = useCallback((playlistId, song) => {
    dispatch({
      type: 'ADD_TO_PLAYLIST',
      payload: { playlistId, song }
    });
  }, [dispatch]);

  return {
    addSongs,
    createPlaylist,
    addToPlaylist
  };
}; 
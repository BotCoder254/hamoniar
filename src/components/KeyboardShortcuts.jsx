import React, { useEffect } from 'react';
import { useMusic } from '../context/MusicContext';

const KeyboardShortcuts = () => {
  const { state, dispatch } = useMusic();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          dispatch({ type: 'TOGGLE_PLAY' });
          break;
        case 'ArrowRight':
          if (e.ctrlKey) dispatch({ type: 'NEXT_TRACK' });
          break;
        case 'ArrowLeft':
          if (e.ctrlKey) dispatch({ type: 'PREVIOUS_TRACK' });
          break;
        case 'KeyM':
          dispatch({ type: 'TOGGLE_MUTE' });
          break;
        case 'KeyL':
          dispatch({ type: 'TOGGLE_LIKE_CURRENT' });
          break;
        case 'KeyR':
          dispatch({ type: 'TOGGLE_REPEAT' });
          break;
        case 'KeyS':
          dispatch({ type: 'TOGGLE_SHUFFLE' });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch]);

  return null;
};

export default KeyboardShortcuts; 
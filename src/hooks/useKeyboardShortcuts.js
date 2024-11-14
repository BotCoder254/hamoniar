import { useEffect } from 'react';
import { useMusic } from '../context/MusicContext';

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useMusic();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT') return;

      const shortcuts = {
        'Space': () => dispatch({ type: 'TOGGLE_PLAY' }),
        'ArrowRight': () => e.ctrlKey && dispatch({ type: 'NEXT_TRACK' }),
        'ArrowLeft': () => e.ctrlKey && dispatch({ type: 'PREVIOUS_TRACK' }),
        'KeyM': () => dispatch({ type: 'TOGGLE_MUTE' }),
        'KeyL': () => dispatch({ type: 'TOGGLE_LIKE_CURRENT' }),
        'KeyR': () => dispatch({ type: 'TOGGLE_REPEAT' }),
        'KeyS': () => dispatch({ type: 'TOGGLE_SHUFFLE' })
      };

      const action = shortcuts[e.code];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch]);
}; 
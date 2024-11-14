import React, { createContext, useContext, useEffect } from 'react';
import { usePlayer } from './PlayerContext';
import { useToast } from './ToastContext';

const KeyboardShortcutsContext = createContext();

export function KeyboardShortcutsProvider({ children }) {
  const { state, dispatch } = usePlayer();
  const { addToast } = useToast();

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          dispatch({ type: 'TOGGLE_PLAY' });
          break;
        case 'ArrowRight':
          if (e.ctrlKey) {
            dispatch({ type: 'NEXT_TRACK' });
            addToast('Playing next track', 'info');
          }
          break;
        case 'ArrowLeft':
          if (e.ctrlKey) {
            dispatch({ type: 'PREVIOUS_TRACK' });
            addToast('Playing previous track', 'info');
          }
          break;
        case 'KeyM':
          dispatch({ type: 'TOGGLE_MUTE' });
          addToast(state.muted ? 'Unmuted' : 'Muted', 'info');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [dispatch, state.muted, addToast]);

  return (
    <KeyboardShortcutsContext.Provider value={{}}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

export const useKeyboardShortcuts = () => {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within a KeyboardShortcutsProvider');
  }
  return context;
}; 
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilPlus, UilTrashAlt, UilEdit, UilSave 
} from '@iconscout/react-unicons';
import { useMusic } from '../context/MusicContext';

const PlaylistManager = () => {
  const { state, dispatch } = useMusic();
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;

    dispatch({
      type: 'CREATE_PLAYLIST',
      payload: {
        id: Date.now(),
        name: newPlaylistName,
        songs: []
      }
    });

    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleSavePlaylist = (playlist) => {
    const playlistData = JSON.stringify(playlist);
    const blob = new Blob([playlistData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadPlaylist = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const playlist = JSON.parse(e.target.result);
        dispatch({ type: 'IMPORT_PLAYLIST', payload: playlist });
      } catch (error) {
        console.error('Error loading playlist:', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-light p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Playlists</h2>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCreating(true)}
          className="p-2 hover:bg-gray-700 rounded-full"
        >
          <UilPlus className="w-5 h-5" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <input
              type="text"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              placeholder="Playlist name"
              className="w-full bg-dark p-2 rounded-lg mb-2"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleCreatePlaylist}
                className="bg-primary px-4 py-2 rounded-lg"
              >
                Create
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="bg-dark px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        {state.playlists?.map((playlist) => (
          <motion.div
            key={playlist.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between p-3 bg-dark rounded-lg"
          >
            {editingId === playlist.id ? (
              <input
                type="text"
                value={playlist.name}
                onChange={(e) => dispatch({
                  type: 'RENAME_PLAYLIST',
                  payload: { id: playlist.id, name: e.target.value }
                })}
                className="bg-light p-1 rounded"
              />
            ) : (
              <span>{playlist.name}</span>
            )}

            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSavePlaylist(playlist)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <UilSave className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setEditingId(editingId === playlist.id ? null : playlist.id)}
                className="p-2 hover:bg-gray-700 rounded-full"
              >
                <UilEdit className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => dispatch({
                  type: 'DELETE_PLAYLIST',
                  payload: playlist.id
                })}
                className="p-2 hover:bg-gray-700 rounded-full text-red-500"
              >
                <UilTrashAlt className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadPlaylist}
        className="hidden"
      />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => fileInputRef.current?.click()}
        className="mt-4 w-full bg-dark p-2 rounded-lg hover:bg-gray-700 transition-colors"
      >
        Import Playlist
      </motion.button>
    </div>
  );
};

export default PlaylistManager; 
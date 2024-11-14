import React from 'react';
import Playlist from '../components/Playlist';
import PlaylistManager from '../components/PlaylistManager';

const Library = () => (
  <div className="space-y-8">
    <section>
      <h2 className="text-2xl font-bold mb-4">Your Library</h2>
      <Playlist />
    </section>
    <section>
      <h2 className="text-2xl font-bold mb-4">Playlists</h2>
      <PlaylistManager />
    </section>
  </div>
);

export default Library; 
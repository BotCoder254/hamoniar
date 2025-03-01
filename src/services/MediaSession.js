export const initializeMediaSession = (controls) => {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', controls.play);
    navigator.mediaSession.setActionHandler('pause', controls.pause);
    navigator.mediaSession.setActionHandler('previoustrack', controls.previous);
    navigator.mediaSession.setActionHandler('nexttrack', controls.next);
    navigator.mediaSession.setActionHandler('seekto', controls.seekTo);
  }
};

export const updateMediaMetadata = (track) => {
  if (!track || !('mediaSession' in navigator)) return;

  try {
    const defaultCover = '/default-cover.jpg';
    const artwork = [
      {
        src: track.coverUrl || defaultCover,
        sizes: '512x512',
        type: 'image/jpeg'
      }
    ];

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || '',
      artwork
    });
  } catch (error) {
    console.error('Error updating media metadata:', error);
  }
}; 
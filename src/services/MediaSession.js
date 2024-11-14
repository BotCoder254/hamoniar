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
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album,
      artwork: [
        { src: track.albumArt, sizes: '512x512', type: 'image/jpeg' },
      ],
    });
  }
}; 
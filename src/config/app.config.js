export const APP_CONFIG = {
  name: 'Harmonia',
  version: '1.0.0',
  description: 'Professional Music Experience',
  theme: {
    primary: '#1DB954',
    dark: '#121212',
    light: '#282828',
    lightest: '#B3B3B3',
  },
  features: {
    audioFormats: ['mp3', 'wav', 'ogg', 'm4a', 'flac'],
    maxPlaylistSize: 1000,
    maxUploadSize: 50 * 1024 * 1024, // 50MB
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },
  defaults: {
    volume: 0.7,
    crossfadeDuration: 3,
    visualizerSensitivity: 1.5,
  }
}; 
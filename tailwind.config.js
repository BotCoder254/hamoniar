module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#121212',
        primary: '#1DB954',  // Spotify-like green as primary color
        light: '#282828',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

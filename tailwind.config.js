/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#4f46e5',
        dark: '#1a1a1a',
        light: '#2a2a2a',
        lightest: '#4a4a4a',
      },
    },
  },
  plugins: [],
}

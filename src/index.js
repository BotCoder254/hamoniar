import './config/firebase'; // Import Firebase configuration first
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { PlayerProvider } from './context/PlayerContext';
import { KeyboardShortcutsProvider } from './context/KeyboardShortcutsContext';
import { UploadProvider } from './context/UploadContext';

// Import Chart.js defaults
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Configure Chart.js defaults
ChartJS.defaults.color = '#B3B3B3';
ChartJS.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
ChartJS.defaults.font.family = 'Inter, sans-serif';

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render app with all providers
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <MusicProvider>
            <PlayerProvider>
              <UploadProvider>
                <ToastProvider>
                  <KeyboardShortcutsProvider>
                    <App />
                  </KeyboardShortcutsProvider>
                </ToastProvider>
              </UploadProvider>
            </PlayerProvider>
          </MusicProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);

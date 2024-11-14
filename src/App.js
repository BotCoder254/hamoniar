import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { ProtectedRoute, PublicRoute } from './routes';
import { 
  Home, Discover, Library, Upload, Profile, 
  Dashboard, Activity, Following, Settings 
} from './pages';

// Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import NowPlaying from './components/NowPlaying';
import Playlist from './components/Playlist';
import Queue from './components/Queue';
import Equalizer from './components/Equalizer';
import PlaylistManager from './components/PlaylistManager';
import MusicFeed from './components/MusicFeed';
import UserProfile from './components/UserProfile/UserProfile';
import AuthModal from './components/Auth/AuthModal';
import UserDashboard from './components/Dashboard/UserDashboard';
import ActivityFeed from './components/ActivityFeed/ActivityFeed';
import UserFollowing from './components/UserFollowing/UserFollowing';
import MusicUploader from './components/MusicUploader/MusicUploader';
import TrendingPage from './pages/TrendingPage';

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-dark to-black">
      {currentUser && <Sidebar />}
      <div className={`flex-1 ${currentUser ? 'ml-64' : ''}`}>
        <Header />
        <main className="px-8 py-6">
          {children}
        </main>
      </div>
      {currentUser && <MusicPlayer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <Router>
          <MainLayout>
            <Routes>
              {/* Public Routes */}
              <Route 
                path="/login" 
                element={
                  <PublicRoute>
                    <AuthModal isOpen={true} />
                  </PublicRoute>
                } 
              />

              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/discover" element={<ProtectedRoute><Discover /></ProtectedRoute>} />
              <Route path="/library" element={<ProtectedRoute><Library /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/profile/:userId?" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
              <Route path="/following" element={<ProtectedRoute><Following /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route 
                path="/trending" 
                element={
                  <ProtectedRoute>
                    <TrendingPage />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MainLayout>
        </Router>
      </MusicProvider>
    </AuthProvider>
  );
}

export default App;

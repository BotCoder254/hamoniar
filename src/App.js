import React, { useState, Suspense } from 'react';
import { collection, query, where } from 'firebase/firestore';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { ToastProvider } from './context/ToastContext';
import { AchievementProvider } from './context/AchievementContext';
import { ProtectedRoute, PublicRoute } from './routes';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import LoadingSpinner from './components/Loading/LoadingSpinner';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import FloatingActionButton from './components/FloatingActionButton';
import AuthModal from './components/Auth/AuthModal';

// Lazy load components for better performance
const Home = React.lazy(() => import('./pages/Home'));
const Discover = React.lazy(() => import('./pages/Discover'));
const Library = React.lazy(() => import('./pages/Library'));
const Upload = React.lazy(() => import('./pages/Upload'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Activity = React.lazy(() => import('./pages/Activity'));
const Following = React.lazy(() => import('./pages/Following'));
const Settings = React.lazy(() => import('./pages/Settings'));
const TrendingPage = React.lazy(() => import('./pages/TrendingPage'));

// Components
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const MainLayout = ({ children }) => {
  const { currentUser } = useAuth();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex min-h-screen bg-gradient-to-b from-dark to-black"
    >
      {currentUser && <Sidebar />}
      <div className={`flex-1 ${currentUser ? 'ml-64' : ''}`}>
        <Header />
        <main className="px-8 py-6">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        {currentUser && <FloatingActionButton />}
      </div>
      {currentUser && <MusicPlayer />}
    </motion.div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MusicProvider>
          <ToastProvider>
            <AchievementProvider>
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
            </AchievementProvider>
          </ToastProvider>
        </MusicProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

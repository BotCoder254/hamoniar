import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar/Sidebar';
import MusicPlayer from './components/MusicPlayer';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { MusicProvider } from './context/MusicContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProvider>
          <MusicProvider>
            <div className="flex min-h-screen bg-dark-700">
              <Sidebar />
              <div className="flex-1 ml-64">
                <Header />
                <main className="p-8">
                  <AppRoutes />
                </main>
              </div>
              <MusicPlayer />
            </div>
            <Toaster 
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#1a1a27',
                  color: '#fff',
                  borderRadius: '0.5rem',
                },
              }}
            />
          </MusicProvider>
        </UserProvider>
      </AuthProvider>
    </Router>
  );
}

export default App; 
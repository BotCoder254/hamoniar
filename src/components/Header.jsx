import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UilSearch, UilBell, UilUserCircle, UilSetting,
  UilAngleLeft, UilAngleRight, UilCloudUpload, UilSignout
} from '@iconscout/react-unicons';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import AuthModal from './Auth/AuthModal';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { currentUser, signout } = useAuth();
  const { userProfile } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between py-4 px-8 bg-dark/50 backdrop-blur-md sticky top-0 z-10"
    >
      <div className="flex items-center space-x-4">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-black/50"
            onClick={() => window.history.back()}
          >
            <UilAngleLeft className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-full bg-black/50"
            onClick={() => window.history.forward()}
          >
            <UilAngleRight className="w-5 h-5" />
          </motion.button>
        </div>

        <div className="relative">
          <UilSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for songs, artists, or albums..."
            className="bg-light/50 pl-10 pr-4 py-2 rounded-full w-96 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-light/50"
        >
          <UilBell className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/upload')}
          className="p-2 rounded-full bg-primary hover:bg-primary/90"
        >
          <UilCloudUpload className="w-5 h-5" />
        </motion.button>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center space-x-2 p-1 rounded-full hover:bg-light/50 cursor-pointer group"
            >
              {userProfile?.photoURL || currentUser.photoURL ? (
                <img 
                  src={userProfile?.photoURL || currentUser.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <UilUserCircle className="w-8 h-8 text-primary" />
              )}
              <span className="text-sm font-medium">{userProfile?.displayName || currentUser.displayName}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-400"
              >
                <UilSignout className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 bg-primary rounded-full font-medium"
            >
              Login
            </motion.button>
          )}

          <AuthModal 
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
          />
        </div>
      </div>
    </motion.header>
  );
};

export default Header; 
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UilHome, UilCompass, UilMusic, UilUser,
  UilHeadphones, UilSignout, UilChart, UilBell, UilCloudUpload
} from '@iconscout/react-unicons';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const menuItems = [
    { icon: <UilHome />, text: 'Home', path: '/' },
    { icon: <UilChart />, text: 'Dashboard', path: '/dashboard' },
    { icon: <UilCompass />, text: 'Discover', path: '/discover' },
    { icon: <UilMusic />, text: 'Library', path: '/library' },
    { icon: <UilCloudUpload />, text: 'Upload', path: '/upload' },
    { icon: <UilUser />, text: 'Profile', path: '/profile' },
    { icon: <UilBell />, text: 'Activity', path: '/activity' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <motion.div 
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-dark h-screen fixed left-0 top-0 p-6 flex flex-col"
    >
      <motion.div 
        className="flex items-center space-x-2 mb-8"
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate('/')}
        style={{ cursor: 'pointer' }}
      >
        <UilHeadphones className="w-8 h-8 text-primary" />
        <span className="text-2xl font-bold text-white">Harmonia</span>
      </motion.div>

      <div className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.path}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(item.path)}
            className={`flex items-center space-x-4 w-full p-3 rounded-lg transition-colors
              ${location.pathname === item.path ? 
                'bg-primary text-white' : 
                'text-lightest hover:text-white hover:bg-light/30'}`}
          >
            <span className="w-5 h-5">{item.icon}</span>
            <span>{item.text}</span>
          </motion.button>
        ))}
      </div>

      {currentUser && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="flex items-center space-x-4 w-full p-3 rounded-lg text-red-500 
                   hover:bg-red-500/10 transition-colors mt-4"
        >
          <UilSignout className="w-5 h-5" />
          <span>Logout</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default Sidebar; 
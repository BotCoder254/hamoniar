import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  UilEstate, UilMusic, UilHeart, UilHistory,
  UilUsersAlt, UilUpload, UilCompass, UilSetting,
  UilChart
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import DefaultUserIcon from '../icons/DefaultUserIcon';

const MenuItem = ({ to, icon: Icon, label, isActive }) => (
  <Link to={to}>
    <motion.div
      whileHover={{ x: 5 }}
      className={`flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors
        ${isActive ? 'bg-primary text-white' : 'text-white/70 hover:bg-light/10 hover:text-white'}`}
    >
      <Icon className="w-6 h-6" />
      <span className="font-medium">{label}</span>
    </motion.div>
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { userProfile } = useUser();

  const menuItems = [
    { to: '/', icon: UilEstate, label: 'Home' },
    { to: '/discover', icon: UilCompass, label: 'Discover' },
    { to: '/library', icon: UilMusic, label: 'Library' },
    { to: '/liked', icon: UilHeart, label: 'Liked Tracks' },
    { to: '/history', icon: UilHistory, label: 'History' },
    { to: '/following', icon: UilUsersAlt, label: 'Following' },
    { to: '/upload', icon: UilUpload, label: 'Upload' },
    { to: '/analytics', icon: UilChart, label: 'Analytics' },
    { to: '/settings', icon: UilSetting, label: 'Settings' }
  ];

  return (
    <div className="w-64 h-screen bg-dark/50 backdrop-blur-xl fixed left-0 top-0 z-50 flex flex-col">
      {/* User Profile Section */}
      <Link to={`/profile/${currentUser?.uid}`} className="p-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="flex items-center space-x-3 group"
        >
          {userProfile?.photoURL ? (
            <img
              src={userProfile.photoURL}
              alt={userProfile.displayName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/50"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-light/10 flex items-center justify-center ring-2 ring-primary/50">
              <DefaultUserIcon className="w-8 h-8 text-white/70" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-white group-hover:text-primary transition-colors">
              {userProfile?.displayName || 'User'}
            </h3>
            <p className="text-sm text-white/50">View Profile</p>
          </div>
        </motion.div>
      </Link>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <MenuItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            label={item.label}
            isActive={location.pathname === item.to}
          />
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-6 border-t border-light/10">
        <div className="text-center">
          <p className="text-xs text-white/50">
            © 2024 Hamoniar. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 
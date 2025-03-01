import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilEstate, UilMusic, UilHeart, UilHistory,
  UilUsersAlt, UilUpload, UilCompass, UilAngleDown
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { useUser } from '../../context/UserContext';
import DefaultUserIcon from '../icons/DefaultUserIcon';
import SidebarUsers from './SidebarUsers';

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
  const [isSuggestedUsersOpen, setSuggestedUsersOpen] = useState(true);

  const menuItems = [
    { to: '/', icon: UilEstate, label: 'Home' },
    { to: '/discover', icon: UilCompass, label: 'Discover' },
    { to: '/library', icon: UilMusic, label: 'Library' },
    { to: '/liked', icon: UilHeart, label: 'Liked Tracks' },
    { to: '/history', icon: UilHistory, label: 'History' },
    { to: '/following', icon: UilUsersAlt, label: 'Following' },
    { to: '/upload', icon: UilUpload, label: 'Upload' }
  ];

  if (!currentUser) return null;

  return (
    <div className="w-64 h-[calc(100vh-96px)] bg-dark/50 backdrop-blur-xl fixed left-0 top-0 z-50 flex flex-col">
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
      <nav className="flex-1 px-3 py-4 space-y-1">
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

      {/* Suggested Users Section */}
      <div className="border-t border-light/10">
        <motion.button
          onClick={() => setSuggestedUsersOpen(!isSuggestedUsersOpen)}
          className="w-full px-4 py-3 flex items-center justify-between text-white/70 hover:text-white"
        >
          <span className="text-sm font-medium">Suggested Users</span>
          <motion.div
            animate={{ rotate: isSuggestedUsersOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <UilAngleDown className="w-5 h-5" />
          </motion.div>
        </motion.button>
        <AnimatePresence>
          {isSuggestedUsersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <SidebarUsers />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
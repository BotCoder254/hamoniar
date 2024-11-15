import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UilTrophy } from '@iconscout/react-unicons';

const BadgeNotification = ({ badge, onClose, isVisible }) => {
  if (!badge || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.3 }}
          className="fixed bottom-24 right-4 z-50"
        >
          <div className="bg-dark/90 backdrop-blur-lg border border-primary/20 rounded-lg p-4 shadow-xl
                        flex items-center space-x-4 max-w-sm">
            {/* Badge Icon */}
            <div className={`${badge.color} p-3 rounded-lg`}>
              <span className="text-2xl">{badge.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <UilTrophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-bold text-lg">New Badge Earned!</h3>
              </div>
              <p className="font-medium text-primary mt-1">{badge.name}</p>
              <p className="text-sm text-gray-300 mt-1">{badge.description}</p>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              ×
            </button>
          </div>

          {/* Celebration Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5 }}
            className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-500 rounded-full
                     flex items-center justify-center text-lg"
          >
            🎉
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BadgeNotification;

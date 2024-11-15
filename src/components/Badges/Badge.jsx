import React from 'react';
import { motion } from 'framer-motion';
import { getBadgeProgress } from '../../config/badges';

const Badge = ({ badge, userStats, showProgress = false, className = '' }) => {
  const progress = getBadgeProgress(badge, userStats);
  const isEarned = progress.percentage >= 100;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative group ${className}`}
    >
      <div
        className={`
          ${badge.color} ${isEarned ? 'opacity-100' : 'opacity-50'}
          p-3 rounded-lg shadow-lg flex items-center justify-center
          transition-all duration-300 hover:shadow-xl
          ${isEarned ? 'ring-2 ring-primary' : ''}
        `}
      >
        <span className="text-2xl">{badge.icon}</span>
      </div>

      {/* Tooltip */}
      <div className="
        absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2
        bg-dark/90 backdrop-blur-lg rounded-lg shadow-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        pointer-events-none whitespace-nowrap
      ">
        <div className="text-sm font-semibold">{badge.name}</div>
        <div className="text-xs text-gray-300">{badge.description}</div>
        
        {showProgress && !isEarned && (
          <div className="mt-1">
            <div className="text-xs text-gray-400">
              Progress: {progress.current}/{progress.required}
            </div>
            <div className="w-full h-1 bg-gray-700 rounded-full mt-1">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Achievement Unlocked Animation */}
      {isEarned && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full
                     flex items-center justify-center text-xs"
        >
          ✓
        </motion.div>
      )}
    </motion.div>
  );
};

export default Badge;

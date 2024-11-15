import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGES, BADGE_TYPES } from '../../config/badges';
import Badge from './Badge';

const BadgeCollection = ({ userStats, className = '' }) => {
  const [selectedType, setSelectedType] = useState('all');

  const filterBadges = () => {
    const badges = Object.values(BADGES);
    if (selectedType === 'all') return badges;
    return badges.filter(badge => badge.type === selectedType);
  };

  const badgeTypes = [
    { id: 'all', label: 'All Badges' },
    { id: BADGE_TYPES.UPLOADER, label: 'Uploader' },
    { id: BADGE_TYPES.LISTENER, label: 'Listener' },
    { id: BADGE_TYPES.SOCIAL, label: 'Social' },
    { id: BADGE_TYPES.CURATOR, label: 'Curator' },
    { id: BADGE_TYPES.ACHIEVEMENT, label: 'Achievements' }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {badgeTypes.map(type => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium
              transition-all duration-200
              ${selectedType === type.id
                ? 'bg-primary text-white'
                : 'bg-dark/50 text-gray-300 hover:bg-dark/80'
              }
            `}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {filterBadges().map(badge => (
            <motion.div
              key={badge.id}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
                mass: 1
              }}
            >
              <Badge
                badge={badge}
                userStats={userStats}
                showProgress={true}
                className="w-full"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filterBadges().length === 0 && (
        <div className="text-center py-8 text-gray-400">
          No badges found for this category.
        </div>
      )}
    </div>
  );
};

export default BadgeCollection;

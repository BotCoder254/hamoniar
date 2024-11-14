import React from 'react';
import { motion } from 'framer-motion';
import { UilPlay, UilHeart, UilClock } from '@iconscout/react-unicons';

const TrackStats = ({ track }) => {
  return (
    <div className="grid grid-cols-3 gap-4 bg-light/50 p-4 rounded-lg">
      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center p-4 bg-dark rounded-lg"
      >
        <UilPlay className="w-6 h-6 text-primary mb-2" />
        <span className="text-2xl font-bold">{track.plays || 0}</span>
        <span className="text-sm text-lightest">Plays</span>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center p-4 bg-dark rounded-lg"
      >
        <UilHeart className="w-6 h-6 text-red-500 mb-2" />
        <span className="text-2xl font-bold">{track.likes || 0}</span>
        <span className="text-sm text-lightest">Likes</span>
      </motion.div>

      <motion.div 
        whileHover={{ scale: 1.05 }}
        className="flex flex-col items-center p-4 bg-dark rounded-lg"
      >
        <UilClock className="w-6 h-6 text-blue-500 mb-2" />
        <span className="text-2xl font-bold">{formatDuration(track.duration)}</span>
        <span className="text-sm text-lightest">Duration</span>
      </motion.div>
    </div>
  );
};

export default TrackStats; 
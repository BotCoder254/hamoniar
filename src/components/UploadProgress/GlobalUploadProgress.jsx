import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UilCloudUpload, UilTimes } from '@iconscout/react-unicons';

const GlobalUploadProgress = ({ uploads, onClose }) => {
  if (!uploads || Object.keys(uploads).length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-24 right-4 bg-dark/95 backdrop-blur-lg p-4 rounded-lg shadow-lg z-50 w-80"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <UilCloudUpload className="w-5 h-5 text-primary" />
            <span className="font-medium">Uploading Files</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-1 hover:bg-light/30 rounded-full"
          >
            <UilTimes className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="space-y-4">
          {Object.entries(uploads).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="truncate">{fileName}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-1 bg-light/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GlobalUploadProgress; 
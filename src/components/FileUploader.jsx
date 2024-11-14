import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UilCloudUpload, UilMusic } from '@iconscout/react-unicons';
import { useMusic } from '../context/MusicContext';
import * as mm from 'music-metadata-browser';

const FileUploader = ({ isVisible, onClose }) => {
  const { dispatch } = useMusic();

  const processFile = async (file) => {
    try {
      const metadata = await mm.parseBlob(file);
      const url = URL.createObjectURL(file);
      
      const song = {
        id: Date.now() + Math.random(),
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        duration: metadata.format.duration,
        url: url,
        albumArt: metadata.common.picture?.[0] ? 
          URL.createObjectURL(new Blob([metadata.common.picture[0].data])) : 
          null
      };

      dispatch({ type: 'ADD_TO_PLAYLIST', payload: song });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(processFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    }
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-dark p-8 rounded-2xl max-w-xl w-full mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center
                ${isDragActive ? 'border-primary bg-primary bg-opacity-10' : 'border-gray-600'}`}
            >
              <input {...getInputProps()} />
              <UilCloudUpload className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {isDragActive ? 'Drop your music here' : 'Drag & drop music files'}
              </h3>
              <p className="text-lightest mb-4">
                Or click to select files
              </p>
              <div className="flex items-center justify-center space-x-2 text-sm text-lightest">
                <UilMusic className="w-4 h-4" />
                <span>Supports MP3, WAV, OGG, M4A</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FileUploader; 
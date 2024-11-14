import React, { createContext, useContext, useState } from 'react';
import GlobalUploadProgress from '../components/UploadProgress/GlobalUploadProgress';

const UploadContext = createContext();

export function UploadProvider({ children }) {
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const updateProgress = (fileName, progress) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: progress
    }));
  };

  const clearProgress = (fileName) => {
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const value = {
    uploadProgress,
    isUploading,
    setIsUploading,
    updateProgress,
    clearProgress
  };

  return (
    <UploadContext.Provider value={value}>
      {children}
      <GlobalUploadProgress 
        uploads={uploadProgress}
        onClose={() => setUploadProgress({})}
      />
    </UploadContext.Provider>
  );
};

export const useUpload = () => {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error('useUpload must be used within an UploadProvider');
  }
  return context;
}; 
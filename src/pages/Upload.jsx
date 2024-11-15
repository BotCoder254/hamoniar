import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useAchievements } from '../context/AchievementContext';
import { storage, db } from '../config/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { UilCloudUpload, UilMusic } from '@iconscout/react-unicons';

const Upload = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error } = useToast();
  const { userStats, updateUserStats } = useAchievements();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trackInfo, setTrackInfo] = useState({
    title: '',
    artist: '',
    genre: '',
    description: ''
  });

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;

    try {
      setUploading(true);
      const file = acceptedFiles[0];

      // Create storage reference
      const storageRef = ref(storage, `tracks/${currentUser.uid}/${Date.now()}-${file.name}`);
      
      // Upload file
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          error('Failed to upload track. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Update track info in Firestore
            const trackRef = doc(db, 'tracks', currentUser.uid);
            await updateDoc(trackRef, {
              tracks: increment(1),
              lastUpload: new Date().toISOString(),
              [`trackList.${Date.now()}`]: {
                ...trackInfo,
                url: downloadURL,
                fileName: file.name,
                uploadDate: new Date().toISOString()
              }
            });

            // Update user stats for achievements
            await updateUserStats({
              totalUploads: (userStats?.totalUploads || 0) + 1
            });

            success('Track uploaded successfully!');
            navigate('/library');
          } catch (err) {
            console.error('Error saving track info:', err);
            error('Failed to save track information.');
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      error('Failed to start upload. Please try again.');
      setUploading(false);
    }
  }, [currentUser, trackInfo, navigate, success, error, updateUserStats, userStats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: false,
    disabled: uploading
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTrackInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Upload Track</h1>

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center
          transition-colors duration-200 cursor-pointer
          ${isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-gray-600 hover:border-primary/50'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="space-y-4"
        >
          {uploading ? (
            <>
              <div className="w-20 h-20 mx-auto">
                <svg className="animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <div className="text-lg font-medium">Uploading... {Math.round(uploadProgress)}%</div>
            </>
          ) : (
            <>
              <UilCloudUpload className="w-20 h-20 mx-auto text-gray-400" />
              <div className="text-lg font-medium">
                {isDragActive
                  ? "Drop your track here..."
                  : "Drag & drop your track here, or click to browse"
                }
              </div>
              <p className="text-sm text-gray-400">
                Supports MP3, WAV, OGG, and M4A files
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Track Information Form */}
      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Track Title
          </label>
          <input
            type="text"
            name="title"
            value={trackInfo.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Enter track title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Artist Name
          </label>
          <input
            type="text"
            name="artist"
            value={trackInfo.artist}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Enter artist name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre
          </label>
          <select
            name="genre"
            value={trackInfo.genre}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
          >
            <option value="">Select a genre</option>
            <option value="electronic">Electronic</option>
            <option value="rock">Rock</option>
            <option value="hiphop">Hip Hop</option>
            <option value="jazz">Jazz</option>
            <option value="classical">Classical</option>
            <option value="pop">Pop</option>
            <option value="ambient">Ambient</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={trackInfo.description}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary resize-none"
            placeholder="Enter track description"
          />
        </div>
      </div>
    </div>
  );
};

export default Upload;
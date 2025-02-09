import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storage, db } from '../config/firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { UilCloudUpload, UilMusic } from '@iconscout/react-unicons';

const Upload = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { success, error: showError } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackInfo, setTrackInfo] = useState({
    title: '',
    artist: '',
    genre: '',
    description: ''
  });

  const validateForm = () => {
    if (!selectedFile) {
      showError('Please select a file to upload');
      return false;
    }
    if (!trackInfo.title.trim()) {
      showError('Please enter a track title');
      return false;
    }
    if (!trackInfo.artist.trim()) {
      showError('Please enter an artist name');
      return false;
    }
    if (!trackInfo.genre) {
      showError('Please select a genre');
      return false;
    }
    return true;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length || !currentUser) return;
    setSelectedFile(acceptedFiles[0]);
  }, [currentUser]);

  const handleUpload = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);
      const file = selectedFile;

      // Create storage reference with a unique name
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `audio/${currentUser.uid}/${fileName}`);
      
      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          userId: currentUser.uid,
          originalName: file.name
        }
      };
      
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          showError('Failed to upload track. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            // Get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Save track info to Firestore
            const trackData = {
              title: trackInfo.title.trim(),
              artist: trackInfo.artist.trim(),
              genre: trackInfo.genre,
              description: trackInfo.description.trim(),
              audioUrl: downloadURL,
              fileName: fileName,
              originalFileName: file.name,
              userId: currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              duration: 0,
              plays: 0,
              likes: 0,
              public: true,
              fileType: file.type,
              fileSize: file.size
            };

            // Add track document to 'tracks' collection
            const docRef = await addDoc(collection(db, 'tracks'), trackData);

            // Update the document with its ID
            await addDoc(collection(db, 'activities'), {
              type: 'upload',
              userId: currentUser.uid,
              trackId: docRef.id,
              timestamp: serverTimestamp(),
              details: {
                trackName: trackData.title,
                genre: trackData.genre
              }
            });

            success('Track uploaded successfully!');
            navigate('/library');
          } catch (err) {
            console.error('Error saving track info:', err);
            showError('Failed to save track information.');
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (err) {
      console.error('Upload error:', err);
      showError('Failed to start upload. Please try again.');
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    multiple: false,
    disabled: uploading,
    maxSize: 50 * 1024 * 1024 // 50MB
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTrackInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Please login to upload tracks</h1>
      </div>
    );
  }

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
                {selectedFile 
                  ? `Selected: ${selectedFile.name}`
                  : isDragActive
                    ? "Drop your track here..."
                    : "Drag & drop your track here, or click to browse"
                }
              </div>
              <p className="text-sm text-gray-400">
                Supports MP3, WAV, OGG, and M4A files (max 50MB)
              </p>
            </>
          )}
        </motion.div>
      </div>

      {/* Track Information Form */}
      <div className="mt-8 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Track Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={trackInfo.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Enter track title"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Artist Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="artist"
            value={trackInfo.artist}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Enter artist name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Genre <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={trackInfo.genre}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-dark/50 rounded-lg border border-gray-600
                     focus:border-primary focus:ring-1 focus:ring-primary"
            required
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

        <div className="pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploading || !selectedFile}
            className={`w-full py-3 rounded-lg font-medium ${
              uploading || !selectedFile
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Track'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Upload;
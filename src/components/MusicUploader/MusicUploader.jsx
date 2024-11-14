import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { 
  UilCloudUpload, UilMusic, UilTimes, UilCheck,
  UilSpinner, UilEdit, UilImage, UilMicrophone,
  UilCompactDisc, UilCalendarAlt, UilTag, UilParagraph
} from '@iconscout/react-unicons';
import { storage, db } from '../../config/firebase.config';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  collection, addDoc, serverTimestamp, updateDoc, 
  increment, doc
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { extractMetadata } from '../../utils/audio.utils';

const EditableMetadata = ({ metadata, setMetadata }) => (
  <div className="grid grid-cols-2 gap-4 mb-6">
    <div>
      <label className="block text-sm font-medium mb-1">Title</label>
      <div className="relative">
        <UilMusic className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={metadata.title}
          onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Track title"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Artist</label>
      <div className="relative">
        <UilMicrophone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={metadata.artist}
          onChange={(e) => setMetadata(prev => ({ ...prev, artist: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Artist name"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Album</label>
      <div className="relative">
        <UilCompactDisc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={metadata.album}
          onChange={(e) => setMetadata(prev => ({ ...prev, album: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Album name"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Year</label>
      <div className="relative">
        <UilCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="number"
          value={metadata.year}
          onChange={(e) => setMetadata(prev => ({ ...prev, year: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Release year"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Genre</label>
      <div className="relative">
        <UilTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={metadata.genre}
          onChange={(e) => setMetadata(prev => ({ ...prev, genre: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Music genre"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">Custom Cover Art</label>
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (e) => {
                setMetadata(prev => ({ ...prev, albumArt: e.target.result }));
              };
              reader.readAsDataURL(file);
            }
          }}
          className="hidden"
          id="cover-art-input"
        />
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => document.getElementById('cover-art-input').click()}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg flex items-center"
        >
          <UilImage className="absolute left-3 text-gray-400" />
          <span className="text-lightest">Choose image</span>
        </motion.button>
      </div>
    </div>

    <div className="col-span-2">
      <label className="block text-sm font-medium mb-1">Description</label>
      <div className="relative">
        <UilParagraph className="absolute left-3 top-3 text-gray-400" />
        <textarea
          value={metadata.description}
          onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary h-24 resize-none"
          placeholder="Add a description for your track..."
        />
      </div>
    </div>
  </div>
);

const ProgressBar = ({ progress }) => (
  <div className="relative w-full h-2 bg-light/30 rounded-full overflow-hidden">
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="absolute h-full bg-primary rounded-full"
    />
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      className="absolute h-full bg-white/20 rounded-full"
      style={{
        animation: 'progressPulse 1s ease-in-out infinite'
      }}
    />
  </div>
);

const UploadStatus = ({ file, progress, metadata }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-light/30 p-4 rounded-lg"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <img
          src={metadata.albumArt || "/default-album-art.jpg"}
          alt="Album Art"
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div>
          <h4 className="font-medium">{metadata.title}</h4>
          <p className="text-sm text-lightest">{metadata.artist}</p>
        </div>
      </div>
      <span className="text-sm text-lightest">{Math.round(progress)}%</span>
    </div>
    <ProgressBar progress={progress} />
  </motion.div>
);

const MusicUploader = ({ isVisible, onClose }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [currentMetadata, setCurrentMetadata] = useState(null);
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (!currentUser) return;
    
    const file = acceptedFiles[0];
    setSelectedFile(file);
    
    try {
      // Extract initial metadata
      const metadata = await extractMetadata(file);
      setCurrentMetadata({
        ...metadata,
        description: '',
        isPublic: true
      });
    } catch (error) {
      console.error('Error processing file:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentMetadata) return;
    setIsUploading(true);
    
    try {
      // Create storage reference
      const storageRef = ref(storage, `music/${currentUser.uid}/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(prev => ({
            ...prev,
            [selectedFile.name]: progress
          }));
        },
        (error) => {
          console.error('Upload error:', error);
          setIsUploading(false);
        },
        async () => {
          // Get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          // Clean and validate metadata
          const cleanMetadata = {
            title: currentMetadata.title || 'Untitled',
            artist: currentMetadata.artist || 'Unknown Artist',
            album: currentMetadata.album || 'Unknown Album',
            genre: currentMetadata.genre || 'Unknown Genre',
            description: currentMetadata.description || '',
            year: currentMetadata.year ? parseInt(currentMetadata.year) : null,
            albumArt: currentMetadata.albumArt || null,
            url: downloadURL,
            uploadedBy: currentUser.uid,
            uploadedAt: serverTimestamp(),
            plays: 0,
            likes: [],
            isPublic: true,
            duration: currentMetadata.duration || 0,
            bpm: currentMetadata.bpm ? parseInt(currentMetadata.bpm) : null,
            key: currentMetadata.key || null
          };

          // Save to Firestore
          const docRef = await addDoc(collection(db, 'music'), cleanMetadata);

          // Update user's upload count
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, {
            'stats.uploads': increment(1)
          });

          // Add to activity feed
          await addDoc(collection(db, 'activities'), {
            type: 'upload',
            userId: currentUser.uid,
            userName: currentUser.displayName,
            userPhotoURL: currentUser.photoURL,
            trackId: docRef.id,
            trackName: cleanMetadata.title,
            timestamp: serverTimestamp()
          });

          setUploadedFiles(prev => [...prev, {
            ...cleanMetadata,
            id: docRef.id,
            progress: 100,
            status: 'completed'
          }]);

          // Reset states after successful upload
          setSelectedFile(null);
          setCurrentMetadata(null);
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false // Only allow single file upload
  });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-dark p-8 rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upload Music</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-light rounded-full transition-colors"
              >
                <UilTimes className="w-6 h-6" />
              </motion.button>
            </div>

            {!currentMetadata ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-6
                  ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-600'}`}
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
                  <span>Supports MP3, WAV, OGG, M4A (Max 50MB)</span>
                </div>
              </div>
            ) : (
              <>
                <EditableMetadata 
                  metadata={currentMetadata}
                  setMetadata={setCurrentMetadata}
                />
                
                <div className="flex justify-end space-x-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setCurrentMetadata(null);
                      setSelectedFile(null);
                    }}
                    className="px-6 py-2 bg-light rounded-lg"
                    disabled={isUploading}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    className="px-6 py-2 bg-primary rounded-lg flex items-center space-x-2"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <UilSpinner className="w-5 h-5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UilCloudUpload className="w-5 h-5" />
                        <span>Upload</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </>
            )}

            {/* Upload Progress */}
            <div className="space-y-4 mt-6">
              {uploadedFiles.map(file => (
                <UploadStatus
                  key={file.id}
                  file={file}
                  progress={uploadProgress[file.name] || 0}
                  metadata={file}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MusicUploader; 
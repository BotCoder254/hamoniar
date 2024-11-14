import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilMusic, UilHeart, UilUpload, UilEdit,
  UilCamera, UilSpinner, UilShare, UilMapMarker,
  UilLink, UilGlobe, UilCalendarAlt, UilUsersAlt
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { storage, db } from '../../config/firebase.config';
import { 
  doc, getDoc, updateDoc, collection, 
  query, where, getDocs, orderBy, limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

const ProfileHeader = ({ user, isOwnProfile, onEdit, onImageUpload }) => (
  <div className="relative mb-8">
    {/* Cover Image */}
    <div className="h-64 bg-gradient-to-r from-primary/20 to-dark rounded-xl overflow-hidden">
      {user.coverPhoto && (
        <img 
          src={user.coverPhoto} 
          alt="Cover" 
          className="w-full h-full object-cover"
        />
      )}
      {isOwnProfile && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => document.getElementById('cover-upload').click()}
          className="absolute top-4 right-4 p-2 bg-dark/50 rounded-full"
        >
          <UilCamera className="w-5 h-5" />
        </motion.button>
      )}
    </div>

    {/* Profile Info */}
    <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
      <div className="relative group">
        <img
          src={user.photoURL || '/default-avatar.png'}
          alt={user.displayName}
          className="w-32 h-32 rounded-full border-4 border-dark object-cover"
        />
        {isOwnProfile && (
          <label className="absolute inset-0 flex items-center justify-center bg-black/50 
                          opacity-0 group-hover:opacity-100 transition-opacity rounded-full 
                          cursor-pointer">
            <UilCamera className="w-8 h-8 text-white" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={onImageUpload}
              id="profile-upload"
            />
          </label>
        )}
      </div>
      
      <div className="mb-4 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-lightest">{user.bio || 'No bio yet'}</p>
          </div>
          {isOwnProfile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onEdit}
              className="p-2 hover:bg-light rounded-full"
            >
              <UilEdit className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-2 text-sm text-lightest">
          {user.location && (
            <div className="flex items-center space-x-1">
              <UilMapMarker className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.website && (
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-primary"
            >
              <UilLink className="w-4 h-4" />
              <span>Website</span>
            </a>
          )}
          <div className="flex items-center space-x-1">
            <UilCalendarAlt className="w-4 h-4" />
            <span>Joined {formatDistanceToNow(user.createdAt?.toDate(), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileStats = ({ stats }) => (
  <div className="grid grid-cols-4 gap-4 mb-8">
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-light p-6 rounded-xl text-center"
    >
      <UilMusic className="w-6 h-6 mx-auto text-primary mb-2" />
      <span className="block text-2xl font-bold">{stats.uploads}</span>
      <span className="text-sm text-lightest">Uploads</span>
    </motion.div>
    
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-light p-6 rounded-xl text-center"
    >
      <UilHeart className="w-6 h-6 mx-auto text-red-500 mb-2" />
      <span className="block text-2xl font-bold">{stats.likes}</span>
      <span className="text-sm text-lightest">Likes</span>
    </motion.div>
    
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-light p-6 rounded-xl text-center"
    >
      <UilUsersAlt className="w-6 h-6 mx-auto text-blue-500 mb-2" />
      <span className="block text-2xl font-bold">{stats.followers}</span>
      <span className="text-sm text-lightest">Followers</span>
    </motion.div>

    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-light p-6 rounded-xl text-center"
    >
      <UilGlobe className="w-6 h-6 mx-auto text-green-500 mb-2" />
      <span className="block text-2xl font-bold">{stats.plays}</span>
      <span className="text-sm text-lightest">Total Plays</span>
    </motion.div>
  </div>
);

const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || ''
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-dark p-6 rounded-xl w-full max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              onSave(formData);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-light p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full bg-light p-2 rounded-lg h-24 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-light p-2 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full bg-light p-2 rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-light rounded-lg"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 bg-primary rounded-lg"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const UserProfile = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [likedTracks, setLikedTracks] = useState([]);

  const isOwnProfile = !userId || userId === currentUser?.uid;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', userId || currentUser.uid));
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() });
        }

        // Fetch uploaded tracks
        const uploadsQuery = query(
          collection(db, 'music'),
          where('uploadedBy', '==', userId || currentUser.uid),
          orderBy('uploadedAt', 'desc')
        );
        const uploadedDocs = await getDocs(uploadsQuery);
        setUploadedTracks(uploadedDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        // Fetch liked tracks
        const likedQuery = query(
          collection(db, 'music'),
          where('likes', 'array-contains', userId || currentUser.uid)
        );
        const likedDocs = await getDocs(likedQuery);
        setLikedTracks(likedDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser]);

  const handleProfileUpdate = async (data) => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...data,
        updatedAt: new Date()
      });

      setUser(prev => ({ ...prev, ...data }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', currentUser.uid), {
        photoURL,
        updatedAt: new Date()
      });

      setUser(prev => ({
        ...prev,
        photoURL
      }));
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <UilSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="text-lightest mt-2">This user might not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ProfileHeader 
        user={user}
        isOwnProfile={isOwnProfile}
        onEdit={() => setIsEditing(true)}
        onImageUpload={handleImageUpload}
      />

      <div className="mt-20">
        <ProfileStats stats={user.stats || {}} />

        <div className="grid grid-cols-2 gap-8">
          {/* Uploaded Tracks */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center">
              <UilUpload className="w-5 h-5 mr-2" />
              Uploaded Tracks
            </h3>
            {/* Add uploaded tracks list component */}
          </div>

          {/* Liked Tracks */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center">
              <UilHeart className="w-5 h-5 mr-2" />
              Liked Tracks
            </h3>
            {/* Add liked tracks list component */}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfile; 
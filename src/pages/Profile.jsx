import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityFeed from '../components/ActivityFeed/ActivityFeed';
import UserStats from '../components/UserProfile/UserStats';
import EditProfileModal from '../components/UserProfile/EditProfileModal';
import FollowList from '../components/UserProfile/FollowList';
import { toast } from 'react-hot-toast';
import { FiEdit3, FiUpload, FiMusic, FiActivity, FiUsers, FiHeart } from 'react-icons/fi';
import DefaultUserIcon from '../components/icons/DefaultUserIcon';

export default function Profile() {
  const { currentUser } = useAuth();
  const { 
    userProfile,
    loading,
    followers,
    following,
    activities,
    updateProfile
  } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('uploads');
  const [showBio, setShowBio] = useState(false);

  const handleImageUpload = async (event) => {
    try {
      setUploadingImage(true);
      const file = event.target.files[0];
      if (!file) return;

      const imageRef = storageRef(storage, `profile-images/${currentUser.uid}/${file.name}`);
      await uploadBytes(imageRef, file);
      const photoURL = await getDownloadURL(imageRef);

      await updateProfile({ photoURL });
      toast.success('Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to update profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileUpdate = async (data) => {
    try {
      await updateProfile(data);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'uploads', label: 'Uploads', icon: FiMusic },
    { id: 'activities', label: 'Activities', icon: FiActivity },
    { id: 'following', label: 'Following', icon: FiUsers },
    { id: 'followers', label: 'Followers', icon: FiUsers },
    { id: 'liked', label: 'Liked', icon: FiHeart }
  ];

  return (
    <div className="min-h-screen bg-dark  from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark rounded-2xl shadow-xl p-8 mb-8 text-white"
        >
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Image */}
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-purple-500 ring-opacity-50"
              >
                {userProfile?.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-dark flex items-center justify-center">
                    <DefaultUserIcon className="w-20 h-20 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                    <FiUpload className="h-8 w-8 text-white" />
                  </label>
                </div>
              </motion.div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white-900">{userProfile?.displayName}</h1>
              <p className="text-gray-600 mb-2">{userProfile?.email}</p>
              <motion.div
                initial={false}
                animate={{ height: showBio ? 'auto' : '2.5rem' }}
                className="overflow-hidden"
              >
                <p className="text-gray-700 whitespace-pre-wrap">
                  {userProfile?.bio || 'No bio yet'}
                </p>
              </motion.div>
              {userProfile?.bio && userProfile.bio.length > 100 && (
                <button
                  onClick={() => setShowBio(!showBio)}
                  className="text-purple-500 hover:text-purple-600 text-sm mt-1"
                >
                  {showBio ? 'Show less' : 'Show more'}
                </button>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {userProfile?.preferredGenres?.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="mt-4 inline-flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                <FiEdit3 className="mr-2" />
                Edit Profile
              </button>
            </div>

            {/* User Stats */}
            <UserStats stats={userProfile?.stats} />
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="bg-dark rounded-xl shadow-lg mb-8 text-white">
          <div className="flex overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`flex-1 min-w-[120px] flex items-center justify-center space-x-2 py-4 px-6 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-purple-600 border-b-2 border-purple-500'
                      : 'text-gray-600 hover:text-purple-500'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {(tab.id === 'followers' || tab.id === 'following') && (
                    <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                      {tab.id === 'followers' ? followers.length : following.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-dark rounded-2xl shadow-xl p-6"
          >
            {activeTab === 'uploads' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfile?.uploads?.length > 0 ? (
                  userProfile.uploads.map((upload) => (
                    <motion.div
                      key={upload.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md p-4"
                    >
                      <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={upload.coverImage || '/default-track.jpg'}
                          alt={upload.title}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{upload.title}</h3>
                      <p className="text-sm text-gray-600">{upload.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>{upload.plays || 0} plays</span>
                        <span>{upload.likes || 0} likes</span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No uploads yet
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activities' && <ActivityFeed activities={activities} />}

            {activeTab === 'following' && (
              <FollowList users={following} type="following" />
            )}

            {activeTab === 'followers' && (
              <FollowList users={followers} type="followers" />
            )}

            {activeTab === 'liked' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userProfile?.likedTracks?.length > 0 ? (
                  userProfile.likedTracks.map((track) => (
                    <motion.div
                      key={track.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-md p-4"
                    >
                      <div className="aspect-w-16 aspect-h-9 mb-4 rounded-lg overflow-hidden">
                        <img
                          src={track.coverImage || '/default-track.jpg'}
                          alt={track.title}
                          className="object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-900">{track.title}</h3>
                      <p className="text-sm text-gray-600">by {track.artist}</p>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No liked tracks yet
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <EditProfileModal
            profile={userProfile}
            onClose={() => setIsEditing(false)}
            onSave={handleProfileUpdate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    website: profile?.website || '',
    preferredGenres: profile?.preferredGenres || [],
    socialLinks: profile?.socialLinks || {
      twitter: '',
      instagram: '',
      soundcloud: ''
    }
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const genres = [
    'Hip Hop',
    'Rock',
    'Electronic',
    'Pop',
    'Jazz',
    'Classical',
    'R&B',
    'Country',
    'Metal',
    'Folk'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social-')) {
      const platform = name.replace('social-', '');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [platform]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => {
      const currentGenres = prev.preferredGenres;
      if (currentGenres.includes(genre)) {
        return {
          ...prev,
          preferredGenres: currentGenres.filter(g => g !== genre)
        };
      } else {
        return {
          ...prev,
          preferredGenres: [...currentGenres, genre]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onSave(formData);
      onClose(); // Close modal after successful save
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center overflow-y-auto">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-dark rounded-lg shadow-xl max-w-2xl w-full relative"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Your display name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Your location"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="https://your-website.com"
                />
              </div>

              {/* Preferred Genres */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preferred Genres
                </label>
                <div className="flex flex-wrap gap-2">
                  {genres.map(genre => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => handleGenreToggle(genre)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        formData.preferredGenres.includes(genre)
                          ? 'bg-purple-500 text-white'
                          : 'bg-dark/50 text-gray-300 border border-gray-600 hover:border-purple-500'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  Social Links
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 w-24">Twitter</span>
                    <input
                      type="url"
                      name="social-twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 w-24">Instagram</span>
                    <input
                      type="url"
                      name="social-instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="https://instagram.com/username"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 w-24">SoundCloud</span>
                    <input
                      type="url"
                      name="social-soundcloud"
                      value={formData.socialLinks.soundcloud}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 rounded-lg bg-dark/50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="https://soundcloud.com/username"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

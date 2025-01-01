import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UilPlay, UilHeart, UilShare, UilMusic,
  UilSpinner
} from '@iconscout/react-unicons';
import { useParams } from 'react-router-dom';
import { db } from '../../config/firebase.config';
import { doc, getDoc } from 'firebase/firestore';
import DefaultAlbumIcon from '../icons/DefaultAlbumIcon';

const SharedMusic = () => {
  const [musicData, setMusicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const docRef = doc(db, 'music', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setMusicData({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching music:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <UilSpinner className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!musicData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <UilMusic className="w-12 h-12 mx-auto text-lightest mb-4" />
          <h2 className="text-2xl font-bold mb-2">Track Not Found</h2>
          <p className="text-lightest">The track you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light p-6 rounded-xl"
      >
        <div className="flex space-x-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative group"
          >
            {musicData.albumArt ? (
              <img
                src={musicData.albumArt}
                alt={musicData.title}
                className="w-64 h-64 rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-64 h-64 rounded-lg shadow-lg bg-dark flex items-center justify-center">
                <DefaultAlbumIcon className="w-32 h-32 text-white" />
              </div>
            )}
          </motion.div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{musicData.title}</h1>
            <p className="text-xl text-lightest mb-6">{musicData.artist}</p>

            <div className="flex items-center space-x-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={playMusic}
                className="px-6 py-3 bg-primary rounded-full font-medium flex items-center space-x-2"
              >
                <UilPlay className="w-5 h-5" />
                <span>Play Now</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-gray-700 rounded-full"
              >
                <UilHeart className="w-5 h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 hover:bg-gray-700 rounded-full"
              >
                <UilShare className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-lightest">Album</p>
                <p className="font-medium">{musicData.album}</p>
              </div>
              <div>
                <p className="text-lightest">Duration</p>
                <p className="font-medium">{musicData.duration}</p>
              </div>
              <div>
                <p className="text-lightest">Plays</p>
                <p className="font-medium">{musicData.plays}</p>
              </div>
              <div>
                <p className="text-lightest">Likes</p>
                <p className="font-medium">{musicData.likes}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SharedMusic; 
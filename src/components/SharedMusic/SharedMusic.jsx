import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { UilPlay, UilHeart, UilShare } from '@iconscout/react-unicons';
import { useMusic } from '../../context/MusicContext';

const SharedMusic = () => {
  const { musicId } = useParams();
  const [musicData, setMusicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useMusic();

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        const musicDoc = await getDoc(doc(db, 'music', musicId));
        if (musicDoc.exists()) {
          setMusicData(musicDoc.data());
          // Increment play count
          await updateDoc(doc(db, 'music', musicId), {
            plays: increment(1)
          });
        }
      } catch (error) {
        console.error('Error fetching music:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicData();
  }, [musicId]);

  const playMusic = () => {
    if (musicData) {
      dispatch({ type: 'SET_CURRENT_SONG', payload: musicData });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!musicData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Music not found</h2>
        <p className="text-lightest mt-2">This music might have been removed or is private.</p>
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
          <motion.img
            whileHover={{ scale: 1.05 }}
            src={musicData.albumArt || '/default-album-art.jpg'}
            alt={musicData.title}
            className="w-64 h-64 rounded-lg shadow-lg object-cover"
          />

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
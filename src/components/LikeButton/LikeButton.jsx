import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UilHeart } from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  doc, updateDoc, arrayUnion, arrayRemove, 
  onSnapshot, collection, addDoc, serverTimestamp,
  increment
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const LikeButton = ({ trackId }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!trackId || !currentUser) return;

    const trackRef = doc(db, 'music', trackId);
    const unsubscribe = onSnapshot(trackRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsLiked(data.likes?.includes(currentUser.uid) || false);
        setLikeCount(data.likes?.length || 0);
      }
    });

    return () => unsubscribe();
  }, [trackId, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      toast.error('Please log in to like tracks');
      return;
    }

    setIsAnimating(true);

    try {
      const trackRef = doc(db, 'music', trackId);
      const trackData = (await trackRef.get()).data();

      if (!isLiked) {
        await updateDoc(trackRef, {
          likes: arrayUnion(currentUser.uid),
          likeCount: increment(1)
        });

        // Add to activity feed
        await addDoc(collection(db, 'activities'), {
          type: 'like',
          userId: currentUser.uid,
          userName: currentUser.displayName,
          userPhotoURL: currentUser.photoURL,
          trackId,
          trackName: trackData?.title || 'Unknown Track',
          timestamp: serverTimestamp(),
          read: false
        });

        toast.success('Added to your liked tracks');
      } else {
        await updateDoc(trackRef, {
          likes: arrayRemove(currentUser.uid),
          likeCount: increment(-1)
        });

        toast.success('Removed from your liked tracks');
      }
    } catch (error) {
      console.error('Error updating like:', error);
      toast.error('Failed to update like status');
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="flex items-center space-x-2">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleLike}
        className="relative"
      >
        <UilHeart 
          className={`w-5 h-5 transition-colors duration-300
            ${isLiked ? 'text-red-500 fill-current' : 'text-white/70 hover:text-white'}`}
        />
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 text-red-500"
            >
              <UilHeart className="w-5 h-5 fill-current" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      <motion.span 
        key={likeCount}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-sm text-white/70"
      >
        {likeCount}
      </motion.span>
    </div>
  );
};

export default LikeButton; 
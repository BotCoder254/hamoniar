import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilCommentAlt, UilTrashAlt, UilClock, UilSpinner,
  UilMessage, UilSmile, UilEllipsisH
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, addDoc, query, orderBy, 
  onSnapshot, deleteDoc, doc, serverTimestamp,
  where, limit 
} from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';

const CommentItem = ({ comment, onDelete, currentUserId }) => {
  const [showOptions, setShowOptions] = useState(false);

  const getFormattedTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    try {
      if (timestamp.toDate) {
        return formatDistanceToNow(timestamp.toDate(), { addSuffix: true });
      }
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Just now';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex space-x-3 p-4 bg-dark/50 rounded-lg group"
    >
      <img
        src={comment.userPhotoURL || '/default-avatar.png'}
        alt={comment.userName}
        className="w-8 h-8 rounded-full"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-medium text-sm text-white">{comment.userName}</span>
            <p className="text-sm mt-1 text-white/90">{comment.text}</p>
          </div>
          <div className="relative">
            {currentUserId === comment.userId && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowOptions(!showOptions)}
                className="p-1 hover:bg-light/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <UilEllipsisH className="w-4 h-4 text-lightest" />
              </motion.button>
            )}
            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-32 bg-dark rounded-lg shadow-xl z-10"
                >
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                    onClick={() => {
                      onDelete(comment.id);
                      setShowOptions(false);
                    }}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-500"
                  >
                    <UilTrashAlt className="w-4 h-4" />
                    <span>Delete</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <UilClock className="w-3 h-3 text-white/70" />
          <span className="text-xs text-white/70">
            {getFormattedTime(comment.timestamp)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const Comments = ({ trackId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (!trackId) return;

    const q = query(
      collection(db, 'music', trackId, 'comments'),
      orderBy('timestamp', 'desc'),
      limit(isExpanded ? 50 : 3)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsList);
      setCommentCount(snapshot.size);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [trackId, isExpanded]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    try {
      await addDoc(collection(db, 'music', trackId, 'comments'), {
        text: newComment,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        timestamp: serverTimestamp()
      });

      // Add to activity feed
      await addDoc(collection(db, 'activities'), {
        type: 'comment',
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        trackId,
        commentText: newComment,
        timestamp: serverTimestamp()
      });

      setNewComment('');
      toast.success('Comment added successfully!', {
        style: {
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment. Please try again.', {
        style: {
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
      });
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteDoc(doc(db, 'music', trackId, 'comments', commentId));
      toast.success('Comment deleted successfully!', {
        style: {
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.', {
        style: {
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
      });
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewComment(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="mt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 text-sm text-lightest hover:text-white"
      >
        <UilCommentAlt className="w-4 h-4" />
        <span>{commentCount} Comments</span>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            {currentUser && (
              <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex space-x-2">
                  <img
                    src={currentUser.photoURL || '/default-avatar.png'}
                    alt={currentUser.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="w-full bg-light p-2 pr-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                      <div className="relative">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          type="button"
                          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          className="text-lightest hover:text-white"
                        >
                          <UilSmile className="w-5 h-5" />
                        </motion.button>
                        <AnimatePresence>
                          {showEmojiPicker && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute bottom-full right-0 mb-2 z-50 bg-dark rounded-lg shadow-xl overflow-hidden"
                              style={{ 
                                maxHeight: '400px',
                                width: '320px',
                                backgroundColor: '#1a1a1a'
                              }}
                            >
                              <EmojiPicker
                                onEmojiClick={onEmojiClick}
                                disableAutoFocus
                                native
                                width="100%"
                                height={400}
                                previewConfig={{ showPreview: false }}
                                searchDisabled
                                skinTonesDisabled
                                theme="dark"
                                lazyLoadEmojis
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="submit"
                        className="text-primary"
                        disabled={!newComment.trim()}
                      >
                        <UilMessage className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {loading ? (
              <div className="flex justify-center py-4">
                <UilSpinner className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2 smooth-scroll">
                <AnimatePresence>
                  {comments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      onDelete={handleDelete}
                      currentUserId={currentUser?.uid}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Comments; 
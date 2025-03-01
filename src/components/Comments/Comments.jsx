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

const CommentItem = ({ comment, onDelete }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const { currentUser } = useAuth();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const replyData = {
        text: replyText,
        userId: currentUser.uid,
        userName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        parentId: comment.id,
        timestamp: serverTimestamp(),
      };

      await addDoc(collection(db, 'comments'), replyData);
      setReplyText('');
      setIsReplying(false);
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-dark/50 rounded-lg p-4 space-y-4"
    >
      <div className="flex items-start space-x-4">
        <img
          src={comment.userPhotoURL || '/default-avatar.png'}
          alt={comment.userName}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{comment.userName}</h4>
            <span className="text-sm text-lightest">
              {formatDistanceToNow(comment.timestamp?.toDate() || new Date(), { addSuffix: true })}
            </span>
          </div>
          <p className="text-lightest mt-1">{comment.text}</p>
          
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-sm text-primary hover:text-primary/80"
            >
              Reply
            </button>
            {comment.replies?.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="text-sm text-lightest hover:text-white"
              >
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {currentUser?.uid === comment.userId && (
              <button
                onClick={() => onDelete(comment.id)}
                className="text-sm text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reply Form */}
      <AnimatePresence>
        {isReplying && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleReply}
            className="mt-4 pl-14"
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-light/20 rounded-lg p-3 min-h-[100px] resize-none"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => setIsReplying(false)}
                className="px-4 py-2 text-sm hover:bg-light/20 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded-lg"
              >
                Reply
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Nested Replies */}
      <AnimatePresence>
        {showReplies && comment.replies && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-14 space-y-4"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                onDelete={onDelete}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
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
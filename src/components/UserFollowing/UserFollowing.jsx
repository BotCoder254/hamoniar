import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UilUserPlus, UilUserMinus, UilSearch,
  UilMusic, UilHeart, UilUsersAlt
} from '@iconscout/react-unicons';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase.config';
import { 
  collection, query, where, getDocs, 
  addDoc, deleteDoc, doc, getDoc, setDoc
} from 'firebase/firestore';
import RecommendedUsers from './RecommendedUsers';

const UserCard = ({ user, isFollowing, onToggleFollow }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-light p-4 rounded-lg flex items-center justify-between"
  >
    <div className="flex items-center space-x-4">
      <img
        src={user.photoURL || '/default-avatar.png'}
        alt={user.displayName}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h3 className="font-medium">{user.displayName}</h3>
        <div className="flex items-center space-x-4 text-sm text-lightest">
          <div className="flex items-center space-x-1">
            <UilMusic className="w-4 h-4" />
            <span>{user.stats?.uploads || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <UilHeart className="w-4 h-4" />
            <span>{user.stats?.likes || 0}</span>
          </div>
          <div className="flex items-center space-x-1">
            <UilUsersAlt className="w-4 h-4" />
            <span>{user.stats?.followers || 0}</span>
          </div>
        </div>
      </div>
    </div>

    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggleFollow(user)}
      className={`px-4 py-2 rounded-full flex items-center space-x-2
        ${isFollowing ? 
          'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 
          'bg-primary text-white hover:bg-primary/90'}`}
    >
      {isFollowing ? (
        <>
          <UilUserMinus className="w-5 h-5" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UilUserPlus className="w-5 h-5" />
          <span>Follow</span>
        </>
      )}
    </motion.button>
  </motion.div>
);

const UserFollowing = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      // Fetch all users except current user
      const usersSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('uid', '!=', currentUser.uid)
        )
      );
      
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch following list
      const followingSnapshot = await getDocs(
        collection(db, 'users', currentUser.uid, 'following')
      );
      
      const followingIds = followingSnapshot.docs.map(doc => doc.id);
      
      setUsers(usersData);
      setFollowing(followingIds);
      setLoading(false);
    };

    fetchUsers();
  }, [currentUser]);

  const handleToggleFollow = async (user) => {
    const isFollowing = following.includes(user.id);
    const followingRef = doc(db, 'users', currentUser.uid, 'following', user.id);
    const followerRef = doc(db, 'users', user.id, 'followers', currentUser.uid);

    try {
      if (isFollowing) {
        await deleteDoc(followingRef);
        await deleteDoc(followerRef);
        setFollowing(prev => prev.filter(id => id !== user.id));
      } else {
        await addDoc(collection(db, 'activities'), {
          type: 'follow',
          userId: currentUser.uid,
          userName: currentUser.displayName,
          userPhotoURL: currentUser.photoURL,
          targetUserId: user.id,
          targetUserName: user.displayName,
          timestamp: new Date()
        });

        await setDoc(followingRef, {
          timestamp: new Date()
        });
        await setDoc(followerRef, {
          timestamp: new Date()
        });
        setFollowing(prev => [...prev, user.id]);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Following</h2>
        <div className="relative">
          <UilSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lightest" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-64 bg-light pl-10 pr-4 py-2 rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Following List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold mb-4">People You Follow</h3>
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              isFollowing={following.includes(user.id)}
              onToggleFollow={handleToggleFollow}
            />
          ))}
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 bg-light/20 rounded-lg">
              <p className="text-lightest">No users found</p>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="space-y-4">
          <RecommendedUsers
            onFollow={handleToggleFollow}
            currentFollowing={following}
          />
        </div>
      </div>
    </div>
  );
};

export default UserFollowing; 
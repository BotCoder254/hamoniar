import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase.config';
import { 
  collection, query, limit, orderBy, startAfter, 
  onSnapshot, getDocs, where, or, and
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import DefaultUserIcon from '../icons/DefaultUserIcon';
import FollowButton from '../UserProfile/FollowButton';
import { UilSearch } from '@iconscout/react-unicons';
import { toast } from 'react-hot-toast';

const SidebarUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const lastUserRef = useRef(null);
  const { currentUser } = useAuth();
  const observerRef = useRef();
  const searchTimeoutRef = useRef(null);
  const USERS_PER_PAGE = 5;

  // Real-time users subscription with proper indexing
  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    // Simplified query to avoid complex index requirements
    const q = query(
      usersRef,
      where('uid', '!=', currentUser.uid),
      orderBy('uid'),
      limit(USERS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const usersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by lastActive in memory instead of in query
        const sortedUsers = usersData.sort((a, b) => 
          (b.lastActive?.toMillis() || 0) - (a.lastActive?.toMillis() || 0)
        );
        
        setUsers(sortedUsers);
        setLoading(false);
        lastUserRef.current = snapshot.docs[snapshot.docs.length - 1];
      } catch (error) {
        console.error('Error fetching users:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Enhanced search functionality with simpler indexing
  const handleSearch = async (value) => {
    setSearchQuery(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const usersRef = collection(db, 'users');
        const searchLower = value.toLowerCase();
        
        // Simplified query with single field index
        const q = query(
          usersRef,
          where('displayNameLower', '>=', searchLower),
          where('displayNameLower', '<=', searchLower + '\uf8ff'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const searchData = snapshot.docs
          .filter(doc => doc.id !== currentUser?.uid)
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        setSearchResults(searchData);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  // Load more users with simplified indexing
  const loadMoreUsers = async () => {
    if (!lastUserRef.current || !hasMore || isSearching) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('uid', '!=', currentUser.uid),
        orderBy('uid'),
        startAfter(lastUserRef.current),
        limit(USERS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const newUsers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by lastActive in memory
      const sortedUsers = [...users, ...newUsers].sort((a, b) => 
        (b.lastActive?.toMillis() || 0) - (a.lastActive?.toMillis() || 0)
      );

      setUsers(sortedUsers);
      lastUserRef.current = snapshot.docs[snapshot.docs.length - 1];
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Infinite scroll observer
  const lastUserElementRef = useCallback(node => {
    if (loading || isSearching) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreUsers();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [loading, hasMore, isSearching]);

  const displayUsers = searchQuery ? searchResults : users;

  if (!currentUser || (users.length === 0 && !searchQuery)) {
    return null;
  }

  return (
    <div className="px-4 py-3">
      {/* Search Input */}
      <div className="mb-3 relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-light/10 text-white/90 text-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary/50"
        />
        <UilSearch className="w-4 h-4 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>

      <div className="space-y-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-light/10 scrollbar-track-transparent">
        {displayUsers.map((user, index) => (
          <motion.div
            key={user.id}
            ref={!searchQuery && index === displayUsers.length - 1 ? lastUserElementRef : null}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between group hover:bg-light/5 rounded-lg p-2"
          >
            <Link
              to={`/profile/${user.id}`}
              className="flex items-center space-x-3 flex-1 min-w-0"
            >
              <div className="w-8 h-8 rounded-full bg-light/10 flex-shrink-0 overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <DefaultUserIcon className="w-5 h-5 text-white/50" />
                  </div>
                )}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white/90 truncate">
                  {user.displayName || 'Anonymous User'}
                </p>
                {user.lastActivity && (
                  <p className="text-xs text-white/50 truncate">
                    {user.lastActivity.type === 'upload' && 'Uploaded a track'}
                    {user.lastActivity.type === 'like' && 'Liked a track'}
                    {user.lastActivity.type === 'follow' && 'Followed someone'}
                  </p>
                )}
              </div>
            </Link>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <FollowButton 
                targetUserId={user.id}
                className="!px-2 !py-1 !text-xs"
              />
            </div>
          </motion.div>
        ))}
        {(loading || isSearching) && (
          <div className="text-center py-2">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <div className="text-center py-2 text-white/50 text-sm">
            No users found
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarUsers; 
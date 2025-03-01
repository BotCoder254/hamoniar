import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { db } from '../../config/firebase.config';
import { 
  collection, query, limit, orderBy, startAfter, 
  onSnapshot, getDocs, where 
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import DefaultUserIcon from '../icons/DefaultUserIcon';
import FollowButton from '../UserProfile/FollowButton';
import { UilSearch } from '@iconscout/react-unicons';

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

  // Real-time users subscription
  useEffect(() => {
    if (!currentUser) return;

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef,
      orderBy('createdAt', 'desc'),
      limit(USERS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser?.uid);
      
      setUsers(usersData);
      setLoading(false);
      lastUserRef.current = snapshot.docs[snapshot.docs.length - 1];
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Search functionality
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
        const q = query(
          usersRef,
          where('displayNameLower', '>=', searchLower),
          where('displayNameLower', '<=', searchLower + '\uf8ff'),
          limit(10)
        );

        const snapshot = await getDocs(q);
        const searchData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUser?.uid);

        setSearchResults(searchData);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
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

  // Load more users function
  const loadMoreUsers = async () => {
    if (!lastUserRef.current || !hasMore || isSearching) return;

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastUserRef.current),
        limit(USERS_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setHasMore(false);
        return;
      }

      const newUsers = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== currentUser?.uid);

      setUsers(prevUsers => [...prevUsers, ...newUsers]);
      lastUserRef.current = snapshot.docs[snapshot.docs.length - 1];
    } catch (error) {
      console.error('Error loading more users:', error);
    } finally {
      setLoading(false);
    }
  };

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
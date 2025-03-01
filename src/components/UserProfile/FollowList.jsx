import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FollowButton from './FollowButton';
import DefaultUserIcon from '../icons/DefaultUserIcon';

export default function FollowList({ users, type }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-lightest">
        No {type === 'followers' ? 'followers' : 'following'} yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <motion.div
          key={user.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 bg-light/10 rounded-xl backdrop-blur-sm hover:bg-light/20 transition-colors"
        >
          <Link
            to={`/profile/${user.uid}`}
            className="flex items-center space-x-3"
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-dark flex items-center justify-center">
                <DefaultUserIcon className="w-8 h-8 text-white opacity-50" />
              </div>
            )}
            <div>
              <h3 className="font-medium text-white">{user.displayName}</h3>
              {user.bio && (
                <p className="text-sm text-lightest truncate max-w-md">
                  {user.bio}
                </p>
              )}
            </div>
          </Link>
          
          {type === 'followers' && (
            <FollowButton targetUserId={user.uid} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

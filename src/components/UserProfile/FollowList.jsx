import React from 'react';
import { Link } from 'react-router-dom';

export default function FollowList({ users, type }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No {type === 'followers' ? 'followers' : 'following'} yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <Link
            to={`/profile/${user.id}`}
            className="flex items-center space-x-3"
          >
            <img
              src={user.photoURL || '/default-avatar.png'}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-gray-900">{user.displayName}</h3>
              {user.bio && (
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {user.bio}
                </p>
              )}
            </div>
          </Link>
          
          {type === 'followers' && (
            <button className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 border border-purple-600 rounded-full hover:bg-purple-50 transition-colors">
              Follow Back
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

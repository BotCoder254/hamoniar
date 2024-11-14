import React from 'react';
import UserFollowing from '../components/UserFollowing/UserFollowing';
import RecommendedUsers from '../components/UserFollowing/RecommendedUsers';

const Following = () => {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Following</h1>
      <UserFollowing />
    </div>
  );
};

export default Following; 
import React from 'react';

export default function UserStats({ stats }) {
  const statItems = [
    { label: 'Uploads', value: stats?.uploads || 0 },
    { label: 'Followers', value: stats?.followers || 0 },
    { label: 'Following', value: stats?.following || 0 },
    { label: 'Likes', value: stats?.likes || 0 }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg shadow">
      {statItems.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-2xl font-bold text-purple-600">{item.value}</div>
          <div className="text-sm text-gray-600">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

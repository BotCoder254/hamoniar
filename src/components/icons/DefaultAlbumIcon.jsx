import React from 'react';

const DefaultAlbumIcon = ({ className = "w-6 h-6", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="2"
      className="fill-current"
      fillOpacity="0.2"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      className="fill-current"
      fillOpacity="0.3"
    />
    <circle
      cx="12"
      cy="12"
      r="2"
      className="fill-current"
      fillOpacity="0.4"
    />
  </svg>
);

export default DefaultAlbumIcon; 
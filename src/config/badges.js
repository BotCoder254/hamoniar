export const BADGE_TYPES = {
  UPLOADER: 'uploader',
  LISTENER: 'listener',
  SOCIAL: 'social',
  CURATOR: 'curator',
  ACHIEVEMENT: 'achievement'
};

export const BADGES = {
  // Uploader Badges
  TOP_UPLOADER: {
    id: 'top_uploader',
    type: BADGE_TYPES.UPLOADER,
    name: 'Top Uploader',
    description: 'Upload 50 or more tracks',
    icon: '🎵',
    requirement: { uploads: 50 },
    color: 'bg-purple-500'
  },
  MUSIC_PIONEER: {
    id: 'music_pioneer',
    type: BADGE_TYPES.UPLOADER,
    name: 'Music Pioneer',
    description: 'Be among the first 100 users to upload content',
    icon: '🚀',
    requirement: { earlyUploader: true },
    color: 'bg-blue-500'
  },

  // Listener Badges
  MUSIC_ENTHUSIAST: {
    id: 'music_enthusiast',
    type: BADGE_TYPES.LISTENER,
    name: 'Music Enthusiast',
    description: 'Listen to 1000+ minutes of music',
    icon: '🎧',
    requirement: { listenTime: 1000 },
    color: 'bg-green-500'
  },
  GENRE_EXPLORER: {
    id: 'genre_explorer',
    type: BADGE_TYPES.LISTENER,
    name: 'Genre Explorer',
    description: 'Listen to tracks from 10 different genres',
    icon: '🌎',
    requirement: { uniqueGenres: 10 },
    color: 'bg-yellow-500'
  },

  // Social Badges
  TRENDSETTER: {
    id: 'trendsetter',
    type: BADGE_TYPES.SOCIAL,
    name: 'Trendsetter',
    description: 'Have 5 tracks featured in trending',
    icon: '🌟',
    requirement: { trendingTracks: 5 },
    color: 'bg-pink-500'
  },
  COMMUNITY_PILLAR: {
    id: 'community_pillar',
    type: BADGE_TYPES.SOCIAL,
    name: 'Community Pillar',
    description: 'Reach 1000 followers',
    icon: '👥',
    requirement: { followers: 1000 },
    color: 'bg-indigo-500'
  },

  // Curator Badges
  PLAYLIST_MASTER: {
    id: 'playlist_master',
    type: BADGE_TYPES.CURATOR,
    name: 'Playlist Master',
    description: 'Create 10 playlists with 100+ followers each',
    icon: '📝',
    requirement: { popularPlaylists: 10 },
    color: 'bg-red-500'
  },
  TASTE_MAKER: {
    id: 'taste_maker',
    type: BADGE_TYPES.CURATOR,
    name: 'Taste Maker',
    description: 'Have your playlists followed by 5000+ users',
    icon: '🎯',
    requirement: { playlistFollowers: 5000 },
    color: 'bg-orange-500'
  },

  // Achievement Badges
  EARLY_ADOPTER: {
    id: 'early_adopter',
    type: BADGE_TYPES.ACHIEVEMENT,
    name: 'Early Adopter',
    description: 'Join during the beta phase',
    icon: '🏆',
    requirement: { betaUser: true },
    color: 'bg-teal-500'
  },
  VERIFIED_ARTIST: {
    id: 'verified_artist',
    type: BADGE_TYPES.ACHIEVEMENT,
    name: 'Verified Artist',
    description: 'Become a verified artist on Hamoniar',
    icon: '✓',
    requirement: { verified: true },
    color: 'bg-blue-600'
  }
};

export const getBadgeProgress = (badge, userStats) => {
  const { requirement } = badge;
  const progress = {
    current: 0,
    required: 0,
    percentage: 0
  };

  // Calculate progress based on requirement type
  if (requirement.uploads) {
    progress.current = userStats.totalUploads || 0;
    progress.required = requirement.uploads;
  } else if (requirement.listenTime) {
    progress.current = userStats.totalListenMinutes || 0;
    progress.required = requirement.listenTime;
  } else if (requirement.uniqueGenres) {
    progress.current = userStats.uniqueGenresListened?.length || 0;
    progress.required = requirement.uniqueGenres;
  } else if (requirement.trendingTracks) {
    progress.current = userStats.trendingTracksCount || 0;
    progress.required = requirement.trendingTracks;
  } else if (requirement.followers) {
    progress.current = userStats.followersCount || 0;
    progress.required = requirement.followers;
  } else if (requirement.popularPlaylists) {
    progress.current = userStats.popularPlaylistsCount || 0;
    progress.required = requirement.popularPlaylists;
  } else if (requirement.playlistFollowers) {
    progress.current = userStats.totalPlaylistFollowers || 0;
    progress.required = requirement.playlistFollowers;
  }

  // Calculate percentage
  progress.percentage = Math.min(
    100,
    Math.round((progress.current / progress.required) * 100) || 0
  );

  return progress;
};

export const checkBadgeEligibility = (badge, userStats) => {
  const { requirement } = badge;

  // Check boolean requirements
  if (requirement.earlyUploader) return userStats.isEarlyUploader || false;
  if (requirement.betaUser) return userStats.isBetaUser || false;
  if (requirement.verified) return userStats.isVerified || false;

  // Check numeric requirements
  const progress = getBadgeProgress(badge, userStats);
  return progress.percentage >= 100;
};

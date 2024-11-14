import { useState, useEffect } from 'react';
import { db } from '../config/firebase.config';
import { 
  collection, query, where, getDocs, 
  doc, getDoc, orderBy, limit 
} from 'firebase/firestore';

export const useUserStats = (userId) => {
  const [stats, setStats] = useState({
    totalListeningHours: 0,
    activeStreak: 0,
    songsAdded: 0,
    newFollowers: 0,
    engagementRate: 0,
    playlistReach: 0,
    weeklyListening: [0, 0, 0, 0, 0, 0, 0],
    genreDistribution: {},
    topArtists: [],
    growth: 0,
    totalPlays: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch basic user stats
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userData = userDoc.data();

        // Fetch uploaded tracks
        const uploadsQuery = query(
          collection(db, 'music'),
          where('uploadedBy', '==', userId)
        );
        const uploadedTracks = await getDocs(uploadsQuery);
        const totalUploads = uploadedTracks.size;

        // Calculate total plays
        let totalPlays = 0;
        uploadedTracks.forEach(doc => {
          totalPlays += doc.data().plays || 0;
        });

        // Fetch listening history for weekly stats
        const historyQuery = query(
          collection(db, 'listening_history'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(100)
        );
        const historyDocs = await getDocs(historyQuery);
        
        // Process listening history
        const weeklyData = new Array(7).fill(0);
        let totalHours = 0;
        const genres = {};
        const artists = new Map();

        historyDocs.forEach(doc => {
          const data = doc.data();
          const day = new Date(data.timestamp.toDate()).getDay();
          weeklyData[day] += data.duration || 0;
          totalHours += (data.duration || 0) / 3600;

          // Track genre distribution
          if (data.genre) {
            genres[data.genre] = (genres[data.genre] || 0) + 1;
          }

          // Track artist plays
          if (data.artist) {
            const current = artists.get(data.artist) || 0;
            artists.set(data.artist, current + 1);
          }
        });

        // Calculate top artists
        const topArtists = Array.from(artists.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, plays]) => ({ name, plays }));

        // Calculate engagement rate
        const totalInteractions = (userData.likes?.length || 0) + 
                                (userData.comments?.length || 0) + 
                                totalPlays;
        const engagementRate = totalUploads > 0 ? 
          (totalInteractions / totalUploads).toFixed(2) : 0;

        // Calculate growth (compared to last month)
        const lastMonthStats = userData.monthlyStats?.[
          new Date().getMonth() - 1
        ] || { followers: 0 };
        const growth = userData.stats?.followers > 0 ?
          ((userData.stats.followers - lastMonthStats.followers) / 
           lastMonthStats.followers * 100).toFixed(1) : 0;

        setStats({
          totalListeningHours: Math.round(totalHours),
          activeStreak: userData.activeStreak || 0,
          songsAdded: totalUploads,
          newFollowers: userData.stats?.newFollowers || 0,
          engagementRate,
          playlistReach: userData.stats?.playlistReach || 0,
          weeklyListening: weeklyData,
          genreDistribution: genres,
          topArtists,
          growth: parseFloat(growth),
          totalPlays
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchStats();
    }
  }, [userId]);

  return { stats, loading };
}; 
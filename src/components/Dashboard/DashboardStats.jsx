import React from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  UilClock, UilChartGrowth, UilAnalysis,
  UilHeartRate, UilUsersAlt, UilMusicNote
} from '@iconscout/react-unicons';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ title, value, change, icon: Icon, color }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="bg-light p-6 rounded-xl"
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-lightest text-sm">{title}</p>
        <h3 className="text-3xl font-bold mt-1">{value}</h3>
        <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
        </p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

const ListeningTrendsChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Listening Activity',
        color: '#fff',
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#B3B3B3',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#B3B3B3',
        },
      },
    },
  };

  return (
    <div className="bg-light p-6 rounded-xl">
      <Line options={options} data={data} />
    </div>
  );
};

const GenreDistributionChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#fff',
        },
      },
      title: {
        display: true,
        text: 'Genre Distribution',
        color: '#fff',
      },
    },
  };

  return (
    <div className="bg-light p-6 rounded-xl">
      <Doughnut options={options} data={data} />
    </div>
  );
};

const TopArtistsChart = ({ data }) => {
  const options = {
    indexAxis: 'y',
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Artists',
        color: '#fff',
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#B3B3B3',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#B3B3B3',
        },
      },
    },
  };

  return (
    <div className="bg-light p-6 rounded-xl">
      <Bar options={options} data={data} />
    </div>
  );
};

const DashboardStats = ({ stats }) => {
  const listeningTrendsData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: stats.weeklyListening,
        borderColor: '#1DB954',
        backgroundColor: 'rgba(29, 185, 84, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const genreData = {
    labels: Object.keys(stats.genreDistribution),
    datasets: [
      {
        data: Object.values(stats.genreDistribution),
        backgroundColor: [
          '#1DB954',
          '#1E88E5',
          '#E53935',
          '#FDD835',
          '#8E24AA',
          '#43A047',
        ],
      },
    ],
  };

  const topArtistsData = {
    labels: stats.topArtists.map(artist => artist.name),
    datasets: [
      {
        data: stats.topArtists.map(artist => artist.plays),
        backgroundColor: '#1DB954',
      },
    ],
  };

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Total Listening Time"
          value={`${stats.totalListeningHours}h`}
          change={12}
          icon={UilClock}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Streak"
          value={`${stats.activeStreak} days`}
          change={5}
          icon={UilChartGrowth}
          color="bg-green-500"
        />
        <StatCard
          title="Songs Added"
          value={stats.songsAdded}
          change={-3}
          icon={UilMusicNote}
          color="bg-purple-500"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ListeningTrendsChart data={listeningTrendsData} />
        <GenreDistributionChart data={genreData} />
      </div>

      {/* Top Artists */}
      <div className="grid grid-cols-1 gap-8">
        <TopArtistsChart data={topArtistsData} />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Followers Growth"
          value={`+${stats.newFollowers}`}
          change={8}
          icon={UilUsersAlt}
          color="bg-red-500"
        />
        <StatCard
          title="Engagement Rate"
          value={`${stats.engagementRate}%`}
          change={15}
          icon={UilHeartRate}
          color="bg-yellow-500"
        />
        <StatCard
          title="Playlist Reach"
          value={stats.playlistReach}
          change={20}
          icon={UilAnalysis}
          color="bg-indigo-500"
        />
      </div>
    </div>
  );
};

export default DashboardStats; 
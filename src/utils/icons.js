import * as Icons from '@iconscout/react-unicons';

// Map unavailable icons to available alternatives
export const IconMap = {
  // Player Controls
  Play: Icons.UilPlayCircle,
  Pause: Icons.UilPauseCircle,
  Next: Icons.UilStepForward,
  Previous: Icons.UilStepBackward,
  Shuffle: Icons.UilRandom,
  Repeat: Icons.UilRepeat,
  
  // Navigation
  Menu: Icons.UilApps,
  List: Icons.UilBars,
  Playlist: Icons.UilListUl,
  Users: Icons.UilUsersAlt,
  
  // Actions
  Add: Icons.UilPlus,
  Remove: Icons.UilMinus,
  Edit: Icons.UilEdit,
  Delete: Icons.UilTrashAlt,
  Save: Icons.UilSave,
  Upload: Icons.UilImport,
  
  // Status
  Success: Icons.UilCheckCircle,
  Error: Icons.UilTimesCircle,
  Warning: Icons.UilExclamationCircle,
  Info: Icons.UilInfoCircle,
  Loading: Icons.UilSpinner,
  
  // Common
  Search: Icons.UilSearch,
  Bell: Icons.UilBell,
  Settings: Icons.UilSetting,
  User: Icons.UilUser,
  Heart: Icons.UilHeart,
  Music: Icons.UilMusic,
  Volume: Icons.UilVolume,
  Microphone: Icons.UilMicrophone,
  Chart: Icons.UilChart,
  Clock: Icons.UilClock,
  Calendar: Icons.UilCalendar,
  Email: Icons.UilEnvelope,
  Lock: Icons.UilLock,
  Share: Icons.UilShare,
  Comment: Icons.UilComment,
  More: Icons.UilEllipsisH,
  Back: Icons.UilAngleLeft,
  Forward: Icons.UilAngleRight,
  Logout: Icons.UilSignout
};

// Helper function to get icon component
export const getIcon = (name) => {
  return IconMap[name] || Icons.UilQuestion;
}; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UilSetting, UilVolume, UilMusic, UilKeyboard,
  UilDesktop, UilFileExport, UilImport, UilTimes,
  UilMoon, UilSun, UilBell
} from '@iconscout/react-unicons';
import { APP_CONFIG } from '../config/app.config';
import { useMusic } from '../context/MusicContext';

const SettingsSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const SettingItem = ({ label, children }) => (
  <div className="flex items-center justify-between">
    <span className="text-lightest">{label}</span>
    {children}
  </div>
);

const Settings = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('audio');
  const { state, dispatch } = useMusic();
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    volume: parseFloat(localStorage.getItem('volume')) || 0.7,
    crossfade: parseInt(localStorage.getItem('crossfade')) || 0,
    autoplay: localStorage.getItem('autoplay') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    quality: localStorage.getItem('quality') || 'high',
    visualizer: localStorage.getItem('visualizer') === 'true',
    shortcuts: localStorage.getItem('shortcuts') === 'true',
  });

  const tabs = [
    { id: 'audio', icon: <UilVolume />, label: 'Audio' },
    { id: 'playback', icon: <UilMusic />, label: 'Playback' },
    { id: 'shortcuts', icon: <UilKeyboard />, label: 'Shortcuts' },
    { id: 'appearance', icon: <UilDesktop />, label: 'Appearance' },
    { id: 'import', icon: <UilImport />, label: 'Import/Export' },
  ];

  useEffect(() => {
    // Save settings to localStorage whenever they change
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });

    // Apply settings
    document.documentElement.setAttribute('data-theme', settings.theme);
    dispatch({ type: 'SET_VOLUME', payload: settings.volume });
    dispatch({ type: 'SET_VISUALIZER', payload: settings.visualizer });
  }, [settings, dispatch]);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleClose = (e) => {
    e.stopPropagation();
    onClose();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'audio':
        return (
          <>
            <SettingsSection title="Playback">
              <SettingItem label="Volume">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={settings.volume}
                  onChange={e => handleSettingChange('volume', e.target.value)}
                  className="w-32"
                />
              </SettingItem>
              <SettingItem label="Audio Quality">
                <select
                  value={settings.quality}
                  onChange={e => handleSettingChange('quality', e.target.value)}
                  className="bg-dark rounded-lg p-2"
                >
                  <option value="low">Normal</option>
                  <option value="medium">High</option>
                  <option value="high">Very High</option>
                </select>
              </SettingItem>
            </SettingsSection>

            <SettingsSection title="Crossfade">
              <SettingItem label="Crossfade Duration">
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={settings.crossfade}
                  onChange={e => handleSettingChange('crossfade', e.target.value)}
                  className="w-32"
                />
                <span className="ml-2 text-sm">{settings.crossfade}s</span>
              </SettingItem>
            </SettingsSection>
          </>
        );

      case 'playback':
        return (
          <>
            <SettingsSection title="Playback Settings">
              <SettingItem label="Autoplay">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={e => handleSettingChange('autoplay', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-light peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-primary"></div>
                </label>
              </SettingItem>
              <SettingItem label="Music Visualizer">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.visualizer}
                    onChange={e => handleSettingChange('visualizer', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-light peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-primary"></div>
                </label>
              </SettingItem>
            </SettingsSection>
          </>
        );

      case 'appearance':
        return (
          <>
            <SettingsSection title="Theme">
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('theme', 'dark')}
                  className={`p-4 rounded-lg flex items-center space-x-3
                    ${settings.theme === 'dark' ? 'bg-primary' : 'bg-light'}`}
                >
                  <UilMoon className="w-5 h-5" />
                  <span>Dark</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSettingChange('theme', 'light')}
                  className={`p-4 rounded-lg flex items-center space-x-3
                    ${settings.theme === 'light' ? 'bg-primary' : 'bg-light'}`}
                >
                  <UilSun className="w-5 h-5" />
                  <span>Light</span>
                </motion.button>
              </div>
            </SettingsSection>

            <SettingsSection title="Notifications">
              <SettingItem label="Enable Notifications">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={e => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-light peer-focus:outline-none rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                                peer-checked:bg-primary"></div>
                </label>
              </SettingItem>
            </SettingsSection>
          </>
        );

      case 'shortcuts':
        return (
          <SettingsSection title="Keyboard Shortcuts">
            <SettingItem label="Enable Shortcuts">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shortcuts}
                  onChange={e => handleSettingChange('shortcuts', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-light peer-focus:outline-none rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all 
                              peer-checked:bg-primary"></div>
              </label>
            </SettingItem>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Play/Pause</span>
                <kbd className="px-2 py-1 bg-dark rounded">Space</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span>Next Track</span>
                <kbd className="px-2 py-1 bg-dark rounded">Ctrl + →</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span>Previous Track</span>
                <kbd className="px-2 py-1 bg-dark rounded">Ctrl + ←</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toggle Mute</span>
                <kbd className="px-2 py-1 bg-dark rounded">M</kbd>
              </div>
              <div className="flex justify-between text-sm">
                <span>Toggle Like</span>
                <kbd className="px-2 py-1 bg-dark rounded">L</kbd>
              </div>
            </div>
          </SettingsSection>
        );

      case 'import':
        return (
          <SettingsSection title="Import/Export Settings">
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const data = JSON.stringify(settings);
                  const blob = new Blob([data], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'harmonia-settings.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="w-full p-4 bg-light rounded-lg flex items-center justify-center space-x-2"
              >
                <UilFileExport className="w-5 h-5" />
                <span>Export Settings</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('import-settings').click()}
                className="w-full p-4 bg-light rounded-lg flex items-center justify-center space-x-2"
              >
                <UilImport className="w-5 h-5" />
                <span>Import Settings</span>
              </motion.button>
              <input
                id="import-settings"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const importedSettings = JSON.parse(e.target.result);
                        setSettings(importedSettings);
                      } catch (error) {
                        console.error('Error importing settings:', error);
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </div>
          </SettingsSection>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            className="bg-dark p-6 rounded-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Settings</h2>
                <p className="text-sm text-lightest">
                  {APP_CONFIG.name} v{APP_CONFIG.version}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 hover:bg-light/30 rounded-full"
              >
                <UilTimes className="w-6 h-6" />
              </motion.button>
            </div>

            <div className="flex space-x-6">
              <div className="w-48 space-y-1">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 w-full p-3 rounded-lg
                      ${activeTab === tab.id ? 'bg-light text-primary' : 'text-lightest hover:text-white'}`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="flex-1 bg-light/10 rounded-lg p-6">
                {renderTabContent()}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings; 
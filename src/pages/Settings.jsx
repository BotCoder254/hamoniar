import React from 'react';
import SettingsComponent from '../components/Settings';

const Settings = () => (
  <div className="space-y-8">
    <h1 className="text-3xl font-bold">Settings</h1>
    <SettingsComponent isOpen={true} />
  </div>
);

export default Settings; 
import React, { useState } from 'react';
import SettingsComponent from '../components/Settings';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <SettingsComponent isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default Settings; 
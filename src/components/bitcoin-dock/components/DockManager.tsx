'use client';

import React, { useState, useEffect } from 'react';
import Dock from './Dock';
import MinimalDock from './MinimalDock';

interface DockManagerProps {
  currentApp?: string; // ID of the current app (e.g., 'bitcoin-identity', 'bitcoin-writer')
}

const DockManager: React.FC<DockManagerProps> = ({ currentApp = 'bitcoin-os' }) => {
  const [dockStyle, setDockStyle] = useState<string>('large');

  useEffect(() => {
    // Get initial dock style from localStorage
    const savedStyle = localStorage.getItem('dockStyle') || 'large';
    setDockStyle(savedStyle);

    // Listen for dock style changes
    const handleDockStyleChange = (event: CustomEvent) => {
      setDockStyle(event.detail);
    };

    window.addEventListener('dockStyleChanged', handleDockStyleChange as EventListener);

    return () => {
      window.removeEventListener('dockStyleChanged', handleDockStyleChange as EventListener);
    };
  }, []);

  return (
    <>
      {dockStyle === 'minimal' ? <MinimalDock currentApp={currentApp} /> : <Dock currentApp={currentApp} />}
    </>
  );
};

export default DockManager;
import React, { useState, useEffect } from 'react';
import MinimalDock from './MinimalDock';
import Dock from './Dock';

interface DockManagerProps {
  currentApp?: string;
}

const DockManager: React.FC<DockManagerProps> = ({ currentApp = 'bitcoin-drive' }) => {
  const [dockStyle, setDockStyle] = useState<'minimal' | 'large'>('minimal');

  useEffect(() => {
    // Check localStorage for saved dock style
    const savedDockStyle = localStorage.getItem('dockStyle') as 'minimal' | 'large' | null;
    if (savedDockStyle) {
      setDockStyle(savedDockStyle);
    }

    // Listen for dock style changes
    const handleDockStyleChange = (event: CustomEvent) => {
      setDockStyle(event.detail);
    };

    window.addEventListener('dockStyleChanged', handleDockStyleChange as EventListener);

    return () => {
      window.removeEventListener('dockStyleChanged', handleDockStyleChange as EventListener);
    };
  }, []);

  if (dockStyle === 'large') {
    return <Dock currentApp={currentApp} />;
  }

  return <MinimalDock currentApp={currentApp} />;
};

export default DockManager;
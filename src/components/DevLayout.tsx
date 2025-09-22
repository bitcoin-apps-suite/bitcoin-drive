'use client';

import React, { useState, useEffect } from 'react';
import DevSidebar from './DevSidebar';

interface DevLayoutProps {
  children: React.ReactNode;
}

const DevLayout: React.FC<DevLayoutProps> = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Check if sidebar is collapsed from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devSidebarCollapsed');
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
  };

  return (
    <>
      <DevSidebar onCollapsedChange={handleCollapsedChange} />
      <div className={`app-container ${isCollapsed ? 'with-dev-sidebar-collapsed' : 'with-dev-sidebar'}`}>
        {children}
      </div>
    </>
  );
};

export default DevLayout;
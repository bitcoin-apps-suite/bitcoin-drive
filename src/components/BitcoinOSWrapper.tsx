'use client';

import React from 'react';
import { useBitcoinOS } from '@/lib/utils/useBitcoinOS';
import PocBar from './PocBar';
import DockManager from './DockManager';

interface BitcoinOSWrapperProps {
  children: React.ReactNode;
}

export default function BitcoinOSWrapper({ children }: BitcoinOSWrapperProps) {
  const { isInOS } = useBitcoinOS();

  return (
    <>
      {!isInOS && <PocBar color="#00ff88" />}
      <div style={{ paddingTop: isInOS ? '0px' : '40px', paddingBottom: isInOS ? '0px' : '120px' }}>
        {children}
      </div>
      {!isInOS && <DockManager currentApp="bitcoin-drive" />}
    </>
  );
}
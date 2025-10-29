'use client'

import React from 'react'
import { Shield, Lock, Clock, Zap, Cloud, HardDrive, Database, Calendar } from 'lucide-react'
import { UnifiedFile } from '@/hooks/useDriveFiles'

interface FileStatusIndicatorProps {
  file: UnifiedFile
  className?: string
}

export default function FileStatusIndicator({ file, className = '' }: FileStatusIndicatorProps) {
  const getProviderIcon = () => {
    switch (file.storageProvider) {
      case 'dropblocks':
        return <Shield size={14} style={{ color: '#00ff88' }} />
      case 'google-drive':
        return <Cloud size={14} style={{ color: '#4285f4' }} />
      case 'local':
        return <HardDrive size={14} style={{ color: '#6b7280' }} />
      case 'ipfs':
        return <Database size={14} style={{ color: '#ff6b35' }} />
      default:
        return null
    }
  }

  const getStatusIndicators = () => {
    const indicators = []

    // Storage provider indicator
    indicators.push(
      <div key="provider" className="flex items-center gap-1" title={`Stored on ${file.storageProvider}`}>
        {getProviderIcon()}
      </div>
    )

    // Encryption indicator
    if (file.isEncrypted) {
      indicators.push(
        <div key="encryption" className="flex items-center" title="File is encrypted">
          <Lock size={12} style={{ color: '#fbbf24' }} />
        </div>
      )
    }

    // Blockchain verification for DropBlocks
    if (file.storageProvider === 'dropblocks' && file.blockchainTxId) {
      indicators.push(
        <div key="blockchain" className="flex items-center" title="Verified on blockchain">
          <Zap size={12} style={{ color: '#10b981' }} />
        </div>
      )
    }

    // Expiry warning for DropBlocks
    if (file.expiryDate) {
      const daysUntilExpiry = Math.ceil((file.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      const isExpiringSoon = daysUntilExpiry <= 7
      
      indicators.push(
        <div 
          key="expiry" 
          className="flex items-center" 
          title={`Expires in ${daysUntilExpiry} days`}
        >
          <Calendar 
            size={12} 
            style={{ color: isExpiringSoon ? '#ef4444' : '#6b7280' }} 
          />
          {isExpiringSoon && (
            <span className="text-xs ml-1" style={{ color: '#ef4444' }}>
              {daysUntilExpiry}d
            </span>
          )}
        </div>
      )
    }

    return indicators
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {getStatusIndicators()}
    </div>
  )
}
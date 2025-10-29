'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Settings, BarChart3, Users, Clock, Zap } from 'lucide-react'
import { UnifiedFile } from '@/hooks/useDriveFiles'
import StorageProviderSelector from './StorageProviderSelector'
import FileStatusIndicator from './FileStatusIndicator'
import WalletSync from './WalletSync'
import BulkOperations from './BulkOperations'
import { StorageProvider } from '@/lib/storage/hybrid-storage'
import { getDropBlocksManager } from '@/lib/dropblocks'
import { dropBlocksAdvanced } from '@/lib/dropblocks-advanced'

interface DropBlocksIntegrationProps {
  files: UnifiedFile[]
  selectedFiles: string[]
  onSelectionChange: (selectedFiles: string[]) => void
  onRefresh: () => void
  className?: string
}

interface DropBlocksStats {
  totalFiles: number
  totalSize: number
  encryptedFiles: number
  expiringFiles: number
  blockchainVerified: number
  collaborativeFiles: number
}

export default function DropBlocksIntegration({
  files,
  selectedFiles,
  onSelectionChange,
  onRefresh,
  className = ''
}: DropBlocksIntegrationProps) {
  const [activeView, setActiveView] = useState<'overview' | 'bulk' | 'sync' | 'analytics'>('overview')
  const [storageProviders, setStorageProviders] = useState<StorageProvider[]>(['google-drive', 'dropblocks'])
  const [stats, setStats] = useState<DropBlocksStats>({
    totalFiles: 0,
    totalSize: 0,
    encryptedFiles: 0,
    expiringFiles: 0,
    blockchainVerified: 0,
    collaborativeFiles: 0
  })

  useEffect(() => {
    calculateStats()
  }, [files])

  const calculateStats = () => {
    const dropBlocksFiles = files.filter(file => file.storageProvider === 'dropblocks')
    
    const newStats: DropBlocksStats = {
      totalFiles: dropBlocksFiles.length,
      totalSize: dropBlocksFiles.reduce((acc, file) => acc + parseInt(file.size || '0'), 0),
      encryptedFiles: dropBlocksFiles.filter(file => file.isEncrypted).length,
      expiringFiles: dropBlocksFiles.filter(file => {
        if (!file.expiryDate) return false
        const daysUntilExpiry = Math.ceil((file.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return daysUntilExpiry <= 7
      }).length,
      blockchainVerified: dropBlocksFiles.filter(file => file.blockchainTxId).length,
      collaborativeFiles: dropBlocksFiles.filter(file => {
        if (!file.dropBlocksData) return false
        const access = dropBlocksAdvanced.getCollaborativeAccess(file.dropBlocksData.id)
        return access && access.collaborators.length > 0
      }).length
    }

    setStats(newStats)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Shield },
    { key: 'bulk', label: 'Bulk Operations', icon: Settings },
    { key: 'sync', label: 'Wallet Sync', icon: Zap },
    { key: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Storage Provider Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={24} style={{ color: '#00ff88' }} />
          <h2 className="text-xl font-light" style={{ color: '#ffffff' }}>
            DropBlocks Integration
          </h2>
        </div>
        
        <StorageProviderSelector
          selectedProviders={storageProviders}
          onProvidersChange={setStorageProviders}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = activeView === item.key
          
          return (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                isActive 
                  ? 'bg-white/10 border border-white/20' 
                  : 'hover:bg-white/5'
              }`}
            >
              <Icon 
                size={16} 
                style={{ 
                  color: isActive ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' 
                }} 
              />
              <span style={{ 
                color: isActive ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' 
              }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} style={{ color: '#00ff88' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Files</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {stats.totalFiles}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={16} style={{ color: '#4285f4' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Size</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {formatBytes(stats.totalSize)}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} style={{ color: '#fbbf24' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Encrypted</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {stats.encryptedFiles}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} style={{ color: '#ef4444' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Expiring</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {stats.expiringFiles}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} style={{ color: '#10b981' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Verified</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {stats.blockchainVerified}
              </div>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} style={{ color: '#8b5cf6' }} />
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Shared</span>
              </div>
              <div className="text-2xl font-bold" style={{ color: '#ffffff' }}>
                {stats.collaborativeFiles}
              </div>
            </div>
          </div>

          {/* Recent Files with Status */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h3 className="font-medium mb-4" style={{ color: '#ffffff' }}>
              Recent DropBlocks Files
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {files
                .filter(file => file.storageProvider === 'dropblocks')
                .slice(0, 10)
                .map(file => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                        {file.name}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        {new Date(file.modifiedTime).toLocaleDateString()} • {formatBytes(parseInt(file.size || '0'))}
                      </div>
                    </div>
                    <FileStatusIndicator file={file} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'bulk' && (
        <BulkOperations
          files={files}
          selectedFiles={selectedFiles}
          onSelectionChange={onSelectionChange}
          onRefresh={onRefresh}
        />
      )}

      {activeView === 'sync' && (
        <WalletSync />
      )}

      {activeView === 'analytics' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h3 className="font-medium mb-4" style={{ color: '#ffffff' }}>
            Storage Analytics
          </h3>
          
          {/* Storage Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Storage Provider Distribution
              </h4>
              <div className="space-y-3">
                {['google-drive', 'dropblocks', 'local', 'ipfs'].map(provider => {
                  const providerFiles = files.filter(file => file.storageProvider === provider)
                  const count = providerFiles.length
                  const percentage = files.length > 0 ? (count / files.length) * 100 : 0
                  
                  return (
                    <div key={provider} className="flex items-center justify-between">
                      <span className="text-sm capitalize" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {provider.replace('-', ' ')}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm w-8 text-right" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {count}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                File Security Status
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Encrypted Files
                  </span>
                  <span className="text-sm" style={{ color: '#fbbf24' }}>
                    {files.filter(file => file.isEncrypted).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Blockchain Verified
                  </span>
                  <span className="text-sm" style={{ color: '#10b981' }}>
                    {files.filter(file => file.blockchainTxId).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Collaborative
                  </span>
                  <span className="text-sm" style={{ color: '#8b5cf6' }}>
                    {stats.collaborativeFiles}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
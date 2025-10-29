'use client'

import React, { useState, useEffect } from 'react'
import { Wallet, Sync, Key, Users, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { getDropBlocksManager } from '@/lib/dropblocks'

interface WalletSyncProps {
  className?: string
}

interface SyncStatus {
  isConnected: boolean
  walletAddress?: string
  syncedFiles: number
  lastSyncTime?: Date
  isSharedWallet: boolean
  collaborators: string[]
  syncInProgress: boolean
}

export default function WalletSync({ className = '' }: WalletSyncProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isConnected: false,
    syncedFiles: 0,
    isSharedWallet: false,
    collaborators: [],
    syncInProgress: false
  })
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Load wallet sync status
    loadSyncStatus()
  }, [])

  const loadSyncStatus = async () => {
    try {
      // Check for existing wallet connection
      const walletAddress = localStorage.getItem('dropblocks-wallet-address')
      const lastSync = localStorage.getItem('dropblocks-last-sync')
      const collaborators = JSON.parse(localStorage.getItem('dropblocks-collaborators') || '[]')
      
      const dropBlocksManager = getDropBlocksManager()
      const files = dropBlocksManager.listFiles()
      
      setSyncStatus({
        isConnected: !!walletAddress,
        walletAddress: walletAddress || undefined,
        syncedFiles: files.length,
        lastSyncTime: lastSync ? new Date(lastSync) : undefined,
        isSharedWallet: collaborators.length > 0,
        collaborators,
        syncInProgress: false
      })
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const connectWallet = async () => {
    setSyncStatus(prev => ({ ...prev, syncInProgress: true }))
    
    try {
      // Mock wallet connection - in production, integrate with actual BSV wallet
      const mockAddress = '1' + Array.from(crypto.getRandomValues(new Uint8Array(20)))
        .map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 33)
      
      localStorage.setItem('dropblocks-wallet-address', mockAddress)
      localStorage.setItem('dropblocks-last-sync', new Date().toISOString())
      
      await syncFilesFromBlockchain(mockAddress)
      
      setSyncStatus(prev => ({
        ...prev,
        isConnected: true,
        walletAddress: mockAddress,
        lastSyncTime: new Date(),
        syncInProgress: false
      }))
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }))
    }
  }

  const syncFilesFromBlockchain = async (walletAddress: string) => {
    // Mock blockchain file discovery
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // In production, query blockchain for files associated with wallet address
    // and sync them to local DropBlocks catalog
  }

  const addCollaborator = async (collaboratorAddress: string) => {
    const newCollaborators = [...syncStatus.collaborators, collaboratorAddress]
    localStorage.setItem('dropblocks-collaborators', JSON.stringify(newCollaborators))
    
    setSyncStatus(prev => ({
      ...prev,
      collaborators: newCollaborators,
      isSharedWallet: true
    }))
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 6)}`
  }

  const getStatusIcon = () => {
    if (syncStatus.syncInProgress) {
      return <Sync size={16} className="animate-spin" style={{ color: '#fbbf24' }} />
    }
    if (syncStatus.isConnected) {
      return <CheckCircle size={16} style={{ color: '#10b981' }} />
    }
    return <AlertCircle size={16} style={{ color: '#6b7280' }} />
  }

  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Wallet size={20} style={{ color: '#00ff88' }} />
          <div>
            <h3 className="font-medium" style={{ color: '#ffffff' }}>
              Blockchain Sync
            </h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {syncStatus.isConnected 
                ? `${syncStatus.syncedFiles} files synced` 
                : 'Connect wallet to sync files across devices'
              }
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Key size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          {!syncStatus.isConnected ? (
            <div className="space-y-3">
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Connect your BSV wallet to automatically sync DropBlocks files across all your devices.
              </p>
              <button
                onClick={connectWallet}
                disabled={syncStatus.syncInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white transition-colors"
              >
                {syncStatus.syncInProgress ? (
                  <>
                    <Sync size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet size={16} />
                    Connect BSV Wallet
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Wallet Address:
                </span>
                <span className="text-sm font-mono" style={{ color: '#00ff88' }}>
                  {formatAddress(syncStatus.walletAddress!)}
                </span>
              </div>
              
              {syncStatus.lastSyncTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Last Sync:
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    {syncStatus.lastSyncTime.toLocaleString()}
                  </span>
                </div>
              )}
              
              {syncStatus.isSharedWallet && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} style={{ color: '#4285f4' }} />
                    <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      Collaborators ({syncStatus.collaborators.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {syncStatus.collaborators.map((collaborator, index) => (
                      <div 
                        key={index}
                        className="text-xs font-mono px-2 py-1 bg-white/5 rounded"
                        style={{ color: 'rgba(255, 255, 255, 0.6)' }}
                      >
                        {formatAddress(collaborator)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => syncFilesFromBlockchain(syncStatus.walletAddress!)}
                disabled={syncStatus.syncInProgress}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white transition-colors"
              >
                <Sync size={16} />
                Sync Now
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
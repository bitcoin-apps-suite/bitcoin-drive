'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'
import { 
  Grid, 
  FileText, 
  Clock, 
  Hexagon, 
  Share2, 
  HardDrive, 
  Upload,
  Cloud,
  Package,
  Hash,
  Activity,
  Plus
} from 'lucide-react'

interface DriveSidebarProps {
  currentView: 'drive' | 'exchange'
  activeCategory?: string
  setActiveCategory?: (category: string) => void
  setShowUploadModal?: (show: boolean) => void
  setShowStorageConnector?: (show: boolean) => void
  setShowAuthModal?: (show: boolean) => void
  connectedStorageProviders?: Array<{ type: string; name: string; [key: string]: unknown }>
  storageUsed?: number
  // Exchange-specific props
  filterType?: 'all' | 'tokenized' | 'non-tokenized'
  setFilterType?: (type: 'all' | 'tokenized' | 'non-tokenized') => void
  sortBy?: string
  setSortBy?: (sort: 'revenue' | 'views' | 'recent' | 'shares') => void
  totalRevenue?: number
  totalFiles?: number
  tokenizedCount?: number
  totalHolders?: number
  width?: number
  isResizing?: boolean
  onMouseDown?: (e: React.MouseEvent) => void
}

export default function DriveSidebar({
  currentView,
  activeCategory,
  setActiveCategory,
  setShowUploadModal,
  setShowStorageConnector,
  setShowAuthModal,
  connectedStorageProviders = [],
  storageUsed = 0,
  filterType,
  setFilterType,
  sortBy,
  setSortBy,
  totalRevenue = 0,
  totalFiles = 0,
  tokenizedCount = 0,
  totalHolders = 0,
  width,
  isResizing,
  onMouseDown
}: DriveSidebarProps) {
  const { data: session } = useSession()
  const [handcashConnected, setHandcashConnected] = useState(false)
  const [handcashProfile, setHandcashProfile] = useState<{handle?: string; displayName?: string} | null>(null)

  useEffect(() => {
    if (session?.user) {
      checkHandCashConnection()
    }
  }, [session])

  const checkHandCashConnection = async () => {
    try {
      const response = await fetch('/api/handcash/profile')
      if (response.ok) {
        const data = await response.json()
        setHandcashConnected(true)
        setHandcashProfile(data)
      }
    } catch (error) {
      console.error('Error checking HandCash connection:', error)
    }
  }

  const connectHandCash = async () => {
    try {
      const response = await fetch('/api/handcash/connect')
      const data = await response.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch (error) {
      console.error('Error connecting HandCash:', error)
    }
  }

  const sidebarStyle = {
    backgroundColor: 'var(--bg-secondary)', 
    borderRight: '1px solid var(--color-border)', 
    overflow: 'auto' as const,
    position: 'relative' as const,
    ...(width && { 
      width: `${width}px`,
      transition: isResizing ? 'none' : 'width 0.2s ease'
    })
  }

  return (
    <div 
      className={width ? '' : 'w-64 border-r'}
      style={sidebarStyle}
    >
      <div className="p-4">
        <div className="space-y-4">
          {/* User Profile */}
          <div className="card p-3">
            {session ? (
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full border-2"
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                    {session.user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {session.user?.email}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal?.(true)}
                className="w-full text-left text-sm font-light transition-all"
                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
              >
                Connect Account
              </button>
            )}
          </div>

          {/* HandCash Status - Only show when logged in and in drive view */}
          {session && currentView === 'drive' && (
            <div className="card p-3">
              {handcashConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>HandCash</span>
                    <span className="text-xs" style={{ color: 'var(--color-primary)' }}>Connected</span>
                  </div>
                  {handcashProfile && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      @{handcashProfile.handle}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectHandCash}
                  className="w-full text-left text-sm font-light transition-all"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Connect HandCash Wallet
                </button>
              )}
            </div>
          )}

          {/* Exchange Stats - Only show in exchange view */}
          {currentView === 'exchange' && (
            <div className="card p-3">
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-accent)' }}>Exchange Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Files</span>
                  <span className="text-xs font-medium" style={{ color: '#ffffff' }}>{totalFiles}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Tokenized</span>
                  <span className="text-xs font-medium" style={{ color: '#00ff88' }}>{tokenizedCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Revenue</span>
                  <span className="text-xs font-medium" style={{ color: '#00ff88' }}>₿ {totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Holders</span>
                  <span className="text-xs font-medium" style={{ color: '#fbbf24' }}>{totalHolders}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {currentView === 'drive' ? (
            <>
              <button 
                onClick={() => setShowUploadModal?.(true)}
                className="btn-primary w-full mb-2 px-4 py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2">
                <Upload size={18} />
                Upload to Blockchain
              </button>
              
              <button 
                onClick={() => setShowStorageConnector?.(true)}
                className="w-full mb-2 px-4 py-2 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)'
                }}>
                <Cloud size={16} />
                Connect Cloud Storage
              </button>
              
              {connectedStorageProviders.length > 0 && (
                <div className="text-xs mb-4" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {connectedStorageProviders.length} provider{connectedStorageProviders.length > 1 ? 's' : ''} connected
                </div>
              )}
            </>
          ) : (
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full mb-2 px-4 py-2 font-medium rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
              <Plus size={16} />
              Upload New File
            </button>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {currentView === 'drive' ? (
              <>
                <button 
                  onClick={() => setActiveCategory?.('all')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: activeCategory === 'all' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: activeCategory === 'all' ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeCategory === 'all' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Grid size={16} />
                  All Files
                </button>
                <button 
                  onClick={() => setActiveCategory?.('documents')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: activeCategory === 'documents' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: activeCategory === 'documents' ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeCategory === 'documents' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <FileText size={16} />
                  Documents
                </button>
                <button 
                  onClick={() => setActiveCategory?.('recent')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: activeCategory === 'recent' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: activeCategory === 'recent' ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeCategory === 'recent' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Clock size={16} />
                  Recent
                </button>
                <button 
                  onClick={() => setActiveCategory?.('nfts')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: activeCategory === 'nfts' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: activeCategory === 'nfts' ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeCategory === 'nfts' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Hexagon size={16} />
                  NFTs
                </button>
                <button 
                  onClick={() => setActiveCategory?.('shared')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: activeCategory === 'shared' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: activeCategory === 'shared' ? '2px solid #00ff88' : '2px solid transparent',
                    color: activeCategory === 'shared' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Share2 size={16} />
                  Shared
                </button>
                {/* Exchange Navigation */}
                <button 
                  onClick={() => window.location.href = '/exchange'}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: 'transparent',
                    borderLeft: '2px solid transparent',
                    color: 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Package size={16} />
                  Drive Exchange
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setFilterType?.('all')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: filterType === 'all' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: filterType === 'all' ? '2px solid #00ff88' : '2px solid transparent',
                    color: filterType === 'all' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Package size={16} />
                  All Listings
                </button>
                <button 
                  onClick={() => setFilterType?.('tokenized')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: filterType === 'tokenized' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: filterType === 'tokenized' ? '2px solid #00ff88' : '2px solid transparent',
                    color: filterType === 'tokenized' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <Hash size={16} />
                  Tokenized Files
                </button>
                <button 
                  onClick={() => setFilterType?.('non-tokenized')}
                  className="w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2"
                  style={{ 
                    backgroundColor: filterType === 'non-tokenized' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                    borderLeft: filterType === 'non-tokenized' ? '2px solid #00ff88' : '2px solid transparent',
                    color: filterType === 'non-tokenized' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                  }}>
                  <FileText size={16} />
                  Non-Tokenized
                </button>
              </>
            )}
          </nav>

          {/* Sort Options - Only in exchange view */}
          {currentView === 'exchange' && sortBy && setSortBy && (
            <div className="card p-3">
              <h3 className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>Sort By</h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy?.(e.target.value as 'revenue' | 'views' | 'recent' | 'shares')}
                className="w-full px-2 py-1 text-xs rounded"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ffffff',
                  outline: 'none'
                }}
              >
                <option value="revenue">Highest Revenue</option>
                <option value="views">Most Views</option>
                <option value="recent">Most Recent</option>
                <option value="shares">Trading Volume</option>
              </select>
            </div>
          )}

          {/* Storage Indicator / Revenue Summary */}
          <div className="card p-3">
            {currentView === 'drive' ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive size={16} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>Storage Used</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {storageUsed} MB of ∞
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: '0%',
                      backgroundColor: 'var(--color-primary)'
                    }}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={16} style={{ color: 'var(--color-accent)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>Revenue Stream</span>
                </div>
                <div className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
                  <div>Total Files: {totalFiles}</div>
                  <div>Tokenized: {tokenizedCount}</div>
                </div>
                <div className="mt-2 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
                  <div 
                    className="h-full transition-all"
                    style={{ 
                      width: `${Math.min((tokenizedCount / Math.max(totalFiles, 1)) * 100, 100)}%`,
                      backgroundColor: 'var(--color-primary)'
                    }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Navigation to other view */}
          {currentView === 'drive' ? (
            <button
              onClick={() => window.location.href = '/exchange'}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md"
            >
              → Go to Exchange
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/'}
              className="w-full text-left px-3 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-md"
            >
              ← Back to Drive
            </button>
          )}

          {/* Sign Out - Only show when logged in */}
          {session && (
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Resize Handle - Show in both views when onMouseDown is provided */}
      {onMouseDown && (
        <div
          onMouseDown={onMouseDown}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '4px',
            height: '100%',
            backgroundColor: isResizing ? 'rgba(0, 255, 136, 0.5)' : 'transparent',
            cursor: 'ew-resize',
            transition: 'background-color 0.2s ease',
            zIndex: 1000
          }}
          onMouseEnter={(e) => {
            if (!isResizing) {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isResizing) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '40px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '1px'
          }} />
        </div>
      )}
    </div>
  )
}
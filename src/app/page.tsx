'use client'

import { useSession, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Taskbar from "@/components/Taskbar"
import BlockchainUploadModal, { UploadOptions } from "@/components/BlockchainUploadModal"
import AuthModal from "@/components/AuthModal"
import { Search, Upload, FileText, Clock, Hexagon, Share2, HardDrive, Grid, List } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const [handcashConnected, setHandcashConnected] = useState(false)
  const [handcashProfile, setHandcashProfile] = useState<{handle?: string; displayName?: string} | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [storageUsed] = useState(0) // MB

  useEffect(() => {
    // Check HandCash connection status
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

  const handleFileUpload = async (file: File, options: UploadOptions) => {
    console.log('Uploading file:', file.name, options)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        // TODO: Refresh file list
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-2xl" style={{ color: 'var(--color-accent)' }}>Loading...</div>
      </div>
    )
  }


  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* macOS-style Taskbar */}
      <Taskbar />
      
      {/* App Toolbar */}
      <div className="toolbar" style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'var(--bg-secondary)',  // Pure black for header
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: '96px',
        position: 'relative'
      }}>
        {/* Left section - View Mode Toggle */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{ 
                padding: '8px 12px',
                backgroundColor: viewMode === 'grid' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                color: viewMode === 'grid' ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                borderRight: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{ 
                padding: '8px 12px',
                backgroundColor: viewMode === 'list' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                color: viewMode === 'list' ? '#00ff88' : 'rgba(255, 255, 255, 0.5)',
                border: 'none'
              }}>
              <List size={18} />
            </button>
          </div>
        </div>
        
        {/* Center section - Bitcoin Drive Title */}
        <div style={{ 
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Image
            src="/bitcoindrive-icon.jpg"
            alt="Bitcoin Drive"
            width={40}
            height={40}
            style={{ borderRadius: '8px' }}
          />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '300', 
            letterSpacing: '-0.03em',
            margin: 0
          }}>
            <span style={{ color: '#00ff88' }}>Bitcoin</span>
            <span style={{ color: '#ffffff' }}> Drive</span>
          </h1>
        </div>

        {/* Right section - Actions */}
        <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <button 
            id="upload-btn"
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
            <Upload size={14} style={{ marginRight: '3px' }} />
            Upload to Chain
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={24}
                  height={24}
                  className="rounded-full"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.12)' }}
                />
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)', overflow: 'auto' }}>
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
                  onClick={() => setShowAuthModal(true)}
                  className="w-full text-left text-sm font-light transition-all"
                  style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                >
                  Connect Accounts
                </button>
              )}
            </div>

            {/* HandCash Status - Only show when logged in */}
            {session && (
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

            {/* Upload Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="btn-primary w-full mb-4 px-4 py-3 font-medium rounded-lg transition-all flex items-center justify-center gap-2">
              <Upload size={18} />
              Upload to Blockchain
            </button>

            {/* Navigation Categories */}
            <nav className="space-y-1 mb-4">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2`}
                style={{ 
                  backgroundColor: activeCategory === 'all' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  borderLeft: activeCategory === 'all' ? '2px solid #00ff88' : '2px solid transparent',
                  color: activeCategory === 'all' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                }}>
                <Grid size={16} />
                All Files
              </button>
              <button 
                onClick={() => setActiveCategory('documents')}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2`}
                style={{ 
                  backgroundColor: activeCategory === 'documents' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  borderLeft: activeCategory === 'documents' ? '2px solid #00ff88' : '2px solid transparent',
                  color: activeCategory === 'documents' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                }}>
                <FileText size={16} />
                Documents
              </button>
              <button 
                onClick={() => setActiveCategory('recent')}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2`}
                style={{ 
                  backgroundColor: activeCategory === 'recent' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  borderLeft: activeCategory === 'recent' ? '2px solid #00ff88' : '2px solid transparent',
                  color: activeCategory === 'recent' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                }}>
                <Clock size={16} />
                Recent
              </button>
              <button 
                onClick={() => setActiveCategory('nfts')}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2`}
                style={{ 
                  backgroundColor: activeCategory === 'nfts' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  borderLeft: activeCategory === 'nfts' ? '2px solid #00ff88' : '2px solid transparent',
                  color: activeCategory === 'nfts' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                }}>
                <Hexagon size={16} />
                NFTs
              </button>
              <button 
                onClick={() => setActiveCategory('shared')}
                className={`w-full text-left px-3 py-2 text-sm font-light rounded-md transition-all flex items-center gap-2`}
                style={{ 
                  backgroundColor: activeCategory === 'shared' ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  borderLeft: activeCategory === 'shared' ? '2px solid #00ff88' : '2px solid transparent',
                  color: activeCategory === 'shared' ? '#00ff88' : 'rgba(255, 255, 255, 0.7)' 
                }}>
                <Share2 size={16} />
                Shared
              </button>
            </nav>

            {/* Storage Indicator */}
            <div className="card p-3 mb-4">
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
            </div>

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
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Content */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {/* Category Header with Search */}
          <div className="px-6 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-semibold capitalize" style={{ color: 'var(--color-accent)' }}>
              {activeCategory === 'all' && 'All Files'}
              {activeCategory === 'documents' && 'Documents'}
              {activeCategory === 'recent' && 'Recent Files'}
              {activeCategory === 'nfts' && 'NFT Collection'}
              {activeCategory === 'shared' && 'Shared with Me'}
            </h2>
            
            {/* Search Bar */}
            <div style={{ width: '300px' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ 
                    width: '100%',
                    paddingLeft: '32px',
                    paddingRight: '12px',
                    paddingTop: '6px',
                    paddingBottom: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '13px',
                    outline: 'none',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Files Grid/List */}
          <div className="flex-1 p-6">
            {/* Perforation Edge Drop Box */}
            <div 
              className="rounded-lg text-center relative"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backgroundImage: `radial-gradient(circle at 15px 15px, transparent 2px, rgba(0, 255, 136, 0.08) 2px, rgba(0, 255, 136, 0.08) 3px, transparent 3px)`,
                backgroundSize: '30px 30px',
                border: '2px dashed rgba(0, 255, 136, 0.25)',
                padding: '60px 40px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.6)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 255, 136, 0.05)';
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.3)';
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.15)';
                const files = Array.from(e.dataTransfer.files);
                if (files.length > 0) {
                  // Handle file drop
                  console.log('Files dropped:', files);
                  setShowUploadModal(true);
                }
              }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={48} style={{ color: '#00ff88', marginBottom: '20px', opacity: 0.8 }} />
              <h3 className="text-xl font-light mb-3" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                Drop files here to upload
              </h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                or click to browse files
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                fontSize: '12px', 
                color: 'rgba(255, 255, 255, 0.5)',
                alignItems: 'center'
              }}>
                <span style={{ padding: '4px 8px', backgroundColor: 'rgba(0, 255, 136, 0.1)', borderRadius: '4px' }}>
                  OP_RETURN
                </span>
                <span>•</span>
                <span style={{ padding: '4px 8px', backgroundColor: 'rgba(0, 255, 136, 0.1)', borderRadius: '4px' }}>
                  OP_PUSHDATA4
                </span>
                <span>•</span>
                <span style={{ padding: '4px 8px', backgroundColor: 'rgba(0, 255, 136, 0.1)', borderRadius: '4px' }}>
                  Hash + Drive
                </span>
              </div>
            </div>
            
            {/* Show this when there are files */}
            {searchQuery && (
              <div className="mt-6 text-center">
                <p style={{ color: 'var(--color-text-muted)' }}>
                  No files matching &quot;{searchQuery}&quot;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Blockchain Upload Modal */}
      <BlockchainUploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Refresh the page to update session
          window.location.reload()
        }}
      />
    </div>
  )
}
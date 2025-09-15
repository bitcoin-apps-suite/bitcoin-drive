'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Image from "next/image"
import UploadModal, { UploadOptions } from "@/components/UploadModal"
import AuthModal from "@/components/AuthModal"
import { useTheme } from "@/components/ThemeSelector"
import ThemeControls from "@/components/ThemeControls"
import { Search, Upload, FileText, Clock, Hexagon, Share2, HardDrive, Grid, List } from 'lucide-react'

export default function Home() {
  useTheme() // Initialize theme system
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
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-64 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--color-accent)' }}>
            <span className="text-yellow-500">₿</span>
            Bitcoin Drive
          </h1>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {/* User Profile */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
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
                  className="w-full text-left text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Connect Accounts
                </button>
              )}
            </div>

            {/* HandCash Status - Only show when logged in */}
            {session && (
              <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
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
                    className="w-full text-left text-sm transition-opacity hover:opacity-80"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    Connect HandCash Wallet
                  </button>
                )}
              </div>
            )}

            {/* Upload Button */}
            <button 
              onClick={() => setShowUploadModal(true)}
              className="w-full mb-4 px-4 py-3 font-semibold rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
              <Upload size={20} />
              Upload Files
            </button>

            {/* Navigation Categories */}
            <nav className="space-y-1 mb-4">
              <button 
                onClick={() => setActiveCategory('all')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeCategory === 'all' ? '' : 'hover:bg-[var(--color-hover)]'}`}
                style={{ 
                  backgroundColor: activeCategory === 'all' ? 'var(--color-primary)' : 'transparent', 
                  color: activeCategory === 'all' ? 'var(--bg-primary)' : 'var(--color-accent)' 
                }}>
                <Grid size={16} />
                All Files
              </button>
              <button 
                onClick={() => setActiveCategory('documents')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeCategory === 'documents' ? '' : 'hover:bg-[var(--color-hover)]'}`}
                style={{ 
                  backgroundColor: activeCategory === 'documents' ? 'var(--color-primary)' : 'transparent', 
                  color: activeCategory === 'documents' ? 'var(--bg-primary)' : 'var(--color-accent)' 
                }}>
                <FileText size={16} />
                Documents
              </button>
              <button 
                onClick={() => setActiveCategory('recent')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeCategory === 'recent' ? '' : 'hover:bg-[var(--color-hover)]'}`}
                style={{ 
                  backgroundColor: activeCategory === 'recent' ? 'var(--color-primary)' : 'transparent', 
                  color: activeCategory === 'recent' ? 'var(--bg-primary)' : 'var(--color-accent)' 
                }}>
                <Clock size={16} />
                Recent
              </button>
              <button 
                onClick={() => setActiveCategory('nfts')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeCategory === 'nfts' ? '' : 'hover:bg-[var(--color-hover)]'}`}
                style={{ 
                  backgroundColor: activeCategory === 'nfts' ? 'var(--color-primary)' : 'transparent', 
                  color: activeCategory === 'nfts' ? 'var(--bg-primary)' : 'var(--color-accent)' 
                }}>
                <Hexagon size={16} />
                NFTs
              </button>
              <button 
                onClick={() => setActiveCategory('shared')}
                className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${activeCategory === 'shared' ? '' : 'hover:bg-[var(--color-hover)]'}`}
                style={{ 
                  backgroundColor: activeCategory === 'shared' ? 'var(--color-primary)' : 'transparent', 
                  color: activeCategory === 'shared' ? 'var(--bg-primary)' : 'var(--color-accent)' 
                }}>
                <Share2 size={16} />
                Shared
              </button>
            </nav>

            {/* Storage Indicator */}
            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
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
        {/* Header */}
        <div className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="px-6 py-3 flex items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={20} style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--bg-primary)', 
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-accent)'
                  }}
                />
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  className="p-2 transition-colors"
                  style={{ 
                    backgroundColor: viewMode === 'grid' ? 'var(--color-primary)' : 'transparent',
                    color: viewMode === 'grid' ? 'var(--bg-primary)' : 'var(--color-accent)'
                  }}>
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className="p-2 transition-colors"
                  style={{ 
                    backgroundColor: viewMode === 'list' ? 'var(--color-primary)' : 'transparent',
                    color: viewMode === 'list' ? 'var(--bg-primary)' : 'var(--color-accent)'
                  }}>
                  <List size={18} />
                </button>
              </div>

              {/* Theme Controls */}
              <ThemeControls />

              {/* User Menu or Sign In */}
              {!session ? (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 font-medium rounded-lg transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
                  Sign In
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {session.user?.image && (
                    <Image
                      src={session.user.image}
                      alt="Profile"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
          {/* Category Header */}
          <div className="px-6 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h2 className="text-lg font-semibold capitalize" style={{ color: 'var(--color-accent)' }}>
              {activeCategory === 'all' && 'All Files'}
              {activeCategory === 'documents' && 'Documents'}
              {activeCategory === 'recent' && 'Recent Files'}
              {activeCategory === 'nfts' && 'NFT Collection'}
              {activeCategory === 'shared' && 'Shared with Me'}
            </h2>
          </div>

          {/* Files Grid/List */}
          <div className="flex-1 p-6">
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)' }}>
              <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
                {searchQuery ? `No files matching "${searchQuery}"` : 'No files yet'}
              </h3>
              <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                {searchQuery ? 'Try a different search term' : 'Upload your first file to get started'}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 font-semibold rounded-md transition-opacity hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
                  Upload File
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal 
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
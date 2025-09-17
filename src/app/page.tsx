'use client'

import { useSession } from "next-auth/react"
import { useState } from "react"
import Image from "next/image"
import Taskbar from "@/components/Taskbar"
import DriveSidebar from "@/components/DriveSidebar"
import BlockchainUploadModal, { UploadOptions } from "@/components/BlockchainUploadModal"
import AuthModal from "@/components/AuthModal"
import StorageConnector from '@/components/StorageConnector'
import type { StorageProvider } from '@/components/StorageConnector'
import TokenizationModal, { TokenizationSettings } from '@/components/TokenizationModal'
import { Search, Upload, Grid, List, RefreshCw } from 'lucide-react'
import { useDriveFiles } from '@/hooks/useDriveFiles'
import GoogleDriveFileCard from '@/components/GoogleDriveFileCard'
import { GoogleDriveFile } from '@/types/drive'

export default function Home() {
  const { data: session, status } = useSession()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showStorageConnector, setShowStorageConnector] = useState(false)
  const [showTokenizationModal, setShowTokenizationModal] = useState(false)
  const [selectedFileForTokenization, setSelectedFileForTokenization] = useState<File | null>(null)
  const [connectedStorageProviders, setConnectedStorageProviders] = useState<StorageProvider[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [storageUsed] = useState(0) // MB
  const [selectedGoogleDriveFile, setSelectedGoogleDriveFile] = useState<GoogleDriveFile | null>(null)
  
  // Google Drive integration
  const {
    files: driveFiles,
    loading: driveLoading,
    error: driveError,
    hasMore: driveHasMore,
    refresh: refreshDriveFiles,
    loadMore: loadMoreDriveFiles
  } = useDriveFiles({
    autoFetch: session ? true : false
  })


  const handleFileUpload = async (file: File, options: UploadOptions) => {
    console.log('Uploading file:', file.name, options)
    
    // Check if tokenization is requested
    if (options.tokenize) {
      setSelectedFileForTokenization(file)
      setShowTokenizationModal(true)
      setShowUploadModal(false)
      return
    }
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))
    
    // Add cloud storage provider if selected
    if (options.cloudProvider && connectedStorageProviders.length > 0) {
      const provider = connectedStorageProviders.find(p => p.type === options.cloudProvider)
      if (provider) {
        formData.append('cloudProvider', JSON.stringify(provider))
      }
    }
    
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

  const handleStorageConnect = (provider: StorageProvider) => {
    setConnectedStorageProviders([...connectedStorageProviders, provider])
    console.log('Connected storage provider:', provider)
  }

  const handleTokenizationComplete = (tokenSettings: TokenizationSettings) => {
    console.log('Tokenization complete:', tokenSettings)
    // Here we would upload the file with tokenization settings
    if (selectedFileForTokenization) {
      handleFileUpload(selectedFileForTokenization, {
        method: 'hash_drive',
        encrypt: tokenSettings.encrypted,
        tokenize: true,
        currency: 'BSV'
      } as UploadOptions)
    }
    setShowTokenizationModal(false)
    setSelectedFileForTokenization(null)
  }

  const handleGoogleDriveTokenization = (file: GoogleDriveFile) => {
    setSelectedGoogleDriveFile(file)
    setShowTokenizationModal(true)
  }

  const handleGoogleDriveTokenizationComplete = (tokenSettings: TokenizationSettings) => {
    if (selectedGoogleDriveFile) {
      console.log('Tokenizing Google Drive file:', selectedGoogleDriveFile.name, tokenSettings)
      // Here we would create the blockchain container for the Google Drive file
      // The file stays in Google Drive, but we create NFT + FT tokens on BSV
      alert(`Google Drive file "${selectedGoogleDriveFile.name}" would be tokenized with ${tokenSettings.totalSupply} shares at ${tokenSettings.sharePrice} BSV each`)
    }
    setShowTokenizationModal(false)
    setSelectedGoogleDriveFile(null)
  }

  // Filter and search Google Drive files
  const filteredDriveFiles = driveFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || 
                           (activeCategory === 'documents' && file.mimeType.includes('document')) ||
                           (activeCategory === 'nfts' && file.isTokenized)
    return matchesSearch && matchesCategory
  })

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
          {/* Removed Upload to Chain button from here - moved near upload pad */}

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
        <DriveSidebar
          currentView="drive"
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          setShowUploadModal={setShowUploadModal}
          setShowStorageConnector={setShowStorageConnector}
          setShowAuthModal={setShowAuthModal}
          connectedStorageProviders={connectedStorageProviders as unknown as Array<{ type: string; name: string; [key: string]: unknown }>}
          storageUsed={storageUsed}
        />

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
            {/* Google Drive Files Section */}
            {session && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--color-accent)' }}>
                      Google Drive Files
                    </h3>
                    {driveLoading && (
                      <RefreshCw size={16} className="animate-spin" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                    )}
                  </div>
                  <button
                    onClick={refreshDriveFiles}
                    disabled={driveLoading}
                    style={{
                      padding: '6px 12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '12px',
                      cursor: driveLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                </div>

                {driveError && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(255, 68, 68, 0.1)',
                    border: '1px solid rgba(255, 68, 68, 0.3)',
                    borderRadius: '8px',
                    color: '#ff4444',
                    fontSize: '14px',
                    marginBottom: '16px'
                  }}>
                    {driveError}
                  </div>
                )}

                {filteredDriveFiles.length > 0 ? (
                  <>
                    <div style={{
                      display: viewMode === 'grid' ? 'grid' : 'flex',
                      flexDirection: viewMode === 'grid' ? undefined : 'column',
                      gap: '16px',
                      gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(280px, 1fr))' : undefined
                    }}>
                      {filteredDriveFiles.map(file => (
                        <GoogleDriveFileCard
                          key={file.id}
                          file={file}
                          onTokenize={handleGoogleDriveTokenization}
                          viewMode={viewMode}
                        />
                      ))}
                    </div>

                    {driveHasMore && (
                      <div className="text-center mt-6">
                        <button
                          onClick={loadMoreDriveFiles}
                          disabled={driveLoading}
                          style={{
                            padding: '8px 16px',
                            background: 'rgba(0, 255, 136, 0.1)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            borderRadius: '6px',
                            color: '#00ff88',
                            fontSize: '14px',
                            cursor: driveLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {driveLoading ? 'Loading...' : 'Load More Files'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  !driveLoading && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>No Google Drive files found</div>
                      <div style={{ fontSize: '14px' }}>
                        {searchQuery ? 'Try adjusting your search terms' : 'Connect to Google Drive to see your files'}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Upload Area */}
            <div 
              className="rounded-lg text-center relative"
              style={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backgroundImage: `radial-gradient(circle at 15px 15px, transparent 2px, rgba(0, 255, 136, 0.08) 2px, rgba(0, 255, 136, 0.08) 3px, transparent 3px)`,
                backgroundSize: '30px 30px',
                border: '2px dashed rgba(0, 255, 136, 0.25)',
                padding: '60px 40px',
                minHeight: session ? '200px' : '400px',
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
                  console.log('Files dropped:', files);
                  setShowUploadModal(true);
                }
              }}
              onClick={() => setShowUploadModal(true)}
            >
              <Upload size={48} style={{ color: '#00ff88', marginBottom: '20px', opacity: 0.8 }} />
              <h3 className="text-xl font-light mb-3" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                {session ? 'Upload additional files to blockchain' : 'Drop files here to upload'}
              </h3>
              <p className="mb-6" style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                or click to browse files
              </p>
              
              <button 
                id="upload-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUploadModal(true);
                }}
                className="btn-primary flex items-center gap-2 px-6 py-2 rounded-lg font-medium"
                style={{ 
                  backgroundColor: '#00ff88',
                  color: '#000000',
                  marginBottom: '20px'
                }}>
                <Upload size={16} />
                Upload to Chain
              </button>
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
            
            {searchQuery && filteredDriveFiles.length === 0 && !driveLoading && (
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
        connectedProviders={connectedStorageProviders}
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
      
      {/* Storage Connector Modal */}
      <StorageConnector
        isOpen={showStorageConnector}
        onClose={() => setShowStorageConnector(false)}
        onConnect={handleStorageConnect}
      />
      
      {/* Tokenization Modal */}
      {(selectedFileForTokenization || selectedGoogleDriveFile) && (
        <TokenizationModal
          isOpen={showTokenizationModal}
          onClose={() => {
            setShowTokenizationModal(false)
            setSelectedFileForTokenization(null)
            setSelectedGoogleDriveFile(null)
          }}
          fileName={selectedFileForTokenization?.name || selectedGoogleDriveFile?.name || ''}
          fileSize={selectedFileForTokenization?.size || selectedGoogleDriveFile?.size || 0}
          mimeType={selectedFileForTokenization?.type || selectedGoogleDriveFile?.mimeType || ''}
          onTokenize={selectedGoogleDriveFile ? handleGoogleDriveTokenizationComplete : handleTokenizationComplete}
        />
      )}
    </div>
  )
}
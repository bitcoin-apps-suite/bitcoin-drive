'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import DriveSidebar from '@/components/DriveSidebar'
import AuthModal from '@/components/AuthModal'
import TokenizationModal from '@/components/TokenizationModal'
import { 
  Search,
  DollarSign,
  Activity,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  Code,
  Eye,
  Download,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  BarChart3,
  Calendar,
  Filter,
  Zap,
  Package
} from 'lucide-react'

interface DriveFile {
  id: string
  fileName: string
  fileType: string
  fileSize: number
  uploadDate: Date
  container: string // .nft container ID
  tokenSymbol: string // FT token symbol
  totalShares: number
  availableShares: number
  sharePrice: number // Current price per share in BSV
  totalRevenue: number // Total revenue generated
  monthlyRevenue: number
  downloads: number
  views: number
  holders: number
  dividendRate: number // Percentage of revenue distributed
  lastDividend: Date
  nextDividend: Date
  priceChange24h: number
  volumeTraded: number
  isTokenized: boolean
}

export default function DriveExchangePage() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showTokenizationModal, setShowTokenizationModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'tokenized' | 'non-tokenized'>('all')
  const [sortBy, setSortBy] = useState<'revenue' | 'views' | 'recent' | 'shares'>('revenue')
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Mock data for user's uploaded files
  const [userFiles] = useState<DriveFile[]>([
    {
      id: '1',
      fileName: 'Bitcoin_Whitepaper_2025_Annotated.pdf',
      fileType: 'pdf',
      fileSize: 2457600, // 2.4MB
      uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      container: 'BTCWP2025.nft',
      tokenSymbol: 'BTCWP',
      totalShares: 1000000,
      availableShares: 450000,
      sharePrice: 0.00012,
      totalRevenue: 12.5,
      monthlyRevenue: 2.3,
      downloads: 3420,
      views: 15230,
      holders: 127,
      dividendRate: 70, // 70% of revenue distributed
      lastDividend: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      nextDividend: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      priceChange24h: 8.5,
      volumeTraded: 45000,
      isTokenized: true
    },
    {
      id: '2',
      fileName: 'DeFi_Tutorial_Course.mp4',
      fileType: 'video',
      fileSize: 524288000, // 500MB
      uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      container: 'DEFICOURSE.nft',
      tokenSymbol: 'DEFI',
      totalShares: 500000,
      availableShares: 125000,
      sharePrice: 0.00034,
      totalRevenue: 45.2,
      monthlyRevenue: 8.7,
      downloads: 892,
      views: 4520,
      holders: 89,
      dividendRate: 60,
      lastDividend: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      nextDividend: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      priceChange24h: -2.3,
      volumeTraded: 23400,
      isTokenized: true
    },
    {
      id: '3',
      fileName: 'Smart_Contract_Templates.zip',
      fileType: 'archive',
      fileSize: 10485760, // 10MB
      uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      container: 'SMARTTPL.nft',
      tokenSymbol: 'STPL',
      totalShares: 200000,
      availableShares: 180000,
      sharePrice: 0.00089,
      totalRevenue: 5.8,
      monthlyRevenue: 3.2,
      downloads: 234,
      views: 890,
      holders: 12,
      dividendRate: 50,
      lastDividend: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      nextDividend: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      priceChange24h: 15.7,
      volumeTraded: 8900,
      isTokenized: true
    },
    {
      id: '4',
      fileName: 'Crypto_Art_Collection.png',
      fileType: 'image',
      fileSize: 5242880, // 5MB
      uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      container: '',
      tokenSymbol: '',
      totalShares: 0,
      availableShares: 0,
      sharePrice: 0,
      totalRevenue: 0.8,
      monthlyRevenue: 0.8,
      downloads: 45,
      views: 230,
      holders: 0,
      dividendRate: 0,
      lastDividend: new Date(),
      nextDividend: new Date(),
      priceChange24h: 0,
      volumeTraded: 0,
      isTokenized: false
    },
    {
      id: '5',
      fileName: 'Blockchain_Music_Album.mp3',
      fileType: 'audio',
      fileSize: 62914560, // 60MB
      uploadDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      container: '',
      tokenSymbol: '',
      totalShares: 0,
      availableShares: 0,
      sharePrice: 0,
      totalRevenue: 0.2,
      monthlyRevenue: 0.2,
      downloads: 12,
      views: 67,
      holders: 0,
      dividendRate: 0,
      lastDividend: new Date(),
      nextDividend: new Date(),
      priceChange24h: 0,
      volumeTraded: 0,
      isTokenized: false
    }
  ])

  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case 'pdf': return <FileText size={20} />
      case 'video': return <Video size={20} />
      case 'image': return <ImageIcon size={20} />
      case 'audio': return <Music size={20} />
      case 'archive': return <Archive size={20} />
      case 'code': return <Code size={20} />
      default: return <FileText size={20} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
    return (bytes / 1073741824).toFixed(1) + ' GB'
  }

  const filteredFiles = userFiles
    .filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterType === 'all' || 
                           (filterType === 'tokenized' && file.isTokenized) ||
                           (filterType === 'non-tokenized' && !file.isTokenized)
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'revenue': return b.totalRevenue - a.totalRevenue
        case 'views': return b.views - a.views
        case 'recent': return b.uploadDate.getTime() - a.uploadDate.getTime()
        case 'shares': return b.volumeTraded - a.volumeTraded
        default: return 0
      }
    })

  const totalRevenue = userFiles.reduce((sum, file) => sum + file.totalRevenue, 0)
  const totalDownloads = userFiles.reduce((sum, file) => sum + file.downloads, 0)
  const totalViews = userFiles.reduce((sum, file) => sum + file.views, 0)
  const tokenizedCount = userFiles.filter(f => f.isTokenized).length

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = Math.max(280, Math.min(600, e.clientX))
    setSidebarWidth(newWidth)
    localStorage.setItem('exchange-sidebar-width', newWidth.toString())
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('exchange-sidebar-width')
    if (saved) {
      setSidebarWidth(parseInt(saved))
    }
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Taskbar */}
      <Taskbar />
      
      {/* Header */}
      <div className="toolbar" style={{ 
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Mobile Header */}
        <div className="lg:hidden" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={16} color="#000000" />
            </div>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: '300', 
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              <span style={{ color: '#00ff88' }}>Bitcoin</span>
              <span style={{ color: '#ffffff' }}> Exchange</span>
            </h1>
          </div>
          {/* Mobile Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'rgba(0,255,136,0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2px' }}>Revenue</div>
              <div style={{ fontSize: '14px', color: '#00ff88', fontWeight: '500' }}>₿ {totalRevenue.toFixed(2)}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2px' }}>Downloads</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{totalDownloads.toLocaleString()}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2px' }}>Views</div>
              <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{totalViews.toLocaleString()}</div>
            </div>
            <div style={{ padding: '8px', background: 'rgba(251,191,36,0.1)', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '2px' }}>Tokenized</div>
              <div style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '500' }}>{tokenizedCount}/{userFiles.length}</div>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:flex" style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          height: '96px'
        }}>
          {/* Left - Stats */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Total Revenue</div>
              <div style={{ fontSize: '18px', color: '#00ff88', fontWeight: '500' }}>₿ {totalRevenue.toFixed(2)}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Downloads</div>
              <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: '500' }}>{totalDownloads.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Views</div>
              <div style={{ fontSize: '18px', color: '#ffffff', fontWeight: '500' }}>{totalViews.toLocaleString()}</div>
            </div>
          </div>
          
          {/* Center - Title */}
          <div style={{ 
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={20} color="#000000" />
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '300', 
              letterSpacing: '-0.03em',
              margin: 0
            }}>
              <span style={{ color: '#00ff88' }}>Bitcoin</span>
              <span style={{ color: '#ffffff' }}> Drive Exchange</span>
            </h1>
          </div>

          {/* Right - User Balance */}
          <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Tokenized Files</div>
              <div style={{ fontSize: '18px', color: '#fbbf24', fontWeight: '500' }}>{tokenizedCount}/{userFiles.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-0 lg:items-center lg:justify-between p-4 lg:px-6" style={{
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Search */}
        <div className="relative w-full lg:w-auto" style={{ maxWidth: isMounted && window.innerWidth >= 1024 ? `${sidebarWidth}px` : undefined }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <input
            type="text"
            placeholder="Search your files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
            style={{ 
              paddingLeft: '32px',
              paddingRight: '12px',
              paddingTop: '6px',
              paddingBottom: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              outline: 'none'
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 lg:gap-3 items-center">
          <Filter size={14} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              background: filterType === 'all' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
              color: filterType === 'all' ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${filterType === 'all' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All Files
          </button>
          <button
            onClick={() => setFilterType('tokenized')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              background: filterType === 'tokenized' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
              color: filterType === 'tokenized' ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${filterType === 'tokenized' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Tokenized
          </button>
          <button
            onClick={() => setFilterType('non-tokenized')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              background: filterType === 'non-tokenized' ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
              color: filterType === 'non-tokenized' ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${filterType === 'non-tokenized' ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Not Tokenized
          </button>
        </div>

        {/* Sort */}
        <div className="flex gap-2 items-center">
          <span className="hidden lg:inline text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'revenue' | 'views' | 'recent' | 'shares')}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="revenue">Revenue</option>
            <option value="views">Views</option>
            <option value="recent">Recent</option>
            <option value="shares">Trading Volume</option>
          </select>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <DriveSidebar
            currentView="exchange"
            filterType={filterType}
            setFilterType={setFilterType}
            sortBy={sortBy}
            setSortBy={setSortBy}
            totalRevenue={totalRevenue}
            totalFiles={userFiles.length}
            tokenizedCount={tokenizedCount}
            totalHolders={userFiles.reduce((sum, f) => sum + f.holders, 0)}
            width={isMounted ? sidebarWidth : 320}
            isResizing={isResizing}
            onMouseDown={handleMouseDown}
            setShowAuthModal={setShowAuthModal}
          />
        </div>

        {/* File Listings */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div style={{ display: 'grid', gap: '16px' }}>
            {filteredFiles.map(file => (
            <div
              key={file.id}
              className="p-3 lg:p-5"
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                transition: 'all 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.border = '1px solid rgba(0, 255, 136, 0.3)'
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
              }}
            >
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start">
                {/* Left - File Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: file.isTokenized ? '#00ff88' : 'rgba(255, 255, 255, 0.4)'
                    }}>
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm lg:text-base font-medium truncate" style={{ color: '#ffffff' }}>{file.fileName}</div>
                      <div className="text-xs lg:text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        {formatFileSize(file.fileSize)} • {Math.floor((Date.now() - file.uploadDate.getTime()) / (1000 * 60 * 60 * 24))}d ago
                      </div>
                    </div>
                  </div>

                  {/* NFT/FT Info */}
                  {file.isTokenized ? (
                    <div className="grid grid-cols-2 lg:flex gap-3 lg:gap-6 p-3 lg:p-4 mb-3" style={{ 
                      background: 'rgba(0, 255, 136, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 255, 136, 0.1)'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Container</div>
                        <div style={{ fontSize: '13px', color: '#00ff88', fontFamily: 'monospace' }} className="truncate">{file.container}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Token</div>
                        <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>${file.tokenSymbol}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Share Price</div>
                        <div style={{ fontSize: '13px', color: '#ffffff' }}>₿ {file.sharePrice.toFixed(5)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Available</div>
                        <div style={{ fontSize: '13px', color: '#ffffff' }}>{((file.availableShares / file.totalShares) * 100).toFixed(1)}%</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Holders</div>
                        <div style={{ fontSize: '13px', color: '#ffffff' }}>{file.holders}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>24h Change</div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: file.priceChange24h >= 0 ? '#00ff88' : '#ff4444',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}>
                          {file.priceChange24h >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                          {Math.abs(file.priceChange24h)}%
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      marginBottom: '12px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedFile(file)
                          setShowTokenizationModal(true)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          background: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          borderRadius: '6px',
                          color: '#00ff88',
                          fontSize: '13px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'
                        }}
                      >
                        <Zap size={14} />
                        Tokenize This File
                      </button>
                    </div>
                  )}

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:flex gap-3 lg:gap-6">
                    <div>
                      <div className="text-xs flex items-center gap-1 mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        <DollarSign size={10} />
                        <span className="hidden lg:inline">Total</span> Revenue
                      </div>
                      <div className="text-sm lg:text-base font-medium" style={{ color: '#00ff88' }}>₿ {file.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs flex items-center gap-1 mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        <Activity size={10} />
                        <span className="hidden lg:inline">Monthly</span> Rev
                      </div>
                      <div className="text-sm lg:text-base" style={{ color: '#ffffff' }}>₿ {file.monthlyRevenue.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-xs flex items-center gap-1 mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        <Download size={10} />
                        Downloads
                      </div>
                      <div className="text-sm lg:text-base" style={{ color: '#ffffff' }}>{file.downloads.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs flex items-center gap-1 mb-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        <Eye size={10} />
                        Views
                      </div>
                      <div className="text-sm lg:text-base" style={{ color: '#ffffff' }}>{file.views.toLocaleString()}</div>
                    </div>
                    {file.isTokenized && (
                      <>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            <Users size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            Dividend Rate
                          </div>
                          <div style={{ fontSize: '16px', color: '#fbbf24' }}>{file.dividendRate}%</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            <Calendar size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            Next Dividend
                          </div>
                          <div style={{ fontSize: '16px', color: '#ffffff' }}>
                            {Math.floor((file.nextDividend.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right - Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '24px' }}>
                  <button
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                      e.currentTarget.style.color = '#ffffff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                      e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    <BarChart3 size={12} />
                    Analytics
                  </button>
                  {file.isTokenized && (
                    <>
                      <button
                        style={{
                          padding: '8px 16px',
                          background: '#00ff88',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#000000',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        Trade Shares
                      </button>
                      <button
                        style={{
                          padding: '8px 16px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: '6px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                          e.currentTarget.style.color = '#ffffff'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <Settings size={12} />
                        Manage
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredFiles.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px',
              color: 'rgba(255, 255, 255, 0.4)'
            }}>
              <Package size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <div style={{ fontSize: '16px', marginBottom: '8px' }}>No files found</div>
              <div style={{ fontSize: '14px' }}>
                {filterType === 'tokenized' ? 'You haven\'t tokenized any files yet' :
                 filterType === 'non-tokenized' ? 'All your files are tokenized!' :
                 'Upload files to get started'}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          window.location.reload()
        }}
      />

      {/* Tokenization Modal */}
      {selectedFile && !selectedFile.isTokenized && (
        <TokenizationModal
          isOpen={showTokenizationModal}
          onClose={() => {
            setShowTokenizationModal(false)
            setSelectedFile(null)
          }}
          fileName={selectedFile.fileName}
          fileSize={selectedFile.fileSize}
          mimeType={selectedFile.fileType}
          onTokenize={(settings) => {
            console.log('Tokenizing file:', selectedFile.fileName, settings)
            alert(`File "${selectedFile.fileName}" would be tokenized with ${settings.totalSupply} shares at ${settings.sharePrice} BSV each`)
            setShowTokenizationModal(false)
            setSelectedFile(null)
          }}
        />
      )}

      {/* Legal Disclaimer */}
      <div style={{
        padding: '20px',
        margin: '20px',
        background: 'rgba(0, 0, 0, 0.2)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '8px' }}>
          <strong>Trading Disclaimer:</strong> All trading activities and token offerings are provided by The Bitcoin Corporation LTD (Company No. 16735102).
        </p>
        <p style={{ marginBottom: '8px' }}>
          Trading involves risk. Past performance does not guarantee future results. 
          Please conduct your own research before making investment decisions.
        </p>
        <p>
          Licensed under the Open BSV License Version 5 • © 2025 The Bitcoin Corporation LTD • Registered in England and Wales
        </p>
      </div>
    </div>
  )
}
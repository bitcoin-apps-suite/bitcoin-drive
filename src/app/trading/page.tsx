'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import DriveSidebar from '@/components/DriveSidebar'
import AuthModal from '@/components/AuthModal'
import { 
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Eye,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Flame,
  Crown,
  Bolt,
  Target,
  FileText,
  Video,
  Music,
  Image as ImageIcon,
  Code,
  Archive
} from 'lucide-react'

interface CreatorProfile {
  id: string
  name: string
  avatar?: string
  totalFiles: number
  totalRevenue: number
  monthlyRevenue: number
  marketCap: number
  followers: number
  verified: boolean
  category: string
  growth24h: number
  sharePrice: number
  availableShares: number
  totalShares: number
}

interface TradableFile {
  id: string
  fileName: string
  creator: string
  creatorId: string
  fileType: string
  fileSize: number
  marketCap: number
  sharePrice: number
  availableShares: number
  totalShares: number
  dailyVolume: number
  totalRevenue: number
  monthlyRevenue: number
  downloads: number
  views: number
  holders: number
  priceChange24h: number
  category: string
  tags: string[]
  createdAt: string
  trending: boolean
  featured: boolean
}

interface Portfolio {
  totalValue: number
  totalInvested: number
  totalReturns: number
  dailyChange: number
  holdings: Array<{
    fileId: string
    fileName: string
    creator: string
    shares: number
    avgPrice: number
    currentPrice: number
    value: number
    returns: number
    returnsPercent: number
  }>
}

export default function TradingDashboard() {
  const { data: session } = useSession()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'discover' | 'creators' | 'portfolio'>('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<'all' | 'video' | 'audio' | 'document' | 'image' | 'code'>('all')
  const [sortBy, setSortBy] = useState<'trending' | 'volume' | 'returns' | 'marketcap'>('trending')
  
  // Resizable sidebar state
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [isResizing, setIsResizing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Mock data for creator capital markets
  const [creators] = useState<CreatorProfile[]>([
    {
      id: 'creator1',
      name: 'Alex Chen',
      avatar: '/avatars/alex.jpg',
      totalFiles: 47,
      totalRevenue: 342.5,
      monthlyRevenue: 45.2,
      marketCap: 12450.0,
      followers: 2340,
      verified: true,
      category: 'AI Content',
      growth24h: 12.5,
      sharePrice: 0.0234,
      availableShares: 45000,
      totalShares: 100000
    },
    {
      id: 'creator2', 
      name: 'Maya Studios',
      totalFiles: 23,
      totalRevenue: 567.8,
      monthlyRevenue: 78.9,
      marketCap: 23400.0,
      followers: 5670,
      verified: true,
      category: 'Video Content',
      growth24h: 8.7,
      sharePrice: 0.0456,
      availableShares: 12000,
      totalShares: 80000
    },
    {
      id: 'creator3',
      name: 'DataScience Pro',
      totalFiles: 89,
      totalRevenue: 234.1,
      monthlyRevenue: 32.4,
      marketCap: 8900.0,
      followers: 1890,
      verified: false,
      category: 'Data & Analytics',
      growth24h: -2.3,
      sharePrice: 0.0123,
      availableShares: 67000,
      totalShares: 150000
    }
  ])

  const [tradableFiles] = useState<TradableFile[]>([
    {
      id: 'file1',
      fileName: 'AI_Video_Generator_v2.mp4',
      creator: 'Alex Chen',
      creatorId: 'creator1',
      fileType: 'video',
      fileSize: 1200000000, // 1.2GB
      marketCap: 4500.0,
      sharePrice: 0.0045,
      availableShares: 23000,
      totalShares: 100000,
      dailyVolume: 890.0,
      totalRevenue: 145.7,
      monthlyRevenue: 23.4,
      downloads: 1234,
      views: 8765,
      holders: 156,
      priceChange24h: 15.7,
      category: 'AI Tools',
      tags: ['AI', 'Video', 'Generator', 'Tools'],
      createdAt: '2025-01-15',
      trending: true,
      featured: true
    },
    {
      id: 'file2',
      fileName: 'Crypto_Trading_Masterclass.pdf',
      creator: 'Maya Studios', 
      creatorId: 'creator2',
      fileType: 'document',
      fileSize: 15000000, // 15MB
      marketCap: 8900.0,
      sharePrice: 0.0089,
      availableShares: 45000,
      totalShares: 200000,
      dailyVolume: 1234.0,
      totalRevenue: 234.5,
      monthlyRevenue: 45.6,
      downloads: 2345,
      views: 12000,
      holders: 234,
      priceChange24h: 8.3,
      category: 'Education',
      tags: ['Crypto', 'Trading', 'Education', 'Finance'],
      createdAt: '2025-01-10',
      trending: true,
      featured: false
    },
    {
      id: 'file3',
      fileName: 'Machine_Learning_Dataset.zip',
      creator: 'DataScience Pro',
      creatorId: 'creator3', 
      fileType: 'archive',
      fileSize: 500000000, // 500MB
      marketCap: 2340.0,
      sharePrice: 0.0023,
      availableShares: 89000,
      totalShares: 150000,
      dailyVolume: 456.0,
      totalRevenue: 67.8,
      monthlyRevenue: 12.3,
      downloads: 567,
      views: 3400,
      holders: 89,
      priceChange24h: -3.2,
      category: 'Data',
      tags: ['ML', 'Dataset', 'Python', 'Data'],
      createdAt: '2025-01-08',
      trending: false,
      featured: false
    }
  ])

  const [portfolio] = useState<Portfolio>({
    totalValue: 1245.67,
    totalInvested: 1000.00,
    totalReturns: 245.67,
    dailyChange: 3.4,
    holdings: [
      {
        fileId: 'file1',
        fileName: 'AI_Video_Generator_v2.mp4',
        creator: 'Alex Chen',
        shares: 500,
        avgPrice: 0.0040,
        currentPrice: 0.0045,
        value: 22.50,
        returns: 2.50,
        returnsPercent: 12.5
      },
      {
        fileId: 'file2', 
        fileName: 'Crypto_Trading_Masterclass.pdf',
        creator: 'Maya Studios',
        shares: 1000,
        avgPrice: 0.0082,
        currentPrice: 0.0089,
        value: 89.00,
        returns: 7.00,
        returnsPercent: 8.5
      }
    ]
  })

  // Utility functions
  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case 'video': return <Video size={16} />
      case 'audio': return <Music size={16} />
      case 'document': return <FileText size={16} />
      case 'image': return <ImageIcon size={16} />
      case 'code': return <Code size={16} />
      case 'archive': return <Archive size={16} />
      default: return <FileText size={16} />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB'
    return (bytes / 1073741824).toFixed(1) + ' GB'
  }

  const formatCurrency = (value: number) => `₿ ${value.toFixed(2)}`

  // Filter and sort logic
  const filteredFiles = tradableFiles
    .filter(file => {
      const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesCategory = filterCategory === 'all' || file.fileType === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'trending': return (b.trending ? 1 : 0) - (a.trending ? 1 : 0) || b.priceChange24h - a.priceChange24h
        case 'volume': return b.dailyVolume - a.dailyVolume
        case 'returns': return b.priceChange24h - a.priceChange24h
        case 'marketcap': return b.marketCap - a.marketCap
        default: return 0
      }
    })

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    const newWidth = Math.max(280, Math.min(600, e.clientX))
    setSidebarWidth(newWidth)
    localStorage.setItem('trading-sidebar-width', newWidth.toString())
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    setIsMounted(true)
    const saved = localStorage.getItem('trading-sidebar-width')
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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 24px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        height: '96px'
      }}>
        {/* Left - Portfolio Stats */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Portfolio Value</div>
            <div style={{ fontSize: '18px', color: '#00ff88', fontWeight: '500' }}>{formatCurrency(portfolio.totalValue)}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Total Returns</div>
            <div style={{ 
              fontSize: '18px', 
              color: portfolio.totalReturns >= 0 ? '#00ff88' : '#ff4444', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {portfolio.totalReturns >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {formatCurrency(Math.abs(portfolio.totalReturns))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>24h Change</div>
            <div style={{ 
              fontSize: '18px', 
              color: portfolio.dailyChange >= 0 ? '#00ff88' : '#ff4444', 
              fontWeight: '500'
            }}>
              {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange}%
            </div>
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
            <TrendingUp size={20} color="#000000" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '300', 
              letterSpacing: '-0.03em',
              margin: 0,
              marginBottom: '4px'
            }}>
              <span style={{ color: '#00ff88' }}>Trading</span>
              <span style={{ color: '#ffffff' }}> Hub</span>
            </h1>
            <p style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: 0,
              fontWeight: '400',
              letterSpacing: '0.02em'
            }}>
              File Tokenization & Investment Platform
            </p>
          </div>
        </div>

        {/* Right - Market Stats */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Active Traders</div>
            <div style={{ fontSize: '18px', color: '#fbbf24', fontWeight: '500' }}>1,247</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 24px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {[
          { id: 'discover', label: 'Discover', icon: <Flame size={16} /> },
          { id: 'creators', label: 'Creators', icon: <Crown size={16} /> },
          { id: 'portfolio', label: 'Portfolio', icon: <PieChart size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'discover' | 'creators' | 'portfolio')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 24px',
              background: activeTab === tab.id ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #00ff88' : '2px solid transparent',
              color: activeTab === tab.id ? '#00ff88' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <DriveSidebar
          currentView="drive"
          width={isMounted ? sidebarWidth : 320}
          isResizing={isResizing}
          onMouseDown={handleMouseDown}
          setShowAuthModal={setShowAuthModal}
        />

        {/* Content Area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          {/* Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px'
          }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '400px' }}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={14} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              <input
                type="text"
                placeholder="Search files, creators, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  width: '100%',
                  paddingLeft: '32px',
                  paddingRight: '12px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Filter size={16} style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as 'all' | 'video' | 'audio' | 'document' | 'image' | 'code')}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="all">All Types</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
                <option value="image">Images</option>
                <option value="code">Code</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'trending' | 'volume' | 'returns' | 'marketcap')}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="trending">Trending</option>
                <option value="volume">Volume</option>
                <option value="returns">Returns</option>
                <option value="marketcap">Market Cap</option>
              </select>
            </div>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'discover' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    {/* File Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#00ff88'
                        }}>
                          {getFileIcon(file.fileType)}
                        </div>
                        <div>
                          <div style={{ 
                            fontSize: '16px', 
                            color: '#ffffff', 
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {file.fileName}
                            {file.trending && <Flame size={16} style={{ color: '#ff6b35' }} />}
                            {file.featured && <Star size={16} style={{ color: '#fbbf24' }} />}
                          </div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                            by {file.creator} • {formatFileSize(file.fileSize)} • {file.category}
                          </div>
                        </div>
                      </div>

                      {/* Trading Info */}
                      <div style={{ 
                        display: 'flex', 
                        gap: '24px',
                        padding: '12px 16px',
                        background: 'rgba(0, 255, 136, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 255, 136, 0.1)',
                        marginBottom: '12px'
                      }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Market Cap</div>
                          <div style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>{formatCurrency(file.marketCap)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Share Price</div>
                          <div style={{ fontSize: '13px', color: '#00ff88' }}>₿ {file.sharePrice.toFixed(4)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>24h Volume</div>
                          <div style={{ fontSize: '13px', color: '#ffffff' }}>{formatCurrency(file.dailyVolume)}</div>
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
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Holders</div>
                          <div style={{ fontSize: '13px', color: '#ffffff' }}>{file.holders}</div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div style={{ display: 'flex', gap: '32px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            <DollarSign size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            Monthly Revenue
                          </div>
                          <div style={{ fontSize: '16px', color: '#00ff88', fontWeight: '500' }}>{formatCurrency(file.monthlyRevenue)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            <Download size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            Downloads
                          </div>
                          <div style={{ fontSize: '16px', color: '#ffffff' }}>{file.downloads.toLocaleString()}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>
                            <Eye size={10} style={{ display: 'inline', marginRight: '4px' }} />
                            Views
                          </div>
                          <div style={{ fontSize: '16px', color: '#ffffff' }}>{file.views.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '24px' }}>
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
                        Buy Shares
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
                        <BarChart3 size={12} />
                        Analytics
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'creators' && (
            <div style={{ display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))' }}>
              {creators.map(creator => (
                <div
                  key={creator.id}
                  style={{
                    background: 'rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#000000'
                    }}>
                      {creator.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <h3 style={{ fontSize: '18px', color: '#ffffff', fontWeight: '600', margin: 0 }}>
                          {creator.name}
                        </h3>
                        {creator.verified && <Crown size={16} style={{ color: '#fbbf24' }} />}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {creator.category} • {creator.followers.toLocaleString()} followers
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: '16px',
                    marginBottom: '16px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Market Cap</div>
                      <div style={{ fontSize: '16px', color: '#00ff88', fontWeight: '500' }}>{formatCurrency(creator.marketCap)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Monthly Revenue</div>
                      <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>{formatCurrency(creator.monthlyRevenue)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Total Files</div>
                      <div style={{ fontSize: '16px', color: '#ffffff', fontWeight: '500' }}>{creator.totalFiles}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>24h Growth</div>
                      <div style={{ 
                        fontSize: '16px', 
                        color: creator.growth24h >= 0 ? '#00ff88' : '#ff4444',
                        fontWeight: '500'
                      }}>
                        {creator.growth24h >= 0 ? '+' : ''}{creator.growth24h}%
                      </div>
                    </div>
                  </div>

                  <button
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '8px',
                      color: '#00ff88',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Invest in Creator
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div>
              {/* Portfolio Summary */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px'
              }}>
                <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '16px' }}>Portfolio Overview</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Total Value</div>
                    <div style={{ fontSize: '24px', color: '#00ff88', fontWeight: '600' }}>{formatCurrency(portfolio.totalValue)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Total Invested</div>
                    <div style={{ fontSize: '24px', color: '#ffffff', fontWeight: '600' }}>{formatCurrency(portfolio.totalInvested)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Total Returns</div>
                    <div style={{ 
                      fontSize: '24px', 
                      color: portfolio.totalReturns >= 0 ? '#00ff88' : '#ff4444', 
                      fontWeight: '600'
                    }}>
                      {formatCurrency(portfolio.totalReturns)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>24h Change</div>
                    <div style={{ 
                      fontSize: '24px', 
                      color: portfolio.dailyChange >= 0 ? '#00ff88' : '#ff4444', 
                      fontWeight: '600'
                    }}>
                      {portfolio.dailyChange >= 0 ? '+' : ''}{portfolio.dailyChange}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Holdings */}
              <div>
                <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '16px' }}>Your Holdings</h3>
                <div style={{ display: 'grid', gap: '12px' }}>
                  {portfolio.holdings.map(holding => (
                    <div
                      key={holding.fileId}
                      style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                          {holding.fileName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          by {holding.creator} • {holding.shares} shares
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500', marginBottom: '4px' }}>
                          {formatCurrency(holding.value)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          color: holding.returns >= 0 ? '#00ff88' : '#ff4444'
                        }}>
                          {holding.returns >= 0 ? '+' : ''}{formatCurrency(holding.returns)} ({holding.returnsPercent >= 0 ? '+' : ''}{holding.returnsPercent}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
          <strong>Trading Platform Disclaimer:</strong> All trading services and digital asset offerings are provided by The Bitcoin Corporation LTD (Company No. 16735102).
        </p>
        <p style={{ marginBottom: '8px' }}>
          Trading digital assets involves substantial risk of loss and may not be suitable for all investors. 
          Please ensure you understand the risks before trading.
        </p>
        <p>
          Licensed under the Open BSV License Version 5 • © 2025 The Bitcoin Corporation LTD • Registered in England and Wales
        </p>
      </div>
    </div>
  )
}
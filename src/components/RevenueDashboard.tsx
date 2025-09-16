'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Users, PieChart, Activity, Download, Eye, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface FileRevenue {
  fileId: string
  fileName: string
  thumbnail?: string
  totalRevenue: number
  yourShare: number
  yourPercentage: number
  tokenSymbol: string
  revenueModels: Array<{
    type: string
    views: number
    revenue: number
  }>
  last24h: {
    revenue: number
    change: number
  }
  last7d: {
    revenue: number
    change: number
  }
  holders: number
  transactions: Array<{
    id: string
    type: string
    amount: number
    user?: string
    timestamp: Date
  }>
}

interface RevenueDashboardProps {
  userId: string
}

export default function RevenueDashboard({ userId }: RevenueDashboardProps) {
  const [files, setFiles] = useState<FileRevenue[]>([
    // Mock data - would be fetched from API
    {
      fileId: '1',
      fileName: 'Hollywood Blockbuster 2024.mp4',
      thumbnail: '/api/placeholder/120/80',
      totalRevenue: 125.5,
      yourShare: 37.65,
      yourPercentage: 30,
      tokenSymbol: 'HB24',
      revenueModels: [
        { type: 'pay-per-view', views: 15420, revenue: 77.1 },
        { type: 'pay-per-second', views: 892000, revenue: 44.6 },
        { type: 'pay-per-download', views: 76, revenue: 3.8 }
      ],
      last24h: { revenue: 12.3, change: 15.2 },
      last7d: { revenue: 78.9, change: -5.1 },
      holders: 1247,
      transactions: [
        { id: '1', type: 'pay-per-view', amount: 0.05, user: 'user123', timestamp: new Date() },
        { id: '2', type: 'pay-per-second', amount: 0.0001, user: 'user456', timestamp: new Date() }
      ]
    },
    {
      fileId: '2',
      fileName: 'Educational Course - Web3 Development.pdf',
      thumbnail: '/api/placeholder/120/80',
      totalRevenue: 45.2,
      yourShare: 22.6,
      yourPercentage: 50,
      tokenSymbol: 'EDU3',
      revenueModels: [
        { type: 'pay-per-download', views: 904, revenue: 45.2 }
      ],
      last24h: { revenue: 5.1, change: 32.1 },
      last7d: { revenue: 28.7, change: 18.9 },
      holders: 523,
      transactions: [
        { id: '3', type: 'pay-per-download', amount: 0.05, user: 'student789', timestamp: new Date() }
      ]
    }
  ])
  
  const [selectedFile, setSelectedFile] = useState<FileRevenue | null>(null)
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  
  const totalRevenue = files.reduce((sum, file) => sum + file.yourShare, 0)
  const totalFiles = files.length
  const totalHolders = files.reduce((sum, file) => sum + file.holders, 0)
  const avgRevenuePerFile = totalRevenue / totalFiles
  
  return (
    <div className="p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} style={{ color: '#00ff88' }} />
            <span className="text-xs px-2 py-1 rounded" 
              style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
              +12.3%
            </span>
          </div>
          <div className="text-2xl font-light" style={{ color: '#ffffff' }}>
            {totalRevenue.toFixed(4)} BSV
          </div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Total Revenue
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} style={{ color: '#00ff88' }} />
            <ArrowUpRight size={16} style={{ color: '#00ff88' }} />
          </div>
          <div className="text-2xl font-light" style={{ color: '#ffffff' }}>
            {avgRevenuePerFile.toFixed(4)} BSV
          </div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Avg per File
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <Users size={20} style={{ color: '#00ff88' }} />
          </div>
          <div className="text-2xl font-light" style={{ color: '#ffffff' }}>
            {totalHolders.toLocaleString()}
          </div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Total Token Holders
          </div>
        </div>
        
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div className="flex items-center justify-between mb-2">
            <PieChart size={20} style={{ color: '#00ff88' }} />
          </div>
          <div className="text-2xl font-light" style={{ color: '#ffffff' }}>
            {totalFiles}
          </div>
          <div className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            Tokenized Files
          </div>
        </div>
      </div>
      
      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {(['24h', '7d', '30d', 'all'] as const).map(range => (
          <button key={range}
            onClick={() => setTimeRange(range)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: timeRange === range ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              color: timeRange === range ? '#00ff88' : 'rgba(255, 255, 255, 0.6)',
              border: `1px solid ${timeRange === range ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`
            }}>
            {range === '24h' ? 'Last 24 Hours' : 
             range === '7d' ? 'Last 7 Days' :
             range === '30d' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>
      
      {/* Files Revenue Table */}
      <div className="rounded-lg overflow-hidden" 
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                File
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Your Share
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Total Revenue
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                24h Change
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Models
              </th>
              <th className="text-left p-4 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Holders
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.fileId} 
                className="border-t cursor-pointer hover:bg-white/5 transition-colors"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                onClick={() => setSelectedFile(file)}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 rounded bg-gray-800" />
                    <div>
                      <div className="font-medium" style={{ color: '#ffffff' }}>
                        {file.fileName}
                      </div>
                      <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Token: {file.tokenSymbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <div className="font-medium" style={{ color: '#00ff88' }}>
                      {file.yourShare.toFixed(4)} BSV
                    </div>
                    <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      {file.yourPercentage}% ownership
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div style={{ color: '#ffffff' }}>
                    {file.totalRevenue.toFixed(4)} BSV
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1">
                    {file.last24h.change > 0 ? (
                      <ArrowUpRight size={16} style={{ color: '#00ff88' }} />
                    ) : (
                      <ArrowDownRight size={16} style={{ color: '#ff4444' }} />
                    )}
                    <span style={{ color: file.last24h.change > 0 ? '#00ff88' : '#ff4444' }}>
                      {Math.abs(file.last24h.change).toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {file.revenueModels.map(model => {
                      const icon = model.type === 'pay-per-view' ? <Eye size={14} /> :
                                  model.type === 'pay-per-second' ? <Clock size={14} /> :
                                  <Download size={14} />
                      return (
                        <div key={model.type} className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
                          {icon}
                          <span>{model.views.toLocaleString()}</span>
                        </div>
                      )
                    })}
                  </div>
                </td>
                <td className="p-4">
                  <div style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {file.holders.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Selected File Details */}
      {selectedFile && (
        <div className="mt-6 p-6 rounded-lg" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h3 className="text-lg font-medium mb-4" style={{ color: '#ffffff' }}>
            Revenue Breakdown: {selectedFile.fileName}
          </h3>
          
          <div className="grid grid-cols-3 gap-6">
            {selectedFile.revenueModels.map(model => (
              <div key={model.type} className="p-4 rounded-lg"
                style={{ backgroundColor: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    {model.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {model.type === 'pay-per-view' ? <Eye size={16} style={{ color: '#00ff88' }} /> :
                   model.type === 'pay-per-second' ? <Clock size={16} style={{ color: '#00ff88' }} /> :
                   <Download size={16} style={{ color: '#00ff88' }} />}
                </div>
                <div className="text-xl font-light" style={{ color: '#ffffff' }}>
                  {model.revenue.toFixed(4)} BSV
                </div>
                <div className="text-xs mt-1" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                  {model.views.toLocaleString()} interactions
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Recent Transactions
            </h4>
            <div className="space-y-2">
              {selectedFile.transactions.slice(0, 5).map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-2 rounded"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00ff88' }} />
                    <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {tx.type}
                    </span>
                    {tx.user && (
                      <span className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        from {tx.user}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#00ff88' }}>
                    +{tx.amount.toFixed(6)} BSV
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
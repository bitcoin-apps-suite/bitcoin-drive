/**
 * DropBlocks File Browser for Bitcoin Drive
 * Provides interface for managing decentralized files
 * 
 * Based on original DropBlocks by Monte Ohrt (https://github.com/mohrt/dropblocks)
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Upload, 
  Download, 
  Search, 
  FolderOpen, 
  Calendar, 
  RefreshCw, 
  FileText, 
  Shield, 
  Hash, 
  ExternalLink,
  Trash2,
  Archive,
  Settings,
  Import,
  FileDown,
  AlertTriangle,
  Clock,
  Tag
} from 'lucide-react'
import { DropBlocksManager, type DropBlocksFile, DEFAULT_DROPBLOCKS_CONFIG } from '@/lib/dropblocks'
import DropBlocksModal from './DropBlocksModal'

interface DropBlocksBrowserProps {
  className?: string
}

export default function DropBlocksBrowser({ className = '' }: DropBlocksBrowserProps) {
  const [dropblocks] = useState(() => new DropBlocksManager(DEFAULT_DROPBLOCKS_CONFIG))
  const [files, setFiles] = useState<DropBlocksFile[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showExpiring, setShowExpiring] = useState(false)
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set())
  const [selectedFile, setSelectedFile] = useState<DropBlocksFile | null>(null)
  const [passwordPrompt, setPasswordPrompt] = useState<string>('')

  const folders = dropblocks.getFolders()
  const expiringFiles = dropblocks.getExpiringSoon(7)

  useEffect(() => {
    refreshFiles()
  }, [selectedFolder, searchQuery])

  const refreshFiles = () => {
    if (searchQuery) {
      setFiles(dropblocks.searchFiles(searchQuery))
    } else {
      setFiles(dropblocks.getFilesByFolder(selectedFolder || undefined))
    }
  }

  const handleUploadComplete = (file: DropBlocksFile) => {
    refreshFiles()
  }

  const handleDownload = async (file: DropBlocksFile) => {
    if (file.isEncrypted) {
      const password = prompt('Enter password to decrypt file:')
      if (!password) return
      setPasswordPrompt(password)
    }

    setDownloadingFiles(prev => new Set(prev).add(file.id))
    
    try {
      const blob = await dropblocks.downloadFile(file.id, passwordPrompt || undefined)
      
      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
    
    setDownloadingFiles(prev => {
      const next = new Set(prev)
      next.delete(file.id)
      return next
    })
    setPasswordPrompt('')
  }

  const handleRenew = async (file: DropBlocksFile) => {
    const days = prompt('How many additional days?', '30')
    if (!days) return
    
    try {
      await dropblocks.renewFile(file.id, parseInt(days))
      refreshFiles()
      alert(`File renewed for ${days} additional days`)
    } catch (error) {
      alert(`Renewal failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async (file: DropBlocksFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return
    
    try {
      await dropblocks.deleteFile(file.id)
      refreshFiles()
    } catch (error) {
      alert(`Delete failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExport = () => {
    const catalog = dropblocks.exportCatalog()
    const blob = new Blob([catalog], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dropblocks-catalog.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const catalog = e.target?.result as string
          dropblocks.importCatalog(catalog)
          refreshFiles()
          alert('Catalog imported successfully')
        } catch (error) {
          alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getDaysUntilExpiry = (expiryDate: Date): number => {
    return Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  }

  const getExpiryColor = (expiryDate: Date): string => {
    const days = getDaysUntilExpiry(expiryDate)
    if (days <= 1) return '#ff4444'
    if (days <= 7) return '#ff9900'
    if (days <= 30) return '#ffcc00'
    return '#00ff88'
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
        <div className="flex items-center gap-3">
          <Archive size={24} style={{ color: '#00ff88' }} />
          <div>
            <h2 className="text-xl font-semibold" style={{ color: '#ffffff' }}>
              DropBlocks Storage
            </h2>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Decentralized file storage on BSV blockchain
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {expiringFiles.length > 0 && (
            <button
              onClick={() => setShowExpiring(!showExpiring)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
            >
              <AlertTriangle size={16} style={{ color: '#ffcc00' }} />
              <span className="text-sm" style={{ color: '#ffcc00' }}>
                {expiringFiles.length} expiring soon
              </span>
            </button>
          )}
          
          <button
            onClick={handleExport}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Export catalog"
          >
            <FileDown size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <button
            onClick={handleImport}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Import catalog"
          >
            <Import size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Settings"
          >
            <Settings size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
            style={{ backgroundColor: '#00ff88', color: '#000000' }}
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
        {/* Search */}
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff'
            }}
          />
        </div>

        {/* Folder Filter */}
        <div className="flex items-center gap-2">
          <FolderOpen size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 rounded-lg border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff'
            }}
          >
            <option value="">All Files</option>
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
          </select>
        </div>

        <button
          onClick={refreshFiles}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
        </button>
      </div>

      {/* Expiring Files Alert */}
      {showExpiring && expiringFiles.length > 0 && (
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)', backgroundColor: 'rgba(255, 204, 0, 0.1)' }}>
          <h3 className="font-medium mb-2" style={{ color: '#ffcc00' }}>Files Expiring Soon</h3>
          <div className="space-y-2">
            {expiringFiles.slice(0, 3).map(file => (
              <div key={file.id} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {file.name} - expires in {getDaysUntilExpiry(file.expiryDate)} days
                </span>
                <button
                  onClick={() => handleRenew(file)}
                  className="text-xs px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30"
                  style={{ color: '#ffcc00' }}
                >
                  Renew
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-auto">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Archive size={64} style={{ color: 'rgba(255, 255, 255, 0.3)', marginBottom: '16px' }} />
            <h3 className="text-lg font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {searchQuery ? 'No files found' : 'No files uploaded yet'}
            </h3>
            <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
              {searchQuery ? 'Try adjusting your search terms' : 'Upload your first file to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#00ff88', color: '#000000' }}
              >
                <Upload size={16} />
                Upload File
              </button>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className="p-4 rounded-lg border hover:bg-white/5 transition-colors"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <FileText size={24} style={{ color: '#4285f4', marginTop: '2px' }} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate" style={{ color: '#ffffff' }}>
                            {file.name}
                          </h3>
                          {file.isEncrypted && (
                            <Shield size={14} style={{ color: '#00ff88' }} title="Encrypted" />
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          <span>{formatFileSize(file.size)}</span>
                          <span>{file.mimeType}</span>
                          {file.folder && (
                            <span className="flex items-center gap-1">
                              <FolderOpen size={12} />
                              {file.folder}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          <span>Uploaded: {formatDate(file.uploadDate)}</span>
                          <span style={{ color: getExpiryColor(file.expiryDate) }}>
                            Expires: {formatDate(file.expiryDate)} ({getDaysUntilExpiry(file.expiryDate)} days)
                          </span>
                        </div>
                        
                        {file.tags && file.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag size={12} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                            <div className="flex gap-1">
                              {file.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 rounded text-xs"
                                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.6)' }}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                          <Hash size={12} />
                          <span className="font-mono">{file.hash.substring(0, 16)}...</span>
                          {file.metadata.txid && (
                            <>
                              <span>•</span>
                              <span>TX: {file.metadata.txid.substring(0, 8)}...</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleDownload(file)}
                        disabled={downloadingFiles.has(file.id)}
                        className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                        title="Download"
                      >
                        <Download size={16} style={{ color: downloadingFiles.has(file.id) ? 'rgba(255, 255, 255, 0.3)' : '#4285f4' }} />
                      </button>
                      
                      <button
                        onClick={() => handleRenew(file)}
                        className="p-2 rounded-lg hover:bg-green-500/20 transition-colors"
                        title="Renew"
                      >
                        <Clock size={16} style={{ color: '#00ff88' }} />
                      </button>
                      
                      {file.url && (
                        <button
                          onClick={() => window.open(file.url, '_blank')}
                          className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
                          title="Open in browser"
                        >
                          <ExternalLink size={16} style={{ color: '#9333ea' }} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(file)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} style={{ color: '#ef4444' }} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Attribution Footer */}
      <div className="border-t p-4 text-center" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
        <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
          Powered by DropBlocks technology • Original by{' '}
          <a href="https://github.com/mohrt/dropblocks" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">
            Monte Ohrt
          </a>
        </p>
      </div>

      {/* Upload Modal */}
      <DropBlocksModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadComplete={handleUploadComplete}
        dropblocks={dropblocks}
      />
    </div>
  )
}
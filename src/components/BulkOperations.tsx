'use client'

import React, { useState } from 'react'
import { 
  CheckSquare, 
  Square, 
  Download, 
  Trash2, 
  Share2, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Archive,
  Tag,
  Folder,
  Shield,
  Clock
} from 'lucide-react'
import { UnifiedFile } from '@/hooks/useDriveFiles'
import { renewDropBlocksFile, deleteDropBlocksFile } from '@/lib/dropblocks'

interface BulkOperationsProps {
  files: UnifiedFile[]
  selectedFiles: string[]
  onSelectionChange: (selectedFiles: string[]) => void
  onRefresh: () => void
  className?: string
}

export default function BulkOperations({
  files,
  selectedFiles,
  onSelectionChange,
  onRefresh,
  className = ''
}: BulkOperationsProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [operation, setOperation] = useState<string | null>(null)

  const selectedFileObjects = files.filter(file => selectedFiles.includes(file.id))
  const dropBlocksFiles = selectedFileObjects.filter(file => file.storageProvider === 'dropblocks')
  const hasSelection = selectedFiles.length > 0

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(files.map(file => file.id))
    }
  }

  const toggleFileSelection = (fileId: string) => {
    if (selectedFiles.includes(fileId)) {
      onSelectionChange(selectedFiles.filter(id => id !== fileId))
    } else {
      onSelectionChange([...selectedFiles, fileId])
    }
  }

  const executeOperation = async (operationType: string) => {
    if (!hasSelection) return

    setIsProcessing(true)
    setOperation(operationType)

    try {
      switch (operationType) {
        case 'download':
          await downloadSelectedFiles()
          break
        case 'delete':
          await deleteSelectedFiles()
          break
        case 'renew':
          await renewSelectedFiles()
          break
        case 'encrypt':
          await encryptSelectedFiles()
          break
        case 'share':
          await shareSelectedFiles()
          break
        default:
          console.warn('Unknown operation:', operationType)
      }
      
      onSelectionChange([])
      onRefresh()
    } catch (error) {
      console.error(`Failed to ${operationType} files:`, error)
    } finally {
      setIsProcessing(false)
      setOperation(null)
    }
  }

  const downloadSelectedFiles = async () => {
    // Mock bulk download - in production, create zip archive
    for (const file of selectedFileObjects) {
      console.log(`Downloading ${file.name}`)
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const deleteSelectedFiles = async () => {
    for (const file of dropBlocksFiles) {
      if (file.dropBlocksData) {
        await deleteDropBlocksFile(file.dropBlocksData.id)
      }
    }
  }

  const renewSelectedFiles = async () => {
    for (const file of dropBlocksFiles) {
      if (file.dropBlocksData) {
        await renewDropBlocksFile(file.dropBlocksData.id, 30) // Renew for 30 days
      }
    }
  }

  const encryptSelectedFiles = async () => {
    // Mock encryption - in production, re-upload with encryption
    for (const file of selectedFileObjects) {
      console.log(`Encrypting ${file.name}`)
      await new Promise(resolve => setTimeout(resolve, 800))
    }
  }

  const shareSelectedFiles = async () => {
    // Mock sharing - in production, create shared links or collaborative access
    for (const file of selectedFileObjects) {
      console.log(`Sharing ${file.name}`)
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  }

  const getSelectedStats = () => {
    const totalSize = selectedFileObjects.reduce((acc, file) => acc + parseInt(file.size || '0'), 0)
    const dropBlocksCount = dropBlocksFiles.length
    const encryptedCount = selectedFileObjects.filter(file => file.isEncrypted).length
    const expiringCount = selectedFileObjects.filter(file => {
      if (!file.expiryDate) return false
      const daysUntilExpiry = Math.ceil((file.expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysUntilExpiry <= 7
    }).length

    return { totalSize, dropBlocksCount, encryptedCount, expiringCount }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const stats = getSelectedStats()

  return (
    <div className={`bg-white/5 border border-white/10 rounded-lg p-4 ${className}`}>
      {/* Selection Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm hover:text-white transition-colors"
            style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          >
            {selectedFiles.length === files.length ? (
              <CheckSquare size={16} style={{ color: '#00ff88' }} />
            ) : (
              <Square size={16} />
            )}
            {selectedFiles.length === files.length ? 'Deselect All' : 'Select All'}
          </button>
          
          {hasSelection && (
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              {selectedFiles.length} of {files.length} selected
            </div>
          )}
        </div>
        
        {hasSelection && (
          <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Total: {formatBytes(stats.totalSize)}
          </div>
        )}
      </div>

      {/* Selection Stats */}
      {hasSelection && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-2">
            <Shield size={14} style={{ color: '#00ff88' }} />
            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {stats.dropBlocksCount} DropBlocks
            </span>
          </div>
          
          {stats.encryptedCount > 0 && (
            <div className="flex items-center gap-2">
              <Lock size={14} style={{ color: '#fbbf24' }} />
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {stats.encryptedCount} Encrypted
              </span>
            </div>
          )}
          
          {stats.expiringCount > 0 && (
            <div className="flex items-center gap-2">
              <Clock size={14} style={{ color: '#ef4444' }} />
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {stats.expiringCount} Expiring Soon
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bulk Operations */}
      {hasSelection && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => executeOperation('download')}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <Download size={14} />
            Download
          </button>
          
          <button
            onClick={() => executeOperation('share')}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <Share2 size={14} />
            Share
          </button>
          
          {dropBlocksFiles.length > 0 && (
            <button
              onClick={() => executeOperation('renew')}
              disabled={isProcessing}
              className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
            >
              <RefreshCw size={14} />
              Renew (30d)
            </button>
          )}
          
          <button
            onClick={() => executeOperation('encrypt')}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <Lock size={14} />
            Encrypt
          </button>
          
          <button
            onClick={() => executeOperation('delete')}
            disabled={isProcessing}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-white text-sm transition-colors"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <RefreshCw size={16} className="animate-spin" style={{ color: '#00ff88' }} />
            <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              {operation === 'download' && 'Downloading files...'}
              {operation === 'delete' && 'Deleting files...'}
              {operation === 'renew' && 'Renewing files...'}
              {operation === 'encrypt' && 'Encrypting files...'}
              {operation === 'share' && 'Sharing files...'}
            </span>
          </div>
        </div>
      )}

      {/* File List with Selection */}
      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
        {files.map(file => (
          <div
            key={file.id}
            className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
              selectedFiles.includes(file.id) 
                ? 'bg-white/10 border border-white/20' 
                : 'hover:bg-white/5'
            }`}
            onClick={() => toggleFileSelection(file.id)}
          >
            <div className="flex-shrink-0">
              {selectedFiles.includes(file.id) ? (
                <CheckSquare size={16} style={{ color: '#00ff88' }} />
              ) : (
                <Square size={16} style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: '#ffffff' }}>
                {file.name}
              </div>
              <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                {formatBytes(parseInt(file.size || '0'))} • {file.storageProvider}
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {file.storageProvider === 'dropblocks' && (
                <Shield size={12} style={{ color: '#00ff88' }} />
              )}
              {file.isEncrypted && (
                <Lock size={12} style={{ color: '#fbbf24' }} />
              )}
              {file.expiryDate && (
                <Clock size={12} style={{ color: '#6b7280' }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
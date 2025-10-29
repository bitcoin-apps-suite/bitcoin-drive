/**
 * DropBlocks Upload Modal for Bitcoin Drive
 * Provides decentralized file storage interface
 * 
 * Based on original DropBlocks by Monte Ohrt (https://github.com/mohrt/dropblocks)
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

'use client'

import { useState, useRef } from 'react'
import { X, Upload, FolderPlus, Tag, Calendar, Shield, HardDrive, FileText, Progress, CheckCircle, AlertCircle } from 'lucide-react'
import { DropBlocksManager, UploadProgress, type DropBlocksFile } from '@/lib/dropblocks'

interface DropBlocksModalProps {
  isOpen: boolean
  onClose: () => void
  onUploadComplete?: (file: DropBlocksFile) => void
  dropblocks: DropBlocksManager
}

export default function DropBlocksModal({ isOpen, onClose, onUploadComplete, dropblocks }: DropBlocksModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [enableEncryption, setEnableEncryption] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [folder, setFolder] = useState('')
  const [tags, setTags] = useState('')
  const [retentionDays, setRetentionDays] = useState(30)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const existingFolders = dropblocks.getFolders()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const validateForm = (): string | null => {
    if (!selectedFile) return 'Please select a file'
    if (enableEncryption && !password) return 'Password required for encryption'
    if (enableEncryption && password !== confirmPassword) return 'Passwords do not match'
    if (enableEncryption && password.length < 8) return 'Password must be at least 8 characters'
    if (retentionDays < 1) return 'Retention must be at least 1 day'
    return null
  }

  const handleUpload = async () => {
    const validationError = validateForm()
    if (validationError) {
      alert(validationError)
      return
    }

    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress({ phase: 'encrypting', progress: 0, message: 'Starting upload...' })

    try {
      const uploadedFile = await dropblocks.uploadFile(selectedFile, {
        encrypt: enableEncryption,
        password: enableEncryption ? password : undefined,
        folder: folder || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        retentionDays,
        onProgress: setUploadProgress
      })

      onUploadComplete?.(uploadedFile)
      resetForm()
      onClose()
    } catch (error) {
      setUploadProgress({
        phase: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed'
      })
    }

    setIsUploading(false)
  }

  const resetForm = () => {
    setSelectedFile(null)
    setEnableEncryption(false)
    setPassword('')
    setConfirmPassword('')
    setFolder('')
    setTags('')
    setRetentionDays(30)
    setUploadProgress(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getProgressColor = () => {
    if (!uploadProgress) return '#00ff88'
    switch (uploadProgress.phase) {
      case 'error': return '#ff4444'
      case 'complete': return '#00ff88'
      default: return '#4285f4'
    }
  }

  const getProgressIcon = () => {
    if (!uploadProgress) return <Upload size={16} />
    switch (uploadProgress.phase) {
      case 'error': return <AlertCircle size={16} />
      case 'complete': return <CheckCircle size={16} />
      default: return <Progress size={16} />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
      >
        {/* Header */}
        <div className="border-b p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <div className="flex items-center gap-3">
            <HardDrive size={24} style={{ color: '#00ff88' }} />
            <div>
              <h2 className="text-2xl font-light" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                DropBlocks Upload
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Decentralized file storage powered by BSV blockchain
              </p>
            </div>
          </div>
          
          {/* Attribution */}
          <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              Based on DropBlocks by <span style={{ color: '#00ff88' }}>Monte Ohrt</span> • 
              <a href="https://github.com/mohrt/dropblocks" target="_blank" rel="noopener noreferrer" className="ml-1 underline hover:text-white">
                Original Project
              </a>
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Select File
            </label>
            
            {!selectedFile ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors hover:border-green-500"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
              >
                <Upload size={48} style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 16px' }} />
                <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
                  Click to select or drag and drop a file
                </p>
                <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>
                  Maximum file size: 100MB
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-lg border" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', borderColor: 'rgba(0, 255, 136, 0.3)' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText size={24} style={{ color: '#00ff88' }} />
                    <div>
                      <p style={{ color: '#ffffff', fontWeight: '500' }}>{selectedFile.name}</p>
                      <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <X size={16} style={{ color: '#ff4444' }} />
                  </button>
                </div>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Basic Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Folder */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <FolderPlus size={16} className="inline mr-2" />
                Folder (optional)
              </label>
              <input
                type="text"
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
                placeholder="Enter folder name"
                list="existing-folders"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
              />
              <datalist id="existing-folders">
                {existingFolders.map(f => (
                  <option key={f} value={f} />
                ))}
              </datalist>
            </div>

            {/* Retention */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                <Calendar size={16} className="inline mr-2" />
                Retention (days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff'
                }}
              />
            </div>
          </div>

          {/* Encryption Toggle */}
          <div>
            <button
              onClick={() => setEnableEncryption(!enableEncryption)}
              className={`w-full p-4 rounded-lg border transition-all ${enableEncryption ? 'border-green-500' : ''}`}
              style={{
                backgroundColor: enableEncryption ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: enableEncryption ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield size={20} style={{ color: enableEncryption ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' }} />
                  <div className="text-left">
                    <p style={{ color: '#ffffff', fontWeight: '500' }}>File Encryption</p>
                    <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                      Encrypt file with password for additional security
                    </p>
                  </div>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${enableEncryption ? 'bg-green-500' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${enableEncryption ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`} />
                </div>
              </div>
            </button>

            {/* Encryption Fields */}
            {enableEncryption && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 8 chars)"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: password === confirmPassword ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Options */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm underline"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>

            {showAdvanced && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  <Tag size={16} className="inline mr-2" />
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g., documents, work, important"
                  className="w-full px-3 py-2 rounded-lg border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff'
                  }}
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)', border: `1px solid ${getProgressColor()}` }}>
              <div className="flex items-center gap-3 mb-3">
                <div style={{ color: getProgressColor() }}>
                  {getProgressIcon()}
                </div>
                <span style={{ color: '#ffffff', fontWeight: '500' }}>
                  {uploadProgress.message}
                </span>
              </div>
              
              {uploadProgress.phase !== 'error' && uploadProgress.phase !== 'complete' && (
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress.progress}%`,
                      backgroundColor: getProgressColor()
                    }}
                  />
                </div>
              )}
              
              {uploadProgress.txid && (
                <p className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                  Transaction ID: {uploadProgress.txid}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.8)',
              opacity: isUploading ? 0.5 : 1
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-6 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: selectedFile && !isUploading ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
              color: selectedFile && !isUploading ? '#000000' : 'rgba(255, 255, 255, 0.3)',
              cursor: selectedFile && !isUploading ? 'pointer' : 'not-allowed'
            }}
          >
            {isUploading ? 'Uploading...' : 'Upload to DropBlocks'}
          </button>
        </div>
      </div>
    </div>
  )
}
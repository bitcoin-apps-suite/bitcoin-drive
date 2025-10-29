/**
 * DropBlocks Integration for Bitcoin Drive
 * Provides decentralized file storage using BSV blockchain and UHRP
 * 
 * Based on original DropBlocks by Monte Ohrt (https://github.com/mohrt/dropblocks)
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 * 
 * Attribution: This implementation is derived from DropBlocks by Monte Ohrt
 * Original source: https://github.com/mohrt/dropblocks
 */

import { PrivateKey, Transaction, Script } from '@bsv/sdk'

export interface DropBlocksFile {
  id: string
  name: string
  size: number
  mimeType: string
  hash: string
  encryptionKey?: string
  isEncrypted: boolean
  uploadDate: Date
  expiryDate: Date
  retentionDays: number
  folder?: string
  tags?: string[]
  url?: string
  metadata: {
    location: string
    txid?: string
    height?: number
    timestamp?: number
  }
}

export interface DropBlocksConfig {
  walletHost?: string
  storageProviders: string[]
  defaultRetention: number // days
  maxFileSize: number // bytes
  allowedMimeTypes?: string[]
}

export interface UploadProgress {
  phase: 'encrypting' | 'uploading' | 'confirming' | 'complete' | 'error'
  progress: number
  message: string
  txid?: string
}

export interface StorageProvider {
  name: string
  endpoint: string
  apiKey?: string
  regions?: string[]
}

export class DropBlocksManager {
  private config: DropBlocksConfig
  private files: Map<string, DropBlocksFile> = new Map()
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map()

  constructor(config: DropBlocksConfig) {
    this.config = {
      walletHost: 'localhost',
      defaultRetention: 30,
      maxFileSize: 100 * 1024 * 1024, // 100MB
      ...config
    }
    this.loadLocalCatalog()
  }

  /**
   * Upload file with optional encryption and folder organization
   */
  async uploadFile(
    file: File,
    options: {
      encrypt?: boolean
      password?: string
      folder?: string
      tags?: string[]
      retentionDays?: number
      onProgress?: (progress: UploadProgress) => void
    } = {}
  ): Promise<DropBlocksFile> {
    const fileId = this.generateFileId()
    
    if (options.onProgress) {
      this.progressCallbacks.set(fileId, options.onProgress)
    }

    try {
      this.updateProgress(fileId, 'encrypting', 0, 'Preparing file...')

      // Validate file
      this.validateFile(file)

      // Calculate hash
      const arrayBuffer = await file.arrayBuffer()
      const hash = await this.calculateHash(arrayBuffer)

      // Encrypt if requested
      let encryptedData = arrayBuffer
      let encryptionKey: string | undefined

      if (options.encrypt && options.password) {
        this.updateProgress(fileId, 'encrypting', 25, 'Encrypting file...')
        const result = await this.encryptFile(arrayBuffer, options.password)
        encryptedData = result.data
        encryptionKey = result.key
      }

      this.updateProgress(fileId, 'uploading', 50, 'Uploading to storage...')

      // Upload to storage provider
      const location = await this.uploadToStorage(encryptedData, hash, file.name)

      this.updateProgress(fileId, 'confirming', 75, 'Recording on blockchain...')

      // Record on blockchain
      const txid = await this.recordOnBlockchain(hash, location, file.name)

      this.updateProgress(fileId, 'complete', 100, 'Upload complete!')

      // Create file record
      const dropBlocksFile: DropBlocksFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        hash,
        encryptionKey,
        isEncrypted: !!options.encrypt,
        uploadDate: new Date(),
        expiryDate: new Date(Date.now() + (options.retentionDays || this.config.defaultRetention) * 24 * 60 * 60 * 1000),
        retentionDays: options.retentionDays || this.config.defaultRetention,
        folder: options.folder,
        tags: options.tags,
        metadata: {
          location,
          txid
        }
      }

      // Store locally
      this.files.set(fileId, dropBlocksFile)
      this.saveLocalCatalog()

      return dropBlocksFile

    } catch (error) {
      this.updateProgress(fileId, 'error', 0, `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      throw error
    } finally {
      this.progressCallbacks.delete(fileId)
    }
  }

  /**
   * Download and decrypt file
   */
  async downloadFile(fileId: string, password?: string): Promise<Blob> {
    const file = this.files.get(fileId)
    if (!file) {
      throw new Error('File not found')
    }

    // Download from storage
    const data = await this.downloadFromStorage(file.metadata.location)

    // Decrypt if needed
    if (file.isEncrypted && password) {
      if (!file.encryptionKey) {
        throw new Error('Encryption key not available')
      }
      const decrypted = await this.decryptFile(data, password, file.encryptionKey)
      return new Blob([decrypted], { type: file.mimeType })
    }

    return new Blob([data], { type: file.mimeType })
  }

  /**
   * Renew file retention
   */
  async renewFile(fileId: string, additionalDays: number): Promise<void> {
    const file = this.files.get(fileId)
    if (!file) {
      throw new Error('File not found')
    }

    // Extend expiry date
    file.expiryDate = new Date(file.expiryDate.getTime() + additionalDays * 24 * 60 * 60 * 1000)
    file.retentionDays += additionalDays

    // Record renewal on blockchain
    await this.recordRenewal(file.hash, additionalDays)

    this.saveLocalCatalog()
  }

  /**
   * Get files by folder
   */
  getFilesByFolder(folder?: string): DropBlocksFile[] {
    return Array.from(this.files.values())
      .filter(file => file.folder === folder)
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
  }

  /**
   * Get all folders
   */
  getFolders(): string[] {
    const folders = new Set<string>()
    for (const file of this.files.values()) {
      if (file.folder) {
        folders.add(file.folder)
      }
    }
    return Array.from(folders).sort()
  }

  /**
   * Search files
   */
  searchFiles(query: string): DropBlocksFile[] {
    const lowerQuery = query.toLowerCase()
    return Array.from(this.files.values()).filter(file =>
      file.name.toLowerCase().includes(lowerQuery) ||
      file.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * Export catalog
   */
  exportCatalog(): string {
    const catalog = {
      version: '1.0',
      exported: new Date().toISOString(),
      files: Array.from(this.files.values())
    }
    return JSON.stringify(catalog, null, 2)
  }

  /**
   * Import catalog
   */
  importCatalog(catalogJson: string): void {
    const catalog = JSON.parse(catalogJson)
    
    if (catalog.version !== '1.0') {
      throw new Error('Unsupported catalog version')
    }

    for (const fileData of catalog.files) {
      const file: DropBlocksFile = {
        ...fileData,
        uploadDate: new Date(fileData.uploadDate),
        expiryDate: new Date(fileData.expiryDate)
      }
      this.files.set(file.id, file)
    }

    this.saveLocalCatalog()
  }

  /**
   * Get files expiring soon
   */
  getExpiringSoon(days: number = 7): DropBlocksFile[] {
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    return Array.from(this.files.values())
      .filter(file => file.expiryDate <= threshold)
      .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
  }

  /**
   * Delete file
   */
  async deleteFile(fileId: string): Promise<void> {
    const file = this.files.get(fileId)
    if (!file) {
      throw new Error('File not found')
    }

    // Note: In a full implementation, you might want to delete from storage
    // For now, we just remove from local catalog
    this.files.delete(fileId)
    this.saveLocalCatalog()
  }

  // Private methods

  private updateProgress(fileId: string, phase: UploadProgress['phase'], progress: number, message: string): void {
    const callback = this.progressCallbacks.get(fileId)
    if (callback) {
      callback({ phase, progress, message })
    }
  }

  private validateFile(file: File): void {
    if (file.size > this.config.maxFileSize) {
      throw new Error(`File too large. Maximum size: ${this.config.maxFileSize / (1024 * 1024)}MB`)
    }

    if (this.config.allowedMimeTypes && !this.config.allowedMimeTypes.includes(file.type)) {
      throw new Error(`File type not allowed: ${file.type}`)
    }
  }

  private async calculateHash(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async encryptFile(data: ArrayBuffer, password: string): Promise<{ data: ArrayBuffer, key: string }> {
    // Simple encryption implementation
    // In production, use proper encryption libraries
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    )

    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv)
    combined.set(new Uint8Array(encrypted), iv.length)
    
    return {
      data: combined.buffer,
      key: Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('')
    }
  }

  private async decryptFile(data: ArrayBuffer, password: string, encryptionKey: string): Promise<ArrayBuffer> {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password.padEnd(32, '0').slice(0, 32)),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    )

    const combined = new Uint8Array(data)
    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    return await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
  }

  private async uploadToStorage(data: ArrayBuffer, hash: string, filename: string): Promise<string> {
    // Mock implementation - in production, upload to actual storage provider
    const mockUrl = `https://storage.dropblocks.io/${hash}/${encodeURIComponent(filename)}`
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return mockUrl
  }

  private async downloadFromStorage(location: string): Promise<ArrayBuffer> {
    // Mock implementation - in production, download from actual storage
    throw new Error('Download not implemented in mock')
  }

  private async recordOnBlockchain(hash: string, location: string, filename: string): Promise<string> {
    // Mock implementation - in production, create actual BSV transaction
    const mockTxid = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    
    // Simulate blockchain confirmation delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return mockTxid
  }

  private async recordRenewal(hash: string, additionalDays: number): Promise<string> {
    // Mock implementation for renewal transaction
    const mockTxid = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
    
    return mockTxid
  }

  private generateFileId(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private loadLocalCatalog(): void {
    try {
      const saved = localStorage.getItem('dropblocks-catalog')
      if (saved) {
        const catalog = JSON.parse(saved)
        for (const fileData of catalog.files || []) {
          const file: DropBlocksFile = {
            ...fileData,
            uploadDate: new Date(fileData.uploadDate),
            expiryDate: new Date(fileData.expiryDate)
          }
          this.files.set(file.id, file)
        }
      }
    } catch (error) {
      console.warn('Failed to load local catalog:', error)
    }
  }

  private saveLocalCatalog(): void {
    try {
      const catalog = {
        version: '1.0',
        files: Array.from(this.files.values())
      }
      localStorage.setItem('dropblocks-catalog', JSON.stringify(catalog))
    } catch (error) {
      console.warn('Failed to save local catalog:', error)
    }
  }
}

// Default configuration
export const DEFAULT_DROPBLOCKS_CONFIG: DropBlocksConfig = {
  walletHost: 'localhost',
  storageProviders: ['dropblocks-storage'],
  defaultRetention: 30,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  allowedMimeTypes: undefined // Allow all types
}
/**
 * Unit Tests for Storage Provider Integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { HybridStorage, StorageMetadata, StorageProvider } from '../src/lib/storage/hybrid-storage'

// Mock Google Drive API
const mockGoogleDrive = {
  files: {
    create: vi.fn().mockResolvedValue({
      data: { id: 'mock-google-drive-id', name: 'test-file', size: '1024' }
    })
  }
}

// Mock DropBlocks functions
vi.mock('../src/lib/dropblocks', () => ({
  uploadToDropBlocks: vi.fn().mockResolvedValue({
    id: 'mock-dropblocks-id',
    name: 'test-file.txt',
    size: 1024,
    mimeType: 'text/plain',
    hash: 'mock-hash',
    isEncrypted: false,
    uploadDate: new Date(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    retentionDays: 30,
    metadata: {
      location: 'mock-location',
      txid: 'mock-txid'
    }
  }),
  getDropBlocksFile: vi.fn(),
  downloadFromDropBlocks: vi.fn()
}))

describe('Storage Provider Integration', () => {
  let hybridStorage: HybridStorage

  beforeEach(() => {
    // Mock the Google Drive instance
    vi.doMock('googleapis', () => ({
      google: {
        drive: vi.fn(() => mockGoogleDrive),
        auth: {
          OAuth2: vi.fn().mockImplementation(() => ({
            setCredentials: vi.fn()
          }))
        }
      }
    }))

    hybridStorage = new HybridStorage('mock-access-token')
  })

  describe('Google Drive Integration', () => {
    it('should upload file to Google Drive by default', async () => {
      const fileBuffer = Buffer.from('test content')
      const fileName = 'test.txt'
      const mimeType = 'text/plain'

      const result = await hybridStorage.uploadFile(fileBuffer, fileName, mimeType)

      expect(result.storageProvider).toBe('google-drive')
      expect(result.googleDriveId).toBe('mock-google-drive-id')
      expect(result.fileName).toBe(fileName)
      expect(result.mimeType).toBe(mimeType)
      expect(mockGoogleDrive.files.create).toHaveBeenCalled()
    })

    it('should handle Google Drive upload with folder', async () => {
      const fileBuffer = Buffer.from('test content')
      const fileName = 'test.txt'
      const mimeType = 'text/plain'
      const folderId = 'mock-folder-id'

      await hybridStorage.uploadFile(fileBuffer, fileName, mimeType, {
        folder: folderId
      })

      expect(mockGoogleDrive.files.create).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            parents: [folderId]
          })
        })
      )
    })

    it('should handle Google Drive upload with encryption', async () => {
      const fileBuffer = Buffer.from('secret content')
      const fileName = 'secret.txt'
      const mimeType = 'text/plain'

      const result = await hybridStorage.uploadFile(fileBuffer, fileName, mimeType, {
        encrypt: true
      })

      expect(result.encryptionKey).toBeDefined()
      expect(result.storageProvider).toBe('google-drive')
    })
  })

  describe('DropBlocks Integration', () => {
    it('should upload file to DropBlocks when specified', async () => {
      const fileBuffer = Buffer.from('blockchain content')
      const fileName = 'blockchain.txt'
      const mimeType = 'text/plain'

      const result = await hybridStorage.uploadFile(fileBuffer, fileName, mimeType, {
        storageProvider: 'dropblocks'
      })

      expect(result.storageProvider).toBe('dropblocks')
      expect(result.dropBlocksHash).toBe('mock-hash')
      expect(result.dropBlocksMetadata).toBeDefined()
      expect(result.googleDriveId).toBeUndefined()
    })

    it('should upload encrypted file to DropBlocks', async () => {
      const fileBuffer = Buffer.from('secret blockchain content')
      const fileName = 'secret.txt'
      const mimeType = 'text/plain'

      const result = await hybridStorage.uploadFile(fileBuffer, fileName, mimeType, {
        storageProvider: 'dropblocks',
        encrypt: true,
        retentionDays: 90
      })

      expect(result.storageProvider).toBe('dropblocks')
      expect(result.encryptionKey).toBeDefined()
      expect(result.dropBlocksMetadata).toBeDefined()
    })

    it('should handle DropBlocks upload with custom retention', async () => {
      const fileBuffer = Buffer.from('long-term content')
      const fileName = 'longterm.txt'
      const mimeType = 'text/plain'

      const { uploadToDropBlocks } = await import('../src/lib/dropblocks')

      await hybridStorage.uploadFile(fileBuffer, fileName, mimeType, {
        storageProvider: 'dropblocks',
        retentionDays: 365
      })

      expect(uploadToDropBlocks).toHaveBeenCalledWith(
        expect.any(Buffer),
        fileName,
        mimeType,
        expect.objectContaining({
          retentionDays: 365
        })
      )
    })
  })

  describe('Provider Selection', () => {
    it('should support all storage provider types', () => {
      const providers: StorageProvider[] = ['google-drive', 'dropblocks', 'local', 'ipfs']
      
      providers.forEach(provider => {
        expect(typeof provider).toBe('string')
        expect(['google-drive', 'dropblocks', 'local', 'ipfs']).toContain(provider)
      })
    })

    it('should default to google-drive when no provider specified', async () => {
      const fileBuffer = Buffer.from('default content')
      const result = await hybridStorage.uploadFile(fileBuffer, 'default.txt', 'text/plain')
      
      expect(result.storageProvider).toBe('google-drive')
    })

    it('should handle invalid storage provider gracefully', async () => {
      const fileBuffer = Buffer.from('test content')
      
      // TypeScript would catch this, but test runtime behavior
      const result = await hybridStorage.uploadFile(fileBuffer, 'test.txt', 'text/plain', {
        storageProvider: 'invalid-provider' as StorageProvider
      })
      
      // Should fallback to google-drive
      expect(result.storageProvider).toBe('google-drive')
    })
  })

  describe('Metadata Management', () => {
    it('should generate consistent metadata structure', async () => {
      const fileBuffer = Buffer.from('metadata test')
      const result = await hybridStorage.uploadFile(fileBuffer, 'metadata.txt', 'text/plain')

      // Check required metadata fields
      expect(result.fileId).toBeDefined()
      expect(result.fileName).toBe('metadata.txt')
      expect(result.fileSize).toBe(fileBuffer.length)
      expect(result.mimeType).toBe('text/plain')
      expect(result.sha256Hash).toBeDefined()
      expect(result.storageProvider).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should include blockchain transaction ID for all providers', async () => {
      const fileBuffer = Buffer.from('blockchain test')
      
      const googleResult = await hybridStorage.uploadFile(fileBuffer, 'google.txt', 'text/plain', {
        storageProvider: 'google-drive'
      })
      
      const dropblocksResult = await hybridStorage.uploadFile(fileBuffer, 'dropblocks.txt', 'text/plain', {
        storageProvider: 'dropblocks'
      })

      expect(googleResult.blockchainTxId).toBeDefined()
      expect(dropblocksResult.blockchainTxId).toBeDefined()
    })

    it('should handle timelock configuration', async () => {
      const fileBuffer = Buffer.from('timelock test')
      const unlockDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now

      const result = await hybridStorage.uploadFile(fileBuffer, 'timelock.txt', 'text/plain', {
        timelock: {
          enabled: true,
          unlockDate,
          unlockConditions: [{
            type: 'time',
            value: unlockDate.toISOString()
          }]
        }
      })

      expect(result.timelockUntil).toEqual(unlockDate)
    })
  })

  describe('Cross-Provider Operations', () => {
    it('should maintain consistent file IDs across providers', async () => {
      const fileBuffer = Buffer.from('cross-provider test')
      
      const googleResult = await hybridStorage.uploadFile(fileBuffer, 'test.txt', 'text/plain', {
        storageProvider: 'google-drive'
      })
      
      const dropblocksResult = await hybridStorage.uploadFile(fileBuffer, 'test.txt', 'text/plain', {
        storageProvider: 'dropblocks'
      })

      // Different file IDs but same content hash
      expect(googleResult.fileId).not.toBe(dropblocksResult.fileId)
      expect(googleResult.sha256Hash).toBe(dropblocksResult.sha256Hash)
    })

    it('should support provider migration scenarios', async () => {
      const fileBuffer = Buffer.from('migration test')
      
      // Upload to Google Drive first
      const googleResult = await hybridStorage.uploadFile(fileBuffer, 'migrate.txt', 'text/plain', {
        storageProvider: 'google-drive'
      })
      
      // Then upload same content to DropBlocks
      const dropblocksResult = await hybridStorage.uploadFile(fileBuffer, 'migrate.txt', 'text/plain', {
        storageProvider: 'dropblocks'
      })

      expect(googleResult.sha256Hash).toBe(dropblocksResult.sha256Hash)
      expect(googleResult.storageProvider).toBe('google-drive')
      expect(dropblocksResult.storageProvider).toBe('dropblocks')
    })
  })

  describe('Error Handling', () => {
    it('should handle Google Drive API failures', async () => {
      mockGoogleDrive.files.create.mockRejectedValueOnce(new Error('Google API Error'))
      
      const fileBuffer = Buffer.from('error test')
      
      await expect(
        hybridStorage.uploadFile(fileBuffer, 'error.txt', 'text/plain')
      ).rejects.toThrow('Google API Error')
    })

    it('should handle DropBlocks upload failures', async () => {
      const { uploadToDropBlocks } = await import('../src/lib/dropblocks')
      vi.mocked(uploadToDropBlocks).mockRejectedValueOnce(new Error('DropBlocks Error'))
      
      const fileBuffer = Buffer.from('dropblocks error test')
      
      await expect(
        hybridStorage.uploadFile(fileBuffer, 'error.txt', 'text/plain', {
          storageProvider: 'dropblocks'
        })
      ).rejects.toThrow('DropBlocks Error')
    })

    it('should handle network timeouts gracefully', async () => {
      mockGoogleDrive.files.create.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      )
      
      const fileBuffer = Buffer.from('timeout test')
      
      await expect(
        hybridStorage.uploadFile(fileBuffer, 'timeout.txt', 'text/plain')
      ).rejects.toThrow('Timeout')
    })
  })
})
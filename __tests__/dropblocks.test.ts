/**
 * Unit Tests for DropBlocks Core Functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  DropBlocksManager, 
  DropBlocksConfig, 
  uploadToDropBlocks, 
  getDropBlocksFile,
  downloadFromDropBlocks,
  renewDropBlocksFile,
  deleteDropBlocksFile,
  listDropBlocksFiles
} from '../src/lib/dropblocks'

// Mock crypto for testing
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    }),
    subtle: {
      importKey: vi.fn().mockResolvedValue({}),
      encrypt: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
      decrypt: vi.fn().mockResolvedValue(new ArrayBuffer(24))
    }
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock
})

describe('DropBlocks Core Functionality', () => {
  let config: DropBlocksConfig
  let manager: DropBlocksManager

  beforeEach(() => {
    config = {
      walletHost: 'localhost',
      storageProviders: ['test-storage'],
      defaultRetention: 30,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['text/plain', 'image/jpeg']
    }
    manager = new DropBlocksManager(config)
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorageMock.clear()
  })

  describe('DropBlocksManager', () => {
    it('should initialize with correct configuration', () => {
      expect(manager).toBeDefined()
      expect(manager.listFiles()).toEqual([])
    })

    it('should upload a file successfully', async () => {
      const fileData = Buffer.from('test content')
      const fileName = 'test.txt'
      const mimeType = 'text/plain'
      const retentionDays = 30

      const uploadedFile = await manager.uploadFile(
        fileData,
        fileName,
        mimeType,
        retentionDays,
        { encrypt: false }
      )

      expect(uploadedFile).toBeDefined()
      expect(uploadedFile.name).toBe(fileName)
      expect(uploadedFile.mimeType).toBe(mimeType)
      expect(uploadedFile.size).toBe(fileData.length)
      expect(uploadedFile.isEncrypted).toBe(false)
      expect(uploadedFile.retentionDays).toBe(retentionDays)
      expect(uploadedFile.id).toBeDefined()
      expect(uploadedFile.hash).toBeDefined()
    })

    it('should upload an encrypted file', async () => {
      const fileData = Buffer.from('secret content')
      const fileName = 'secret.txt'
      const mimeType = 'text/plain'

      const uploadedFile = await manager.uploadFile(
        fileData,
        fileName,
        mimeType,
        30,
        { encrypt: true }
      )

      expect(uploadedFile.isEncrypted).toBe(true)
      expect(uploadedFile.encryptionKey).toBeDefined()
    })

    it('should reject files that are too large', async () => {
      const largeFileData = Buffer.alloc(config.maxFileSize + 1)
      
      await expect(
        manager.uploadFile(largeFileData, 'large.txt', 'text/plain', 30)
      ).rejects.toThrow('File size exceeds maximum allowed size')
    })

    it('should reject unsupported mime types when restrictions are set', async () => {
      const fileData = Buffer.from('test')
      
      await expect(
        manager.uploadFile(fileData, 'test.pdf', 'application/pdf', 30)
      ).rejects.toThrow('MIME type not allowed')
    })

    it('should list uploaded files', async () => {
      const file1 = await manager.uploadFile(
        Buffer.from('content1'), 'file1.txt', 'text/plain', 30
      )
      const file2 = await manager.uploadFile(
        Buffer.from('content2'), 'file2.txt', 'text/plain', 30
      )

      const files = manager.listFiles()
      expect(files).toHaveLength(2)
      expect(files.map(f => f.id)).toContain(file1.id)
      expect(files.map(f => f.id)).toContain(file2.id)
    })

    it('should filter files by folder', async () => {
      await manager.uploadFile(
        Buffer.from('content1'), 'file1.txt', 'text/plain', 30,
        { folder: 'documents' }
      )
      await manager.uploadFile(
        Buffer.from('content2'), 'file2.txt', 'text/plain', 30,
        { folder: 'images' }
      )
      await manager.uploadFile(
        Buffer.from('content3'), 'file3.txt', 'text/plain', 30
      )

      const documentsFiles = manager.listFiles('documents')
      const imagesFiles = manager.listFiles('images')
      const rootFiles = manager.listFiles()

      expect(documentsFiles).toHaveLength(1)
      expect(imagesFiles).toHaveLength(1)
      expect(rootFiles).toHaveLength(3)
    })

    it('should retrieve a file by ID', async () => {
      const uploadedFile = await manager.uploadFile(
        Buffer.from('test'), 'test.txt', 'text/plain', 30
      )

      const retrievedFile = manager.getFile(uploadedFile.id)
      expect(retrievedFile).toEqual(uploadedFile)
    })

    it('should return null for non-existent file', () => {
      const nonExistentFile = manager.getFile('non-existent-id')
      expect(nonExistentFile).toBeNull()
    })

    it('should delete a file', async () => {
      const uploadedFile = await manager.uploadFile(
        Buffer.from('test'), 'test.txt', 'text/plain', 30
      )

      await manager.deleteFile(uploadedFile.id)
      
      const retrievedFile = manager.getFile(uploadedFile.id)
      expect(retrievedFile).toBeNull()
      expect(manager.listFiles()).toHaveLength(0)
    })

    it('should renew a file', async () => {
      const uploadedFile = await manager.uploadFile(
        Buffer.from('test'), 'test.txt', 'text/plain', 30
      )

      const originalExpiry = uploadedFile.expiryDate
      await manager.renewFile(uploadedFile.id, 60)

      const renewedFile = manager.getFile(uploadedFile.id)
      expect(renewedFile?.expiryDate.getTime()).toBeGreaterThan(originalExpiry.getTime())
    })
  })

  describe('Utility Functions', () => {
    it('should upload file using utility function', async () => {
      const fileData = Buffer.from('utility test')
      const fileName = 'utility.txt'
      const mimeType = 'text/plain'

      const result = await uploadToDropBlocks(fileData, fileName, mimeType, {
        encrypt: false,
        retentionDays: 60,
        folder: 'utilities'
      })

      expect(result.name).toBe(fileName)
      expect(result.folder).toBe('utilities')
      expect(result.retentionDays).toBe(60)
    })

    it('should get file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(
        Buffer.from('test'), 'test.txt', 'text/plain'
      )

      const retrievedFile = await getDropBlocksFile(uploadedFile.id)
      expect(retrievedFile).toEqual(uploadedFile)
    })

    it('should list files using utility function', async () => {
      await uploadToDropBlocks(Buffer.from('1'), 'file1.txt', 'text/plain')
      await uploadToDropBlocks(Buffer.from('2'), 'file2.txt', 'text/plain')

      const files = listDropBlocksFiles()
      expect(files).toHaveLength(2)
    })

    it('should renew file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(
        Buffer.from('test'), 'test.txt', 'text/plain'
      )

      await renewDropBlocksFile(uploadedFile.id, 90)
      
      // Should not throw
      expect(true).toBe(true)
    })

    it('should delete file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(
        Buffer.from('test'), 'test.txt', 'text/plain'
      )

      await deleteDropBlocksFile(uploadedFile.id)
      
      const deletedFile = await getDropBlocksFile(uploadedFile.id)
      expect(deletedFile).toBeNull()
    })
  })

  describe('File Operations', () => {
    it('should handle file tags correctly', async () => {
      const uploadedFile = await manager.uploadFile(
        Buffer.from('tagged content'),
        'tagged.txt',
        'text/plain',
        30,
        { tags: ['important', 'work', 'draft'] }
      )

      expect(uploadedFile.tags).toEqual(['important', 'work', 'draft'])
    })

    it('should generate unique file IDs', async () => {
      const file1 = await manager.uploadFile(
        Buffer.from('content1'), 'file1.txt', 'text/plain', 30
      )
      const file2 = await manager.uploadFile(
        Buffer.from('content2'), 'file2.txt', 'text/plain', 30
      )

      expect(file1.id).not.toBe(file2.id)
      expect(file1.id).toBeDefined()
      expect(file2.id).toBeDefined()
    })

    it('should generate consistent hashes for same content', async () => {
      const content = Buffer.from('identical content')
      
      const file1 = await manager.uploadFile(content, 'file1.txt', 'text/plain', 30)
      const file2 = await manager.uploadFile(content, 'file2.txt', 'text/plain', 30)

      expect(file1.hash).toBe(file2.hash)
    })

    it('should handle expiry dates correctly', async () => {
      const uploadedFile = await manager.uploadFile(
        Buffer.from('test'), 'test.txt', 'text/plain', 7
      )

      const expectedExpiry = new Date()
      expectedExpiry.setDate(expectedExpiry.getDate() + 7)

      const timeDiff = Math.abs(uploadedFile.expiryDate.getTime() - expectedExpiry.getTime())
      expect(timeDiff).toBeLessThan(1000) // Within 1 second
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid file IDs gracefully', async () => {
      await expect(manager.deleteFile('')).rejects.toThrow('File not found')
      await expect(manager.renewFile('invalid-id', 30)).rejects.toThrow('File not found')
    })

    it('should handle corrupted local storage', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      // Should not throw when initializing with corrupted storage
      const newManager = new DropBlocksManager(config)
      expect(newManager.listFiles()).toEqual([])
    })

    it('should handle network errors gracefully', async () => {
      // Mock network failure by overriding the upload method
      const originalUpload = manager['uploadToStorage']
      manager['uploadToStorage'] = vi.fn().mockRejectedValue(new Error('Network error'))

      await expect(
        manager.uploadFile(Buffer.from('test'), 'test.txt', 'text/plain', 30)
      ).rejects.toThrow('Network error')

      // Restore original method
      manager['uploadToStorage'] = originalUpload
    })
  })

  describe('Performance', () => {
    it('should handle multiple simultaneous uploads', async () => {
      const uploads = Array.from({ length: 10 }, (_, i) =>
        manager.uploadFile(
          Buffer.from(`content${i}`),
          `file${i}.txt`,
          'text/plain',
          30
        )
      )

      const results = await Promise.all(uploads)
      expect(results).toHaveLength(10)
      expect(manager.listFiles()).toHaveLength(10)
    })

    it('should maintain performance with large number of files', async () => {
      // Upload 100 files
      const uploads = Array.from({ length: 100 }, (_, i) =>
        manager.uploadFile(
          Buffer.from(`content${i}`),
          `file${i}.txt`,
          'text/plain',
          30
        )
      )

      await Promise.all(uploads)

      const start = performance.now()
      const files = manager.listFiles()
      const end = performance.now()

      expect(files).toHaveLength(100)
      expect(end - start).toBeLessThan(10) // Should take less than 10ms
    })
  })
})
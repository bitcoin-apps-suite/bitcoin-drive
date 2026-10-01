/**
 * Unit Tests for DropBlocks Core Functionality
 *
 * Runs in Node so File, Blob and WebCrypto are the real implementations.
 * @vitest-environment node
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  DropBlocksManager,
  DropBlocksConfig,
  uploadToDropBlocks,
  getDropBlocksFile,
  getDropBlocksManager,
  renewDropBlocksFile,
  deleteDropBlocksFile,
  listDropBlocksFiles
} from '../src/lib/dropblocks'

// In-memory localStorage (Node has none; the manager persists its catalog there)
const store = new Map<string, string>()
const localStorageMock = {
  getItem: vi.fn((key: string) => store.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => { store.set(key, value) }),
  removeItem: vi.fn((key: string) => { store.delete(key) }),
  clear: vi.fn(() => { store.clear() })
}
vi.stubGlobal('localStorage', localStorageMock)

// The storage upload and blockchain recording are network calls (currently
// simulated with multi-second delays), so stub them out.
interface ManagerNetwork {
  uploadToStorage(data: ArrayBuffer, hash: string, filename: string): Promise<string>
  recordOnBlockchain(hash: string, location: string, filename: string): Promise<string>
}
const network = DropBlocksManager.prototype as unknown as ManagerNetwork

const MOCK_TXID = 'ab'.repeat(32)

const textFile = (content: string, name: string, type = 'text/plain') =>
  new File([content], name, { type })

describe('DropBlocks Core Functionality', () => {
  let config: DropBlocksConfig
  let manager: DropBlocksManager

  beforeEach(() => {
    store.clear()
    vi.clearAllMocks()
    vi.spyOn(network, 'uploadToStorage').mockImplementation(
      async (_data, hash, filename) => `https://storage.test/${hash}/${encodeURIComponent(filename)}`
    )
    vi.spyOn(network, 'recordOnBlockchain').mockResolvedValue(MOCK_TXID)

    config = {
      walletHost: 'localhost',
      storageProviders: ['test-storage'],
      defaultRetention: 30,
      maxFileSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['text/plain', 'image/jpeg']
    }
    manager = new DropBlocksManager(config)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('DropBlocksManager', () => {
    it('should initialize with correct configuration', () => {
      expect(manager).toBeDefined()
      expect(manager.listFiles()).toEqual([])
    })

    it('should upload a file successfully', async () => {
      const file = textFile('test content', 'test.txt')

      const uploadedFile = await manager.uploadFile(file, { retentionDays: 30 })

      expect(uploadedFile.name).toBe('test.txt')
      expect(uploadedFile.mimeType).toBe('text/plain')
      expect(uploadedFile.size).toBe(file.size)
      expect(uploadedFile.isEncrypted).toBe(false)
      expect(uploadedFile.retentionDays).toBe(30)
      expect(uploadedFile.id).toMatch(/^[0-9a-f]{32}$/)
      expect(uploadedFile.hash).toMatch(/^[0-9a-f]{64}$/)
      expect(uploadedFile.metadata.txid).toBe(MOCK_TXID)
      expect(uploadedFile.metadata.location).toContain(uploadedFile.hash)
    })

    it('should report upload progress through to completion', async () => {
      const onProgress = vi.fn()

      await manager.uploadFile(textFile('progress', 'progress.txt'), { onProgress })

      const phases = onProgress.mock.calls.map(([progress]) => progress.phase)
      expect(phases).toEqual(['encrypting', 'uploading', 'confirming', 'complete'])
    })

    it('should upload an encrypted file', async () => {
      const uploadedFile = await manager.uploadFile(
        textFile('secret content', 'secret.txt'),
        { encrypt: true, password: 'correct horse battery staple' }
      )

      expect(uploadedFile.isEncrypted).toBe(true)
      expect(uploadedFile.encryptionKey).toMatch(/^[0-9a-f]{24}$/) // 12-byte IV
    })

    it('should reject files that are too large', async () => {
      const largeFile = new File([new Uint8Array(config.maxFileSize + 1)], 'large.txt', { type: 'text/plain' })

      await expect(manager.uploadFile(largeFile)).rejects.toThrow('File too large')
    })

    it('should reject unsupported mime types when restrictions are set', async () => {
      await expect(
        manager.uploadFile(textFile('test', 'test.pdf', 'application/pdf'))
      ).rejects.toThrow('File type not allowed: application/pdf')
    })

    it('should list uploaded files', async () => {
      const file1 = await manager.uploadFile(textFile('content1', 'file1.txt'))
      const file2 = await manager.uploadFile(textFile('content2', 'file2.txt'))

      const ids = manager.listFiles().map(f => f.id)
      expect(ids).toHaveLength(2)
      expect(ids).toContain(file1.id)
      expect(ids).toContain(file2.id)
    })

    it('should filter files by folder', async () => {
      await manager.uploadFile(textFile('content1', 'file1.txt'), { folder: 'documents' })
      await manager.uploadFile(textFile('content2', 'file2.txt'), { folder: 'images' })
      await manager.uploadFile(textFile('content3', 'file3.txt'))

      expect(manager.listFiles('documents')).toHaveLength(1)
      expect(manager.listFiles('images')).toHaveLength(1)
      expect(manager.listFiles()).toHaveLength(3)
      expect(manager.getFolders()).toEqual(['documents', 'images'])
    })

    it('should retrieve a file by ID', async () => {
      const uploadedFile = await manager.uploadFile(textFile('test', 'test.txt'))

      expect(manager.getFile(uploadedFile.id)).toEqual(uploadedFile)
    })

    it('should return null for non-existent file', () => {
      expect(manager.getFile('non-existent-id')).toBeNull()
    })

    it('should delete a file', async () => {
      const uploadedFile = await manager.uploadFile(textFile('test', 'test.txt'))

      await manager.deleteFile(uploadedFile.id)

      expect(manager.getFile(uploadedFile.id)).toBeNull()
      expect(manager.listFiles()).toHaveLength(0)
    })

    it('should renew a file', async () => {
      const uploadedFile = await manager.uploadFile(textFile('test', 'test.txt'))
      const originalExpiry = uploadedFile.expiryDate.getTime()

      await manager.renewFile(uploadedFile.id, 60)

      const renewedFile = manager.getFile(uploadedFile.id)
      expect(renewedFile?.expiryDate.getTime()).toBe(originalExpiry + 60 * 24 * 60 * 60 * 1000)
      expect(renewedFile?.retentionDays).toBe(90)
    })

    it('should persist the catalog and reload it in a new manager', async () => {
      const uploadedFile = await manager.uploadFile(textFile('persisted', 'persisted.txt'))

      const reloaded = new DropBlocksManager(config)
      const restored = reloaded.getFile(uploadedFile.id)

      expect(restored?.name).toBe('persisted.txt')
      expect(restored?.uploadDate).toBeInstanceOf(Date)
      expect(restored?.expiryDate.getTime()).toBe(uploadedFile.expiryDate.getTime())
    })

    it('should round-trip the catalog through export and import', async () => {
      const uploadedFile = await manager.uploadFile(textFile('exported', 'exported.txt'))
      const exported = manager.exportCatalog()

      store.clear()
      const fresh = new DropBlocksManager(config)
      fresh.importCatalog(exported)

      expect(fresh.getFile(uploadedFile.id)?.hash).toBe(uploadedFile.hash)
      expect(() => fresh.importCatalog(JSON.stringify({ version: '2.0', files: [] })))
        .toThrow('Unsupported catalog version')
    })

    it('should search files by name and tag', async () => {
      await manager.uploadFile(textFile('a', 'Quarterly Report.txt'), { tags: ['finance'] })
      await manager.uploadFile(textFile('b', 'holiday.txt'), { tags: ['personal'] })

      expect(manager.searchFiles('report').map(f => f.name)).toEqual(['Quarterly Report.txt'])
      expect(manager.searchFiles('PERSONAL').map(f => f.name)).toEqual(['holiday.txt'])
    })

    it('should list files expiring soon', async () => {
      const soon = await manager.uploadFile(textFile('a', 'soon.txt'), { retentionDays: 3 })
      await manager.uploadFile(textFile('b', 'later.txt'), { retentionDays: 30 })

      expect(manager.getExpiringSoon(7).map(f => f.id)).toEqual([soon.id])
    })
  })

  describe('Utility Functions', () => {
    beforeEach(async () => {
      // The utility functions share a module-level manager; start each test empty
      const shared = getDropBlocksManager()
      for (const file of shared.listFiles()) {
        await shared.deleteFile(file.id)
      }
    })

    it('should upload file using utility function', async () => {
      const result = await uploadToDropBlocks(Buffer.from('utility test'), 'utility.txt', 'text/plain', {
        encrypt: false,
        retentionDays: 60,
        folder: 'utilities'
      })

      expect(result.name).toBe('utility.txt')
      expect(result.mimeType).toBe('text/plain')
      expect(result.folder).toBe('utilities')
      expect(result.retentionDays).toBe(60)
    })

    it('should get file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(Buffer.from('test'), 'test.txt', 'text/plain')

      expect(await getDropBlocksFile(uploadedFile.id)).toEqual(uploadedFile)
    })

    it('should list files using utility function', async () => {
      await uploadToDropBlocks(Buffer.from('1'), 'file1.txt', 'text/plain')
      await uploadToDropBlocks(Buffer.from('2'), 'file2.txt', 'text/plain')

      expect(listDropBlocksFiles()).toHaveLength(2)
    })

    it('should renew file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(Buffer.from('test'), 'test.txt', 'text/plain')
      const originalRetention = uploadedFile.retentionDays

      await renewDropBlocksFile(uploadedFile.id, 90)

      const renewed = await getDropBlocksFile(uploadedFile.id)
      expect(renewed?.retentionDays).toBe(originalRetention + 90)
    })

    it('should delete file using utility function', async () => {
      const uploadedFile = await uploadToDropBlocks(Buffer.from('test'), 'test.txt', 'text/plain')

      await deleteDropBlocksFile(uploadedFile.id)

      expect(await getDropBlocksFile(uploadedFile.id)).toBeNull()
    })
  })

  describe('File Operations', () => {
    it('should handle file tags correctly', async () => {
      const uploadedFile = await manager.uploadFile(
        textFile('tagged content', 'tagged.txt'),
        { tags: ['important', 'work', 'draft'] }
      )

      expect(uploadedFile.tags).toEqual(['important', 'work', 'draft'])
    })

    it('should generate unique file IDs', async () => {
      const file1 = await manager.uploadFile(textFile('content1', 'file1.txt'))
      const file2 = await manager.uploadFile(textFile('content2', 'file2.txt'))

      expect(file1.id).not.toBe(file2.id)
    })

    it('should generate consistent hashes for same content', async () => {
      const file1 = await manager.uploadFile(textFile('identical content', 'file1.txt'))
      const file2 = await manager.uploadFile(textFile('identical content', 'file2.txt'))
      const file3 = await manager.uploadFile(textFile('different content', 'file3.txt'))

      expect(file1.hash).toBe(file2.hash)
      expect(file1.hash).not.toBe(file3.hash)
    })

    it('should handle expiry dates correctly', async () => {
      const before = Date.now()
      const uploadedFile = await manager.uploadFile(textFile('test', 'test.txt'), { retentionDays: 7 })
      const after = Date.now()

      const week = 7 * 24 * 60 * 60 * 1000
      expect(uploadedFile.expiryDate.getTime()).toBeGreaterThanOrEqual(before + week)
      expect(uploadedFile.expiryDate.getTime()).toBeLessThanOrEqual(after + week)
    })

    it('should use the default retention when none is given', async () => {
      const uploadedFile = await manager.uploadFile(textFile('test', 'test.txt'))

      expect(uploadedFile.retentionDays).toBe(config.defaultRetention)
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid file IDs gracefully', async () => {
      await expect(manager.deleteFile('')).rejects.toThrow('File not found')
      await expect(manager.renewFile('invalid-id', 30)).rejects.toThrow('File not found')
      await expect(manager.downloadFile('invalid-id')).rejects.toThrow('File not found')
    })

    it('should handle corrupted local storage', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      store.set('dropblocks-catalog', 'invalid json')

      // Should not throw when initializing with corrupted storage
      const newManager = new DropBlocksManager(config)

      expect(newManager.listFiles()).toEqual([])
      expect(warn).toHaveBeenCalledWith('Failed to load local catalog:', expect.any(SyntaxError))
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(network.uploadToStorage).mockRejectedValueOnce(new Error('Network error'))
      const onProgress = vi.fn()

      await expect(
        manager.uploadFile(textFile('test', 'test.txt'), { onProgress })
      ).rejects.toThrow('Network error')

      expect(onProgress).toHaveBeenLastCalledWith(
        expect.objectContaining({ phase: 'error', message: 'Upload failed: Network error' })
      )
      expect(manager.listFiles()).toHaveLength(0)
    })
  })

  describe('Performance', () => {
    it('should handle multiple simultaneous uploads', async () => {
      const results = await Promise.all(
        Array.from({ length: 10 }, (_, i) => manager.uploadFile(textFile(`content${i}`, `file${i}.txt`)))
      )

      expect(results).toHaveLength(10)
      expect(manager.listFiles()).toHaveLength(10)
    })

    it('should maintain performance with large number of files', async () => {
      await Promise.all(
        Array.from({ length: 100 }, (_, i) => manager.uploadFile(textFile(`content${i}`, `file${i}.txt`)))
      )

      const start = performance.now()
      const files = manager.listFiles()
      const end = performance.now()

      expect(files).toHaveLength(100)
      expect(end - start).toBeLessThan(50)
    })
  })
})

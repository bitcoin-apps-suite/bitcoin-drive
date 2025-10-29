/**
 * Unit Tests for Advanced DropBlocks Features
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  DropBlocksAdvanced,
  FileVersion,
  SmartContract,
  CollaborativeAccess,
  dropBlocksAdvanced
} from '../src/lib/dropblocks-advanced'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// Mock crypto
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    })
  }
})

describe('DropBlocks Advanced Features', () => {
  let advanced: DropBlocksAdvanced

  beforeEach(() => {
    advanced = new DropBlocksAdvanced()
    vi.clearAllMocks()
  })

  describe('File Versioning', () => {
    it('should create file version successfully', async () => {
      const fileId = 'test-file-id'
      const hash = 'new-content-hash'
      const size = 1024
      const changedBy = 'user@example.com'
      const description = 'Updated content'

      const version = await advanced.createFileVersion(
        fileId, hash, size, changedBy, description
      )

      expect(version.version).toBe(1)
      expect(version.hash).toBe(hash)
      expect(version.size).toBe(size)
      expect(version.changedBy).toBe(changedBy)
      expect(version.changeDescription).toBe(description)
      expect(version.isCurrentVersion).toBe(true)
      expect(version.txid).toBeDefined()
    })

    it('should maintain version history', async () => {
      const fileId = 'versioned-file'
      
      // Create first version
      const v1 = await advanced.createFileVersion(
        fileId, 'hash1', 1000, 'user1', 'Initial version'
      )
      
      // Create second version
      const v2 = await advanced.createFileVersion(
        fileId, 'hash2', 1200, 'user2', 'Updated version'
      )
      
      // Create third version
      const v3 = await advanced.createFileVersion(
        fileId, 'hash3', 1500, 'user1', 'Final version'
      )

      const versions = advanced.getFileVersions(fileId)
      expect(versions).toHaveLength(3)
      expect(versions[0].version).toBe(1)
      expect(versions[1].version).toBe(2)
      expect(versions[2].version).toBe(3)
      
      // Only the latest should be current
      expect(versions[0].isCurrentVersion).toBe(false)
      expect(versions[1].isCurrentVersion).toBe(false)
      expect(versions[2].isCurrentVersion).toBe(true)
    })

    it('should get current version correctly', async () => {
      const fileId = 'current-version-test'
      
      await advanced.createFileVersion(fileId, 'hash1', 1000, 'user1')
      const latest = await advanced.createFileVersion(fileId, 'hash2', 1200, 'user1')

      const current = advanced.getCurrentVersion(fileId)
      expect(current).toEqual(latest)
      expect(current?.isCurrentVersion).toBe(true)
    })

    it('should restore previous version', async () => {
      const fileId = 'restore-test'
      
      const v1 = await advanced.createFileVersion(fileId, 'hash1', 1000, 'user1', 'Version 1')
      await advanced.createFileVersion(fileId, 'hash2', 1200, 'user1', 'Version 2')
      
      await advanced.restoreVersion(fileId, v1.id, 'user1')

      const versions = advanced.getFileVersions(fileId)
      expect(versions).toHaveLength(3)
      
      const current = advanced.getCurrentVersion(fileId)
      expect(current?.hash).toBe('hash1') // Restored to v1 content
      expect(current?.changeDescription).toContain('Restored from version 1')
    })

    it('should handle non-existent version restore', async () => {
      const fileId = 'restore-error-test'
      
      await expect(
        advanced.restoreVersion(fileId, 'non-existent-version', 'user1')
      ).rejects.toThrow('Version not found')
    })
  })

  describe('Smart Contracts', () => {
    it('should create auto-renewal contract', async () => {
      const fileId = 'auto-renewal-file'
      const conditions = [{
        type: 'time-based' as const,
        parameters: { targetTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() },
        isMet: false,
        lastChecked: new Date()
      }]

      const contract = await advanced.createSmartContract(fileId, 'auto-renewal', conditions)

      expect(contract.type).toBe('auto-renewal')
      expect(contract.fileId).toBe(fileId)
      expect(contract.conditions).toEqual(conditions)
      expect(contract.isActive).toBe(true)
      expect(contract.txid).toBeDefined()
    })

    it('should create access control contract', async () => {
      const fileId = 'access-control-file'
      const conditions = [
        {
          type: 'payment-based' as const,
          parameters: { amount: 1000, currency: 'BSV' },
          isMet: false,
          lastChecked: new Date()
        },
        {
          type: 'signature-based' as const,
          parameters: { requiredSignatures: ['user1', 'user2'] },
          isMet: false,
          lastChecked: new Date()
        }
      ]

      const contract = await advanced.createSmartContract(fileId, 'access-control', conditions)

      expect(contract.type).toBe('access-control')
      expect(contract.conditions).toHaveLength(2)
    })

    it('should execute contract when conditions are met', async () => {
      const fileId = 'executable-contract'
      const pastTime = new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
      
      const conditions = [{
        type: 'time-based' as const,
        parameters: { targetTime: pastTime.toISOString() },
        isMet: false,
        lastChecked: new Date()
      }]

      const contract = await advanced.createSmartContract(fileId, 'auto-renewal', conditions)
      const result = await advanced.executeContract(contract.id)

      expect(result).toBe(true)
      expect(contract.conditions[0].isMet).toBe(true)
    })

    it('should not execute contract when conditions are not met', async () => {
      const fileId = 'non-executable-contract'
      const futureTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      
      const conditions = [{
        type: 'time-based' as const,
        parameters: { targetTime: futureTime.toISOString() },
        isMet: false,
        lastChecked: new Date()
      }]

      const contract = await advanced.createSmartContract(fileId, 'auto-renewal', conditions)
      const result = await advanced.executeContract(contract.id)

      expect(result).toBe(false)
      expect(contract.conditions[0].isMet).toBe(false)
    })

    it('should get contracts for specific file', async () => {
      const fileId = 'multi-contract-file'
      
      await advanced.createSmartContract(fileId, 'auto-renewal', [])
      await advanced.createSmartContract(fileId, 'access-control', [])
      await advanced.createSmartContract('other-file', 'auto-renewal', [])

      const fileContracts = advanced.getFileContracts(fileId)
      expect(fileContracts).toHaveLength(2)
      expect(fileContracts.every(c => c.fileId === fileId)).toBe(true)
    })
  })

  describe('Collaborative Storage', () => {
    it('should setup collaborative access', async () => {
      const fileId = 'collaborative-file'
      const owner = 'owner@example.com'

      const access = await advanced.setupCollaborativeAccess(fileId, owner)

      expect(access.fileId).toBe(fileId)
      expect(access.owner).toBe(owner)
      expect(access.collaborators).toEqual([])
      expect(access.accessRequests).toEqual([])
    })

    it('should add collaborator with permissions', async () => {
      const fileId = 'collab-file'
      const owner = 'owner@example.com'
      const collaborator = 'collaborator@example.com'
      const permissions = ['read', 'write'] as const

      await advanced.setupCollaborativeAccess(fileId, owner)
      await advanced.addCollaborator(fileId, collaborator, permissions, owner)

      const access = advanced.getCollaborativeAccess(fileId)
      expect(access?.collaborators).toHaveLength(1)
      expect(access?.collaborators[0].address).toBe(collaborator)
      expect(access?.collaborators[0].permissions).toEqual(permissions)
      expect(access?.collaborators[0].addedBy).toBe(owner)
    })

    it('should update existing collaborator permissions', async () => {
      const fileId = 'update-permissions-file'
      const owner = 'owner@example.com'
      const collaborator = 'collaborator@example.com'

      await advanced.setupCollaborativeAccess(fileId, owner)
      await advanced.addCollaborator(fileId, collaborator, ['read'], owner)
      await advanced.addCollaborator(fileId, collaborator, ['read', 'write', 'delete'], owner)

      const access = advanced.getCollaborativeAccess(fileId)
      expect(access?.collaborators).toHaveLength(1)
      expect(access?.collaborators[0].permissions).toEqual(['read', 'write', 'delete'])
    })

    it('should handle access requests', async () => {
      const fileId = 'request-access-file'
      const owner = 'owner@example.com'
      const requester = 'requester@example.com'
      const requestedPermissions = ['read', 'write'] as const

      await advanced.setupCollaborativeAccess(fileId, owner)
      await advanced.requestAccess(fileId, requester, requestedPermissions)

      const access = advanced.getCollaborativeAccess(fileId)
      expect(access?.accessRequests).toHaveLength(1)
      expect(access?.accessRequests[0].requester).toBe(requester)
      expect(access?.accessRequests[0].requestedPermissions).toEqual(requestedPermissions)
      expect(access?.accessRequests[0].status).toBe('pending')
    })

    it('should approve access requests', async () => {
      const fileId = 'approve-access-file'
      const owner = 'owner@example.com'
      const requester = 'requester@example.com'

      await advanced.setupCollaborativeAccess(fileId, owner)
      await advanced.requestAccess(fileId, requester, ['read'])
      await advanced.approveAccessRequest(fileId, requester, owner)

      const access = advanced.getCollaborativeAccess(fileId)
      expect(access?.accessRequests[0].status).toBe('approved')
      expect(access?.accessRequests[0].approvedBy).toBe(owner)
      expect(access?.collaborators).toHaveLength(1)
      expect(access?.collaborators[0].address).toBe(requester)
    })

    it('should check permissions correctly', async () => {
      const fileId = 'permission-check-file'
      const owner = 'owner@example.com'
      const collaborator = 'collaborator@example.com'
      const stranger = 'stranger@example.com'

      await advanced.setupCollaborativeAccess(fileId, owner)
      await advanced.addCollaborator(fileId, collaborator, ['read', 'write'], owner)

      // Owner should have all permissions
      expect(advanced.hasPermission(fileId, owner, 'read')).toBe(true)
      expect(advanced.hasPermission(fileId, owner, 'write')).toBe(true)
      expect(advanced.hasPermission(fileId, owner, 'delete')).toBe(true)

      // Collaborator should have granted permissions
      expect(advanced.hasPermission(fileId, collaborator, 'read')).toBe(true)
      expect(advanced.hasPermission(fileId, collaborator, 'write')).toBe(true)
      expect(advanced.hasPermission(fileId, collaborator, 'delete')).toBe(false)

      // Stranger should have no permissions
      expect(advanced.hasPermission(fileId, stranger, 'read')).toBe(false)
      expect(advanced.hasPermission(fileId, stranger, 'write')).toBe(false)
    })

    it('should handle non-existent collaborative access', async () => {
      expect(advanced.getCollaborativeAccess('non-existent-file')).toBeNull()
      expect(advanced.hasPermission('non-existent-file', 'user@example.com', 'read')).toBe(false)
    })

    it('should handle errors for non-collaborative files', async () => {
      await expect(
        advanced.addCollaborator('non-collaborative-file', 'user@example.com', ['read'], 'owner')
      ).rejects.toThrow('File not set up for collaboration')

      await expect(
        advanced.requestAccess('non-collaborative-file', 'user@example.com', ['read'])
      ).rejects.toThrow('File not set up for collaboration')
    })
  })

  describe('Storage and Persistence', () => {
    it('should save and load data from localStorage', () => {
      const testVersions = new Map([
        ['file1', [{ id: 'v1', version: 1, hash: 'hash1' } as FileVersion]]
      ])
      
      // Create new instance to trigger save
      const testAdvanced = new DropBlocksAdvanced()
      
      // Manually set data to test saving
      testAdvanced['fileVersions'] = testVersions
      testAdvanced['saveToStorage']()

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'dropblocks-versions',
        expect.stringContaining('file1')
      )
    })

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json')
      
      // Should not throw when initializing with corrupted storage
      const testAdvanced = new DropBlocksAdvanced()
      expect(testAdvanced.getFileVersions('any-file')).toEqual([])
    })
  })
})
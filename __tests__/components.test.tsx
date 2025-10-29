/**
 * Unit Tests for React Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UnifiedFile } from '../src/hooks/useDriveFiles'
import StorageProviderSelector from '../src/components/StorageProviderSelector'
import FileStatusIndicator from '../src/components/FileStatusIndicator'
import BulkOperations from '../src/components/BulkOperations'
import WalletSync from '../src/components/WalletSync'

// Mock DropBlocks functions
vi.mock('../src/lib/dropblocks', () => ({
  renewDropBlocksFile: vi.fn().mockResolvedValue(undefined),
  deleteDropBlocksFile: vi.fn().mockResolvedValue(undefined),
  getDropBlocksManager: vi.fn().mockReturnValue({
    listFiles: vi.fn().mockReturnValue([])
  })
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('React Components', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('StorageProviderSelector', () => {
    it('should render all storage providers', () => {
      const mockOnChange = vi.fn()
      
      render(
        <StorageProviderSelector
          selectedProviders={['google-drive']}
          onProvidersChange={mockOnChange}
        />
      )

      expect(screen.getByText('Google Drive')).toBeInTheDocument()
      expect(screen.getByText('DropBlocks')).toBeInTheDocument()
      expect(screen.getByText('Local Storage')).toBeInTheDocument()
      expect(screen.getByText('IPFS')).toBeInTheDocument()
    })

    it('should show selected providers correctly', () => {
      const mockOnChange = vi.fn()
      
      render(
        <StorageProviderSelector
          selectedProviders={['google-drive', 'dropblocks']}
          onProvidersChange={mockOnChange}
        />
      )

      const googleDriveButton = screen.getByText('Google Drive').closest('button')
      const dropBlocksButton = screen.getByText('DropBlocks').closest('button')
      const localButton = screen.getByText('Local Storage').closest('button')

      expect(googleDriveButton).toHaveClass('bg-white/10')
      expect(dropBlocksButton).toHaveClass('bg-white/10')
      expect(localButton).toHaveClass('bg-white/5')
    })

    it('should toggle provider selection', () => {
      const mockOnChange = vi.fn()
      
      render(
        <StorageProviderSelector
          selectedProviders={['google-drive']}
          onProvidersChange={mockOnChange}
        />
      )

      const dropBlocksButton = screen.getByText('DropBlocks').closest('button')
      fireEvent.click(dropBlocksButton!)

      expect(mockOnChange).toHaveBeenCalledWith(['google-drive', 'dropblocks'])
    })

    it('should remove provider when already selected', () => {
      const mockOnChange = vi.fn()
      
      render(
        <StorageProviderSelector
          selectedProviders={['google-drive', 'dropblocks']}
          onProvidersChange={mockOnChange}
        />
      )

      const googleDriveButton = screen.getByText('Google Drive').closest('button')
      fireEvent.click(googleDriveButton!)

      expect(mockOnChange).toHaveBeenCalledWith(['dropblocks'])
    })
  })

  describe('FileStatusIndicator', () => {
    const createMockFile = (overrides: Partial<UnifiedFile> = {}): UnifiedFile => ({
      id: 'test-file-1',
      name: 'test.txt',
      mimeType: 'text/plain',
      size: '1024',
      modifiedTime: '2023-01-01T00:00:00Z',
      createdTime: '2023-01-01T00:00:00Z',
      webViewLink: 'https://example.com/view',
      webContentLink: 'https://example.com/download',
      parents: [],
      storageProvider: 'google-drive',
      ...overrides
    })

    it('should show Google Drive provider icon', () => {
      const file = createMockFile({ storageProvider: 'google-drive' })
      
      render(<FileStatusIndicator file={file} />)
      
      const icon = screen.getByTitle('Stored on google-drive')
      expect(icon).toBeInTheDocument()
    })

    it('should show DropBlocks provider icon', () => {
      const file = createMockFile({ storageProvider: 'dropblocks' })
      
      render(<FileStatusIndicator file={file} />)
      
      const icon = screen.getByTitle('Stored on dropblocks')
      expect(icon).toBeInTheDocument()
    })

    it('should show encryption indicator', () => {
      const file = createMockFile({ 
        storageProvider: 'dropblocks',
        isEncrypted: true 
      })
      
      render(<FileStatusIndicator file={file} />)
      
      expect(screen.getByTitle('File is encrypted')).toBeInTheDocument()
    })

    it('should show blockchain verification for DropBlocks', () => {
      const file = createMockFile({ 
        storageProvider: 'dropblocks',
        blockchainTxId: 'tx123456'
      })
      
      render(<FileStatusIndicator file={file} />)
      
      expect(screen.getByTitle('Verified on blockchain')).toBeInTheDocument()
    })

    it('should show expiry warning', () => {
      const expiryDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      const file = createMockFile({ 
        storageProvider: 'dropblocks',
        expiryDate
      })
      
      render(<FileStatusIndicator file={file} />)
      
      expect(screen.getByTitle('Expires in 3 days')).toBeInTheDocument()
      expect(screen.getByText('3d')).toBeInTheDocument()
    })

    it('should not show expiry warning for distant expiry', () => {
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      const file = createMockFile({ 
        storageProvider: 'dropblocks',
        expiryDate
      })
      
      render(<FileStatusIndicator file={file} />)
      
      expect(screen.getByTitle('Expires in 30 days')).toBeInTheDocument()
      expect(screen.queryByText('30d')).not.toBeInTheDocument()
    })
  })

  describe('BulkOperations', () => {
    const createMockFiles = (): UnifiedFile[] => [
      {
        id: 'file1',
        name: 'document.txt',
        mimeType: 'text/plain',
        size: '1024',
        modifiedTime: '2023-01-01T00:00:00Z',
        createdTime: '2023-01-01T00:00:00Z',
        webViewLink: 'https://example.com/view/1',
        webContentLink: 'https://example.com/download/1',
        parents: [],
        storageProvider: 'google-drive'
      },
      {
        id: 'file2',
        name: 'blockchain-file.txt',
        mimeType: 'text/plain',
        size: '2048',
        modifiedTime: '2023-01-02T00:00:00Z',
        createdTime: '2023-01-02T00:00:00Z',
        webViewLink: 'https://example.com/view/2',
        webContentLink: 'https://example.com/download/2',
        parents: [],
        storageProvider: 'dropblocks',
        isEncrypted: true,
        dropBlocksData: {
          id: 'db-file2',
          name: 'blockchain-file.txt',
          size: 2048,
          mimeType: 'text/plain',
          hash: 'hash123',
          isEncrypted: true,
          uploadDate: new Date('2023-01-02T00:00:00Z'),
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          retentionDays: 30,
          metadata: { location: 'blockchain', txid: 'tx123' }
        }
      }
    ]

    it('should render with no selection', () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={[]}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      expect(screen.getByText('Select All')).toBeInTheDocument()
      expect(screen.queryByText('Download')).not.toBeInTheDocument()
    })

    it('should show bulk operations when files are selected', () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={['file1', 'file2']}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      expect(screen.getByText('Download')).toBeInTheDocument()
      expect(screen.getByText('Share')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Renew (30d)')).toBeInTheDocument() // DropBlocks file present
    })

    it('should select all files', () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={[]}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      const selectAllButton = screen.getByText('Select All')
      fireEvent.click(selectAllButton)

      expect(mockOnSelectionChange).toHaveBeenCalledWith(['file1', 'file2'])
    })

    it('should deselect all files', () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={['file1', 'file2']}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      const deselectAllButton = screen.getByText('Deselect All')
      fireEvent.click(deselectAllButton)

      expect(mockOnSelectionChange).toHaveBeenCalledWith([])
    })

    it('should show stats for selected files', () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={['file1', 'file2']}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      expect(screen.getByText('1 DropBlocks')).toBeInTheDocument()
      expect(screen.getByText('1 Encrypted')).toBeInTheDocument()
      expect(screen.getByText('Total: 3.0 KB')).toBeInTheDocument()
    })

    it('should execute bulk download operation', async () => {
      const mockFiles = createMockFiles()
      const mockOnSelectionChange = vi.fn()
      const mockOnRefresh = vi.fn()

      render(
        <BulkOperations
          files={mockFiles}
          selectedFiles={['file1', 'file2']}
          onSelectionChange={mockOnSelectionChange}
          onRefresh={mockOnRefresh}
        />
      )

      const downloadButton = screen.getByText('Download')
      fireEvent.click(downloadButton)

      expect(screen.getByText('Downloading files...')).toBeInTheDocument()

      await waitFor(() => {
        expect(mockOnSelectionChange).toHaveBeenCalledWith([])
        expect(mockOnRefresh).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('WalletSync', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockReturnValue(null)
    })

    it('should render disconnected state', () => {
      render(<WalletSync />)
      
      expect(screen.getByText('Blockchain Sync')).toBeInTheDocument()
      expect(screen.getByText('Connect wallet to sync files across devices')).toBeInTheDocument()
    })

    it('should show connect wallet button when expanded', () => {
      render(<WalletSync />)
      
      // Click to expand
      const expandButton = screen.getByRole('button', { name: '' }) // Key icon button
      fireEvent.click(expandButton)
      
      expect(screen.getByText('Connect BSV Wallet')).toBeInTheDocument()
    })

    it('should connect wallet', async () => {
      render(<WalletSync />)
      
      // Expand the component
      const expandButton = screen.getByRole('button', { name: '' })
      fireEvent.click(expandButton)
      
      // Click connect wallet
      const connectButton = screen.getByText('Connect BSV Wallet')
      fireEvent.click(connectButton)
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith(
          'dropblocks-wallet-address',
          expect.any(String)
        )
      }, { timeout: 3000 })
    })

    it('should show connected state', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dropblocks-wallet-address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
        if (key === 'dropblocks-last-sync') return new Date().toISOString()
        return null
      })
      
      render(<WalletSync />)
      
      expect(screen.getByText('0 files synced')).toBeInTheDocument()
    })

    it('should show wallet address when connected and expanded', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'dropblocks-wallet-address') return '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
        return null
      })
      
      render(<WalletSync />)
      
      // Expand to see details
      const expandButton = screen.getByRole('button', { name: '' })
      fireEvent.click(expandButton)
      
      expect(screen.getByText('1A1zP1...DivfNa')).toBeInTheDocument()
      expect(screen.getByText('Sync Now')).toBeInTheDocument()
    })
  })
})
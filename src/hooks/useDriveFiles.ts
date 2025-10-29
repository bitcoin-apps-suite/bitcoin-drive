import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GoogleDriveFile, DriveFilesResponse } from '@/types/drive'
import { DropBlocksFile, listDropBlocksFiles } from '@/lib/dropblocks'
import { StorageProvider } from '@/lib/storage/hybrid-storage'

export interface UnifiedFile extends Omit<GoogleDriveFile, 'id'> {
  id: string
  storageProvider: StorageProvider
  dropBlocksData?: DropBlocksFile
  isEncrypted?: boolean
  expiryDate?: Date
  blockchainTxId?: string
}

interface UseDriveFilesOptions {
  pageSize?: number
  query?: string
  autoFetch?: boolean
  includeDropBlocks?: boolean
  storageProviders?: StorageProvider[]
}

export function useDriveFiles({
  pageSize = 50,
  query = "trashed=false",
  autoFetch = true,
  includeDropBlocks = true,
  storageProviders = ['google-drive', 'dropblocks']
}: UseDriveFilesOptions = {}) {
  const { data: session, status } = useSession()
  const [files, setFiles] = useState<UnifiedFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const fetchFiles = async (pageToken?: string, reset = false) => {
    setLoading(true)
    setError(null)

    try {
      const allFiles: UnifiedFile[] = []

      // Fetch Google Drive files if included
      if (storageProviders.includes('google-drive') && session && status === 'authenticated') {
        const params = new URLSearchParams({
          pageSize: pageSize.toString(),
          q: query
        })

        if (pageToken) {
          params.append('pageToken', pageToken)
        }

        const response = await fetch(`/api/drive/files?${params.toString()}`)
        
        if (response.ok) {
          const data: DriveFilesResponse = await response.json()
          
          // Convert Google Drive files to unified format
          const googleFiles: UnifiedFile[] = data.files.map(file => ({
            ...file,
            storageProvider: 'google-drive' as StorageProvider
          }))
          
          allFiles.push(...googleFiles)
          setNextPageToken(data.nextPageToken || null)
          setHasMore(!!data.nextPageToken)
        }
      }

      // Fetch DropBlocks files if included
      if (storageProviders.includes('dropblocks') && includeDropBlocks) {
        try {
          const dropBlocksFiles = listDropBlocksFiles()
          
          // Convert DropBlocks files to unified format
          const unifiedDropBlocksFiles: UnifiedFile[] = dropBlocksFiles.map(file => ({
            id: file.id,
            name: file.name,
            mimeType: file.mimeType,
            size: file.size.toString(),
            modifiedTime: file.uploadDate.toISOString(),
            createdTime: file.uploadDate.toISOString(),
            webViewLink: file.url || `#dropblocks/${file.id}`,
            webContentLink: file.url || `#dropblocks/${file.id}`,
            parents: file.folder ? [file.folder] : [],
            storageProvider: 'dropblocks' as StorageProvider,
            dropBlocksData: file,
            isEncrypted: file.isEncrypted,
            expiryDate: file.expiryDate,
            blockchainTxId: file.metadata.txid
          }))
          
          allFiles.push(...unifiedDropBlocksFiles)
        } catch (dropBlocksError) {
          console.warn('Failed to fetch DropBlocks files:', dropBlocksError)
        }
      }

      // Sort files by modification time (newest first)
      allFiles.sort((a, b) => new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime())

      if (reset) {
        setFiles(allFiles)
      } else {
        setFiles(prev => [...prev, ...allFiles])
      }

    } catch (err) {
      console.error('Error fetching files:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (nextPageToken && !loading) {
      fetchFiles(nextPageToken)
    }
  }

  const refresh = () => {
    setFiles([])
    setNextPageToken(null)
    setHasMore(false)
    fetchFiles(undefined, true)
  }

  const searchFiles = (searchQuery: string) => {
    const fullQuery = searchQuery 
      ? `name contains '${searchQuery}' and trashed=false`
      : "trashed=false"
    
    setFiles([])
    setNextPageToken(null)
    setHasMore(false)
    
    // Update the query and fetch
    fetchFiles(undefined, true)
  }

  useEffect(() => {
    if (autoFetch && session && status === 'authenticated') {
      fetchFiles(undefined, true)
    }
  }, [session, status, autoFetch, query])

  return {
    files,
    loading,
    error,
    hasMore,
    nextPageToken,
    fetchFiles: () => fetchFiles(undefined, true),
    loadMore,
    refresh,
    searchFiles
  }
}
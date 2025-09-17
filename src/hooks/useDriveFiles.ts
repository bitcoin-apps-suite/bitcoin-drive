import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { GoogleDriveFile, DriveFilesResponse } from '@/types/drive'

interface UseDriveFilesOptions {
  pageSize?: number
  query?: string
  autoFetch?: boolean
}

export function useDriveFiles({
  pageSize = 50,
  query = "trashed=false",
  autoFetch = true
}: UseDriveFilesOptions = {}) {
  const { data: session, status } = useSession()
  const [files, setFiles] = useState<GoogleDriveFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const fetchFiles = async (pageToken?: string, reset = false) => {
    if (!session || status !== 'authenticated') {
      setError('Not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        pageSize: pageSize.toString(),
        q: query
      })

      if (pageToken) {
        params.append('pageToken', pageToken)
      }

      const response = await fetch(`/api/drive/files?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch files: ${response.statusText}`)
      }

      const data: DriveFilesResponse = await response.json()

      if (reset) {
        setFiles(data.files)
      } else {
        setFiles(prev => [...prev, ...data.files])
      }

      setNextPageToken(data.nextPageToken || null)
      setHasMore(!!data.nextPageToken)

    } catch (err) {
      console.error('Error fetching Drive files:', err)
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
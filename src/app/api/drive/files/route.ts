import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !('accessToken' in session)) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const accessToken = (session as { accessToken: string }).accessToken
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const drive = google.drive({ version: 'v3', auth })

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const pageToken = searchParams.get('pageToken')
    const pageSize = parseInt(searchParams.get('pageSize') || '50')
    const query = searchParams.get('q') || "trashed=false"

    const response = await drive.files.list({
      pageSize,
      pageToken: pageToken || undefined,
      fields: 'nextPageToken, files(id, name, size, mimeType, modifiedTime, createdTime, webViewLink, webContentLink, thumbnailLink, parents, owners, permissions)',
      q: query,
      orderBy: 'modifiedTime desc'
    })

    const files = response.data.files || []
    
    // Enhance files with additional metadata for tokenization
    const enhancedFiles = files.map(file => ({
      id: file.id,
      name: file.name,
      size: file.size ? parseInt(file.size) : 0,
      mimeType: file.mimeType,
      modifiedTime: file.modifiedTime,
      createdTime: file.createdTime,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      thumbnailLink: file.thumbnailLink,
      parents: file.parents,
      owners: file.owners,
      permissions: file.permissions,
      source: 'google_drive',
      isTokenized: false, // We'll check this against our database later
      canTokenize: true, // All Drive files can potentially be tokenized
      estimatedValue: calculateEstimatedValue(file), // Helper function for initial valuation
    }))

    return NextResponse.json({
      files: enhancedFiles,
      nextPageToken: response.data.nextPageToken,
      totalFiles: files.length
    })

  } catch (error) {
    console.error('Google Drive API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Google Drive files' }, 
      { status: 500 }
    )
  }
}

// Helper function to estimate file value for tokenization
function calculateEstimatedValue(file: { size?: string | null; mimeType?: string | null }) {
  const sizeInMB = file.size ? parseInt(file.size) / (1024 * 1024) : 0
  const baseValue = 0.001 // Base value in BSV
  
  // Value based on file type and size
  let multiplier = 1
  
  if (file.mimeType?.startsWith('video/')) {
    multiplier = 3 // Videos are generally more valuable
  } else if (file.mimeType?.startsWith('audio/')) {
    multiplier = 2 // Audio files
  } else if (file.mimeType?.includes('pdf') || file.mimeType?.includes('document')) {
    multiplier = 1.5 // Documents
  }
  
  // Size factor (larger files generally more valuable)
  const sizeFactor = Math.log10(Math.max(sizeInMB, 1)) / 2
  
  return Number((baseValue * multiplier * (1 + sizeFactor)).toFixed(6))
}
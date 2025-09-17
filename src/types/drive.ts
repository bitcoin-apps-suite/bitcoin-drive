export interface GoogleDriveFile {
  id: string
  name: string
  size: number
  mimeType: string
  modifiedTime: string
  createdTime: string
  webViewLink?: string
  webContentLink?: string
  thumbnailLink?: string
  parents?: string[]
  owners?: Array<{
    displayName: string
    emailAddress: string
    photoLink?: string
  }>
  permissions?: Array<{
    id: string
    type: string
    role: string
    emailAddress?: string
  }>
  source: 'google_drive'
  isTokenized: boolean
  canTokenize: boolean
  estimatedValue: number
}

export interface DriveFilesResponse {
  files: GoogleDriveFile[]
  nextPageToken?: string
  totalFiles: number
}

export interface TokenizationContainer {
  fileId: string
  fileName: string
  fileSource: 'google_drive' | 'local' | 'aws' | 'supabase'
  containerAddress: string // BSV blockchain address
  nftTokenId: string
  ftTokenSymbol: string
  totalShares: number
  sharePrice: number // in BSV
  accessPricing: {
    viewPrice: number
    downloadPrice: number
    executePrice?: number
  }
  revenueDistribution: {
    creatorShare: number // percentage
    holderShare: number // percentage
    platformShare: number // percentage
  }
  createdAt: string
  updatedAt: string
}
import { google } from 'googleapis'
import crypto from 'crypto'

export interface StorageMetadata {
  fileId: string
  fileName: string
  fileSize: number
  mimeType: string
  sha256Hash: string
  googleDriveId?: string
  blockchainTxId?: string
  timelockUntil?: Date
  encryptionKey?: string
  createdAt: Date
  updatedAt: Date
}

export interface TimelockConfig {
  enabled: boolean
  unlockDate: Date
  unlockConditions?: {
    type: 'time' | 'payment' | 'multisig'
    value: unknown
  }[]
}

export class HybridStorage {
  private drive: ReturnType<typeof google.drive>
  
  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    this.drive = google.drive({ version: 'v3', auth })
  }

  /**
   * Upload file to Google Drive and store hash on blockchain
   */
  async uploadFile(
    file: Buffer,
    fileName: string,
    mimeType: string,
    options?: {
      timelock?: TimelockConfig
      encrypt?: boolean
      folder?: string
    }
  ): Promise<StorageMetadata> {
    const fileId = crypto.randomBytes(16).toString('hex')
    const sha256Hash = crypto.createHash('sha256').update(file).digest('hex')
    
    let processedFile = file
    let encryptionKey: string | undefined
    
    // Encrypt file if requested
    if (options?.encrypt) {
      const result = this.encryptFile(file)
      processedFile = result.encrypted
      encryptionKey = result.key
    }
    
    // Upload to Google Drive
    const driveResponse = await this.drive.files.create({
      requestBody: {
        name: `${fileId}_${fileName}`,
        parents: options?.folder ? [options.folder] : undefined
      },
      media: {
        mimeType,
        body: processedFile
      },
      fields: 'id, name, size'
    })
    
    const googleDriveId = driveResponse.data.id
    
    // Store hash on blockchain (stub for now)
    const blockchainTxId = await this.storeHashOnBlockchain(
      sha256Hash,
      {
        fileId,
        fileName,
        googleDriveId,
        timelock: options?.timelock
      }
    )
    
    const metadata: StorageMetadata = {
      fileId,
      fileName,
      fileSize: processedFile.length,
      mimeType,
      sha256Hash,
      googleDriveId: googleDriveId || undefined,
      blockchainTxId,
      timelockUntil: options?.timelock?.unlockDate,
      encryptionKey,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return metadata
  }

  /**
   * Retrieve file from Google Drive and verify against blockchain hash
   */
  async retrieveFile(
    fileId: string,
    googleDriveId: string,
    expectedHash: string,
    encryptionKey?: string
  ): Promise<{ file: Buffer; verified: boolean }> {
    // Download from Google Drive
    const response = await this.drive.files.get(
      { fileId: googleDriveId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )
    
    let file = Buffer.from(response.data as ArrayBuffer)
    
    // Decrypt if needed
    if (encryptionKey) {
      file = Buffer.from(this.decryptFile(file, encryptionKey))
    }
    
    // Verify hash
    const actualHash = crypto.createHash('sha256').update(file).digest('hex')
    const verified = actualHash === expectedHash
    
    return { file, verified }
  }

  /**
   * Check if a timelock has expired
   */
  async checkTimelockStatus(metadata: StorageMetadata): Promise<boolean> {
    if (!metadata.timelockUntil) return true
    
    const now = new Date()
    return now >= metadata.timelockUntil
  }

  /**
   * Encrypt file data
   */
  private encryptFile(data: Buffer): { encrypted: Buffer; key: string } {
    const algorithm = 'aes-256-cbc'
    const key = crypto.randomBytes(32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    const encrypted = Buffer.concat([
      iv,
      cipher.update(data),
      cipher.final()
    ])
    
    return {
      encrypted,
      key: key.toString('hex')
    }
  }

  /**
   * Decrypt file data
   */
  private decryptFile(data: Buffer, keyHex: string): Buffer {
    const algorithm = 'aes-256-cbc'
    const key = Buffer.from(keyHex, 'hex')
    const iv = data.slice(0, 16)
    const encrypted = data.slice(16)
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv)
    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ])
  }

  /**
   * Store file hash and metadata on blockchain
   * This is a stub - actual implementation would use BSV SDK
   */
  private async storeHashOnBlockchain(
    hash: string,
    metadata: unknown
  ): Promise<string> {
    // TODO: Implement actual BSV blockchain storage
    // For now, return a mock transaction ID
    console.log('Storing on blockchain:', { hash, metadata })
    return `mock_tx_${crypto.randomBytes(16).toString('hex')}`
  }

  /**
   * Create a shareable link with optional payment requirements
   */
  async createShareableLink(
    _fileId: string,
    _options?: {
      requirePayment?: boolean
      amount?: number
      recipientAddress?: string
      expiresAt?: Date
    }
  ): Promise<string> {
    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex')
    
    // Store share configuration
    // TODO: Store in database with payment requirements
    
    // Return shareable link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003'
    return `${baseUrl}/share/${shareToken}`
  }

  /**
   * Share file on Twitter
   */
  async shareOnTwitter(
    fileId: string,
    message: string,
    metadata: StorageMetadata
  ): Promise<string> {
    // Create shareable link
    const shareLink = await this.createShareableLink(fileId)
    
    // Compose tweet
    const tweet = `${message}\n\nFile: ${metadata.fileName}\nHash: ${metadata.sha256Hash.substring(0, 12)}...\nAccess: ${shareLink}`
    
    // Return Twitter intent URL (actual posting would require Twitter API)
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`
  }
}
/**
 * .NFT Container Format for Bitcoin Drive
 * Wraps any file in a tokenizable container with metadata
 * 
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

import crypto from 'crypto'

export interface NFTMetadata {
  version: '1.0.0'
  fileHash: string
  fileName: string
  fileSize: number
  mimeType: string
  creator: string
  createdAt: Date
  description?: string
  thumbnail?: string
  
  // Monetization settings
  monetization: {
    models: Array<{
      type: 'pay-per-view' | 'pay-per-second' | 'pay-per-download' | 'subscription'
      price: number
      currency: 'BSV' | 'USD'
      duration?: number // for time-based models
    }>
    revenueAddress: string // File-specific BSV address
    minimumPayment?: number
  }
  
  // Token protocol settings
  tokenProtocol: {
    standard: 'STAS' | 'Run' | 'Sensible' | 'GorillaPool' | 'SimpleFT' | 'Custom'
    totalSupply: number
    decimals: number
    symbol: string
    name: string
    // Revenue distribution rules
    distribution: {
      automatic: boolean
      frequency: 'instant' | 'daily' | 'weekly' | 'monthly'
      minimumPayout: number
    }
  }
  
  // Rights and royalties
  rights: {
    license: 'exclusive' | 'non-exclusive' | 'creative-commons' | 'custom'
    royaltyPercentage: number // 0-25%
    transferable: boolean
    resellable: boolean
    commercialUse: boolean
  }
  
  // Content protection
  protection: {
    encrypted: boolean
    watermarked: boolean
    drm: boolean
    expiryDate?: Date
  }
}

export class NFTContainer {
  private metadata: NFTMetadata
  private fileData: Buffer
  private signature?: string
  
  constructor(file: Buffer, metadata: Partial<NFTMetadata>) {
    const fileHash = crypto.createHash('sha256').update(file).digest('hex')
    
    this.fileData = file
    this.metadata = {
      version: '1.0.0',
      fileHash,
      fileName: metadata.fileName || 'untitled',
      fileSize: file.length,
      mimeType: metadata.mimeType || 'application/octet-stream',
      creator: metadata.creator || '',
      createdAt: new Date(),
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      monetization: metadata.monetization || {
        models: [{
          type: 'pay-per-download',
          price: 0.01,
          currency: 'BSV'
        }],
        revenueAddress: this.generateRevenueAddress(fileHash)
      },
      tokenProtocol: metadata.tokenProtocol || {
        standard: 'STAS',
        totalSupply: 1000000,
        decimals: 8,
        symbol: 'FILE',
        name: `${metadata.fileName} Token`,
        distribution: {
          automatic: true,
          frequency: 'instant',
          minimumPayout: 0.00001
        }
      },
      rights: metadata.rights || {
        license: 'exclusive',
        royaltyPercentage: 10,
        transferable: true,
        resellable: true,
        commercialUse: false
      },
      protection: metadata.protection || {
        encrypted: false,
        watermarked: false,
        drm: false
      }
    }
  }
  
  /**
   * Generate a unique BSV address for this file's revenue
   */
  private generateRevenueAddress(fileHash: string): string {
    // In production, this would generate a real BSV address
    // For now, return a deterministic mock address
    const addressHash = crypto.createHash('sha256')
      .update(`revenue_${fileHash}`)
      .digest('hex')
    return `1File${addressHash.substring(0, 30)}`
  }
  
  /**
   * Package the file and metadata into .NFT format
   */
  package(): Buffer {
    const container = {
      magic: 'NFT\x00', // Magic bytes to identify .NFT files
      version: this.metadata.version,
      metadata: this.metadata,
      signature: this.signature,
      data: this.fileData.toString('base64')
    }
    
    return Buffer.from(JSON.stringify(container))
  }
  
  /**
   * Unpack a .NFT container
   */
  static unpack(containerData: Buffer): { metadata: NFTMetadata, file: Buffer } {
    const container = JSON.parse(containerData.toString())
    
    if (container.magic !== 'NFT\x00') {
      throw new Error('Invalid .NFT container format')
    }
    
    return {
      metadata: container.metadata,
      file: Buffer.from(container.data, 'base64')
    }
  }
  
  /**
   * Calculate revenue distribution for token holders
   */
  calculateDistribution(totalRevenue: number, tokenHolders: Map<string, number>): Map<string, number> {
    const distribution = new Map<string, number>()
    const totalTokens = Array.from(tokenHolders.values()).reduce((a, b) => a + b, 0)
    
    // Deduct royalty first
    const royalty = totalRevenue * (this.metadata.rights.royaltyPercentage / 100)
    const distributableRevenue = totalRevenue - royalty
    
    // Add creator royalty
    distribution.set(this.metadata.creator, royalty)
    
    // Distribute remaining to token holders
    for (const [holder, tokens] of tokenHolders) {
      const percentage = tokens / totalTokens
      const payout = distributableRevenue * percentage
      
      if (payout >= this.metadata.tokenProtocol.distribution.minimumPayout) {
        const existing = distribution.get(holder) || 0
        distribution.set(holder, existing + payout)
      }
    }
    
    return distribution
  }
  
  /**
   * Add watermark to media files
   */
  addWatermark(watermarkText: string): void {
    if (this.metadata.mimeType.startsWith('image/') || 
        this.metadata.mimeType.startsWith('video/')) {
      // In production, use image/video processing libraries
      this.metadata.protection.watermarked = true
    }
  }
  
  /**
   * Encrypt the file data
   */
  encrypt(key: string): void {
    const cipher = crypto.createCipher('aes-256-cbc', key)
    this.fileData = Buffer.concat([
      cipher.update(this.fileData),
      cipher.final()
    ])
    this.metadata.protection.encrypted = true
  }
  
  /**
   * Sign the container with creator's key
   */
  sign(privateKey: string): void {
    const sign = crypto.createSign('SHA256')
    sign.write(JSON.stringify(this.metadata))
    sign.end()
    this.signature = sign.sign(privateKey, 'hex')
  }
  
  /**
   * Get monetization options for UI display
   */
  getMonetizationOptions() {
    return {
      models: this.metadata.monetization.models,
      revenueAddress: this.metadata.monetization.revenueAddress,
      tokenInfo: {
        standard: this.metadata.tokenProtocol.standard,
        symbol: this.metadata.tokenProtocol.symbol,
        totalSupply: this.metadata.tokenProtocol.totalSupply,
        available: this.metadata.tokenProtocol.totalSupply // Would track actual available
      },
      estimatedRevenue: this.estimateRevenue()
    }
  }
  
  /**
   * Estimate potential revenue based on settings
   */
  private estimateRevenue(): { daily: number, monthly: number, yearly: number } {
    // Mock calculation - in production would use historical data
    const basePrice = this.metadata.monetization.models[0]?.price || 0
    return {
      daily: basePrice * 10,
      monthly: basePrice * 300,
      yearly: basePrice * 3650
    }
  }
}

/**
 * Token Protocol Implementations
 */
export const TOKEN_PROTOCOLS = {
  STAS: {
    name: 'STAS (Satoshi Token Asset Standard)',
    description: 'Simple, efficient fungible tokens',
    features: ['Low cost', 'Native BSV', 'Simple transfers'],
    gasEstimate: 0.00001
  },
  Run: {
    name: 'Run Protocol',
    description: 'Interactive smart contracts and tokens',
    features: ['Interactive tokens', 'On-chain state', 'Complex logic'],
    gasEstimate: 0.00005
  },
  Sensible: {
    name: 'Sensible Contract',
    description: 'Advanced smart contract platform',
    features: ['Advanced features', 'Cross-chain', 'DeFi ready'],
    gasEstimate: 0.00008
  },
  GorillaPool: {
    name: 'GorillaPool Tokens',
    description: 'Mining pool integrated tokens',
    features: ['Mining rewards', 'Pool integration', 'Staking'],
    gasEstimate: 0.00003
  },
  SimpleFT: {
    name: 'Simple Fungible Tokens',
    description: 'Minimal complexity fungible tokens',
    features: ['Ultra low cost', 'Basic transfers', 'Easy integration'],
    gasEstimate: 0.000005
  },
  Custom: {
    name: 'Custom Protocol',
    description: 'Bring your own token standard',
    features: ['Flexible', 'Custom logic', 'Full control'],
    gasEstimate: 0.0001
  }
}

/**
 * Revenue Models
 */
export const REVENUE_MODELS = {
  'pay-per-view': {
    name: 'Pay Per View',
    description: 'One-time payment to view content',
    icon: '👁️',
    recommended: ['video', 'image', 'document']
  },
  'pay-per-second': {
    name: 'Pay Per Second',
    description: 'Streaming payment by time watched',
    icon: '⏱️',
    recommended: ['video', 'audio', 'live-stream']
  },
  'pay-per-download': {
    name: 'Pay Per Download',
    description: 'Payment to download file',
    icon: '⬇️',
    recommended: ['software', 'document', 'archive']
  },
  'subscription': {
    name: 'Subscription',
    description: 'Recurring access payment',
    icon: '🔄',
    recommended: ['collection', 'series', 'updates']
  }
}
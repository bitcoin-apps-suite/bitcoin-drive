/**
 * Wallet Manager for Bitcoin Drive
 * Handles native wallets, HandCash integration, and BSV credit system
 * 
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

import crypto from 'crypto'

export interface Wallet {
  id: string
  type: 'native' | 'handcash'
  address: string
  balance: number // in BSV
  credits: number // purchased via Stripe
  userId: string
  createdAt: Date
  lastActivity: Date
}

export interface Transaction {
  id: string
  walletId: string
  type: 'credit' | 'debit' | 'revenue' | 'distribution'
  amount: number
  description: string
  metadata?: {
    fileId?: string
    tokenId?: string
    stripePaymentId?: string
    txid?: string
  }
  timestamp: Date
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number // USD per month
  bsvCredits: number // BSV credits included
  features: string[]
  limits: {
    storageGB: number
    uploadsPerMonth: number
    tokenizations: number
    revenueShare: number // percentage taken by platform
  }
}

export class WalletManager {
  private wallets: Map<string, Wallet> = new Map()
  private transactions: Transaction[] = []
  
  // Subscription plans
  static readonly PLANS: Record<string, SubscriptionPlan> = {
    free: {
      id: 'free',
      name: 'Free',
      price: 0,
      bsvCredits: 0.001, // Small amount for testing
      features: [
        '1GB storage',
        '10 uploads/month',
        'Basic tokenization'
      ],
      limits: {
        storageGB: 1,
        uploadsPerMonth: 10,
        tokenizations: 5,
        revenueShare: 20 // Platform takes 20%
      }
    },
    starter: {
      id: 'starter',
      name: 'Starter',
      price: 9.99,
      bsvCredits: 0.1,
      features: [
        '10GB storage',
        '100 uploads/month',
        'Advanced tokenization',
        'All token protocols'
      ],
      limits: {
        storageGB: 10,
        uploadsPerMonth: 100,
        tokenizations: 50,
        revenueShare: 15
      }
    },
    pro: {
      id: 'pro',
      name: 'Professional',
      price: 29.99,
      bsvCredits: 0.5,
      features: [
        '100GB storage',
        'Unlimited uploads',
        'Unlimited tokenization',
        'Priority support',
        'Advanced analytics'
      ],
      limits: {
        storageGB: 100,
        uploadsPerMonth: -1, // unlimited
        tokenizations: -1,
        revenueShare: 10
      }
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99.99,
      bsvCredits: 2.0,
      features: [
        'Unlimited storage',
        'Unlimited everything',
        'Custom token protocols',
        'White label options',
        'Dedicated support',
        'SLA guarantee'
      ],
      limits: {
        storageGB: -1,
        uploadsPerMonth: -1,
        tokenizations: -1,
        revenueShare: 5
      }
    }
  }
  
  /**
   * Create or get native wallet for user
   */
  async createNativeWallet(userId: string): Promise<Wallet> {
    const existing = this.getUserWallet(userId, 'native')
    if (existing) return existing
    
    const wallet: Wallet = {
      id: crypto.randomBytes(16).toString('hex'),
      type: 'native',
      address: this.generateBSVAddress(),
      balance: 0,
      credits: 0,
      userId,
      createdAt: new Date(),
      lastActivity: new Date()
    }
    
    this.wallets.set(wallet.id, wallet)
    return wallet
  }
  
  /**
   * Link HandCash wallet
   */
  async linkHandCashWallet(userId: string, handle: string, authToken: string): Promise<Wallet> {
    // In production, verify with HandCash API
    const wallet: Wallet = {
      id: `handcash_${handle}`,
      type: 'handcash',
      address: `${handle}@handcash.io`,
      balance: 0, // Would fetch from HandCash
      credits: 0,
      userId,
      createdAt: new Date(),
      lastActivity: new Date()
    }
    
    this.wallets.set(wallet.id, wallet)
    return wallet
  }
  
  /**
   * Add credits from Stripe payment
   */
  async addCreditsFromStripe(
    userId: string,
    amountUSD: number,
    stripePaymentId: string
  ): Promise<Transaction> {
    const wallet = await this.getOrCreateWallet(userId)
    
    // Convert USD to BSV credits (mock rate)
    const bsvRate = 50 // $50 per BSV
    const bsvAmount = amountUSD / bsvRate
    
    wallet.credits += bsvAmount
    wallet.lastActivity = new Date()
    
    const transaction: Transaction = {
      id: crypto.randomBytes(16).toString('hex'),
      walletId: wallet.id,
      type: 'credit',
      amount: bsvAmount,
      description: `Purchased ${bsvAmount.toFixed(8)} BSV credits`,
      metadata: { stripePaymentId },
      timestamp: new Date()
    }
    
    this.transactions.push(transaction)
    return transaction
  }
  
  /**
   * Process subscription and credit account
   */
  async processSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId: string
  ): Promise<void> {
    const plan = WalletManager.PLANS[planId]
    if (!plan) throw new Error('Invalid plan')
    
    const wallet = await this.getOrCreateWallet(userId)
    
    // Add monthly credits
    wallet.credits += plan.bsvCredits
    
    // Record transaction
    const transaction: Transaction = {
      id: crypto.randomBytes(16).toString('hex'),
      walletId: wallet.id,
      type: 'credit',
      amount: plan.bsvCredits,
      description: `${plan.name} subscription credits`,
      metadata: { stripePaymentId: stripeSubscriptionId },
      timestamp: new Date()
    }
    
    this.transactions.push(transaction)
  }
  
  /**
   * Deduct credits for blockchain operation
   */
  async deductCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> {
    const wallet = await this.getOrCreateWallet(userId)
    
    if (wallet.credits < amount) {
      return false // Insufficient credits
    }
    
    wallet.credits -= amount
    wallet.lastActivity = new Date()
    
    const transaction: Transaction = {
      id: crypto.randomBytes(16).toString('hex'),
      walletId: wallet.id,
      type: 'debit',
      amount,
      description,
      metadata,
      timestamp: new Date()
    }
    
    this.transactions.push(transaction)
    return true
  }
  
  /**
   * Distribute revenue to token holders
   */
  async distributeRevenue(
    fileId: string,
    totalRevenue: number,
    distributions: Map<string, number>
  ): Promise<void> {
    for (const [userId, amount] of distributions) {
      const wallet = await this.getOrCreateWallet(userId)
      
      wallet.balance += amount
      wallet.lastActivity = new Date()
      
      const transaction: Transaction = {
        id: crypto.randomBytes(16).toString('hex'),
        walletId: wallet.id,
        type: 'revenue',
        amount,
        description: `Revenue from file ${fileId}`,
        metadata: { fileId },
        timestamp: new Date()
      }
      
      this.transactions.push(transaction)
    }
  }
  
  /**
   * Get or create wallet for user
   */
  private async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = this.getUserWallet(userId, 'native')
    if (!wallet) {
      wallet = await this.createNativeWallet(userId)
    }
    return wallet
  }
  
  /**
   * Get user's wallet
   */
  private getUserWallet(userId: string, type: 'native' | 'handcash'): Wallet | undefined {
    return Array.from(this.wallets.values()).find(
      w => w.userId === userId && w.type === type
    )
  }
  
  /**
   * Generate BSV address (mock)
   */
  private generateBSVAddress(): string {
    const hash = crypto.randomBytes(20).toString('hex')
    return `1${hash.substring(0, 33).toUpperCase()}`
  }
  
  /**
   * Get wallet balance and credits
   */
  async getWalletInfo(userId: string): Promise<{
    balance: number
    credits: number
    totalValue: number
    transactions: Transaction[]
  }> {
    const wallet = await this.getOrCreateWallet(userId)
    const userTransactions = this.transactions.filter(t => t.walletId === wallet.id)
    
    return {
      balance: wallet.balance,
      credits: wallet.credits,
      totalValue: wallet.balance + wallet.credits,
      transactions: userTransactions.slice(-10) // Last 10 transactions
    }
  }
  
  /**
   * Estimate operation cost
   */
  static estimateCost(operation: {
    type: 'upload' | 'tokenize' | 'transfer'
    size?: number
    protocol?: string
  }): number {
    switch (operation.type) {
      case 'upload':
        // Cost based on size
        const kb = (operation.size || 0) / 1024
        return kb * 0.00001
      
      case 'tokenize':
        // Cost based on protocol
        const protocolCosts: Record<string, number> = {
          'STAS': 0.001,
          'Run': 0.005,
          'Sensible': 0.008,
          'SimpleFT': 0.0005
        }
        return protocolCosts[operation.protocol || 'STAS'] || 0.001
      
      case 'transfer':
        return 0.00001 // Basic transfer cost
      
      default:
        return 0.001
    }
  }
}

/**
 * Credit packages for one-time purchases
 */
export const CREDIT_PACKAGES = [
  {
    id: 'small',
    name: 'Small Pack',
    usd: 5,
    bsv: 0.1,
    bonus: 0
  },
  {
    id: 'medium',
    name: 'Medium Pack',
    usd: 20,
    bsv: 0.5,
    bonus: 0.05 // 10% bonus
  },
  {
    id: 'large',
    name: 'Large Pack',
    usd: 50,
    bsv: 1.5,
    bonus: 0.3 // 20% bonus
  },
  {
    id: 'whale',
    name: 'Whale Pack',
    usd: 200,
    bsv: 10,
    bonus: 2.5 // 25% bonus
  }
]
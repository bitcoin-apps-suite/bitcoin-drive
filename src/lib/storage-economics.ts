/**
 * Storage Economics Engine
 * Calculates optimal storage allocation across providers
 * and manages profit margins for Bitcoin Drive
 * 
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

export interface StorageProvider {
  id: string
  name: string
  costPerGB: number // Monthly cost in USD
  egressPerGB: number // Bandwidth cost per GB
  minStorage: number // Minimum storage in GB
  maxStorage: number // Maximum storage in GB (Infinity for unlimited)
  freeTeir?: number // Free tier in GB if available
  features: string[]
  reliability: number // 0-100 score
  speed: number // 0-100 score
  regions: string[]
}

export interface StorageTier {
  name: string
  price: number // Monthly price in USD
  storage: number // GB
  features: string[]
  allocation: ProviderAllocation[]
  margin: number // Profit margin percentage
  costBreakdown: CostBreakdown
}

export interface ProviderAllocation {
  provider: string
  amount: number // GB
  cost: number // Monthly cost
  purpose: 'primary' | 'backup' | 'cdn' | 'archive'
}

export interface CostBreakdown {
  storageCost: number
  egressCost: number
  operationalCost: number
  totalCost: number
  revenue: number
  profit: number
  marginPercent: number
}

// Current market rates for storage providers (as of 2024)
export const STORAGE_PROVIDERS: Record<string, StorageProvider> = {
  cloudflare_r2: {
    id: 'cloudflare_r2',
    name: 'Cloudflare R2',
    costPerGB: 0.015, // $0.015/GB/month
    egressPerGB: 0, // Free egress!
    minStorage: 0,
    maxStorage: Infinity,
    freeTeir: 10, // 10GB free
    features: ['No egress fees', 'S3 compatible', 'Global CDN'],
    reliability: 95,
    speed: 95,
    regions: ['global']
  },
  aws_s3: {
    id: 'aws_s3',
    name: 'AWS S3 Standard',
    costPerGB: 0.023, // First 50TB
    egressPerGB: 0.09, // First 10TB/month
    minStorage: 0,
    maxStorage: Infinity,
    freeTeir: 5, // 5GB free tier (first year)
    features: ['Industry standard', '99.999999999% durability', 'Extensive tooling'],
    reliability: 99,
    speed: 90,
    regions: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1']
  },
  aws_s3_glacier: {
    id: 'aws_s3_glacier',
    name: 'AWS S3 Glacier Instant',
    costPerGB: 0.004, // Much cheaper for archival
    egressPerGB: 0.09,
    minStorage: 0,
    maxStorage: Infinity,
    features: ['Long-term storage', 'Millisecond retrieval', 'Very cheap'],
    reliability: 99,
    speed: 60,
    regions: ['us-east-1', 'us-west-2', 'eu-west-1']
  },
  backblaze_b2: {
    id: 'backblaze_b2',
    name: 'Backblaze B2',
    costPerGB: 0.006, // $6/TB/month
    egressPerGB: 0.01, // First 3x storage free, then $0.01/GB
    minStorage: 0,
    maxStorage: Infinity,
    freeTeir: 10, // 10GB free
    features: ['Very affordable', 'S3 compatible', 'Simple pricing'],
    reliability: 90,
    speed: 80,
    regions: ['us-west', 'eu-central']
  },
  google_cloud: {
    id: 'google_cloud',
    name: 'Google Cloud Storage',
    costPerGB: 0.020, // Standard storage
    egressPerGB: 0.12, // First 1GB free, then $0.12/GB
    minStorage: 0,
    maxStorage: Infinity,
    freeTeir: 5, // 5GB free
    features: ['Google infrastructure', 'Multi-region', 'Strong ML integration'],
    reliability: 98,
    speed: 92,
    regions: ['us', 'eu', 'asia']
  },
  supabase: {
    id: 'supabase',
    name: 'Supabase Storage',
    costPerGB: 0.021, // $0.021/GB/month
    egressPerGB: 0.09, // $0.09/GB
    minStorage: 0,
    maxStorage: 100, // Soft limit
    freeTeir: 1, // 1GB free
    features: ['Integrated auth', 'Row level security', 'Real-time subscriptions'],
    reliability: 85,
    speed: 85,
    regions: ['us-east', 'eu-west', 'ap-southeast']
  },
  wasabi: {
    id: 'wasabi',
    name: 'Wasabi',
    costPerGB: 0.0069, // $6.99/TB/month (1TB minimum)
    egressPerGB: 0, // Free egress!
    minStorage: 1000, // 1TB minimum
    maxStorage: Infinity,
    features: ['No egress fees', 'S3 compatible', 'Fast hot storage'],
    reliability: 92,
    speed: 88,
    regions: ['us-east', 'us-west', 'eu', 'ap-northeast']
  }
}

// Bitcoin Drive Storage Tiers
export const STORAGE_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    storage: 5, // 5GB
    features: [
      '5GB Storage',
      'Basic encryption',
      'Public sharing',
      'BSV timestamps'
    ]
  },
  pro: {
    name: 'Pro',
    price: 9.99,
    storage: 100, // 100GB
    features: [
      '100GB Storage',
      'Advanced encryption',
      'NFT creation',
      'Priority support',
      'Multi-region backup',
      'Custom domains'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 49.99,
    storage: 1000, // 1TB
    features: [
      '1TB Storage',
      'Multi-sig security',
      'Custom domains',
      'API access',
      'Dedicated support',
      'SLA guarantee',
      'Global CDN',
      'Advanced analytics'
    ]
  }
}

/**
 * Calculate optimal storage allocation across providers
 * Maximizes reliability and speed while minimizing cost
 */
export function calculateOptimalAllocation(
  storageGB: number,
  tier: 'free' | 'pro' | 'enterprise'
): ProviderAllocation[] {
  const allocations: ProviderAllocation[] = []
  
  if (tier === 'free') {
    // Use only free tiers
    allocations.push({
      provider: 'cloudflare_r2',
      amount: Math.min(storageGB, 5),
      cost: 0,
      purpose: 'primary'
    })
  } else if (tier === 'pro') {
    // Primary: Cloudflare R2 (cheapest with free egress)
    const primaryAmount = Math.min(storageGB * 0.7, 70)
    allocations.push({
      provider: 'cloudflare_r2',
      amount: primaryAmount,
      cost: Math.max(0, (primaryAmount - 10) * STORAGE_PROVIDERS.cloudflare_r2.costPerGB),
      purpose: 'primary'
    })
    
    // Backup: Backblaze B2 (very cheap)
    const backupAmount = Math.min(storageGB * 0.3, 30)
    allocations.push({
      provider: 'backblaze_b2',
      amount: backupAmount,
      cost: Math.max(0, (backupAmount - 10) * STORAGE_PROVIDERS.backblaze_b2.costPerGB),
      purpose: 'backup'
    })
  } else if (tier === 'enterprise') {
    // Primary: AWS S3 (most reliable)
    allocations.push({
      provider: 'aws_s3',
      amount: storageGB * 0.4,
      cost: storageGB * 0.4 * STORAGE_PROVIDERS.aws_s3.costPerGB,
      purpose: 'primary'
    })
    
    // CDN: Cloudflare R2 (free egress for global distribution)
    allocations.push({
      provider: 'cloudflare_r2',
      amount: storageGB * 0.3,
      cost: storageGB * 0.3 * STORAGE_PROVIDERS.cloudflare_r2.costPerGB,
      purpose: 'cdn'
    })
    
    // Backup: Multiple providers for redundancy
    allocations.push({
      provider: 'backblaze_b2',
      amount: storageGB * 0.15,
      cost: storageGB * 0.15 * STORAGE_PROVIDERS.backblaze_b2.costPerGB,
      purpose: 'backup'
    })
    
    // Archive: Glacier for long-term storage
    allocations.push({
      provider: 'aws_s3_glacier',
      amount: storageGB * 0.15,
      cost: storageGB * 0.15 * STORAGE_PROVIDERS.aws_s3_glacier.costPerGB,
      purpose: 'archive'
    })
  }
  
  return allocations
}

/**
 * Calculate cost breakdown and profit margins
 */
export function calculateCostBreakdown(
  tier: 'free' | 'pro' | 'enterprise',
  allocations: ProviderAllocation[]
): CostBreakdown {
  const tierConfig = STORAGE_TIERS[tier]
  
  // Calculate storage costs
  const storageCost = allocations.reduce((sum, alloc) => sum + alloc.cost, 0)
  
  // Estimate egress costs (assuming 10% of storage is downloaded monthly)
  const egressCost = allocations.reduce((sum, alloc) => {
    const provider = STORAGE_PROVIDERS[alloc.provider]
    return sum + (alloc.amount * 0.1 * provider.egressPerGB)
  }, 0)
  
  // Operational costs (support, infrastructure, development)
  const operationalCost = tier === 'free' ? 0 : 
                          tier === 'pro' ? 1.5 : // $1.50 per user
                          5 // $5 per enterprise user
  
  const totalCost = storageCost + egressCost + operationalCost
  const revenue = tierConfig.price
  const profit = revenue - totalCost
  const marginPercent = revenue > 0 ? (profit / revenue) * 100 : 0
  
  return {
    storageCost,
    egressCost,
    operationalCost,
    totalCost,
    revenue,
    profit,
    marginPercent
  }
}

/**
 * Generate a complete storage tier with allocations and economics
 */
export function generateStorageTier(tier: 'free' | 'pro' | 'enterprise'): StorageTier {
  const tierConfig = STORAGE_TIERS[tier]
  const allocations = calculateOptimalAllocation(tierConfig.storage, tier)
  const costBreakdown = calculateCostBreakdown(tier, allocations)
  
  return {
    name: tierConfig.name,
    price: tierConfig.price,
    storage: tierConfig.storage,
    features: tierConfig.features,
    allocation: allocations,
    margin: costBreakdown.marginPercent,
    costBreakdown
  }
}

/**
 * Smart routing: Select best provider based on file characteristics
 */
export function selectProviderForFile(
  fileSize: number, // in bytes
  fileType: string,
  accessPattern: 'hot' | 'warm' | 'cold',
  userTier: 'free' | 'pro' | 'enterprise'
): string {
  // Free tier always uses Cloudflare R2
  if (userTier === 'free') {
    return 'cloudflare_r2'
  }
  
  // Large files (>100MB) go to cheapest provider with free egress
  if (fileSize > 100 * 1024 * 1024) {
    return 'cloudflare_r2' // Free egress is crucial for large files
  }
  
  // Cold storage goes to Glacier
  if (accessPattern === 'cold' && userTier === 'enterprise') {
    return 'aws_s3_glacier'
  }
  
  // Media files need CDN
  if (['video', 'audio', 'image'].includes(fileType)) {
    return 'cloudflare_r2' // Built-in CDN with free egress
  }
  
  // Enterprise hot data needs maximum reliability
  if (userTier === 'enterprise' && accessPattern === 'hot') {
    return 'aws_s3'
  }
  
  // Default to most cost-effective
  return 'backblaze_b2'
}

/**
 * Calculate monthly revenue potential
 */
export function calculateMonthlyRevenue(
  freeUsers: number,
  proUsers: number,
  enterpriseUsers: number
): {
  revenue: number
  costs: number
  profit: number
  margin: number
} {
  const freeTier = generateStorageTier('free')
  const proTier = generateStorageTier('pro')
  const enterpriseTier = generateStorageTier('enterprise')
  
  const revenue = 
    (freeUsers * freeTier.price) +
    (proUsers * proTier.price) +
    (enterpriseUsers * enterpriseTier.price)
  
  const costs = 
    (freeUsers * freeTier.costBreakdown.totalCost) +
    (proUsers * proTier.costBreakdown.totalCost) +
    (enterpriseUsers * enterpriseTier.costBreakdown.totalCost)
  
  const profit = revenue - costs
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0
  
  return { revenue, costs, profit, margin }
}

// Example usage and testing
export function printStorageEconomics() {
  console.log('=== Bitcoin Drive Storage Economics ===\n')
  
  // Calculate economics for each tier
  const tiers = ['free', 'pro', 'enterprise'] as const
  
  tiers.forEach(tier => {
    const storageTier = generateStorageTier(tier)
    console.log(`${storageTier.name} Tier ($${storageTier.price}/mo for ${storageTier.storage}GB):`)
    console.log('  Allocations:')
    storageTier.allocation.forEach(alloc => {
      const provider = STORAGE_PROVIDERS[alloc.provider]
      console.log(`    - ${provider.name}: ${alloc.amount}GB (${alloc.purpose}) - $${alloc.cost.toFixed(2)}/mo`)
    })
    console.log('  Economics:')
    console.log(`    Storage Cost: $${storageTier.costBreakdown.storageCost.toFixed(2)}`)
    console.log(`    Egress Cost: $${storageTier.costBreakdown.egressCost.toFixed(2)}`)
    console.log(`    Operational: $${storageTier.costBreakdown.operationalCost.toFixed(2)}`)
    console.log(`    Total Cost: $${storageTier.costBreakdown.totalCost.toFixed(2)}`)
    console.log(`    Revenue: $${storageTier.costBreakdown.revenue.toFixed(2)}`)
    console.log(`    Profit: $${storageTier.costBreakdown.profit.toFixed(2)}`)
    console.log(`    Margin: ${storageTier.costBreakdown.marginPercent.toFixed(1)}%`)
    console.log()
  })
  
  // Calculate potential monthly revenue
  console.log('=== Monthly Revenue Projection ===')
  const projection = calculateMonthlyRevenue(1000, 100, 10)
  console.log(`  1000 Free + 100 Pro + 10 Enterprise users:`)
  console.log(`    Revenue: $${projection.revenue.toFixed(2)}`)
  console.log(`    Costs: $${projection.costs.toFixed(2)}`)
  console.log(`    Profit: $${projection.profit.toFixed(2)}`)
  console.log(`    Margin: ${projection.margin.toFixed(1)}%`)
}
/**
 * Provider Health Monitoring System
 * Tracks performance, costs, and reliability of storage providers
 * 
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

import { STORAGE_PROVIDERS, StorageProvider } from './storage-economics'

export interface ProviderHealthMetrics {
  providerId: string
  timestamp: number
  
  // Performance metrics
  responseTime: number // milliseconds
  uploadSpeed: number // MB/s
  downloadSpeed: number // MB/s
  uptime: number // percentage 0-100
  
  // Cost metrics
  actualCostPerGB: number // Real cost including fees
  egressCostPerGB: number // Actual egress costs
  overageCharges: number // Unexpected charges
  
  // Reliability metrics
  errorRate: number // percentage 0-100
  successfulUploads: number
  failedUploads: number
  
  // Regional performance
  regions: {
    [region: string]: {
      responseTime: number
      uptime: number
    }
  }
  
  // Health score (0-100)
  healthScore: number
}

export interface ProviderAlert {
  id: string
  providerId: string
  type: 'performance' | 'cost' | 'reliability' | 'outage'
  severity: 'info' | 'warning' | 'critical'
  message: string
  timestamp: number
  resolved: boolean
}

// Mock health data for demonstration
export const PROVIDER_HEALTH: Record<string, ProviderHealthMetrics> = {
  cloudflare_r2: {
    providerId: 'cloudflare_r2',
    timestamp: Date.now(),
    responseTime: 45,
    uploadSpeed: 85.2,
    downloadSpeed: 120.5,
    uptime: 99.97,
    actualCostPerGB: 0.015,
    egressCostPerGB: 0,
    overageCharges: 0,
    errorRate: 0.12,
    successfulUploads: 15847,
    failedUploads: 19,
    regions: {
      'us-east': { responseTime: 42, uptime: 99.98 },
      'eu-west': { responseTime: 48, uptime: 99.95 },
      'asia-pacific': { responseTime: 52, uptime: 99.97 }
    },
    healthScore: 98
  },
  aws_s3: {
    providerId: 'aws_s3',
    timestamp: Date.now(),
    responseTime: 35,
    uploadSpeed: 95.8,
    downloadSpeed: 145.2,
    uptime: 99.99,
    actualCostPerGB: 0.024, // Slightly higher due to request charges
    egressCostPerGB: 0.09,
    overageCharges: 12.50,
    errorRate: 0.05,
    successfulUploads: 8954,
    failedUploads: 4,
    regions: {
      'us-east-1': { responseTime: 32, uptime: 99.99 },
      'us-west-2': { responseTime: 38, uptime: 99.98 },
      'eu-west-1': { responseTime: 41, uptime: 99.99 }
    },
    healthScore: 97
  },
  backblaze_b2: {
    providerId: 'backblaze_b2',
    timestamp: Date.now(),
    responseTime: 78,
    uploadSpeed: 65.4,
    downloadSpeed: 88.7,
    uptime: 99.85,
    actualCostPerGB: 0.006,
    egressCostPerGB: 0.01,
    overageCharges: 0,
    errorRate: 0.25,
    successfulUploads: 5623,
    failedUploads: 14,
    regions: {
      'us-west': { responseTime: 72, uptime: 99.87 },
      'eu-central': { responseTime: 84, uptime: 99.82 }
    },
    healthScore: 89
  },
  google_cloud: {
    providerId: 'google_cloud',
    timestamp: Date.now(),
    responseTime: 41,
    uploadSpeed: 92.1,
    downloadSpeed: 134.8,
    uptime: 99.95,
    actualCostPerGB: 0.021,
    egressCostPerGB: 0.12,
    overageCharges: 8.75,
    errorRate: 0.08,
    successfulUploads: 7235,
    failedUploads: 6,
    regions: {
      'us': { responseTime: 38, uptime: 99.96 },
      'eu': { responseTime: 44, uptime: 99.94 },
      'asia': { responseTime: 48, uptime: 99.95 }
    },
    healthScore: 95
  },
  wasabi: {
    providerId: 'wasabi',
    timestamp: Date.now(),
    responseTime: 92,
    uploadSpeed: 58.3,
    downloadSpeed: 76.5,
    uptime: 99.78,
    actualCostPerGB: 0.0069,
    egressCostPerGB: 0,
    overageCharges: 0,
    errorRate: 0.35,
    successfulUploads: 3421,
    failedUploads: 12,
    regions: {
      'us-east': { responseTime: 88, uptime: 99.82 },
      'us-west': { responseTime: 96, uptime: 99.75 },
      'eu': { responseTime: 105, uptime: 99.77 }
    },
    healthScore: 85
  }
}

// Current alerts
export const PROVIDER_ALERTS: ProviderAlert[] = [
  {
    id: 'alert-001',
    providerId: 'backblaze_b2',
    type: 'performance',
    severity: 'warning',
    message: 'Response times elevated in EU region (84ms avg)',
    timestamp: Date.now() - 3600000, // 1 hour ago
    resolved: false
  },
  {
    id: 'alert-002',
    providerId: 'wasabi',
    type: 'reliability',
    severity: 'warning',
    message: 'Error rate above threshold (0.35%)',
    timestamp: Date.now() - 7200000, // 2 hours ago
    resolved: false
  },
  {
    id: 'alert-003',
    providerId: 'aws_s3',
    type: 'cost',
    severity: 'info',
    message: 'Overage charges detected: $12.50 for request costs',
    timestamp: Date.now() - 14400000, // 4 hours ago
    resolved: true
  }
]

/**
 * Calculate provider health score based on multiple factors
 */
export function calculateHealthScore(metrics: Omit<ProviderHealthMetrics, 'healthScore'>): number {
  // Weight factors
  const weights = {
    uptime: 0.3,        // 30% - Most important
    performance: 0.25,   // 25% - Response time + speeds
    reliability: 0.25,   // 25% - Error rates
    cost: 0.2           // 20% - Cost efficiency
  }
  
  // Uptime score (99.9% = 100 points)
  const uptimeScore = Math.min(100, (metrics.uptime / 99.9) * 100)
  
  // Performance score (based on response time - lower is better)
  const perfScore = Math.max(0, 100 - (metrics.responseTime / 2))
  
  // Reliability score (based on error rate - lower is better)
  const reliabilityScore = Math.max(0, 100 - (metrics.errorRate * 100))
  
  // Cost score (compare to market average)
  const avgCost = 0.015 // Market average
  const costScore = metrics.actualCostPerGB <= avgCost ? 100 : 
                   Math.max(0, 100 - ((metrics.actualCostPerGB - avgCost) / avgCost * 100))
  
  const totalScore = 
    (uptimeScore * weights.uptime) +
    (perfScore * weights.performance) +
    (reliabilityScore * weights.reliability) +
    (costScore * weights.cost)
  
  return Math.round(totalScore)
}

/**
 * Get provider recommendations based on current health
 */
export function getProviderRecommendations(): {
  best: string[]
  avoid: string[]
  warnings: string[]
} {
  const providers = Object.entries(PROVIDER_HEALTH)
    .map(([id, health]) => ({ id, health }))
    .sort((a, b) => b.health.healthScore - a.health.healthScore)
  
  const best = providers
    .filter(p => p.health.healthScore >= 95)
    .map(p => p.id)
  
  const avoid = providers
    .filter(p => p.health.healthScore < 85)
    .map(p => p.id)
  
  const warnings = providers
    .filter(p => p.health.healthScore >= 85 && p.health.healthScore < 95)
    .map(p => p.id)
  
  return { best, avoid, warnings }
}

/**
 * Generate cost optimization suggestions
 */
export function getCostOptimizations(): Array<{
  type: 'switch_provider' | 'optimize_allocation' | 'reduce_egress'
  message: string
  potentialSavings: number
  providers: string[]
}> {
  const optimizations = []
  
  // Check for expensive providers with alternatives
  const expensive = Object.entries(PROVIDER_HEALTH)
    .filter(([_, health]) => health.actualCostPerGB > 0.02)
    .map(([id]) => id)
  
  if (expensive.length > 0) {
    optimizations.push({
      type: 'switch_provider' as const,
      message: 'Consider switching from expensive providers to more cost-effective alternatives',
      potentialSavings: 45.60, // Monthly savings
      providers: expensive
    })
  }
  
  // Check for high egress costs
  const highEgress = Object.entries(PROVIDER_HEALTH)
    .filter(([_, health]) => health.egressCostPerGB > 0.05)
    .map(([id]) => id)
  
  if (highEgress.length > 0) {
    optimizations.push({
      type: 'reduce_egress' as const,
      message: 'Move frequently accessed files to providers with free egress',
      potentialSavings: 28.30,
      providers: highEgress
    })
  }
  
  return optimizations
}

/**
 * Check for provider alerts and issues
 */
export function checkProviderAlerts(): ProviderAlert[] {
  const newAlerts: ProviderAlert[] = []
  
  Object.entries(PROVIDER_HEALTH).forEach(([providerId, health]) => {
    // Check for high response times
    if (health.responseTime > 100) {
      newAlerts.push({
        id: `perf-${providerId}-${Date.now()}`,
        providerId,
        type: 'performance',
        severity: 'warning',
        message: `High response time: ${health.responseTime}ms`,
        timestamp: Date.now(),
        resolved: false
      })
    }
    
    // Check for low uptime
    if (health.uptime < 99.5) {
      newAlerts.push({
        id: `uptime-${providerId}-${Date.now()}`,
        providerId,
        type: 'reliability',
        severity: 'critical',
        message: `Low uptime: ${health.uptime}%`,
        timestamp: Date.now(),
        resolved: false
      })
    }
    
    // Check for high error rates
    if (health.errorRate > 0.5) {
      newAlerts.push({
        id: `error-${providerId}-${Date.now()}`,
        providerId,
        type: 'reliability',
        severity: 'warning',
        message: `High error rate: ${health.errorRate}%`,
        timestamp: Date.now(),
        resolved: false
      })
    }
  })
  
  return newAlerts
}

/**
 * Get provider status summary
 */
export function getProviderStatusSummary(): {
  totalProviders: number
  healthyProviders: number
  warningProviders: number
  criticalProviders: number
  averageHealthScore: number
  totalAlerts: number
  unresolvedAlerts: number
} {
  const providers = Object.values(PROVIDER_HEALTH)
  
  const healthy = providers.filter(p => p.healthScore >= 95).length
  const warning = providers.filter(p => p.healthScore >= 85 && p.healthScore < 95).length
  const critical = providers.filter(p => p.healthScore < 85).length
  
  const avgHealth = providers.reduce((sum, p) => sum + p.healthScore, 0) / providers.length
  
  const unresolvedAlerts = PROVIDER_ALERTS.filter(a => !a.resolved).length
  
  return {
    totalProviders: providers.length,
    healthyProviders: healthy,
    warningProviders: warning,
    criticalProviders: critical,
    averageHealthScore: Math.round(avgHealth),
    totalAlerts: PROVIDER_ALERTS.length,
    unresolvedAlerts
  }
}
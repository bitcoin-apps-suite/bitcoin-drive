'use client'

import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Server, 
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Database,
  Cloud,
  Shield,
  Zap
} from 'lucide-react'
import { 
  generateStorageTier, 
  calculateMonthlyRevenue,
  STORAGE_PROVIDERS,
  type StorageTier
} from '@/lib/storage-economics'

export default function StorageEconomicsPage() {
  const [freeTier, setFreeTier] = useState<StorageTier | null>(null)
  const [proTier, setProTier] = useState<StorageTier | null>(null)
  const [enterpriseTier, setEnterpriseTier] = useState<StorageTier | null>(null)
  
  const [userCounts, setUserCounts] = useState({
    free: 1000,
    pro: 100,
    enterprise: 10
  })
  
  const [projection, setProjection] = useState({
    revenue: 0,
    costs: 0,
    profit: 0,
    margin: 0
  })

  useEffect(() => {
    // Calculate tier economics
    setFreeTier(generateStorageTier('free'))
    setProTier(generateStorageTier('pro'))
    setEnterpriseTier(generateStorageTier('enterprise'))
    
    // Calculate revenue projection
    const proj = calculateMonthlyRevenue(
      userCounts.free,
      userCounts.pro,
      userCounts.enterprise
    )
    setProjection(proj)
  }, [userCounts])

  const tiers = [
    { data: freeTier, color: '#888888' },
    { data: proTier, color: '#00ff88' },
    { data: enterpriseTier, color: '#fbbf24' }
  ]

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#ffffff',
      padding: '40px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '300',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <DollarSign size={36} style={{ color: '#00ff88' }} />
            Storage Economics Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            Optimize storage allocation and maximize profit margins
          </p>
        </div>

        {/* Revenue Projection */}
        <div style={{
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} style={{ color: '#00ff88' }} />
            Monthly Revenue Projection
          </h2>
          
          {/* User Input Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {Object.entries(userCounts).map(([tier, count]) => (
              <div key={tier}>
                <label style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255,255,255,0.6)',
                  textTransform: 'capitalize',
                  display: 'block',
                  marginBottom: '8px'
                }}>
                  {tier} Users
                </label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setUserCounts(prev => ({
                    ...prev,
                    [tier]: parseInt(e.target.value) || 0
                  }))}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '16px'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Monthly Revenue
              </div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#00ff88' }}>
                ${projection.revenue.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Total Costs
              </div>
              <div style={{ fontSize: '28px', fontWeight: '600', color: '#ff6b6b' }}>
                ${projection.costs.toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Net Profit
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '600', 
                color: projection.profit >= 0 ? '#00ff88' : '#ff4444',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {projection.profit >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                ${Math.abs(projection.profit).toFixed(2)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                Profit Margin
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '600',
                color: projection.margin >= 50 ? '#00ff88' : projection.margin >= 20 ? '#fbbf24' : '#ff4444'
              }}>
                {projection.margin.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Tier Breakdown */}
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={20} style={{ color: '#00ff88' }} />
            Tier Economics Breakdown
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {tiers.map(({ data: tier, color }) => {
              if (!tier) return null
              
              return (
                <div key={tier.name} style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: `1px solid ${color}33`,
                  borderRadius: '12px',
                  padding: '20px',
                  position: 'relative'
                }}>
                  {/* Tier Header */}
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600',
                      marginBottom: '8px',
                      color
                    }}>
                      {tier.name} Tier
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: '700' }}>
                      ${tier.price}/mo
                    </div>
                    <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                      {tier.storage}GB Storage
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div style={{ 
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '12px', marginBottom: '12px', color: 'rgba(255,255,255,0.5)' }}>
                      COST BREAKDOWN
                    </div>
                    <div style={{ fontSize: '13px', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Storage:</span>
                        <span>${tier.costBreakdown.storageCost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Bandwidth:</span>
                        <span>${tier.costBreakdown.egressCost.toFixed(2)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span>Operations:</span>
                        <span>${tier.costBreakdown.operationalCost.toFixed(2)}</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        paddingTop: '8px',
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        fontWeight: '600'
                      }}>
                        <span>Total Cost:</span>
                        <span style={{ color: '#ff6b6b' }}>${tier.costBreakdown.totalCost.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Profit Metrics */}
                  <div style={{
                    padding: '12px',
                    background: tier.costBreakdown.marginPercent > 0 
                      ? 'rgba(0, 255, 136, 0.1)' 
                      : 'rgba(255, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: `1px solid ${tier.costBreakdown.marginPercent > 0 ? '#00ff88' : '#ff4444'}33`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                          NET PROFIT
                        </div>
                        <div style={{ 
                          fontSize: '18px', 
                          fontWeight: '600',
                          color: tier.costBreakdown.profit >= 0 ? '#00ff88' : '#ff4444'
                        }}>
                          ${tier.costBreakdown.profit.toFixed(2)}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '700',
                        color: tier.costBreakdown.marginPercent > 50 ? '#00ff88' : 
                               tier.costBreakdown.marginPercent > 20 ? '#fbbf24' : '#ff4444'
                      }}>
                        {tier.costBreakdown.marginPercent.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* Provider Allocation */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '8px', color: 'rgba(255,255,255,0.5)' }}>
                      PROVIDER ALLOCATION
                    </div>
                    {tier.allocation.map((alloc, idx) => {
                      const provider = STORAGE_PROVIDERS[alloc.provider]
                      return (
                        <div key={idx} style={{
                          fontSize: '12px',
                          padding: '8px',
                          background: 'rgba(255,255,255,0.02)',
                          borderRadius: '6px',
                          marginBottom: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Cloud size={14} style={{ color }} />
                            <span>{provider.name}</span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div>{alloc.amount}GB</div>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px' }}>
                              {alloc.purpose}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Provider Comparison */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h2 style={{ fontSize: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={20} style={{ color: '#00ff88' }} />
            Storage Provider Comparison
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Provider
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    $/GB/mo
                  </th>
                  <th style={{ textAlign: 'right', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Egress $/GB
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Free Tier
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Reliability
                  </th>
                  <th style={{ textAlign: 'center', padding: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Speed
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.values(STORAGE_PROVIDERS).map(provider => (
                  <tr key={provider.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={16} style={{ color: '#00ff88' }} />
                        {provider.name}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      ${provider.costPerGB.toFixed(3)}
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      color: provider.egressPerGB === 0 ? '#00ff88' : '#ffffff'
                    }}>
                      {provider.egressPerGB === 0 ? 'FREE' : `$${provider.egressPerGB.toFixed(2)}`}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {provider.freeTeir ? `${provider.freeTeir}GB` : '-'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: provider.reliability >= 95 ? 'rgba(0,255,136,0.2)' :
                                   provider.reliability >= 90 ? 'rgba(251,191,36,0.2)' :
                                   'rgba(255,68,68,0.2)',
                        color: provider.reliability >= 95 ? '#00ff88' :
                               provider.reliability >= 90 ? '#fbbf24' :
                               '#ff4444',
                        fontSize: '12px'
                      }}>
                        {provider.reliability}%
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: provider.speed >= 90 ? 'rgba(0,255,136,0.2)' :
                                   provider.speed >= 80 ? 'rgba(251,191,36,0.2)' :
                                   'rgba(255,68,68,0.2)',
                        color: provider.speed >= 90 ? '#00ff88' :
                               provider.speed >= 80 ? '#fbbf24' :
                               '#ff4444',
                        fontSize: '12px'
                      }}>
                        {provider.speed}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Key Insights */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(0,255,136,0.05) 0%, rgba(0,204,106,0.05) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(0,255,136,0.2)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={18} style={{ color: '#00ff88' }} />
            Key Insights
          </h3>
          <ul style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
            <li>• <strong>Cloudflare R2</strong> offers the best value with $0.015/GB and FREE egress - perfect for CDN</li>
            <li>• <strong>Pro tier</strong> has the highest margin at ~{proTier?.costBreakdown.marginPercent.toFixed(0)}% due to optimal provider mix</li>
            <li>• <strong>Enterprise tier</strong> uses AWS S3 for reliability despite higher costs</li>
            <li>• Free tier can be sustainable using free tiers from multiple providers</li>
            <li>• Smart routing can reduce costs by 40% through intelligent file placement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
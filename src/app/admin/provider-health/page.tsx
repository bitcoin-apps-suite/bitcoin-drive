'use client'

import { useState } from 'react'
import { 
  PROVIDER_HEALTH, 
  PROVIDER_ALERTS, 
  getProviderRecommendations,
  getCostOptimizations,
  getProviderStatusSummary,
  ProviderHealthMetrics,
  ProviderAlert
} from '@/lib/provider-health'
import { STORAGE_PROVIDERS } from '@/lib/storage-economics'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Zap, 
  Globe,
  TrendingUp,
  TrendingDown,
  Wifi,
  Upload,
  Download
} from 'lucide-react'

export default function ProviderHealthPage() {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'alerts' | 'recommendations'>('overview')
  
  const statusSummary = getProviderStatusSummary()
  const recommendations = getProviderRecommendations()
  const optimizations = getCostOptimizations()
  
  const getStatusColor = (healthScore: number) => {
    if (healthScore >= 95) return 'text-green-400'
    if (healthScore >= 85) return 'text-yellow-400'
    return 'text-red-400'
  }
  
  const getStatusBg = (healthScore: number) => {
    if (healthScore >= 95) return 'bg-green-500/20'
    if (healthScore >= 85) return 'bg-yellow-500/20'
    return 'bg-red-500/20'
  }
  
  const formatResponseTime = (ms: number) => {
    if (ms < 50) return { value: ms, status: 'excellent' }
    if (ms < 100) return { value: ms, status: 'good' }
    return { value: ms, status: 'poor' }
  }
  
  const formatUptime = (uptime: number) => {
    if (uptime >= 99.9) return { value: uptime, status: 'excellent' }
    if (uptime >= 99.5) return { value: uptime, status: 'good' }
    return { value: uptime, status: 'poor' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Provider Health Monitor
          </h1>
          <p className="text-slate-400">Real-time monitoring of storage provider performance and costs</p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Providers</h3>
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400">{statusSummary.totalProviders}</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Avg Health Score</h3>
              <Activity className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400">{statusSummary.averageHealthScore}%</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Active Alerts</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-400">{statusSummary.unresolvedAlerts}</div>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Critical Issues</h3>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <div className="text-3xl font-bold text-red-400">{statusSummary.criticalProviders}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-800/50 border border-slate-700 rounded-xl p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Activity },
            { id: 'metrics', label: 'Metrics', icon: TrendingUp },
            { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
            { id: 'recommendations', label: 'Recommendations', icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as 'overview' | 'metrics' | 'alerts' | 'recommendations')}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                activeTab === id
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Provider Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.entries(PROVIDER_HEALTH).map(([id, health]) => {
                const provider = STORAGE_PROVIDERS[id]
                return (
                  <div 
                    key={id}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors cursor-pointer"
                    onClick={() => setSelectedProvider(selectedProvider === id ? null : id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold">{provider.name}</h3>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusBg(health.healthScore)}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(health.healthScore).replace('text-', 'bg-')}`} />
                        <span className={`text-sm font-medium ${getStatusColor(health.healthScore)}`}>
                          {health.healthScore}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Response Time</div>
                        <div className="text-lg font-semibold">{health.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Uptime</div>
                        <div className="text-lg font-semibold">{health.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Cost/GB</div>
                        <div className="text-lg font-semibold">${health.actualCostPerGB.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400 mb-1">Error Rate</div>
                        <div className="text-lg font-semibold">{health.errorRate}%</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {health.successfulUploads.toLocaleString()} uploads
                      </span>
                      {health.failedUploads > 0 && (
                        <span className="text-red-400">
                          {health.failedUploads} failed
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Performance Metrics */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Performance Metrics</span>
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(PROVIDER_HEALTH).map(([id, health]) => {
                    const provider = STORAGE_PROVIDERS[id]
                    const responseTime = formatResponseTime(health.responseTime)
                    
                    return (
                      <div key={id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(health.healthScore).replace('text-', 'bg-')}`} />
                          <span className="font-medium">{provider.name}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="text-slate-400">Response</div>
                            <div className={responseTime.status === 'excellent' ? 'text-green-400' : 
                                           responseTime.status === 'good' ? 'text-yellow-400' : 'text-red-400'}>
                              {health.responseTime}ms
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400">Upload</div>
                            <div className="text-blue-400">{health.uploadSpeed.toFixed(1)} MB/s</div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400">Download</div>
                            <div className="text-blue-400">{health.downloadSpeed.toFixed(1)} MB/s</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Cost Analysis */}
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  <span>Cost Analysis</span>
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(PROVIDER_HEALTH).map(([id, health]) => {
                    const provider = STORAGE_PROVIDERS[id]
                    const costEfficiency = health.actualCostPerGB <= 0.01 ? 'excellent' :
                                         health.actualCostPerGB <= 0.02 ? 'good' : 'expensive'
                    
                    return (
                      <div key={id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(health.healthScore).replace('text-', 'bg-')}`} />
                          <span className="font-medium">{provider.name}</span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <div className="text-slate-400">Storage</div>
                            <div className={costEfficiency === 'excellent' ? 'text-green-400' : 
                                           costEfficiency === 'good' ? 'text-yellow-400' : 'text-red-400'}>
                              ${health.actualCostPerGB.toFixed(3)}/GB
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-slate-400">Egress</div>
                            <div className={health.egressCostPerGB === 0 ? 'text-green-400' : 'text-yellow-400'}>
                              ${health.egressCostPerGB.toFixed(3)}/GB
                            </div>
                          </div>
                          {health.overageCharges > 0 && (
                            <div className="text-center">
                              <div className="text-slate-400">Overage</div>
                              <div className="text-red-400">${health.overageCharges.toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">Active Alerts</h3>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span>Critical</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                  <span>Warning</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Info</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {PROVIDER_ALERTS.map((alert) => {
                const provider = STORAGE_PROVIDERS[alert.providerId]
                const severityColors = {
                  critical: 'border-red-500 bg-red-500/10',
                  warning: 'border-yellow-500 bg-yellow-500/10',
                  info: 'border-blue-500 bg-blue-500/10'
                }
                
                return (
                  <div 
                    key={alert.id}
                    className={`border rounded-xl p-6 ${severityColors[alert.severity]} ${alert.resolved ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          alert.severity === 'critical' ? 'text-red-400' :
                          alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                        }`} />
                        <div>
                          <h4 className="font-semibold text-lg">{provider.name}</h4>
                          <p className="text-slate-300">{alert.message}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          alert.severity === 'critical' ? 'bg-red-500 text-white' :
                          alert.severity === 'warning' ? 'bg-yellow-500 text-black' : 'bg-blue-500 text-white'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </div>
                        <div className="text-sm text-slate-400 mt-2">
                          {new Date(alert.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${alert.resolved ? 'text-green-400' : 'text-slate-400'}`}>
                        {alert.resolved ? '✓ Resolved' : 'Active'}
                      </span>
                      {!alert.resolved && (
                        <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors">
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-8">
            {/* Provider Recommendations */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Provider Recommendations</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-400 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Recommended</span>
                  </h4>
                  {recommendations.best.map(providerId => {
                    const provider = STORAGE_PROVIDERS[providerId]
                    const health = PROVIDER_HEALTH[providerId]
                    return (
                      <div key={providerId} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-green-400">Health: {health.healthScore}%</div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-yellow-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Monitor Closely</span>
                  </h4>
                  {recommendations.warnings.map(providerId => {
                    const provider = STORAGE_PROVIDERS[providerId]
                    const health = PROVIDER_HEALTH[providerId]
                    return (
                      <div key={providerId} className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-yellow-400">Health: {health.healthScore}%</div>
                      </div>
                    )
                  })}
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-400 flex items-center space-x-2">
                    <TrendingDown className="w-4 h-4" />
                    <span>Consider Alternatives</span>
                  </h4>
                  {recommendations.avoid.map(providerId => {
                    const provider = STORAGE_PROVIDERS[providerId]
                    const health = PROVIDER_HEALTH[providerId]
                    return (
                      <div key={providerId} className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="font-medium">{provider.name}</div>
                        <div className="text-sm text-red-400">Health: {health.healthScore}%</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Cost Optimizations */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span>Cost Optimization Opportunities</span>
              </h3>
              
              <div className="space-y-4">
                {optimizations.map((optimization, index) => (
                  <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-green-400">
                        Potential Monthly Savings: ${optimization.potentialSavings.toFixed(2)}
                      </h4>
                      <span className="px-3 py-1 bg-slate-600 rounded-full text-xs">
                        {optimization.type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-3">{optimization.message}</p>
                    <div className="flex flex-wrap gap-2">
                      {optimization.providers.map(providerId => {
                        const provider = STORAGE_PROVIDERS[providerId]
                        return (
                          <span key={providerId} className="px-2 py-1 bg-slate-600 rounded text-sm">
                            {provider.name}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
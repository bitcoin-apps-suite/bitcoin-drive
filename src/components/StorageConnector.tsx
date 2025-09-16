'use client'

import { useState } from 'react'
import { X, Cloud, Check, AlertCircle, Link2, Shield } from 'lucide-react'

interface StorageConnectorProps {
  isOpen: boolean
  onClose: () => void
  onConnect: (provider: StorageProvider) => void
}

export interface StorageProvider {
  type: 'aws' | 'supabase' | 'google' | 'azure' | 'ipfs'
  credentials: {
    accessKey?: string
    secretKey?: string
    bucket?: string
    region?: string
    endpoint?: string
    projectUrl?: string
    anonKey?: string
    serviceKey?: string
  }
  connected: boolean
  name: string
}

const STORAGE_PROVIDERS = {
  aws: {
    name: 'Amazon S3',
    icon: '☁️',
    color: '#FF9900',
    description: 'Enterprise-grade object storage with global availability',
    features: ['99.999999999% durability', 'Global CDN', 'Lifecycle policies', 'Versioning'],
    fields: [
      { key: 'accessKey', label: 'Access Key ID', type: 'text', required: true },
      { key: 'secretKey', label: 'Secret Access Key', type: 'password', required: true },
      { key: 'bucket', label: 'Bucket Name', type: 'text', required: true },
      { key: 'region', label: 'Region', type: 'select', required: true, 
        options: ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'] }
    ]
  },
  supabase: {
    name: 'Supabase Storage',
    icon: '🚀',
    color: '#3ECF8E',
    description: 'Open source Firebase alternative with built-in auth',
    features: ['Real-time updates', 'Row level security', 'Edge functions', 'PostgreSQL'],
    fields: [
      { key: 'projectUrl', label: 'Project URL', type: 'text', required: true, 
        placeholder: 'https://xyz.supabase.co' },
      { key: 'anonKey', label: 'Anon/Public Key', type: 'password', required: true },
      { key: 'serviceKey', label: 'Service Key (optional)', type: 'password', required: false },
      { key: 'bucket', label: 'Bucket Name', type: 'text', required: true }
    ]
  },
  google: {
    name: 'Google Drive',
    icon: '📁',
    color: '#4285F4',
    description: 'Seamless integration with Google Workspace',
    features: ['15GB free', 'Collaboration', 'Version history', 'AI search'],
    fields: [] // OAuth based, no manual credentials
  },
  azure: {
    name: 'Azure Blob Storage',
    icon: '☁️',
    color: '#0078D4',
    description: 'Microsoft cloud storage with enterprise features',
    features: ['Tiered storage', 'Immutable blobs', 'Data Lake', 'Archive tier'],
    fields: [
      { key: 'endpoint', label: 'Storage Account URL', type: 'text', required: true },
      { key: 'accessKey', label: 'Access Key', type: 'password', required: true },
      { key: 'bucket', label: 'Container Name', type: 'text', required: true }
    ]
  },
  ipfs: {
    name: 'IPFS',
    icon: '🌐',
    color: '#65C2CB',
    description: 'Decentralized storage on the InterPlanetary File System',
    features: ['Decentralized', 'Content addressed', 'Permanent', 'Censorship resistant'],
    fields: [
      { key: 'endpoint', label: 'IPFS Gateway URL', type: 'text', required: true,
        placeholder: 'https://ipfs.io or your gateway' },
      { key: 'accessKey', label: 'API Key (if required)', type: 'password', required: false }
    ]
  }
}

export default function StorageConnector({ isOpen, onClose, onConnect }: StorageConnectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<keyof typeof STORAGE_PROVIDERS | null>(null)
  const [credentials, setCredentials] = useState<Record<string, string>>({})
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set())
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const handleConnect = async () => {
    if (!selectedProvider) return
    
    setIsConnecting(true)
    setErrors({})
    
    try {
      // Validate required fields
      const provider = STORAGE_PROVIDERS[selectedProvider]
      const missingFields = provider.fields
        .filter(field => field.required && !credentials[field.key])
        .map(field => field.label)
      
      if (missingFields.length > 0) {
        setErrors({ general: `Missing required fields: ${missingFields.join(', ')}` })
        setIsConnecting(false)
        return
      }
      
      // Test connection (in production, would validate with actual service)
      await testConnection(selectedProvider, credentials)
      
      // Save connection
      const storageProvider: StorageProvider = {
        type: selectedProvider,
        credentials,
        connected: true,
        name: provider.name
      }
      
      onConnect(storageProvider)
      setConnectedProviders(new Set([...connectedProviders, selectedProvider]))
      
      // Reset form
      setCredentials({})
      setSelectedProvider(null)
      
    } catch (error) {
      setErrors({ general: (error as Error).message || 'Connection failed' })
    } finally {
      setIsConnecting(false)
    }
  }
  
  const testConnection = async (provider: string, creds: Record<string, string>) => {
    // In production, this would actually test the connection
    // For now, simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (provider === 'aws' && !creds.accessKey?.startsWith('AKIA')) {
          reject(new Error('Invalid AWS Access Key format'))
        } else if (provider === 'supabase' && !creds.projectUrl?.includes('supabase')) {
          reject(new Error('Invalid Supabase project URL'))
        } else {
          resolve(true)
        }
      }, 1000)
    })
  }
  
  const handleGoogleConnect = () => {
    // OAuth flow for Google Drive
    window.location.href = '/api/auth/google'
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 border-b p-6"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#00ff88' }}>
              <Cloud size={24} style={{ color: '#000000' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: '#ffffff' }}>
                Connect Cloud Storage
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Link your cloud storage for hybrid blockchain + cloud file storage
              </p>
            </div>
          </div>
        </div>
        
        {/* Provider Selection */}
        {!selectedProvider ? (
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(STORAGE_PROVIDERS).map(([key, provider]) => (
                <button key={key}
                  onClick={() => key === 'google' ? handleGoogleConnect() : setSelectedProvider(key as keyof typeof STORAGE_PROVIDERS)}
                  disabled={connectedProviders.has(key)}
                  className="p-4 rounded-lg border text-left transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    backgroundColor: connectedProviders.has(key) ? 'rgba(0, 255, 136, 0.05)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: connectedProviders.has(key) ? '#00ff88' : 'rgba(255, 255, 255, 0.1)'
                  }}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{provider.icon}</span>
                    {connectedProviders.has(key) && (
                      <Check size={16} style={{ color: '#00ff88' }} />
                    )}
                  </div>
                  <div className="font-medium mb-1" style={{ color: '#ffffff' }}>
                    {provider.name}
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    {provider.description}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {provider.features.slice(0, 2).map((feature, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'rgba(255, 255, 255, 0.5)' }}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={16} style={{ color: '#ff9500' }} />
                <span className="font-medium" style={{ color: '#ff9500' }}>Security Note</span>
              </div>
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Your credentials are encrypted and stored securely. For production use, we recommend using 
                IAM roles with minimal required permissions. Files are always encrypted before upload.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <button onClick={() => setSelectedProvider(null)}
              className="mb-4 text-sm flex items-center gap-2"
              style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
              ← Back to providers
            </button>
            
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{STORAGE_PROVIDERS[selectedProvider].icon}</span>
                <div>
                  <h3 className="text-xl font-light" style={{ color: '#ffffff' }}>
                    Configure {STORAGE_PROVIDERS[selectedProvider].name}
                  </h3>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Enter your credentials to connect
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                {STORAGE_PROVIDERS[selectedProvider].fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium mb-2" 
                      style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                      {field.label} {field.required && <span style={{ color: '#ff4444' }}>*</span>}
                    </label>
                    {field.type === 'select' ? (
                      <select
                        value={credentials[field.key] || ''}
                        onChange={(e) => setCredentials({...credentials, [field.key]: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff'
                        }}>
                        <option value="">Select {field.label}</option>
                        {'options' in field && field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        value={credentials[field.key] || ''}
                        onChange={(e) => setCredentials({...credentials, [field.key]: e.target.value})}
                        placeholder={'placeholder' in field ? field.placeholder : undefined}
                        className="w-full px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff'
                        }} />
                    )}
                  </div>
                ))}
              </div>
              
              {errors.general && (
                <div className="mt-4 p-3 rounded-lg flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.3)' }}>
                  <AlertCircle size={16} style={{ color: '#ff4444' }} />
                  <span className="text-sm" style={{ color: '#ff4444' }}>{errors.general}</span>
                </div>
              )}
              
              {selectedProvider === 'aws' && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255, 149, 0, 0.05)' }}>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    💡 Tip: Create an IAM user with only S3 access. Never use root credentials.
                  </p>
                </div>
              )}
              
              {selectedProvider === 'supabase' && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(62, 207, 142, 0.05)' }}>
                  <p className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    💡 Find your keys in Supabase Dashboard → Settings → API
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Footer */}
        {selectedProvider && (
          <div className="sticky bottom-0 border-t p-6 flex justify-between"
            style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <button onClick={() => setSelectedProvider(null)}
              className="px-6 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.8)'
              }}>
              Cancel
            </button>
            
            <button onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: '#00ff88',
                color: '#000000',
                opacity: isConnecting ? 0.5 : 1
              }}>
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Link2 size={16} />
                  Connect {STORAGE_PROVIDERS[selectedProvider].name}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
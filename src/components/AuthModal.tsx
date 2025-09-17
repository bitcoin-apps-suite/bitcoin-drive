'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Shield, Check, CreditCard, DollarSign, Wallet, Cloud, Server, Database, Zap, Globe } from 'lucide-react'
import { 
  SiGoogledrive, 
  SiAmazon, 
  SiCloudflare, 
  SiGoogle, 
  SiSupabase,
  SiBitcoin 
} from 'react-icons/si'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface AuthProvider {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  connected?: boolean
  handle?: string
}

type Tab = 'connect' | 'subscribe' | 'topup'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set())
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [topupAmount, setTopupAmount] = useState<string>('25')
  
  const providers: AuthProvider[] = [
    {
      id: 'handcash',
      name: 'HandCash',
      icon: <SiBitcoin size={24} />,
      color: '#00ff88',
      connected: connectedProviders.has('handcash')
    },
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: <SiGoogledrive size={24} />,
      color: '#4285f4',
      connected: connectedProviders.has('googledrive')
    },
    {
      id: 'aws',
      name: 'AWS S3',
      icon: <SiAmazon size={24} />,
      color: '#ff9900',
      connected: connectedProviders.has('aws')
    },
    {
      id: 'cloudflare',
      name: 'Cloudflare',
      icon: <SiCloudflare size={24} />,
      color: '#f38020',
      connected: connectedProviders.has('cloudflare')
    },
    {
      id: 'googlecloud',
      name: 'Google Cloud',
      icon: <SiGoogle size={24} />,
      color: '#ea4335',
      connected: connectedProviders.has('googlecloud')
    },
    {
      id: 'azure',
      name: 'Azure Blob',
      icon: <Cloud size={24} />,
      color: '#0078d4',
      connected: connectedProviders.has('azure')
    },
    {
      id: 'supabase',
      name: 'SupaBase',
      icon: <SiSupabase size={24} />,
      color: '#3ecf8e',
      connected: connectedProviders.has('supabase')
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: <Database size={24} />,
      color: '#0061ff',
      connected: connectedProviders.has('dropbox')
    },
    {
      id: 'fastly',
      name: 'Fastly CDN',
      icon: <Zap size={24} />,
      color: '#ff282d',
      connected: connectedProviders.has('fastly')
    },
    {
      id: 'netlify',
      name: 'Netlify',
      icon: <Globe size={24} />,
      color: '#00c7b7',
      connected: connectedProviders.has('netlify')
    }
  ]

  const subscriptionPlans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['1GB storage', 'Basic encryption', 'Community support'],
      color: '#6b7280'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9.99',
      period: 'per month',
      features: ['100GB storage', 'Advanced encryption', 'Priority support', 'File sharing'],
      color: '#00ff88',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$29.99',
      period: 'per month',
      features: ['1TB storage', 'Enterprise encryption', '24/7 support', 'Team collaboration', 'API access'],
      color: '#8b5cf6'
    }
  ]


  const handleProviderConnect = async (providerId: string) => {
    setIsConnecting(providerId)
    
    if (providerId === 'handcash') {
      const popup = window.open(
        'https://api.handcash.io/v3/connect',
        'HandCash Connect',
        'width=500,height=700'
      )
      
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://app.handcash.io') return
        
        if (event.data.type === 'handcash-auth-success') {
          setConnectedProviders(new Set([...connectedProviders, 'handcash']))
          popup?.close()
        }
      })
      
      setTimeout(() => {
        setConnectedProviders(new Set([...connectedProviders, 'handcash']))
        popup?.close()
        setIsConnecting(null)
      }, 2000)
    } else if (providerId === 'googledrive') {
      // Google Drive OAuth connection
      try {
        const result = await signIn('google', { 
          redirect: false,
          callbackUrl: '/api/auth/callback/google',
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file'
        })
        if (result?.ok) {
          setConnectedProviders(new Set([...connectedProviders, 'googledrive']))
        }
      } catch (error) {
        console.error('Google Drive connection failed:', error)
      } finally {
        setIsConnecting(null)
      }
    } else if (['aws', 'cloudflare', 'azure', 'supabase', 'googlecloud'].includes(providerId)) {
      // Simulate infrastructure provider connection
      setTimeout(() => {
        setConnectedProviders(new Set([...connectedProviders, providerId]))
        setIsConnecting(null)
      }, 1500)
    } else {
      // Other OAuth providers
      try {
        const result = await signIn(providerId, { redirect: false })
        if (result?.ok) {
          setConnectedProviders(new Set([...connectedProviders, providerId]))
        }
      } catch (error) {
        console.error('Connection failed:', error)
      } finally {
        setIsConnecting(null)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="border-b p-6" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl" style={{ 
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' 
            }}>
              <Wallet size={24} style={{ color: '#000000' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
                Welcome to Bitcoin Drive
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Connect your services and set up your account
              </p>
            </div>
          </div>
        </div>

        {/* Content - All in One */}
        <div className="p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="grid grid-cols-12 gap-6">
            {/* Services Column - spans 5 columns */}
            <div className="col-span-5 space-y-3">
              <div className="space-y-2">
                {/* HandCash - Full Width */}
                <button
                  onClick={() => handleProviderConnect('handcash')}
                  disabled={providers[0].connected || isConnecting !== null}
                  className="w-full p-3 rounded-lg border transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{ 
                    borderColor: '#00ff88',
                    backgroundColor: '#00ff88',
                    color: '#000000'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <img 
                      src="/handcash-logo.png" 
                      alt="HandCash"
                      width={24}
                      height={24}
                      style={{ filter: 'brightness(0)' }}
                    />
                    <span className="text-sm font-medium" style={{ color: '#000000' }}>
                      {providers[0].name}
                    </span>
                    {providers[0].connected && (
                      <Check size={16} color="#000000" />
                    )}
                  </div>
                </button>
                
                <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                  Connect your storage and delivery services
                </h3>
                
                {/* Other Services - Grid */}
                <div className="grid grid-cols-3 gap-2">
                  {providers.slice(1).map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderConnect(provider.id)}
                      disabled={provider.connected || isConnecting !== null}
                      className="p-3 rounded-lg border transition-all hover:scale-[1.02] disabled:opacity-50"
                      style={{ 
                        borderColor: provider.connected ? provider.color : 'var(--color-border)',
                        backgroundColor: provider.connected ? `${provider.color}10` : 'var(--bg-card)'
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div style={{ color: provider.color }}>
                          {provider.icon}
                        </div>
                        <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                          {provider.name}
                        </span>
                        {provider.connected && (
                          <Check size={14} color={provider.color} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Plans Column - spans 4 columns */}
            <div className="col-span-4 space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                Choose Plan
              </h3>
              <div className="space-y-2">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all hover:scale-[1.01] ${
                      subscriptionTier === plan.id ? 'ring-1 ring-green-500' : ''
                    }`}
                    style={{ 
                      borderColor: subscriptionTier === plan.id ? '#00ff88' : 'var(--color-border)',
                      backgroundColor: plan.popular ? 'rgba(0,255,136,0.05)' : 'var(--bg-card)'
                    }}
                    onClick={() => setSubscriptionTier(plan.id as typeof subscriptionTier)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold" style={{ color: 'var(--color-accent)' }}>
                            {plan.name}
                          </h4>
                          {plan.popular && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                              POPULAR
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {plan.features.slice(0, 2).join(' • ')}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold" style={{ color: plan.color }}>
                          {plan.price}
                        </span>
                        <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>
                          {plan.period}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Up Column - spans 3 columns */}
            <div className="col-span-3 space-y-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-accent)' }}>
                Add Funds
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {['10', '25', '50', '100'].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTopupAmount(amount)}
                      className={`py-2 px-3 rounded-lg border text-sm transition-all ${
                        topupAmount === amount ? 'border-green-500 bg-green-500/10' : ''
                      }`}
                      style={{ 
                        borderColor: topupAmount === amount ? '#00ff88' : 'var(--color-border)',
                        backgroundColor: topupAmount === amount ? 'rgba(0,255,136,0.1)' : 'var(--bg-card)',
                        color: 'var(--color-accent)'
                      }}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  className="w-full p-2 rounded-lg border text-sm"
                  style={{ 
                    borderColor: 'var(--color-border)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--color-accent)'
                  }}
                  placeholder="Custom amount"
                />
                <button
                  className="w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                    color: '#000000'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign size={16} />
                    Add ${topupAmount}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              color: '#000000'
            }}
          >
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Mail, Twitter, Wallet, Shield, Check, Key, ArrowRight, Zap, CreditCard, DollarSign, Sparkles, Cloud, Server, Database, Globe, Package } from 'lucide-react'
import Image from 'next/image'
import { 
  SiGoogledrive, 
  SiAmazon, 
  SiCloudflare, 
  SiGooglecloud, 
  SiSupabase,
  SiDropbox,
  SiNetlify,
  SiVercel,
  SiDigitalocean,
  SiOracle,
  SiAlibabacloud
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

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'connect' | 'subscribe' | 'topup'>('connect')
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free')
  
  const providers: AuthProvider[] = [
    // Primary - HandCash for payments
    {
      id: 'handcash',
      name: 'HandCash',
      icon: <Image src="/handcash-logo.png" alt="HandCash" width={20} height={20} />,
      color: '#00ff88',
      connected: connectedProviders.has('handcash')
    },
    
    // Cloud Storage Providers
    {
      id: 'googledrive',
      name: 'Google Drive',
      icon: <SiGoogledrive size={20} />,
      color: '#4285f4',
      connected: connectedProviders.has('googledrive')
    },
    {
      id: 'aws',
      name: 'AWS S3',
      icon: <SiAmazon size={20} />,
      color: '#ff9900',
      connected: connectedProviders.has('aws')
    },
    {
      id: 'azure',
      name: 'Azure Blob',
      icon: <Cloud size={20} />,
      color: '#0078d4',
      connected: connectedProviders.has('azure')
    },
    {
      id: 'googlecloud',
      name: 'Google Cloud',
      icon: <SiGooglecloud size={20} />,
      color: '#ea4335',
      connected: connectedProviders.has('googlecloud')
    },
    {
      id: 'supabase',
      name: 'Supabase',
      icon: <SiSupabase size={20} />,
      color: '#3ecf8e',
      connected: connectedProviders.has('supabase')
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: <SiDropbox size={20} />,
      color: '#0061ff',
      connected: connectedProviders.has('dropbox')
    },
    {
      id: 'digitalocean',
      name: 'DigitalOcean Spaces',
      icon: <SiDigitalocean size={20} />,
      color: '#0080ff',
      connected: connectedProviders.has('digitalocean')
    },
    {
      id: 'oracle',
      name: 'Oracle Cloud',
      icon: <SiOracle size={20} />,
      color: '#f80000',
      connected: connectedProviders.has('oracle')
    },
    {
      id: 'alibaba',
      name: 'Alibaba Cloud',
      icon: <SiAlibabacloud size={20} />,
      color: '#ff6a00',
      connected: connectedProviders.has('alibaba')
    },
    
    // CDN Providers
    {
      id: 'cloudflare',
      name: 'Cloudflare R2',
      icon: <SiCloudflare size={20} />,
      color: '#f38020',
      connected: connectedProviders.has('cloudflare')
    },
    {
      id: 'netlify',
      name: 'Netlify',
      icon: <SiNetlify size={20} />,
      color: '#00c7b7',
      connected: connectedProviders.has('netlify')
    },
    {
      id: 'vercel',
      name: 'Vercel Edge',
      icon: <SiVercel size={20} />,
      color: '#000000',
      connected: connectedProviders.has('vercel')
    },
    
    // Social Auth (optional)
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: <Twitter size={20} />,
      color: '#1da1f2',
      connected: connectedProviders.has('twitter')
    }
  ]

  const handleProviderConnect = async (providerId: string) => {
    setIsConnecting(providerId)
    
    try {
      if (providerId === 'handcash') {
        // HandCash OAuth flow
        const response = await fetch('/api/handcash/connect')
        const data = await response.json()
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl
        }
      } else if (providerId === 'twitter') {
        // Twitter OAuth through NextAuth
        const result = await signIn('twitter', { 
          redirect: false,
          callbackUrl: window.location.href 
        })
        if (result?.ok) {
          setConnectedProviders(prev => new Set([...prev, providerId]))
        }
      } else if (providerId === 'googledrive') {
        // Google OAuth for Drive access
        const result = await signIn('google', { 
          redirect: false,
          callbackUrl: window.location.href,
          scope: 'openid email profile https://www.googleapis.com/auth/drive.file'
        })
        if (result?.ok) {
          setConnectedProviders(prev => new Set([...prev, providerId]))
        }
      } else if (['aws', 'azure', 'googlecloud', 'cloudflare', 'supabase', 'dropbox', 'digitalocean', 'oracle', 'alibaba', 'netlify', 'vercel'].includes(providerId)) {
        // Simulate cloud provider connection (would need actual OAuth/API key setup)
        // In production, these would have their own OAuth flows or API key configuration
        setTimeout(() => {
          setConnectedProviders(prev => new Set([...prev, providerId]))
          setIsConnecting(null)
        }, 1500)
      } else {
        // Generic OAuth flow
        try {
          const result = await signIn(providerId, { redirect: false })
          if (result?.ok) {
            setConnectedProviders(prev => new Set([...prev, providerId]))
          }
        } catch (error) {
          console.error('Connection failed:', error)
        }
      }
    } catch (error) {
      console.error(`Error connecting ${providerId}:`, error)
    } finally {
      setIsConnecting(null)
    }
  }

  const allConnected = providers.every(p => p.connected)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-lg rounded-2xl shadow-2xl"
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
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ 
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' 
            }}>
              <Wallet size={24} style={{ color: '#000000' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              Bitcoin Drive Account
            </h2>
          </div>
          
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Connect, subscribe, and manage your Bitcoin Drive account
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b" style={{ borderColor: 'var(--color-border)' }}>
          {[
            { id: 'connect', label: 'Connect', icon: <Wallet size={16} /> },
            { id: 'subscribe', label: 'Subscribe', icon: <Sparkles size={16} /> },
            { id: 'topup', label: 'Top Up', icon: <DollarSign size={16} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'connect' | 'subscribe' | 'topup')}
              className="flex-1 px-4 py-3 flex items-center justify-center gap-2 transition-all"
              style={{
                borderBottom: activeTab === tab.id ? '2px solid #00ff88' : '2px solid transparent',
                color: activeTab === tab.id ? '#00ff88' : 'var(--color-text-muted)',
                fontWeight: activeTab === tab.id ? '600' : '400',
                fontSize: '14px'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {activeTab === 'connect' && (
            <>
              {/* HandCash Primary */}
              <button
                onClick={() => handleProviderConnect('handcash')}
                disabled={connectedProviders.has('handcash') || isConnecting !== null}
                className="w-full p-4 rounded-xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  borderColor: connectedProviders.has('handcash') ? '#00ff88' : 'transparent',
                  background: connectedProviders.has('handcash') 
                    ? 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,204,106,0.1) 100%)'
                    : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  boxShadow: connectedProviders.has('handcash') 
                    ? 'none' 
                    : '0 4px 12px rgba(0, 255, 136, 0.3)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: connectedProviders.has('handcash') ? '#00ff88' : 'rgba(0,0,0,0.2)',
                        color: connectedProviders.has('handcash') ? '#000000' : '#ffffff'
                      }}
                    >
                      <Image src="/handcash-logo.png" alt="HandCash" width={20} height={20} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium" style={{ 
                        color: connectedProviders.has('handcash') ? 'var(--color-accent)' : '#000000' 
                      }}>
                        HandCash Wallet
                      </div>
                      <div className="text-xs" style={{ 
                        color: connectedProviders.has('handcash') ? 'var(--color-text-muted)' : 'rgba(0,0,0,0.7)' 
                      }}>
                        Required for payments
                      </div>
                    </div>
                  </div>
                  {connectedProviders.has('handcash') ? (
                    <Check size={18} color="#00ff88" />
                  ) : isConnecting === 'handcash' ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                      style={{ borderColor: '#000000' }}
                    />
                  ) : (
                    <ArrowRight size={18} color="#000000" />
                  )}
                </div>
              </button>

              {/* Cloud Storage Providers */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Cloud Storage
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
                  {providers.filter(p => ['googledrive', 'aws', 'azure', 'googlecloud', 'supabase', 'dropbox', 'digitalocean', 'oracle', 'alibaba'].includes(p.id)).map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleProviderConnect(provider.id)}
                  disabled={provider.connected || isConnecting !== null}
                  className="w-full p-3 rounded-lg border transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    borderColor: provider.connected ? provider.color : 'var(--color-border)',
                    backgroundColor: provider.connected ? `${provider.color}10` : 'var(--bg-card)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ 
                          backgroundColor: provider.connected ? provider.color : 'var(--bg-primary)',
                          color: provider.connected ? 'white' : provider.color
                        }}
                      >
                        {provider.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium" style={{ color: 'var(--color-accent)' }}>
                          {provider.name}
                        </div>
                        {provider.handle && (
                          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                            @{provider.handle}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {provider.connected ? (
                      <div 
                        className="p-1 rounded-full"
                        style={{ backgroundColor: provider.color }}
                      >
                        <Check size={16} color="white" />
                      </div>
                    ) : isConnecting === provider.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                        style={{ borderColor: provider.color }}
                      />
                    ) : (
                      <span className="text-sm font-medium" style={{ color: provider.color }}>
                        Connect
                      </span>
                    )}
                  </div>
                </button>
                  ))}
                </div>

                {/* CDN Providers */}
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Content Delivery Networks
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '20px' }}>
                  {providers.filter(p => ['cloudflare', 'netlify', 'vercel'].includes(p.id)).map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderConnect(provider.id)}
                      disabled={provider.connected || isConnecting !== null}
                      className="w-full p-3 rounded-lg border transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        borderColor: provider.connected ? provider.color : 'var(--color-border)',
                        backgroundColor: provider.connected ? `${provider.color}10` : 'var(--bg-card)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ 
                              backgroundColor: provider.connected ? provider.color : 'var(--bg-primary)',
                              color: provider.connected ? 'white' : provider.color
                            }}
                          >
                            {provider.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium" style={{ color: 'var(--color-accent)' }}>
                              {provider.name}
                            </div>
                          </div>
                        </div>
                        
                        {provider.connected ? (
                          <div 
                            className="p-1 rounded-full"
                            style={{ backgroundColor: provider.color }}
                          >
                            <Check size={16} color="white" />
                          </div>
                        ) : isConnecting === provider.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                            style={{ borderColor: provider.color }}
                          />
                        ) : (
                          <span className="text-sm font-medium" style={{ color: provider.color }}>
                            Connect
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Social Auth */}
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '600', 
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Social Authentication (Optional)
                </div>
                <div style={{ marginBottom: '20px' }}>
                  {providers.filter(p => p.id === 'twitter').map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderConnect(provider.id)}
                      disabled={provider.connected || isConnecting !== null}
                      className="w-full p-3 rounded-lg border transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        borderColor: provider.connected ? provider.color : 'var(--color-border)',
                        backgroundColor: provider.connected ? `${provider.color}10` : 'var(--bg-card)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ 
                              backgroundColor: provider.connected ? provider.color : 'var(--bg-primary)',
                              color: provider.connected ? 'white' : provider.color
                            }}
                          >
                            {provider.icon}
                          </div>
                          <div className="text-left">
                            <div className="font-medium" style={{ color: 'var(--color-accent)' }}>
                              {provider.name}
                            </div>
                          </div>
                        </div>
                        
                        {provider.connected ? (
                          <div 
                            className="p-1 rounded-full"
                            style={{ backgroundColor: provider.color }}
                          >
                            <Check size={16} color="white" />
                          </div>
                        ) : isConnecting === provider.id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent"
                            style={{ borderColor: provider.color }}
                          />
                        ) : (
                          <span className="text-sm font-medium" style={{ color: provider.color }}>
                            Connect
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'subscribe' && (
            <div className="space-y-4">
              {/* Subscription Tiers */}
              {[
                { 
                  id: 'free', 
                  name: 'Free', 
                  price: '0', 
                  features: ['5GB Storage', 'Basic encryption', 'Public sharing'],
                  color: '#888888'
                },
                { 
                  id: 'pro', 
                  name: 'Pro', 
                  price: '9.99', 
                  features: ['100GB Storage', 'Advanced encryption', 'NFT creation', 'Priority support'],
                  color: '#00ff88',
                  recommended: true
                },
                { 
                  id: 'enterprise', 
                  name: 'Enterprise', 
                  price: '49.99', 
                  features: ['Unlimited Storage', 'Multi-sig security', 'Custom domains', 'API access', 'Dedicated support'],
                  color: '#fbbf24'
                }
              ].map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setSubscriptionTier(tier.id as 'free' | 'pro' | 'enterprise')}
                  className="w-full p-4 rounded-xl border transition-all text-left"
                  style={{
                    borderColor: subscriptionTier === tier.id ? tier.color : 'var(--color-border)',
                    background: subscriptionTier === tier.id ? `${tier.color}10` : 'var(--bg-card)',
                    position: 'relative'
                  }}
                >
                  {tier.recommended && (
                    <span style={{
                      position: 'absolute',
                      top: '-10px',
                      right: '20px',
                      background: tier.color,
                      color: '#000000',
                      padding: '2px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      RECOMMENDED
                    </span>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold" style={{ color: 'var(--color-accent)' }}>
                        {tier.name}
                      </h4>
                      <div className="text-2xl font-bold" style={{ color: tier.color }}>
                        ${tier.price}<span className="text-sm font-normal">/month</span>
                      </div>
                    </div>
                    {subscriptionTier === tier.id && (
                      <Check size={20} style={{ color: tier.color }} />
                    )}
                  </div>
                  <ul className="space-y-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {tier.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <span style={{ color: tier.color }}>✓</span> {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          )}

          {activeTab === 'topup' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ 
                background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,204,106,0.1) 100%)',
                border: '1px solid rgba(0,255,136,0.3)'
              }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Current Balance</span>
                  <span className="text-xl font-bold" style={{ color: '#00ff88' }}>₿ 0.00</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Add funds to pay for storage, transactions, and premium features
                </div>
              </div>

              {/* Quick Top-up Options */}
              <div className="grid grid-cols-3 gap-2">
                {['10', '25', '50'].map(amount => (
                  <button
                    key={amount}
                    className="p-3 rounded-lg border transition-all hover:scale-[1.02]"
                    style={{
                      borderColor: 'var(--color-border)',
                      background: 'var(--bg-card)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#00ff88'
                      e.currentTarget.style.background = 'rgba(0,255,136,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.background = 'var(--bg-card)'
                    }}
                  >
                    <div className="font-semibold" style={{ color: 'var(--color-accent)' }}>
                      ${amount}
                    </div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                  Custom Amount
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="flex-1 p-3 rounded-lg border"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-accent)'
                    }}
                  />
                  <button
                    className="px-6 py-3 rounded-lg font-medium transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                      color: '#000000'
                    }}
                  >
                    Add Funds
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
                  Payment Methods
                </p>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: 'var(--color-border)' }}>
                    <CreditCard size={16} style={{ color: '#00ff88' }} />
                    <span className="text-xs">Card</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border" style={{ borderColor: 'var(--color-border)' }}>
                    <Wallet size={16} style={{ color: '#00ff88' }} />
                    <span className="text-xs">Crypto</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Features/Footer */}
        {activeTab === 'connect' && (
          <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>
              Why connect?
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div className="flex items-start gap-2">
                <Zap size={14} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
                <span><strong>Instant Payments:</strong> Send & receive Bitcoin instantly</span>
              </div>
              <div className="flex items-start gap-2">
                <Key size={14} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
                <span><strong>Secure Auth:</strong> Your wallet is your identity</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield size={14} style={{ color: 'var(--color-primary)', marginTop: '2px' }} />
                <span><strong>Encrypted Storage:</strong> Files secured with your wallet keys</span>
              </div>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => {
              if ((activeTab === 'connect' && connectedProviders.has('handcash')) || 
                  activeTab === 'subscribe' || 
                  activeTab === 'topup') {
                if (onSuccess) onSuccess()
              }
              onClose()
            }}
            className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: 
                (activeTab === 'connect' && connectedProviders.has('handcash')) || 
                activeTab === 'subscribe' || 
                activeTab === 'topup' 
                  ? 'var(--color-primary)' 
                  : 'var(--bg-card)',
              color: 
                (activeTab === 'connect' && connectedProviders.has('handcash')) || 
                activeTab === 'subscribe' || 
                activeTab === 'topup'
                  ? 'var(--bg-primary)' 
                  : 'var(--color-text-muted)',
              border: 
                (activeTab === 'connect' && connectedProviders.has('handcash')) || 
                activeTab === 'subscribe' || 
                activeTab === 'topup'
                  ? 'none' 
                  : '1px solid var(--color-border)'
            }}
          >
            {activeTab === 'connect' 
              ? (connectedProviders.has('handcash') ? 'Continue to Bitcoin Drive' : 'Skip for Now')
              : activeTab === 'subscribe'
              ? 'Subscribe Now'
              : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
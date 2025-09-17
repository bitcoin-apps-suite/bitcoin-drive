'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Mail, Twitter, Wallet, Shield, Check, Key, ArrowRight, Zap, CreditCard, DollarSign, Sparkles } from 'lucide-react'

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
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'enterprise'>('free')
  const [topupAmount, setTopupAmount] = useState<string>('25')
  
  const providers: AuthProvider[] = [
    {
      id: 'handcash',
      name: 'HandCash',
      icon: <Wallet size={20} />,
      color: '#00ff88',
      connected: connectedProviders.has('handcash')
    },
    {
      id: 'google',
      name: 'Google',
      icon: <Mail size={20} />,
      color: '#4285f4',
      connected: connectedProviders.has('google')
    },
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
    
    if (providerId === 'handcash') {
      // HandCash connection
      const popup = window.open(
        'https://app.handcash.io/auth',
        'HandCash Connect',
        'width=500,height=700'
      )
      
      // Listen for message from popup
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://app.handcash.io') return
        
        if (event.data.type === 'handcash-auth-success') {
          setConnectedProviders(new Set([...connectedProviders, 'handcash']))
          popup?.close()
        }
      })
      
      // Simulate connection after delay for demo
      setTimeout(() => {
        setConnectedProviders(new Set([...connectedProviders, 'handcash']))
        popup?.close()
        setIsConnecting(null)
      }, 2000)
    } else {
      // OAuth providers
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
        className="relative w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Header */}
        <div className="border-b p-4" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <X size={20} style={{ color: 'var(--color-text-muted)' }} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg" style={{ 
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)' 
            }}>
              <Wallet size={20} style={{ color: '#000000' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--color-accent)' }}>
                Bitcoin Drive Setup
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Complete your account setup to get started
              </p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Column 1: Connect & Subscribe */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Connect Services - Horizontal Layout */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                    Connect Services
                  </h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* HandCash */}
                  <button
                    onClick={() => handleProviderConnect('handcash')}
                    disabled={connectedProviders.has('handcash') || isConnecting !== null}
                    className="p-4 rounded-xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: connectedProviders.has('handcash') ? '#00ff88' : 'var(--color-border)',
                      background: connectedProviders.has('handcash') 
                        ? 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,204,106,0.1) 100%)'
                        : 'var(--bg-card)'
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: connectedProviders.has('handcash') ? '#00ff88' : 'rgba(0,255,136,0.1)',
                          color: connectedProviders.has('handcash') ? '#000000' : '#00ff88'
                        }}
                      >
                        <Wallet size={24} />
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                        HandCash
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {connectedProviders.has('handcash') ? 'Connected' : 'Required'}
                      </div>
                      {connectedProviders.has('handcash') && (
                        <Check size={16} color="#00ff88" />
                      )}
                    </div>
                  </button>
                  
                  {/* Google */}
                  <button
                    onClick={() => handleProviderConnect('google')}
                    disabled={connectedProviders.has('google') || isConnecting !== null}
                    className="p-4 rounded-xl border transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: connectedProviders.has('google') ? '#4285f4' : 'var(--color-border)',
                      backgroundColor: connectedProviders.has('google') ? 'rgba(66,133,244,0.1)' : 'var(--bg-card)'
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: connectedProviders.has('google') ? '#4285f4' : 'rgba(66,133,244,0.1)',
                          color: connectedProviders.has('google') ? 'white' : '#4285f4'
                        }}
                      >
                        <Mail size={24} />
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                        Google
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {connectedProviders.has('google') ? 'Connected' : 'Drive Access'}
                      </div>
                      {connectedProviders.has('google') && (
                        <Check size={16} color="#4285f4" />
                      )}
                    </div>
                  </button>
                  
                  {/* Twitter */}
                  <button
                    onClick={() => handleProviderConnect('twitter')}
                    disabled={connectedProviders.has('twitter') || isConnecting !== null}
                    className="p-4 rounded-xl border transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: connectedProviders.has('twitter') ? '#1da1f2' : 'var(--color-border)',
                      backgroundColor: connectedProviders.has('twitter') ? 'rgba(29,161,242,0.1)' : 'var(--bg-card)'
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div 
                        className="p-3 rounded-lg"
                        style={{ 
                          backgroundColor: connectedProviders.has('twitter') ? '#1da1f2' : 'rgba(29,161,242,0.1)',
                          color: connectedProviders.has('twitter') ? 'white' : '#1da1f2'
                        }}
                      >
                        <Twitter size={24} />
                      </div>
                      <div className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>
                        X (Twitter)
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {connectedProviders.has('twitter') ? 'Connected' : 'Social'}
                      </div>
                      {connectedProviders.has('twitter') && (
                        <Check size={16} color="#1da1f2" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Subscription Plans - Horizontal Compact */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                    Choose Plan
                  </h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { 
                      id: 'free', 
                      name: 'Free', 
                      price: '0', 
                      storage: '5GB',
                      features: ['Basic encryption', 'Public sharing'],
                      color: '#888888'
                    },
                    { 
                      id: 'pro', 
                      name: 'Pro', 
                      price: '9.99', 
                      storage: '100GB',
                      features: ['NFT creation', 'Priority support'],
                      color: '#00ff88',
                      recommended: true
                    },
                    { 
                      id: 'enterprise', 
                      name: 'Enterprise', 
                      price: '49.99', 
                      storage: 'Unlimited',
                      features: ['Multi-sig', 'Custom domains'],
                      color: '#fbbf24'
                    }
                  ].map(tier => (
                    <button
                      key={tier.id}
                      onClick={() => setSubscriptionTier(tier.id as 'free' | 'pro' | 'enterprise')}
                      className="relative p-4 rounded-xl border transition-all"
                      style={{
                        borderColor: subscriptionTier === tier.id ? tier.color : 'var(--color-border)',
                        background: subscriptionTier === tier.id ? `${tier.color}10` : 'var(--bg-card)'
                      }}
                    >
                      {tier.recommended && (
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: tier.color,
                          color: '#000',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          Recommended
                        </span>
                      )}
                      <div className="text-center">
                        <div className="font-semibold text-sm" style={{ color: tier.color }}>
                          {tier.name}
                        </div>
                        <div className="text-2xl font-bold mt-1" style={{ color: 'var(--color-accent)' }}>
                          ${tier.price}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                          per month
                        </div>
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                          <div className="text-sm font-medium mb-2" style={{ color: tier.color }}>
                            {tier.storage}
                          </div>
                          {tier.features.map(feature => (
                            <div key={feature} className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                              {feature}
                            </div>
                          ))}
                        </div>
                        {subscriptionTier === tier.id && (
                          <Check size={16} style={{ color: tier.color, position: 'absolute', top: '8px', right: '8px' }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Balance & Top Up */}
            <div className="space-y-6">
              
              {/* Current Balance */}
              <div className="p-4 rounded-xl" style={{ 
                background: 'linear-gradient(135deg, rgba(0,255,136,0.1) 0%, rgba(0,204,106,0.1) 100%)',
                border: '1px solid rgba(0,255,136,0.3)'
              }}>
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Current Balance
                </div>
                <div className="text-3xl font-bold" style={{ color: '#00ff88' }}>
                  ₿ 0.00
                </div>
                <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  ≈ $0.00 USD
                </div>
              </div>

              {/* Top Up */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
                    Add Funds
                  </h3>
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {['10', '25', '50', '100'].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopupAmount(amount)}
                      className="p-2 rounded-lg border text-sm font-medium transition-all"
                      style={{
                        borderColor: topupAmount === amount ? '#00ff88' : 'var(--color-border)',
                        background: topupAmount === amount ? 'rgba(0,255,136,0.1)' : 'var(--bg-card)',
                        color: topupAmount === amount ? '#00ff88' : 'var(--color-text-muted)'
                      }}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>

                {/* Custom amount */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 p-2 rounded-lg border text-sm"
                    style={{
                      background: 'var(--bg-card)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-accent)'
                    }}
                  />
                  <button
                    className="px-4 py-2 rounded-lg font-medium text-sm transition-all"
                    style={{
                      background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                      color: '#000000'
                    }}
                  >
                    Add Funds
                  </button>
                </div>

                {/* Payment methods */}
                <div className="flex gap-2">
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    <CreditCard size={14} style={{ color: '#00ff88' }} />
                    Card
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border text-xs" style={{ borderColor: 'var(--color-border)' }}>
                    <Wallet size={14} style={{ color: '#00ff88' }} />
                    Crypto
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
                <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>
                  Selected Plan
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-accent)' }}>
                      {subscriptionTier === 'free' ? 'Free' : subscriptionTier === 'pro' ? 'Pro' : 'Enterprise'}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      ${subscriptionTier === 'free' ? '0' : subscriptionTier === 'pro' ? '9.99' : '49.99'}/mo
                    </div>
                  </div>
                  <Sparkles size={16} style={{ color: '#00ff88' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="p-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--color-border)', background: 'var(--bg-card)' }}>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectedProviders.has('handcash') ? 'bg-green-500' : 'bg-gray-500'}`} />
              HandCash {connectedProviders.has('handcash') ? 'Connected' : 'Required'}
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${connectedProviders.has('google') ? 'bg-green-500' : 'bg-gray-500'}`} />
              Google {connectedProviders.has('google') ? 'Connected' : 'Optional'}
            </div>
          </div>
          
          {connectedProviders.has('handcash') && (
            <button
              onClick={() => {
                if (onSuccess) onSuccess()
                onClose()
              }}
              className="px-6 py-2 rounded-lg font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ 
                backgroundColor: 'var(--color-primary)',
                color: 'var(--bg-primary)'
              }}
            >
              Continue to Bitcoin Drive
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
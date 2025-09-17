'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Mail, Twitter, Wallet, Shield, Check, CreditCard, DollarSign, Sparkles } from 'lucide-react'

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
  const [activeTab, setActiveTab] = useState<Tab>('connect')
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

  const tabs = [
    { id: 'connect', label: 'Connect Services', icon: <Wallet size={16} /> },
    { id: 'subscribe', label: 'Choose Plan', icon: <Shield size={16} /> },
    { id: 'topup', label: 'Add Funds', icon: <CreditCard size={16} /> }
  ]

  const handleProviderConnect = async (providerId: string) => {
    setIsConnecting(providerId)
    
    if (providerId === 'handcash') {
      const popup = window.open(
        'https://app.handcash.io/auth',
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
    } else {
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
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
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

        {/* Tabs */}
        <div className="border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'border-b-2 border-green-500' 
                    : 'hover:bg-black/5'
                }`}
                style={{ 
                  color: activeTab === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderBottomColor: activeTab === tab.id ? '#00ff88' : 'transparent'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8" style={{ minHeight: '400px' }}>
          {activeTab === 'connect' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
                  Connect Your Services
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Link your accounts to access files and enable payments
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    onClick={() => handleProviderConnect(provider.id)}
                    disabled={provider.connected || isConnecting !== null}
                    className="group p-6 rounded-xl border-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: provider.connected ? provider.color : 'var(--color-border)',
                      backgroundColor: provider.connected 
                        ? `${provider.color}10`
                        : 'var(--bg-card)'
                    }}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div 
                        className="p-4 rounded-xl transition-colors"
                        style={{ 
                          backgroundColor: provider.connected ? provider.color : `${provider.color}20`,
                          color: provider.connected ? '#ffffff' : provider.color
                        }}
                      >
                        {provider.icon}
                      </div>
                      <div className="text-center">
                        <h4 className="font-semibold" style={{ color: 'var(--color-accent)' }}>
                          {provider.name}
                        </h4>
                        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          {provider.connected ? 'Connected' : 'Click to connect'}
                        </p>
                      </div>
                      {provider.connected && (
                        <Check size={20} color={provider.color} />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'subscribe' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
                  Choose Your Plan
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Select the plan that best fits your storage needs
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer hover:scale-[1.02] ${
                      subscriptionTier === plan.id ? 'ring-2 ring-green-500' : ''
                    }`}
                    style={{ 
                      borderColor: subscriptionTier === plan.id ? '#00ff88' : 'var(--color-border)',
                      backgroundColor: plan.popular ? 'rgba(0,255,136,0.05)' : 'var(--bg-card)'
                    }}
                    onClick={() => setSubscriptionTier(plan.id as typeof subscriptionTier)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-accent)' }}>
                        {plan.name}
                      </h4>
                      <div className="mb-4">
                        <span className="text-3xl font-bold" style={{ color: plan.color }}>
                          {plan.price}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          /{plan.period}
                        </span>
                      </div>
                      <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Check size={16} color="#00ff88" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'topup' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>
                  Add Funds to Your Account
                </h3>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Top up your balance to pay for storage and transactions
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
                    Amount (USD)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {['10', '25', '50', '100'].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTopupAmount(amount)}
                        className={`py-2 px-4 rounded-lg border-2 transition-all ${
                          topupAmount === amount ? 'border-green-500 bg-green-500/10' : 'border-gray-600'
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
                    className="w-full p-3 rounded-lg border"
                    style={{ 
                      borderColor: 'var(--color-border)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--color-accent)'
                    }}
                    placeholder="Enter custom amount"
                  />
                </div>

                <button
                  className="w-full py-3 px-6 rounded-lg font-semibold transition-all hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                    color: '#000000'
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <DollarSign size={20} />
                    Add ${topupAmount} to Balance
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border transition-colors"
            style={{ 
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)'
            }}
          >
            Skip for now
          </button>
          
          <button
            onClick={() => {
              if (activeTab === 'connect') setActiveTab('subscribe')
              else if (activeTab === 'subscribe') setActiveTab('topup')
              else onClose()
            }}
            className="px-6 py-2 rounded-lg font-semibold transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
              color: '#000000'
            }}
          >
            {activeTab === 'topup' ? 'Complete Setup' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
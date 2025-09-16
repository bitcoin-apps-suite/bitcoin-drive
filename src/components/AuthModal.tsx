'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { X, Mail, Twitter, Wallet, Shield, Check } from 'lucide-react'

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
  
  const providers: AuthProvider[] = [
    {
      id: 'google',
      name: 'Google',
      icon: <Mail size={20} />,
      color: '#00ff88',
      connected: connectedProviders.has('google')
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: <Twitter size={20} />,
      color: '#00ff88',
      connected: connectedProviders.has('twitter')
    },
    {
      id: 'handcash',
      name: 'HandCash',
      icon: <Wallet size={20} />,
      color: '#00ff88',
      connected: connectedProviders.has('handcash')
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
      } else if (providerId === 'google') {
        // Google OAuth through NextAuth
        const result = await signIn('google', { 
          redirect: false,
          callbackUrl: window.location.href 
        })
        if (result?.ok) {
          setConnectedProviders(prev => new Set([...prev, providerId]))
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
        className="relative w-full max-w-md rounded-2xl shadow-2xl"
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
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Shield size={24} style={{ color: 'var(--bg-primary)' }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>
              Connect Your Accounts
            </h2>
          </div>
          
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Link your accounts to unlock all features of Bitcoin Drive
          </p>
        </div>

        {/* Providers List */}
        <div className="p-6 space-y-3">
          {providers.map((provider) => (
            <button
              key={provider.id}
              onClick={() => handleProviderConnect(provider.id)}
              disabled={provider.connected || isConnecting !== null}
              className="w-full p-4 rounded-xl border transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Features */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-accent)' }}>
            Why connect?
          </h3>
          <div className="space-y-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--color-primary)' }}>•</span>
              <span><strong>Google:</strong> Store files in Drive & sync across devices</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--color-primary)' }}>•</span>
              <span><strong>Twitter:</strong> Share files & announce releases</span>
            </div>
            <div className="flex items-start gap-2">
              <span style={{ color: 'var(--color-primary)' }}>•</span>
              <span><strong>HandCash:</strong> Pay with Bitcoin & receive payments</span>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="p-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => {
              if (allConnected && onSuccess) {
                onSuccess()
              }
              onClose()
            }}
            className="w-full py-3 rounded-lg font-semibold transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: allConnected ? 'var(--color-primary)' : 'var(--bg-card)',
              color: allConnected ? 'var(--bg-primary)' : 'var(--color-text-muted)',
              border: allConnected ? 'none' : '1px solid var(--color-border)'
            }}
          >
            {allConnected ? 'All Connected! Continue' : 'Skip for Now'}
          </button>
        </div>
      </div>
    </div>
  )
}
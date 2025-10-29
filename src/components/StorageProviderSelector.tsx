'use client'

import React from 'react'
import { HardDrive, Cloud, Shield, Database } from 'lucide-react'
import { StorageProvider } from '@/lib/storage/hybrid-storage'

interface StorageProviderSelectorProps {
  selectedProviders: StorageProvider[]
  onProvidersChange: (providers: StorageProvider[]) => void
  className?: string
}

const providerConfig = {
  'google-drive': {
    name: 'Google Drive',
    icon: Cloud,
    color: '#4285f4',
    description: 'Store files in Google Drive'
  },
  'dropblocks': {
    name: 'DropBlocks',
    icon: Shield,
    color: '#00ff88',
    description: 'Decentralized blockchain storage'
  },
  'local': {
    name: 'Local Storage',
    icon: HardDrive,
    color: '#6b7280',
    description: 'Store files locally'
  },
  'ipfs': {
    name: 'IPFS',
    icon: Database,
    color: '#ff6b35',
    description: 'InterPlanetary File System'
  }
}

export default function StorageProviderSelector({
  selectedProviders,
  onProvidersChange,
  className = ''
}: StorageProviderSelectorProps) {
  const toggleProvider = (provider: StorageProvider) => {
    if (selectedProviders.includes(provider)) {
      onProvidersChange(selectedProviders.filter(p => p !== provider))
    } else {
      onProvidersChange([...selectedProviders, provider])
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
        Storage:
      </span>
      
      {Object.entries(providerConfig).map(([provider, config]) => {
        const isSelected = selectedProviders.includes(provider as StorageProvider)
        const Icon = config.icon
        
        return (
          <button
            key={provider}
            onClick={() => toggleProvider(provider as StorageProvider)}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg text-sm transition-all ${
              isSelected 
                ? 'bg-white/10 border border-white/20' 
                : 'bg-white/5 border border-white/10 hover:bg-white/8'
            }`}
            title={config.description}
          >
            <Icon 
              size={16} 
              style={{ 
                color: isSelected ? config.color : 'rgba(255, 255, 255, 0.6)' 
              }} 
            />
            <span style={{ 
              color: isSelected ? config.color : 'rgba(255, 255, 255, 0.6)' 
            }}>
              {config.name}
            </span>
          </button>
        )
      })}
    </div>
  )
}
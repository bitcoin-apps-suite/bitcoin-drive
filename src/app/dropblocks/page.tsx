/**
 * DropBlocks Page for Bitcoin Drive
 * Dedicated page for decentralized file storage functionality
 * 
 * Based on original DropBlocks by Monte Ohrt (https://github.com/mohrt/dropblocks)
 * Copyright © 2025 The Bitcoin Corporation LTD.
 * Licensed under the Open BSV License Version 5
 */

'use client'

import { useState } from 'react'
import { HardDrive, Info, Shield, Clock, Zap, Coins, Globe, ChevronRight } from 'lucide-react'
import DropBlocksBrowser from '@/components/DropBlocksBrowser'

export default function DropBlocksPage() {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Hero Section */}
      <div className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <HardDrive size={32} style={{ color: '#00ff88' }} />
                <h1 className="text-3xl font-light" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                  DropBlocks Storage
                </h1>
              </div>
              
              <p className="text-lg mb-4" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                Decentralized file storage powered by BSV blockchain and UHRP protocol
              </p>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
                  <Shield size={16} style={{ color: '#00ff88' }} />
                  <span className="text-sm" style={{ color: '#00ff88' }}>Secure & Permanent</span>
                </div>
                
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ backgroundColor: 'rgba(66, 133, 244, 0.1)', border: '1px solid rgba(66, 133, 244, 0.3)' }}>
                  <Globe size={16} style={{ color: '#4285f4' }} />
                  <span className="text-sm" style={{ color: '#4285f4' }}>Globally Accessible</span>
                </div>
                
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-white/5 transition-colors"
                  style={{ border: '1px solid rgba(255, 255, 255, 0.2)' }}
                >
                  <Info size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                  <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Learn More</span>
                </button>
              </div>
            </div>
            
            {/* Attribution Box */}
            <div className="p-4 rounded-lg max-w-md" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>Based on DropBlocks</h3>
              <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                This implementation is derived from the original DropBlocks project by Monte Ohrt, 
                providing decentralized file storage on the BSV blockchain.
              </p>
              <a
                href="https://github.com/mohrt/dropblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm underline hover:text-white transition-colors"
                style={{ color: '#00ff88' }}
              >
                View Original Project
                <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Info Section */}
      {showInfo && (
        <div className="border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.12)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Shield size={24} style={{ color: '#00ff88', marginBottom: '12px' }} />
                <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>Permanent Storage</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Files are stored permanently on the BSV blockchain with cryptographic proof of integrity.
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Clock size={24} style={{ color: '#4285f4', marginBottom: '12px' }} />
                <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>Flexible Retention</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Set custom retention periods and renew files before expiration to maintain access.
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Zap size={24} style={{ color: '#ff9900', marginBottom: '12px' }} />
                <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>UHRP Protocol</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Utilizes Unified Hosted Resource Protocol for efficient decentralized storage.
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Coins size={24} style={{ color: '#ffcc00', marginBottom: '12px' }} />
                <h3 className="font-medium mb-2" style={{ color: '#ffffff' }}>Cost Effective</h3>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Pay only for what you use with transparent BSV-based pricing.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <h3 className="font-medium mb-3" style={{ color: '#00ff88' }}>How It Works</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#00ff88', color: '#000000' }}>
                      1
                    </div>
                    <span className="font-medium" style={{ color: '#ffffff' }}>Upload & Encrypt</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Upload your files with optional encryption. Files are hashed and metadata is recorded on the blockchain.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#4285f4', color: '#ffffff' }}>
                      2
                    </div>
                    <span className="font-medium" style={{ color: '#ffffff' }}>Blockchain Proof</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    File integrity is verified through blockchain transactions, ensuring permanent proof of existence.
                  </p>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: '#ff9900', color: '#ffffff' }}>
                      3
                    </div>
                    <span className="font-medium" style={{ color: '#ffffff' }}>Access Anywhere</span>
                  </div>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Access your files from any device using the blockchain-verified content addressing system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        <DropBlocksBrowser className="h-full" />
      </div>
    </div>
  )
}
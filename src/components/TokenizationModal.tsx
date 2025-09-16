'use client'

import { useState } from 'react'
import { X, Coins, Zap, Info } from 'lucide-react'
import { TOKEN_PROTOCOLS, REVENUE_MODELS } from '@/lib/nft-container'

interface TokenizationModalProps {
  isOpen: boolean
  onClose: () => void
  fileName: string
  fileSize: number
  mimeType: string
  onTokenize: (settings: TokenizationSettings) => void
}

export interface TokenizationSettings {
  // Token settings
  protocol: string
  tokenName: string
  tokenSymbol: string
  totalSupply: number
  decimals: number
  
  // Share distribution
  initialDistribution: {
    creator: number // percentage
    public: number  // percentage for public sale
    reserved: number // percentage reserved
  }
  sharePrice: number // Price per share in BSV
  
  // Revenue models
  revenueModels: Array<{
    type: string
    price: number
    currency: 'BSV' | 'USD'
    duration?: number
  }>
  
  // Rights & royalties
  royaltyPercentage: number
  transferable: boolean
  resellable: boolean
  commercialUse: boolean
  
  // Protection
  encrypted: boolean
  watermarked: boolean
  expiryDate?: Date
}

export default function TokenizationModal({ 
  isOpen, 
  onClose, 
  fileName,
  fileSize,
  mimeType,
  onTokenize 
}: TokenizationModalProps) {
  const [step, setStep] = useState(1)
  const [protocol, setProtocol] = useState('STAS')
  const [tokenName, setTokenName] = useState(`${fileName} Token`)
  const [tokenSymbol, setTokenSymbol] = useState('FILE')
  const [totalSupply, setTotalSupply] = useState(1000000)
  const [sharePrice, setSharePrice] = useState(0.001)
  
  const [creatorShare, setCreatorShare] = useState(30)
  const [publicShare, setPublicShare] = useState(60)
  const [reservedShare, setReservedShare] = useState(10)
  
  const [selectedRevModels, setSelectedRevModels] = useState<Set<string>>(new Set(['pay-per-download']))
  const [modelPrices, setModelPrices] = useState<Record<string, number>>({
    'pay-per-view': 0.01,
    'pay-per-second': 0.0001,
    'pay-per-download': 0.05,
    'subscription': 0.99
  })
  
  const [royaltyPercentage, setRoyaltyPercentage] = useState(10)
  const [transferable, setTransferable] = useState(true)
  const [resellable, setResellable] = useState(true)
  const [commercialUse, setCommercialUse] = useState(false)
  
  const handleTokenize = () => {
    const settings: TokenizationSettings = {
      protocol,
      tokenName,
      tokenSymbol,
      totalSupply,
      decimals: 8,
      initialDistribution: {
        creator: creatorShare,
        public: publicShare,
        reserved: reservedShare
      },
      sharePrice,
      revenueModels: Array.from(selectedRevModels).map(model => ({
        type: model,
        price: modelPrices[model],
        currency: 'BSV' as const,
        duration: model === 'pay-per-second' ? 1 : undefined
      })),
      royaltyPercentage,
      transferable,
      resellable,
      commercialUse,
      encrypted: false,
      watermarked: mimeType.startsWith('video/') || mimeType.startsWith('image/')
    }
    
    onTokenize(settings)
    onClose()
  }
  
  const estimatedMarketCap = totalSupply * sharePrice
  const creatorTokens = Math.floor(totalSupply * (creatorShare / 100))
  const publicTokens = Math.floor(totalSupply * (publicShare / 100))
  const reservedTokens = Math.floor(totalSupply * (reservedShare / 100))
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 border-b p-6" 
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#00ff88' }}>
              <Coins size={24} style={{ color: '#000000' }} />
            </div>
            <div>
              <h2 className="text-2xl font-light" style={{ color: '#ffffff' }}>
                Tokenize & Issue Shares
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                Convert &quot;{fileName}&quot; into a tradeable asset with revenue sharing
              </p>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 h-1 rounded-full"
                style={{ 
                  backgroundColor: i <= step ? '#00ff88' : 'rgba(255, 255, 255, 0.1)'
                }} />
            ))}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#00ff88' }}>
                Step 1: Choose Token Protocol
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(TOKEN_PROTOCOLS).map(([key, protocolInfo]) => (
                  <button key={key}
                    onClick={() => setProtocol(key)}
                    className="p-4 rounded-lg border text-left transition-all"
                    style={{
                      backgroundColor: protocol === key ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: protocol === key ? '#00ff88' : 'rgba(255, 255, 255, 0.1)'
                    }}>
                    <div className="font-medium mb-1" style={{ color: '#ffffff' }}>
                      {protocolInfo.name}
                    </div>
                    <div className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                      {protocolInfo.description}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {protocolInfo.features.map((feature, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded"
                          style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', color: '#00ff88' }}>
                          {feature}
                        </span>
                      ))}
                    </div>
                    <div className="text-xs mt-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                      Est. gas: {protocolInfo.gasEstimate} BSV
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#00ff88' }}>
                Step 2: Configure Token & Shares
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Token Name
                  </label>
                  <input type="text" value={tokenName} onChange={(e) => setTokenName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Token Symbol
                  </label>
                  <input type="text" value={tokenSymbol} onChange={(e) => setTokenSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Total Supply (Shares)
                  </label>
                  <input type="number" value={totalSupply} 
                    onChange={(e) => setTotalSupply(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }} />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Price per Share (BSV)
                  </label>
                  <input type="number" value={sharePrice} step="0.0001"
                    onChange={(e) => setSharePrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#ffffff'
                    }} />
                </div>
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                <h4 className="font-medium mb-3" style={{ color: '#00ff88' }}>Initial Distribution</h4>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Creator (You)</span>
                      <span style={{ color: '#00ff88' }}>{creatorShare}% = {creatorTokens.toLocaleString()} tokens</span>
                    </div>
                    <input type="range" min="0" max="100" value={creatorShare}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        setCreatorShare(val)
                        setPublicShare(Math.min(100 - val - reservedShare, 100))
                      }}
                      className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Public Sale</span>
                      <span style={{ color: '#00ff88' }}>{publicShare}% = {publicTokens.toLocaleString()} tokens</span>
                    </div>
                    <input type="range" min="0" max="100" value={publicShare}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        setPublicShare(val)
                        setCreatorShare(Math.min(100 - val - reservedShare, 100))
                      }}
                      className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Reserved</span>
                      <span style={{ color: '#00ff88' }}>{reservedShare}% = {reservedTokens.toLocaleString()} tokens</span>
                    </div>
                    <input type="range" min="0" max="100" value={reservedShare}
                      onChange={(e) => {
                        const val = parseInt(e.target.value)
                        setReservedShare(val)
                        setPublicShare(Math.min(100 - creatorShare - val, 100))
                      }}
                      className="w-full" />
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                  <div className="flex justify-between">
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Estimated Market Cap:</span>
                    <span style={{ color: '#ffffff' }}>{estimatedMarketCap.toFixed(4)} BSV</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Your Initial Value:</span>
                    <span style={{ color: '#00ff88' }}>{(creatorTokens * sharePrice).toFixed(4)} BSV</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#00ff88' }}>
                Step 3: Revenue Models
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(REVENUE_MODELS).map(([key, model]) => (
                  <div key={key} className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: selectedRevModels.has(key) ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                      borderColor: selectedRevModels.has(key) ? '#00ff88' : 'rgba(255, 255, 255, 0.1)'
                    }}>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" 
                        checked={selectedRevModels.has(key)}
                        onChange={(e) => {
                          const newSet = new Set(selectedRevModels)
                          if (e.target.checked) {
                            newSet.add(key)
                          } else {
                            newSet.delete(key)
                          }
                          setSelectedRevModels(newSet)
                        }}
                        className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{model.icon}</span>
                          <span className="font-medium" style={{ color: '#ffffff' }}>{model.name}</span>
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          {model.description}
                        </p>
                        {selectedRevModels.has(key) && (
                          <div className="mt-2">
                            <label className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              Price (BSV)
                            </label>
                            <input type="number" 
                              value={modelPrices[key]} 
                              step="0.0001"
                              onChange={(e) => setModelPrices({...modelPrices, [key]: parseFloat(e.target.value)})}
                              className="w-full px-2 py-1 rounded text-sm mt-1"
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#ffffff'
                              }} />
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 149, 0, 0.1)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} style={{ color: '#ff9500' }} />
                  <span className="font-medium" style={{ color: '#ff9500' }}>Revenue Distribution</span>
                </div>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  All revenue generated from this file will be automatically distributed to token holders 
                  based on their ownership percentage. You&apos;ll receive {creatorShare}% of all revenue 
                  plus {royaltyPercentage}% royalty on secondary sales.
                </p>
              </div>
            </div>
          )}
          
          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#00ff88' }}>
                Step 4: Rights & Protection
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                    Creator Royalty on Secondary Sales
                  </label>
                  <div className="flex items-center gap-3">
                    <input type="range" min="0" max="25" value={royaltyPercentage}
                      onChange={(e) => setRoyaltyPercentage(parseInt(e.target.value))}
                      className="flex-1" />
                    <span className="w-12 text-right" style={{ color: '#00ff88' }}>{royaltyPercentage}%</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={transferable} 
                      onChange={(e) => setTransferable(e.target.checked)} />
                    <div>
                      <div style={{ color: '#ffffff' }}>Transferable</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Token holders can transfer their shares to others
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={resellable} 
                      onChange={(e) => setResellable(e.target.checked)} />
                    <div>
                      <div style={{ color: '#ffffff' }}>Resellable</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Token holders can sell their shares on secondary markets
                      </div>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={commercialUse} 
                      onChange={(e) => setCommercialUse(e.target.checked)} />
                    <div>
                      <div style={{ color: '#ffffff' }}>Commercial Use</div>
                      <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Token holders can use the content for commercial purposes
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Summary */}
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)' }}>
                <h4 className="font-medium mb-3" style={{ color: '#00ff88' }}>Tokenization Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Protocol:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{TOKEN_PROTOCOLS[protocol as keyof typeof TOKEN_PROTOCOLS].name}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Token:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{tokenSymbol}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Total Supply:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{totalSupply.toLocaleString()}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Market Cap:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{estimatedMarketCap.toFixed(4)} BSV</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Revenue Models:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{selectedRevModels.size}</span>
                  </div>
                  <div>
                    <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Your Royalty:</span>
                    <span style={{ color: '#ffffff', marginLeft: '8px' }}>{royaltyPercentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 border-t p-6 flex justify-between"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          <button onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.8)'
            }}>
            Previous
          </button>
          
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}
              className="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: '#00ff88',
                color: '#000000'
              }}>
              Next
              <Zap size={16} />
            </button>
          ) : (
            <button onClick={handleTokenize}
              className="px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: '#00ff88',
                color: '#000000'
              }}>
              <Coins size={16} />
              Tokenize & Issue Shares
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
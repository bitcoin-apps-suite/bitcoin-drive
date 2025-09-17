'use client'

import { useState } from 'react'
import { X, Upload, Hash, HardDrive, Lock, DollarSign, FileText, AlertCircle, Cloud, Coins, Wallet, Database, Zap, Globe, Check } from 'lucide-react'
import { 
  SiGoogledrive, 
  SiAmazon, 
  SiCloudflare, 
  SiGoogle, 
  SiSupabase,
  SiBitcoin,
  SiShopify,
  SiStripe,
  SiPaypal
} from 'react-icons/si'
import type { StorageProvider } from './StorageConnector'

interface BlockchainUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, options: UploadOptions) => void
  connectedProviders?: StorageProvider[]
  isHandCashConnected?: boolean
  connectedServiceIds?: Set<string>
}

export interface UploadOptions {
  method: 'op_return' | 'op_pushdata4' | 'hash_drive' | 'full_chain'
  encrypt: boolean
  timelock?: Date
  price?: number
  currency: 'BSV' | 'USD'
  description?: string
  cloudProvider?: string
  tokenize?: boolean
}

export default function BlockchainUploadModal({ isOpen, onClose, onUpload, connectedProviders = [], isHandCashConnected = false, connectedServiceIds = new Set() }: BlockchainUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<UploadOptions['method']>('op_return')
  const [encrypt, setEncrypt] = useState(false)
  const [enableTimelock, setEnableTimelock] = useState(false)
  const [timelockDate, setTimelockDate] = useState('')
  const [enablePrice, setEnablePrice] = useState(false)
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'BSV' | 'USD'>('BSV')
  const [description] = useState('')
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  const [selectedCloudProvider, setSelectedCloudProvider] = useState<string>('')
  const [enableTokenization, setEnableTokenization] = useState(false)
  
  // Modal states for the four options
  const [showEncryptModal, setShowEncryptModal] = useState(false)
  const [showTimelockModal, setShowTimelockModal] = useState(false)
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [showTokenizeModal, setShowTokenizeModal] = useState(false)

  const calculateCost = (file: File | null, method: UploadOptions['method']) => {
    if (!file) return 0
    const sizeInKB = file.size / 1024
    
    switch (method) {
      case 'op_return':
        return sizeInKB * 0.00002 // Cloud storage + OP_RETURN validation
      case 'op_pushdata4':
        return sizeInKB * 0.0001 // Full file on chain (permanent)
      default:
        return 0
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setEstimatedCost(calculateCost(file, uploadMethod))
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return

    const options: UploadOptions = {
      method: uploadMethod,
      encrypt,
      timelock: enableTimelock && timelockDate ? new Date(timelockDate) : undefined,
      price: enablePrice && price ? parseFloat(price) : undefined,
      currency,
      description,
      cloudProvider: selectedCloudProvider,
      tokenize: enableTokenization
    }

    onUpload(selectedFile, options)
    onClose()
  }

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
        className="relative w-full max-w-2xl rounded-2xl shadow-2xl"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)', border: '1px solid rgba(255, 255, 255, 0.12)' }}
      >
        {/* Header */}
        <div className="border-b p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
          </button>
          
          {/* HandCash Status */}
          <div className="absolute right-16 top-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${isHandCashConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <SiBitcoin size={16} style={{ color: isHandCashConnected ? '#00ff88' : '#ff4444' }} />
              <span className="text-xs font-medium" style={{ color: isHandCashConnected ? '#00ff88' : '#ff4444' }}>
                {isHandCashConnected ? 'HandCash Connected' : 'HandCash Disconnected'}
              </span>
              {isHandCashConnected && <Check size={12} style={{ color: '#00ff88' }} />}
            </div>
          </div>
          
          <h2 className="text-2xl font-light" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
            Upload to Blockchain
          </h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Create a paywall for your content. Users pay to stream, download, or access your files.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Storage & Delivery Services */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Your connected Storage and delivery services
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'googledrive', name: 'Google Drive', icon: <SiGoogledrive size={16} />, color: '#4285f4' },
                { id: 'aws', name: 'AWS S3', icon: <SiAmazon size={16} />, color: '#ff9900' },
                { id: 'cloudflare', name: 'Cloudflare', icon: <SiCloudflare size={16} />, color: '#f38020' },
                { id: 'googlecloud', name: 'Google Cloud', icon: <SiGoogle size={16} />, color: '#ea4335' },
                { id: 'azure', name: 'Azure Blob', icon: <Cloud size={16} />, color: '#0078d4' },
                { id: 'supabase', name: 'SupaBase', icon: <SiSupabase size={16} />, color: '#3ecf8e' },
                { id: 'dropbox', name: 'Dropbox', icon: <Database size={16} />, color: '#0061ff' },
                { id: 'fastly', name: 'Fastly CDN', icon: <Zap size={16} />, color: '#ff282d' },
                { id: 'netlify', name: 'Netlify', icon: <Globe size={16} />, color: '#00c7b7' },
                { id: 'stripe', name: 'Stripe', icon: <SiStripe size={16} />, color: '#635bff' },
                { id: 'paypal', name: 'PayPal', icon: <SiPaypal size={16} />, color: '#0070ba' },
                { id: 'shopify', name: 'Shopify', icon: <SiShopify size={16} />, color: '#7ab55c' }
              ].map((service) => {
                const isConnected = connectedServiceIds.has(service.id)
                const isSelected = selectedCloudProvider === service.name.toLowerCase()
                
                return (
                  <button
                    key={service.name}
                    onClick={() => isConnected ? setSelectedCloudProvider(service.name.toLowerCase()) : null}
                    disabled={!isConnected}
                    className={`p-3 rounded-lg border transition-all text-xs ${isConnected ? 'hover:scale-[1.02] cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 255, 136, 0.1)' : isConnected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      borderColor: isSelected ? '#00ff88' : isConnected ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
                      color: isConnected ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div style={{ color: isConnected ? service.color : 'rgba(255, 255, 255, 0.3)' }}>
                        {service.icon}
                      </div>
                      {isConnected && <Check size={12} style={{ color: service.color }} />}
                    </div>
                    <div>{service.name}</div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Storage Options */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Storage Options
            </label>
            <div className="text-xs mb-3 p-3 rounded-lg flex items-start gap-2" style={{ color: 'rgba(255, 255, 255, 0.6)', backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <FileText size={14} style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '1px', flexShrink: 0 }} />
              <span>Note: File hash is always stored on-chain for verification. Storage services validate ownership via blockchain proof.</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setUploadMethod('op_return')
                  setEstimatedCost(calculateCost(selectedFile, 'op_return'))
                }}
                className={`p-4 rounded-lg border transition-all ${uploadMethod === 'op_return' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'op_return' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'op_return' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <Cloud size={24} style={{ color: '#4285f4', margin: '0 auto 8px' }} />
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Cloud Storage</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Cheaper • Uses storage services</div>
              </button>

              <button
                onClick={() => {
                  setUploadMethod('op_pushdata4')
                  setEstimatedCost(calculateCost(selectedFile, 'op_pushdata4'))
                }}
                className={`p-4 rounded-lg border transition-all ${uploadMethod === 'op_pushdata4' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'op_pushdata4' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'op_pushdata4' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <HardDrive size={24} style={{ color: '#00ff88', margin: '0 auto 8px' }} />
                <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>Full Chain Storage</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '12px' }}>Permanent • Directly on blockchain</div>
              </button>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium mb-3" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Upload Options
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Encryption */}
              <button
                onClick={() => {
                  setEncrypt(!encrypt)
                  setShowEncryptModal(true)
                }}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${encrypt ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: encrypt ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: encrypt ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} style={{ color: encrypt ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' }} />
                  {encrypt && <Check size={14} style={{ color: '#00ff88' }} />}
                </div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Encryption</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Secure file with password</div>
              </button>

              {/* Timelock */}
              <button
                onClick={() => {
                  setEnableTimelock(!enableTimelock)
                  setShowTimelockModal(true)
                }}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${enableTimelock ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: enableTimelock ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: enableTimelock ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Lock size={18} style={{ color: enableTimelock ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' }} />
                  {enableTimelock && <Check size={14} style={{ color: '#00ff88' }} />}
                </div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Timelock</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Release at future date</div>
              </button>

              {/* Price Gate */}
              <button
                onClick={() => {
                  setEnablePrice(!enablePrice)
                  setShowPriceModal(true)
                }}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${enablePrice ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: enablePrice ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: enablePrice ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} style={{ color: enablePrice ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' }} />
                  {enablePrice && <Check size={14} style={{ color: '#00ff88' }} />}
                </div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Paywall</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Set access price</div>
              </button>

              {/* Tokenization */}
              <button
                onClick={() => {
                  setEnableTokenization(!enableTokenization)
                  setShowTokenizeModal(true)
                }}
                className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${enableTokenization ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: enableTokenization ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: enableTokenization ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Coins size={18} style={{ color: enableTokenization ? '#00ff88' : 'rgba(255, 255, 255, 0.6)' }} />
                  {enableTokenization && <Check size={14} style={{ color: '#00ff88' }} />}
                </div>
                <div style={{ color: '#ffffff', fontSize: '13px', fontWeight: '500' }}>Tokenize</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Create revenue shares</div>
              </button>
            </div>
            
            {/* Configuration panels that show when options are enabled */}
            {enableTimelock && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Timelock Date
                </label>
                <input
                  type="datetime-local"
                  value={timelockDate}
                  onChange={(e) => setTimelockDate(e.target.value)}
                  className="px-3 py-2 rounded border w-full"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}
            
            {enablePrice && (
              <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.05)', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  Access Price
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="px-3 py-2 rounded border flex-1"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '13px'
                    }}
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as 'BSV' | 'USD')}
                    className="px-3 py-2 rounded border"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
                      fontSize: '13px'
                    }}
                  >
                    <option value="BSV">BSV</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Cost Estimate */}
          {selectedFile && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)' }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} style={{ color: '#00ff88' }} />
                <span style={{ color: '#00ff88', fontSize: '13px', fontWeight: '500' }}>
                  Estimated Cost
                </span>
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                {estimatedCost.toFixed(8)} BSV (~${(estimatedCost * 50).toFixed(2)} USD)
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px', marginTop: '4px' }}>
                Based on current network fees
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-between" style={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'rgba(255, 255, 255, 0.8)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-6 py-2 rounded-lg font-medium transition-all"
            style={{
              backgroundColor: selectedFile ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
              color: selectedFile ? '#000000' : 'rgba(255, 255, 255, 0.3)',
              cursor: selectedFile ? 'pointer' : 'not-allowed'
            }}
          >
            Upload to Blockchain
          </button>
        </div>
      </div>
    </div>
  )
}
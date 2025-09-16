'use client'

import { useState } from 'react'
import { X, Upload, Hash, HardDrive, Lock, DollarSign, FileText, AlertCircle } from 'lucide-react'

interface BlockchainUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, options: UploadOptions) => void
}

export interface UploadOptions {
  method: 'op_return' | 'op_pushdata4' | 'hash_drive' | 'full_chain'
  encrypt: boolean
  timelock?: Date
  price?: number
  currency: 'BSV' | 'USD'
  description?: string
}

export default function BlockchainUploadModal({ isOpen, onClose, onUpload }: BlockchainUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadMethod, setUploadMethod] = useState<UploadOptions['method']>('hash_drive')
  const [encrypt, setEncrypt] = useState(false)
  const [enableTimelock, setEnableTimelock] = useState(false)
  const [timelockDate, setTimelockDate] = useState('')
  const [enablePrice, setEnablePrice] = useState(false)
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'BSV' | 'USD'>('BSV')
  const [description] = useState('')
  const [estimatedCost, setEstimatedCost] = useState<number>(0)

  const calculateCost = (file: File | null, method: UploadOptions['method']) => {
    if (!file) return 0
    const sizeInKB = file.size / 1024
    
    switch (method) {
      case 'op_return':
        return sizeInKB * 0.00001 // ~220 bytes max
      case 'op_pushdata4':
        return sizeInKB * 0.00005 // Up to 4GB
      case 'full_chain':
        return sizeInKB * 0.0001 // Full file on chain
      case 'hash_drive':
        return 0.00001 // Just hash on chain
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
      description
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
          
          <h2 className="text-2xl font-light" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
            Upload to Blockchain
          </h2>
          <p className="text-sm mt-2" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            Choose how to store your file on Bitcoin SV
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Select File
            </label>
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all"
              style={{ 
                borderColor: selectedFile ? '#00ff88' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: selectedFile ? 'rgba(0, 255, 136, 0.05)' : 'transparent'
              }}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div>
                  <FileText size={32} style={{ color: '#00ff88', margin: '0 auto 8px' }} />
                  <p style={{ color: '#ffffff' }}>{selectedFile.name}</p>
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '12px' }}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <Upload size={32} style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 auto 8px' }} />
                  <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    Click to select or drag and drop
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Upload Method */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
              Storage Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setUploadMethod('hash_drive')
                  setEstimatedCost(calculateCost(selectedFile, 'hash_drive'))
                }}
                className={`p-3 rounded-lg border transition-all ${uploadMethod === 'hash_drive' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'hash_drive' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'hash_drive' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <Hash size={20} style={{ color: '#00ff88', margin: '0 auto 4px' }} />
                <div style={{ color: '#ffffff', fontSize: '13px' }}>Hash + Drive</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Cheapest</div>
              </button>

              <button
                onClick={() => {
                  setUploadMethod('op_return')
                  setEstimatedCost(calculateCost(selectedFile, 'op_return'))
                }}
                className={`p-3 rounded-lg border transition-all ${uploadMethod === 'op_return' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'op_return' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'op_return' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <FileText size={20} style={{ color: '#00ff88', margin: '0 auto 4px' }} />
                <div style={{ color: '#ffffff', fontSize: '13px' }}>OP_RETURN</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>220 bytes</div>
              </button>

              <button
                onClick={() => {
                  setUploadMethod('op_pushdata4')
                  setEstimatedCost(calculateCost(selectedFile, 'op_pushdata4'))
                }}
                className={`p-3 rounded-lg border transition-all ${uploadMethod === 'op_pushdata4' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'op_pushdata4' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'op_pushdata4' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <HardDrive size={20} style={{ color: '#00ff88', margin: '0 auto 4px' }} />
                <div style={{ color: '#ffffff', fontSize: '13px' }}>OP_PUSHDATA4</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Up to 4GB</div>
              </button>

              <button
                onClick={() => {
                  setUploadMethod('full_chain')
                  setEstimatedCost(calculateCost(selectedFile, 'full_chain'))
                }}
                className={`p-3 rounded-lg border transition-all ${uploadMethod === 'full_chain' ? 'border-green-500' : ''}`}
                style={{
                  backgroundColor: uploadMethod === 'full_chain' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  borderColor: uploadMethod === 'full_chain' ? '#00ff88' : 'rgba(255, 255, 255, 0.12)'
                }}
              >
                <Upload size={20} style={{ color: '#00ff88', margin: '0 auto 4px' }} />
                <div style={{ color: '#ffffff', fontSize: '13px' }}>Full Chain</div>
                <div style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '11px' }}>Permanent</div>
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Encryption */}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="w-4 h-4"
              />
              <Lock size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                Encrypt file before upload
              </span>
            </label>

            {/* Timelock */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enableTimelock}
                  onChange={(e) => setEnableTimelock(e.target.checked)}
                  className="w-4 h-4"
                />
                <Lock size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  Set timelock (file unlocks at future date)
                </span>
              </label>
              {enableTimelock && (
                <input
                  type="datetime-local"
                  value={timelockDate}
                  onChange={(e) => setTimelockDate(e.target.value)}
                  className="ml-7 px-3 py-1 rounded border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    fontSize: '13px'
                  }}
                />
              )}
            </div>

            {/* Price Gate */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={enablePrice}
                  onChange={(e) => setEnablePrice(e.target.checked)}
                  className="w-4 h-4"
                />
                <DollarSign size={16} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px' }}>
                  Set access price
                </span>
              </label>
              {enablePrice && (
                <div className="ml-7 flex gap-2">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="px-3 py-1 rounded border w-24"
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
                    className="px-3 py-1 rounded border"
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
              )}
            </div>
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
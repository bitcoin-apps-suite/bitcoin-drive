'use client'

import { useState, useRef } from 'react'
import { X, Upload, HardDrive, Cloud } from 'lucide-react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (file: File, options: UploadOptions) => void
}

export interface UploadOptions {
  storageMode: 'full-bsv' | 'hybrid'
  price?: number
  currency: 'USD' | 'BSV'
  description?: string
  encryptFile: boolean
}

export default function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [storageMode, setStorageMode] = useState<'full-bsv' | 'hybrid'>('hybrid')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'BSV'>('USD')
  const [description, setDescription] = useState('')
  const [encryptFile, setEncryptFile] = useState(false)
  const [estimatedCost, setEstimatedCost] = useState<string>('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      calculateEstimatedCost(file)
    }
  }

  const calculateEstimatedCost = (file: File) => {
    // const sizeInMB = file.size / (1024 * 1024)
    if (storageMode === 'full-bsv') {
      // Rough estimate: $0.0001 per KB on BSV
      const costInUSD = (file.size / 1024) * 0.0001
      setEstimatedCost(`~$${costInUSD.toFixed(4)} USD`)
    } else {
      // Hybrid mode: just metadata cost
      setEstimatedCost('~$0.0001 USD (metadata only)')
    }
  }

  const handleUpload = () => {
    if (!selectedFile) return
    
    onUpload(selectedFile, {
      storageMode,
      price: price ? parseFloat(price) : undefined,
      currency,
      description,
      encryptFile
    })
    
    // Reset form
    setSelectedFile(null)
    setPrice('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 w-full max-w-2xl" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Upload File</h2>
          <button
            onClick={onClose}
            className="transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            <X size={24} />
          </button>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-8 border-2 border-dashed rounded-lg transition-all hover:opacity-80"
            style={{ borderColor: 'var(--color-border)' }}
          >
            {selectedFile ? (
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--color-accent)' }}>{selectedFile.name}</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" style={{ color: 'var(--color-primary)' }} />
                <p style={{ color: 'var(--color-accent)' }}>Click to select file</p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>or drag and drop</p>
              </div>
            )}
          </button>
        </div>

        {/* Storage Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
            Storage Mode
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setStorageMode('full-bsv')
                if (selectedFile) calculateEstimatedCost(selectedFile)
              }}
              className="p-4 rounded-lg border transition-all hover:opacity-90"
              style={{
                borderColor: storageMode === 'full-bsv' ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: storageMode === 'full-bsv' ? 'var(--color-hover)' : 'transparent'
              }}
            >
              <HardDrive className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-medium" style={{ color: 'var(--color-accent)' }}>Full BSV</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Permanent on-chain storage
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Higher cost</p>
            </button>
            
            <button
              onClick={() => {
                setStorageMode('hybrid')
                if (selectedFile) calculateEstimatedCost(selectedFile)
              }}
              className="p-4 rounded-lg border transition-all hover:opacity-90"
              style={{
                borderColor: storageMode === 'hybrid' ? 'var(--color-primary)' : 'var(--color-border)',
                backgroundColor: storageMode === 'hybrid' ? 'var(--color-hover)' : 'transparent'
              }}
            >
              <Cloud className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
              <p className="font-medium" style={{ color: 'var(--color-accent)' }}>Hybrid</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Google Drive + BSV metadata
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Lower cost</p>
            </button>
          </div>
          {estimatedCost && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
              Estimated cost: {estimatedCost}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
            Set Access Price (Optional)
          </label>
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 rounded-md focus:outline-none"
                style={{ 
                  backgroundColor: 'var(--bg-primary)', 
                  borderColor: 'var(--color-border)', 
                  color: 'var(--color-accent)',
                  border: '1px solid var(--color-border)'
                }}
              />
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as 'USD' | 'BSV')}
              className="px-3 py-2 rounded-md focus:outline-none"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderColor: 'var(--color-border)', 
                color: 'var(--color-accent)',
                border: '1px solid var(--color-border)'
              }}
            >
              <option value="USD">USD</option>
              <option value="BSV">BSV</option>
            </select>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Leave empty for free access
          </p>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-accent)' }}>
            Description (Optional)
          </label>
          <textarea
            placeholder="What's in this file?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 bg-black border border-green-500/30 rounded-md text-green-400 placeholder-green-300/30 focus:outline-none focus:border-green-500"
          />
        </div>

        {/* Encryption Option */}
        <div className="mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={encryptFile}
              onChange={(e) => setEncryptFile(e.target.checked)}
              className="w-4 h-4 rounded"
              style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderColor: 'var(--color-border)',
                accentColor: 'var(--color-primary)'
              }}
            />
            <span className="text-sm" style={{ color: 'var(--color-accent)' }}>
              Encrypt file (only you can decrypt)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 transition-opacity hover:opacity-80"
            style={{ color: 'var(--color-accent)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="px-6 py-2 font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--bg-primary)'
            }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  )
}
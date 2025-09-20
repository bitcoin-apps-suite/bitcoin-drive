'use client'

import { useState } from 'react'
import { X, HardDrive, Shield, Eye, Code, Download, Upload, Key, Lock, Moon, Sun, Grid, List, Image as ImageIcon, ChevronRight } from 'lucide-react'

interface PreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

type Tab = 'storage' | 'blockchain' | 'privacy' | 'interface' | 'developer'

export default function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('storage')
  const [preferences, setPreferences] = useState({
    // Storage & Sync
    defaultProvider: 'hybrid',
    hybridRules: true,
    autoSync: true,
    localCacheSize: 5, // GB
    uploadChunkSize: 10, // MB
    
    // Blockchain
    network: 'mainnet',
    txPriority: 'standard',
    defaultEncryption: true,
    compression: true,
    paywallPrice: 0.001,
    nftNaming: 'auto',
    
    // Privacy
    masterKey: '',
    multiSig: false,
    privateMode: false,
    anonymousUploads: false,
    accessLogs: true,
    
    // Interface
    theme: 'dark',
    viewMode: 'grid',
    sortMethod: 'name',
    showHidden: false,
    sidebarWidth: 320,
    compactMode: false,
    
    // Developer
    apiKeys: {},
    webhookUrl: '',
    customRpc: '',
    debugMode: false
  })

  if (!isOpen) return null

  const tabs = [
    { id: 'storage', label: 'Storage & Sync', icon: <HardDrive size={16} /> },
    { id: 'blockchain', label: 'Blockchain', icon: <Lock size={16} /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Shield size={16} /> },
    { id: 'interface', label: 'Interface', icon: <Eye size={16} /> },
    { id: 'developer', label: 'Developer', icon: <Code size={16} /> }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-4xl max-h-[80vh] rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Sidebar */}
        <div style={{ 
          width: '220px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ padding: '24px 16px 16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff', marginBottom: '20px' }}>
              Preferences
            </h2>
          </div>
          
          <div style={{ padding: '0 8px' }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  marginBottom: '2px',
                  background: activeTab === tab.id ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: activeTab === tab.id ? '#00ff88' : '#ffffff',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? '500' : '400',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '500', color: '#ffffff' }}>
              {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            {activeTab === 'storage' && (
              <div className="space-y-6">
                {/* Default Provider */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Default Storage Provider
                  </label>
                  <select
                    value={preferences.defaultProvider}
                    onChange={(e) => setPreferences({ ...preferences, defaultProvider: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="hybrid">Hybrid Auto (Intelligent Routing)</option>
                    <option value="bsv">BSV Blockchain</option>
                    <option value="ipfs">IPFS Network</option>
                    <option value="supabase">Supabase</option>
                    <option value="googledrive">Google Drive</option>
                    <option value="aws">AWS S3</option>
                  </select>
                </div>

                {/* Hybrid Rules */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.hybridRules}
                      onChange={(e) => setPreferences({ ...preferences, hybridRules: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Enable intelligent routing based on file type and size
                    </span>
                  </label>
                </div>

                {/* Auto Sync */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.autoSync}
                      onChange={(e) => setPreferences({ ...preferences, autoSync: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Automatically sync to blockchain
                    </span>
                  </label>
                </div>

                {/* Local Cache */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Local Cache Size (GB)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={preferences.localCacheSize}
                      onChange={(e) => setPreferences({ ...preferences, localCacheSize: parseInt(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ 
                      minWidth: '50px', 
                      padding: '6px 10px',
                      background: 'rgba(0, 255, 136, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#00ff88',
                      textAlign: 'center'
                    }}>
                      {preferences.localCacheSize} GB
                    </span>
                  </div>
                </div>

                {/* Upload Chunk Size */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Upload Chunk Size (MB)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={preferences.uploadChunkSize}
                      onChange={(e) => setPreferences({ ...preferences, uploadChunkSize: parseInt(e.target.value) })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ 
                      minWidth: '60px', 
                      padding: '6px 10px',
                      background: 'rgba(0, 255, 136, 0.1)',
                      borderRadius: '6px',
                      fontSize: '14px',
                      color: '#00ff88',
                      textAlign: 'center'
                    }}>
                      {preferences.uploadChunkSize} MB
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'blockchain' && (
              <div className="space-y-6">
                {/* Network */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Network
                  </label>
                  <select
                    value={preferences.network}
                    onChange={(e) => setPreferences({ ...preferences, network: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  >
                    <option value="mainnet">Mainnet</option>
                    <option value="testnet">Testnet</option>
                  </select>
                </div>

                {/* Transaction Priority */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Transaction Priority
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['economy', 'standard', 'priority'].map((priority) => (
                      <button
                        key={priority}
                        onClick={() => setPreferences({ ...preferences, txPriority: priority })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          background: preferences.txPriority === priority ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${preferences.txPriority === priority ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '8px',
                          color: preferences.txPriority === priority ? '#00ff88' : '#ffffff',
                          fontSize: '14px',
                          fontWeight: preferences.txPriority === priority ? '500' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          textTransform: 'capitalize'
                        }}
                      >
                        {priority}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Encryption */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.defaultEncryption}
                      onChange={(e) => setPreferences({ ...preferences, defaultEncryption: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Enable encryption by default
                    </span>
                  </label>
                </div>

                {/* Compression */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.compression}
                      onChange={(e) => setPreferences({ ...preferences, compression: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Auto-compress files before upload
                    </span>
                  </label>
                </div>

                {/* Default Paywall Price */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Default Paywall Price (BSV)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={preferences.paywallPrice}
                    onChange={(e) => setPreferences({ ...preferences, paywallPrice: parseFloat(e.target.value) })}
                    style={{
                      width: '200px',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                {/* Master Key */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    File Encryption Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter master encryption key"
                    value={preferences.masterKey}
                    onChange={(e) => setPreferences({ ...preferences, masterKey: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Multi-sig */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.multiSig}
                      onChange={(e) => setPreferences({ ...preferences, multiSig: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Enable multi-signature requirements
                    </span>
                  </label>
                </div>

                {/* Private Mode */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.privateMode}
                      onChange={(e) => setPreferences({ ...preferences, privateMode: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Private mode (don&apos;t record activity)
                    </span>
                  </label>
                </div>

                {/* Anonymous Uploads */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.anonymousUploads}
                      onChange={(e) => setPreferences({ ...preferences, anonymousUploads: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Anonymous uploads (hide wallet identity)
                    </span>
                  </label>
                </div>

                {/* Access Logs */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.accessLogs}
                      onChange={(e) => setPreferences({ ...preferences, accessLogs: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Track file access logs
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'interface' && (
              <div className="space-y-6">
                {/* Theme */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Theme
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'light', label: 'Light', icon: <Sun size={16} /> },
                      { id: 'dark', label: 'Dark', icon: <Moon size={16} /> },
                      { id: 'auto', label: 'Auto', icon: <Eye size={16} /> }
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setPreferences({ ...preferences, theme: theme.id })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: preferences.theme === theme.id ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${preferences.theme === theme.id ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '8px',
                          color: preferences.theme === theme.id ? '#00ff88' : '#ffffff',
                          fontSize: '14px',
                          fontWeight: preferences.theme === theme.id ? '500' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {theme.icon}
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* View Mode */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Default View Mode
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'grid', label: 'Grid', icon: <Grid size={16} /> },
                      { id: 'list', label: 'List', icon: <List size={16} /> },
                      { id: 'gallery', label: 'Gallery', icon: <ImageIcon size={16} /> }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setPreferences({ ...preferences, viewMode: mode.id })}
                        style={{
                          flex: 1,
                          padding: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          background: preferences.viewMode === mode.id ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                          border: `1px solid ${preferences.viewMode === mode.id ? 'rgba(0, 255, 136, 0.4)' : 'rgba(255, 255, 255, 0.2)'}`,
                          borderRadius: '8px',
                          color: preferences.viewMode === mode.id ? '#00ff88' : '#ffffff',
                          fontSize: '14px',
                          fontWeight: preferences.viewMode === mode.id ? '500' : '400',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {mode.icon}
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Hidden Files */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.showHidden}
                      onChange={(e) => setPreferences({ ...preferences, showHidden: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Show hidden files
                    </span>
                  </label>
                </div>

                {/* Compact Mode */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.compactMode}
                      onChange={(e) => setPreferences({ ...preferences, compactMode: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Compact mode (reduce UI padding)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'developer' && (
              <div className="space-y-6">
                {/* Webhook URL */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-webhook.com/endpoint"
                    value={preferences.webhookUrl}
                    onChange={(e) => setPreferences({ ...preferences, webhookUrl: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Custom RPC */}
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#ffffff', marginBottom: '8px' }}>
                    Custom BSV Node RPC
                  </label>
                  <input
                    type="url"
                    placeholder="https://your-node.com:8332"
                    value={preferences.customRpc}
                    onChange={(e) => setPreferences({ ...preferences, customRpc: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {/* Debug Mode */}
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={preferences.debugMode}
                      onChange={(e) => setPreferences({ ...preferences, debugMode: e.target.checked })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', color: '#ffffff' }}>
                      Enable debug mode (show transaction details)
                    </span>
                  </label>
                </div>

                {/* Export Settings */}
                <div>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(preferences, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = 'bitcoin-drive-preferences.json'
                      a.click()
                    }}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: '8px',
                      color: '#00ff88',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)'
                    }}
                  >
                    Export Settings to JSON
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save preferences
                localStorage.setItem('bitcoin-drive-preferences', JSON.stringify(preferences))
                onClose()
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                border: 'none',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
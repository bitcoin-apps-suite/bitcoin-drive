'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'

interface DropdownItem {
  label?: string
  action?: () => void
  href?: string
  divider?: boolean
  shortcut?: string
  target?: string
}

interface DropdownMenu {
  label: string
  items: DropdownItem[]
}

export default function Taskbar() {
  const { data: session } = useSession()
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [showBitcoinSuite, setShowBitcoinSuite] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleOpenExchange = () => {
    window.location.href = '/exchange'
  }

  const handleIssueShares = () => {
    alert('NFT containers (.nft) will store files, FT tokens will represent dividend-bearing shares of items within the containers')
  }

  const menus: DropdownMenu[] = [
    {
      label: 'Bitcoin Drive',
      items: [
        { label: 'About Bitcoin Drive', action: () => alert('Bitcoin Drive v1.0\n\nDecentralized file storage on BSV blockchain\n\nBuilt with Next.js and BSV SDK') },
        { divider: true },
        { label: 'Preferences...', shortcut: '⌘,', action: () => console.log('Preferences') },
        { label: 'Storage Settings...', action: () => console.log('Storage settings') },
        { divider: true },
        { label: session ? 'Sign Out' : 'Sign In', shortcut: '⌘Q', action: session ? () => signOut() : () => document.querySelector<HTMLButtonElement>('[data-signin]')?.click() }
      ]
    },
    {
      label: 'Share',
      items: [
        { label: 'Copy Link', shortcut: '⌘L', action: () => {
          navigator.clipboard.writeText(window.location.href)
          alert('Link copied!')
        }},
        { label: 'Generate QR Code', action: () => console.log('Generate QR') },
        { divider: true },
        { label: 'Share on X/Twitter', action: () => window.open(`https://twitter.com/intent/tweet?text=Check out my files on Bitcoin Drive&url=${window.location.href}`) },
        { label: 'Share on LinkedIn', action: () => console.log('LinkedIn share') },
        { label: 'Send to WhatsApp', action: () => window.open(`https://wa.me/?text=Check out my files on Bitcoin Drive: ${window.location.href}`) },
        { label: 'Send via Email', action: () => window.location.href = `mailto:?subject=Bitcoin Drive Files&body=Check out my files: ${window.location.href}` },
        { divider: true },
        { label: 'Embed Code', action: () => console.log('Generate embed code') }
      ]
    },
    {
      label: 'Developers',
      items: [
        { label: 'API Documentation', href: '/api/docs', target: '_blank' },
        { label: 'BSV SDK Docs', href: 'https://docs.bsvblockchain.org', target: '_blank' },
        { label: 'HandCash SDK', href: 'https://docs.handcash.io', target: '_blank' },
        { divider: true },
        { label: 'GitHub Repository', href: 'https://github.com/b0ase/bitcoin-drive', target: '_blank' },
        { divider: true },
        { label: 'Bitcoin Writer', href: 'https://bitcoin-writer.vercel.app', target: '_blank' },
        { label: 'Bitcoin Spreadsheets', href: 'https://bitcoin-sheets.vercel.app', target: '_blank' }
      ]
    },
    {
      label: 'File',
      items: [
        { label: 'Upload File', shortcut: '⌘U', action: () => document.getElementById('upload-btn')?.click() },
        { label: 'Upload Folder', shortcut: '⇧⌘U', action: () => console.log('Upload folder') },
        { divider: true },
        { label: 'Save to Blockchain', shortcut: '⌘B', action: () => console.log('Save to blockchain') },
        { label: 'Save to IPFS', action: () => console.log('Save to IPFS') },
        { label: 'Hybrid Storage', action: () => console.log('Hybrid storage') },
        { divider: true },
        { label: 'Download', shortcut: '⌘D', action: () => console.log('Download') },
        { label: 'Share Link', shortcut: '⌘L', action: () => {
          navigator.clipboard.writeText(window.location.href)
          alert('Link copied to clipboard!')
        }},
        { divider: true },
        { label: 'Delete', action: () => console.log('Delete') }
      ]
    },
    {
      label: 'NFT',
      items: [
        { label: 'Create NFT Container', shortcut: '⌘N', action: () => alert('Creating .nft container for file storage') },
        { label: 'Issue FT Shares', shortcut: '⌘F', action: handleIssueShares },
        { divider: true },
        { label: 'Mint Collection', action: () => console.log('Mint collection') },
        { label: 'Set Royalties', action: () => console.log('Set royalties') },
        { label: 'Configure Dividends', action: () => console.log('Configure dividend distribution for FT token holders') },
        { divider: true },
        { label: 'View My NFTs', action: () => window.location.href = '/my-nfts' },
        { label: 'NFT Marketplace', action: () => window.location.href = '/marketplace' }
      ]
    },
    {
      label: 'Blockchain',
      items: [
        { label: 'Encrypt File', shortcut: '⌘E', action: () => console.log('Encrypt') },
        { label: 'Decrypt File', action: () => console.log('Decrypt') },
        { divider: true },
        { label: 'Set Paywall', action: () => console.log('Set paywall') },
        { label: 'Set Timelock', action: () => console.log('Set timelock') },
        { label: 'Multi-signature', action: () => console.log('Set multisig') },
        { divider: true },
        { label: 'Exchange', action: handleOpenExchange },
        { label: 'Trading Dashboard', action: () => window.location.href = '/trading' },
        { divider: true },
        { label: 'Verify on Chain', action: () => console.log('Verify') },
        { label: 'View on Explorer', href: 'https://whatsonchain.com', target: '_blank' }
      ]
    },
    {
      label: 'Storage',
      items: [
        { label: 'BSV Direct', action: () => console.log('BSV storage') },
        { label: 'IPFS + BSV Hash', action: () => console.log('IPFS storage') },
        { label: 'Hybrid Storage', action: () => console.log('Hybrid storage') },
        { divider: true },
        { label: 'Cloud Providers ▸', action: () => {} },
        { label: '  Google Drive', action: () => console.log('Google Drive') },
        { label: '  AWS S3', action: () => console.log('AWS S3') },
        { label: '  Cloudflare R2', action: () => console.log('Cloudflare R2') },
        { label: '  Supabase', action: () => console.log('Supabase') },
        { divider: true },
        { label: 'Storage Calculator', action: () => console.log('Calculator') },
        { label: 'Usage Analytics', action: () => console.log('Analytics') }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: '⇧⌘Z', action: () => document.execCommand('redo') },
        { divider: true },
        { label: 'Cut', shortcut: '⌘X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: '⌘C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: '⌘V', action: () => document.execCommand('paste') },
        { divider: true },
        { label: 'Select All', shortcut: '⌘A', action: () => document.execCommand('selectAll') },
        { label: 'Find...', shortcut: '⌘F', action: () => console.log('Find') }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Grid View', shortcut: '⌘1', action: () => console.log('Grid view') },
        { label: 'List View', shortcut: '⌘2', action: () => console.log('List view') },
        { label: 'Gallery View', shortcut: '⌘3', action: () => console.log('Gallery view') },
        { divider: true },
        { label: 'Toggle Sidebar', shortcut: '⌥⌘S', action: () => console.log('Toggle sidebar') },
        { label: 'Toggle Theme', shortcut: '⌥⌘T', action: () => console.log('Toggle theme') },
        { divider: true },
        { label: 'Full Screen', shortcut: '⌃⌘F', action: () => document.documentElement.requestFullscreen() },
        { divider: true },
        { label: 'Zoom In', shortcut: '⌘+', action: () => (document.body.style as { zoom: string }).zoom = '110%' },
        { label: 'Zoom Out', shortcut: '⌘-', action: () => (document.body.style as { zoom: string }).zoom = '90%' },
        { label: 'Actual Size', shortcut: '⌘0', action: () => (document.body.style as { zoom: string }).zoom = '100%' }
      ]
    },
    {
      label: 'Window',
      items: [
        { label: 'Minimize', shortcut: '⌘M', action: () => console.log('Minimize') },
        { label: 'Zoom', action: () => console.log('Zoom') },
        { divider: true },
        { label: 'Bring All to Front', action: () => console.log('Bring to front') }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'Bitcoin Drive Help', shortcut: '⌘?', action: () => alert('Bitcoin Drive v1.0\n\nStore files permanently on the BSV blockchain') },
        { label: 'Keyboard Shortcuts', action: () => console.log('Show shortcuts') },
        { divider: true },
        { label: 'What\'s New', action: () => alert('New Features:\n\n• NFT Containers (.nft)\n• FT Token Shares\n• Dividend Distribution\n• Multi-cloud Storage\n• Enhanced Encryption') },
        { divider: true },
        { label: 'Report Issue', href: 'https://github.com/b0ase/bitcoin-drive/issues', target: '_blank' },
        { label: 'Contact Support', href: 'https://twitter.com/b0ase', target: '_blank' }
      ]
    }
  ]

  const bitcoinApps = [
    { name: 'Bitcoin Auth', color: '#ef4444', url: '#' },
    { name: 'Bitcoin Chat', color: '#ff6500', url: '#' },
    { name: 'Bitcoin Domains', color: '#eab308', url: '#' },
    { name: 'Bitcoin Draw', color: '#10b981', url: '#' },
    { name: 'Bitcoin Drive', color: '#22c55e', url: 'https://bitcoin-drive.vercel.app', current: true },
    { name: 'Bitcoin Email', color: '#06b6d4', url: '#' },
    { name: 'Bitcoin Exchange', color: '#3b82f6', url: '/exchange' },
    { name: 'Bitcoin Music', color: '#8b5cf6', url: '#' },
    { name: 'Bitcoin Paint', color: '#a855f7', url: '#' },
    { name: 'Bitcoin Pics', color: '#ec4899', url: '#' },
    { name: 'Bitcoin Registry', color: '#f43f5e', url: '#' },
    { name: 'Bitcoin Shares', color: '#f43f5e', url: '#' },
    { name: 'Bitcoin Spreadsheets', color: '#3b82f6', url: 'https://bitcoin-sheets.vercel.app' },
    { name: 'Bitcoin Video', color: '#65a30d', url: '#' },
    { name: 'Bitcoin Wallet', color: '#f59e0b', url: '#' },
    { name: 'Bitcoin Writer', color: '#ff9500', url: 'https://bitcoin-writer.vercel.app' }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
        setShowBitcoinSuite(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div 
      ref={menuRef}
      className="taskbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '28px',
        background: 'linear-gradient(180deg, #3a3a3a 0%, #2a2a2a 100%)',
        borderBottom: '1px solid #1a1a1a',
        fontSize: '13px',
        fontWeight: '500',
        color: '#ffffff',
        userSelect: 'none',
        position: 'relative',
        zIndex: 10000
      }}
    >
      {/* Bitcoin Logo */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setShowBitcoinSuite(!showBitcoinSuite)
            setActiveMenu(null)
          }}
          style={{
            padding: '0 12px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ff88',
            display: 'flex',
            alignItems: 'center',
            height: '28px',
            background: showBitcoinSuite ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          title="Bitcoin Suite Apps"
        >
          ₿
        </button>

        {/* Bitcoin Suite Dropdown */}
        {showBitcoinSuite && (
          <div style={{
            position: 'absolute',
            top: '28px',
            left: 0,
            minWidth: '220px',
            background: '#1a1a1a',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
            padding: '8px 0',
            zIndex: 1000
          }}>
            <div style={{
              padding: '8px 16px',
              fontSize: '12px',
              color: '#00ff88',
              fontWeight: '600',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '4px'
            }}>
              Bitcoin Apps
            </div>
            
            {bitcoinApps.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target={app.url.startsWith('http') ? '_blank' : undefined}
                rel={app.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 16px',
                  color: app.current ? '#ffffff' : '#ffffff',
                  background: 'transparent',
                  textDecoration: 'none',
                  fontSize: '13px',
                  transition: 'background 0.15s ease',
                  cursor: 'pointer',
                  fontWeight: app.current ? '600' : '400'
                }}
                onClick={() => setShowBitcoinSuite(false)}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span 
                  style={{ 
                    color: app.color,
                    marginRight: '12px',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  ₿
                </span>
                <span>
                  {app.name}
                  {app.current && <span style={{ marginLeft: '8px', fontSize: '11px', opacity: 0.6 }}>(current)</span>}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        {menus.map((menu) => (
          <div key={menu.label} style={{ position: 'relative' }}>
            <button
              onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
              onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
              style={{
                padding: '0 12px',
                height: '24px',
                background: activeMenu === menu.label ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.15s ease'
              }}
            >
              {menu.label}
            </button>

            {/* Dropdown Menu */}
            {activeMenu === menu.label && (
              <div style={{
                position: 'absolute',
                top: '28px',
                left: 0,
                minWidth: '200px',
                background: '#1a1a1a',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8)',
                padding: '4px 0',
                zIndex: 9999,
                overflow: 'hidden'
              }}>
                {menu.items.map((item, index) => (
                  item.divider ? (
                    <div 
                      key={index}
                      style={{
                        height: '1px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        margin: '4px 0'
                      }}
                    />
                  ) : item.href ? (
                    <a
                      key={index}
                      href={item.href}
                      target={item.target || '_blank'}
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '4px 12px',
                        color: '#ffffff',
                        textDecoration: 'none',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>{item.shortcut}</span>
                      )}
                    </a>
                  ) : (
                    <button
                      key={index}
                      onClick={() => {
                        item.action?.()
                        setActiveMenu(null)
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        width: '100%',
                        padding: '4px 12px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        textAlign: 'left',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span style={{ opacity: 0.6, fontSize: '12px' }}>{item.shortcut}</span>
                      )}
                    </button>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right side - Status items */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        paddingRight: '16px',
        fontSize: '12px',
        color: 'rgba(255, 255, 255, 0.8)'
      }}>
        {session ? (
          <>
            <span>{session.user?.email || 'Connected'}</span>
            <span style={{ color: '#00ff88' }}>●</span>
          </>
        ) : (
          <>
            <span>Not Connected</span>
            <span style={{ color: '#ff4444', opacity: 0.6 }}>●</span>
          </>
        )}
      </div>
    </div>
  )
}
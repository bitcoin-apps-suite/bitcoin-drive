'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface DropdownItem {
  label: string
  action?: () => void
  href?: string
  divider?: boolean
  shortcut?: string
}

interface DropdownMenu {
  label: string
  items: DropdownItem[]
}

export default function Taskbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const menus: DropdownMenu[] = [
    {
      label: 'Bitcoin Drive',
      items: [
        { label: 'About Bitcoin Drive', action: () => window.location.href = '/bitcoin-drive' },
        { divider: true },
        { label: 'Preferences...', shortcut: '⌘,', action: () => console.log('Preferences') },
        { label: 'Storage Settings...', action: () => console.log('Storage') },
        { divider: true },
        { label: 'Services', action: () => console.log('Services') },
        { divider: true },
        { label: 'Hide Bitcoin Drive', shortcut: '⌘H', action: () => console.log('Hide') },
        { label: 'Hide Others', shortcut: '⌥⌘H', action: () => console.log('Hide Others') },
        { divider: true },
        { label: 'Quit Bitcoin Drive', shortcut: '⌘Q', action: () => window.close() }
      ]
    },
    {
      label: 'Developers',
      items: [
        { label: 'BAP Protocol', href: 'https://github.com/icellan/bap' },
        { label: 'MAP Protocol', href: 'https://github.com/rohenaz/MAP' },
        { label: 'B:// Protocol', href: 'https://github.com/unwriter/B' },
        { divider: true },
        { label: 'OP_RETURN Spec', href: 'https://wiki.bitcoinsv.io/index.php/OP_RETURN' },
        { label: 'OP_PUSHDATA4 Spec', href: 'https://wiki.bitcoinsv.io/index.php/Opcodes' },
        { divider: true },
        { label: 'HandCash SDK', href: 'https://docs.handcash.io' },
        { label: 'BSV SDK', href: 'https://docs.bsvblockchain.org' },
        { divider: true },
        { label: 'API Documentation', href: '/api-docs' },
        { label: 'GitHub', href: 'https://github.com/yourusername/bitcoin-drive' }
      ]
    },
    {
      label: 'File',
      items: [
        { label: 'New Upload', shortcut: '⌘N', action: () => document.getElementById('upload-btn')?.click() },
        { label: 'Upload to Chain', shortcut: '⌘U', action: () => console.log('Upload to chain') },
        { label: 'Upload to Drive', shortcut: '⌘D', action: () => console.log('Upload to drive') },
        { divider: true },
        { label: 'Open...', shortcut: '⌘O', action: () => console.log('Open') },
        { label: 'Open Recent', action: () => console.log('Recent') },
        { divider: true },
        { label: 'Close', shortcut: '⌘W', action: () => console.log('Close') },
        { label: 'Save Hash', shortcut: '⌘S', action: () => console.log('Save') },
        { label: 'Export...', shortcut: '⇧⌘E', action: () => console.log('Export') }
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
        { label: 'Grid View', shortcut: '⌘1', action: () => console.log('Grid') },
        { label: 'List View', shortcut: '⌘2', action: () => console.log('List') },
        { divider: true },
        { label: 'Show Sidebar', shortcut: '⌥⌘S', action: () => console.log('Sidebar') },
        { label: 'Show Toolbar', shortcut: '⌥⌘T', action: () => console.log('Toolbar') },
        { divider: true },
        { label: 'Enter Full Screen', shortcut: '⌃⌘F', action: () => document.documentElement.requestFullscreen() }
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
        { label: 'Bitcoin Drive Help', shortcut: '⌘?', href: '/help' },
        { label: 'Release Notes', href: '/releases' },
        { divider: true },
        { label: 'Report an Issue', href: 'https://github.com/yourusername/bitcoin-drive/issues' },
        { label: 'Contact Support', href: 'mailto:support@bitcoindrive.app' }
      ]
    }
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null)
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
        height: '24px',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        fontSize: '13px',
        fontWeight: '400',
        color: '#ffffff',
        userSelect: 'none',
        position: 'relative',
        zIndex: 9999
      }}
    >
      {/* Bitcoin Logo */}
      <div style={{
        padding: '0 16px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#00ff88',
        display: 'flex',
        alignItems: 'center',
        height: '100%'
      }}>
        ₿
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
                top: '24px',
                left: 0,
                minWidth: '240px',
                background: 'rgba(30, 30, 30, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '6px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                padding: '4px 0',
                zIndex: 10000
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
                      target="_blank"
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
        <span>HandCash Connected</span>
        <span style={{ color: '#00ff88' }}>●</span>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Palette } from 'lucide-react'

export type ThemeColor = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'cyan' | 'yellow' | 'pink'

interface Theme {
  name: string
  primary: string
  secondary: string
  accent: string
  border: string
  hover: string
  text: string
  textMuted: string
}

const themes: Record<ThemeColor, Theme> = {
  green: {
    name: 'Matrix Green',
    primary: 'rgb(34 197 94)',     // green-500
    secondary: 'rgb(134 239 172)',  // green-300
    accent: 'rgb(74 222 128)',      // green-400
    border: 'rgba(34, 197, 94, 0.3)',
    hover: 'rgba(34, 197, 94, 0.1)',
    text: 'rgb(74 222 128)',
    textMuted: 'rgba(134, 239, 172, 0.6)'
  },
  blue: {
    name: 'Cyber Blue',
    primary: 'rgb(59 130 246)',     // blue-500
    secondary: 'rgb(147 197 253)',  // blue-300
    accent: 'rgb(96 165 250)',      // blue-400
    border: 'rgba(59, 130, 246, 0.3)',
    hover: 'rgba(59, 130, 246, 0.1)',
    text: 'rgb(96 165 250)',
    textMuted: 'rgba(147, 197, 253, 0.6)'
  },
  purple: {
    name: 'Neon Purple',
    primary: 'rgb(168 85 247)',     // purple-500
    secondary: 'rgb(216 180 254)',  // purple-300
    accent: 'rgb(196 181 253)',     // purple-400
    border: 'rgba(168, 85, 247, 0.3)',
    hover: 'rgba(168, 85, 247, 0.1)',
    text: 'rgb(196 181 253)',
    textMuted: 'rgba(216, 180, 254, 0.6)'
  },
  orange: {
    name: 'Bitcoin Orange',
    primary: 'rgb(249 115 22)',     // orange-500
    secondary: 'rgb(253 186 116)',  // orange-300
    accent: 'rgb(251 146 60)',      // orange-400
    border: 'rgba(249, 115, 22, 0.3)',
    hover: 'rgba(249, 115, 22, 0.1)',
    text: 'rgb(251 146 60)',
    textMuted: 'rgba(253, 186, 116, 0.6)'
  },
  red: {
    name: 'Danger Red',
    primary: 'rgb(239 68 68)',      // red-500
    secondary: 'rgb(252 165 165)',  // red-300
    accent: 'rgb(248 113 113)',     // red-400
    border: 'rgba(239, 68, 68, 0.3)',
    hover: 'rgba(239, 68, 68, 0.1)',
    text: 'rgb(248 113 113)',
    textMuted: 'rgba(252, 165, 165, 0.6)'
  },
  cyan: {
    name: 'Electric Cyan',
    primary: 'rgb(6 182 212)',      // cyan-500
    secondary: 'rgb(103 232 249)',  // cyan-300
    accent: 'rgb(34 211 238)',      // cyan-400
    border: 'rgba(6, 182, 212, 0.3)',
    hover: 'rgba(6, 182, 212, 0.1)',
    text: 'rgb(34 211 238)',
    textMuted: 'rgba(103, 232, 249, 0.6)'
  },
  yellow: {
    name: 'Gold Rush',
    primary: 'rgb(234 179 8)',      // yellow-500
    secondary: 'rgb(253 224 71)',   // yellow-300
    accent: 'rgb(250 204 21)',      // yellow-400
    border: 'rgba(234, 179, 8, 0.3)',
    hover: 'rgba(234, 179, 8, 0.1)',
    text: 'rgb(250 204 21)',
    textMuted: 'rgba(253, 224, 71, 0.6)'
  },
  pink: {
    name: 'Vapor Pink',
    primary: 'rgb(236 72 153)',     // pink-500
    secondary: 'rgb(249 168 212)',  // pink-300
    accent: 'rgb(244 114 182)',     // pink-400
    border: 'rgba(236, 72, 153, 0.3)',
    hover: 'rgba(236, 72, 153, 0.1)',
    text: 'rgb(244 114 182)',
    textMuted: 'rgba(249, 168, 212, 0.6)'
  }
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<ThemeColor>('green')
  
  useEffect(() => {
    // Load saved theme
    const saved = localStorage.getItem('bitcoin-drive-theme') as ThemeColor
    if (saved && themes[saved]) {
      setCurrentTheme(saved)
      applyTheme(saved)
    }
  }, [])

  const applyTheme = (color: ThemeColor) => {
    const theme = themes[color]
    const root = document.documentElement
    const isLightMode = root.classList.contains('light-mode')
    
    // In light mode, darken colors for better contrast
    if (isLightMode) {
      // Convert RGB string to darker version
      const darkenColor = (rgbStr: string, factor = 0.7) => {
        const match = rgbStr.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\)/)
        if (match) {
          const r = Math.floor(parseInt(match[1]) * factor)
          const g = Math.floor(parseInt(match[2]) * factor)
          const b = Math.floor(parseInt(match[3]) * factor)
          return `rgb(${r} ${g} ${b})`
        }
        return rgbStr
      }
      
      root.style.setProperty('--color-primary', darkenColor(theme.primary))
      root.style.setProperty('--color-secondary', darkenColor(theme.secondary))
      root.style.setProperty('--color-accent', darkenColor(theme.accent))
      root.style.setProperty('--color-text', darkenColor(theme.text))
    } else {
      root.style.setProperty('--color-primary', theme.primary)
      root.style.setProperty('--color-secondary', theme.secondary)
      root.style.setProperty('--color-accent', theme.accent)
      root.style.setProperty('--color-text', theme.text)
    }
    
    // These remain the same for both modes (already handled in CSS)
    root.style.setProperty('--color-border', theme.border)
    root.style.setProperty('--color-hover', theme.hover)
    root.style.setProperty('--color-text-muted', theme.textMuted)
  }

  const changeTheme = (color: ThemeColor) => {
    setCurrentTheme(color)
    applyTheme(color)
    localStorage.setItem('bitcoin-drive-theme', color)
  }

  return { currentTheme, changeTheme, themes }
}

interface ThemeSelectorProps {
  compact?: boolean
}

export default function ThemeSelector({ compact = false }: ThemeSelectorProps) {
  const { currentTheme, changeTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-white/10 transition-colors"
          title="Change theme"
        >
          <Palette size={20} className="text-[var(--color-accent)]" />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 top-12 bg-gray-900 border border-[var(--color-border)] rounded-lg p-2 z-50 min-w-[150px]">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => {
                    changeTheme(key as ThemeColor)
                    setIsOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[var(--color-hover)] transition-colors flex items-center gap-2 ${
                    currentTheme === key ? 'bg-[var(--color-hover)]' : ''
                  }`}
                >
                  <div 
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: theme.primary }}
                  />
                  <span className="text-[var(--color-text)]">{theme.name}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="bg-black/50 border border-[var(--color-border)] rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-[var(--color-accent)]">Theme</span>
        <Palette size={16} className="text-[var(--color-accent)]" />
      </div>
      <div className="grid grid-cols-4 gap-1">
        {Object.entries(themes).map(([key, theme]) => (
          <button
            key={key}
            onClick={() => changeTheme(key as ThemeColor)}
            className={`group relative p-2 rounded-md hover:bg-[var(--color-hover)] transition-all ${
              currentTheme === key ? 'ring-2 ring-[var(--color-primary)]' : ''
            }`}
            title={theme.name}
          >
            <div 
              className="w-full h-6 rounded border border-white/20 transition-transform group-hover:scale-110"
              style={{ backgroundColor: theme.primary }}
            />
          </button>
        ))}
      </div>
      <p className="text-xs text-[var(--color-text-muted)] mt-2 text-center">
        {themes[currentTheme].name}
      </p>
    </div>
  )
}
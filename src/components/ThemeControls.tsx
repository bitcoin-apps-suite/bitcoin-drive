'use client'

import { useState, useEffect } from 'react'
import { Palette, Sun, Moon } from 'lucide-react'
import { useTheme, ThemeColor } from './ThemeSelector'

export default function ThemeControls() {
  const { currentTheme, changeTheme, themes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('bitcoin-drive-dark-mode')
    if (saved === 'false') {
      setIsDark(false)
      document.documentElement.classList.add('light-mode')
    }
  }, [])

  const toggleDarkMode = () => {
    const newMode = !isDark
    setIsDark(newMode)
    
    if (newMode) {
      document.documentElement.classList.remove('light-mode')
      localStorage.setItem('bitcoin-drive-dark-mode', 'true')
    } else {
      document.documentElement.classList.add('light-mode')
      localStorage.setItem('bitcoin-drive-dark-mode', 'false')
    }
    
    // Reapply current theme to adjust colors for the new mode
    changeTheme(currentTheme)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Dark/Light Toggle */}
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
        title={isDark ? 'Light mode' : 'Dark mode'}
      >
        {isDark ? (
          <Sun size={20} style={{ color: 'var(--color-accent)' }} />
        ) : (
          <Moon size={20} style={{ color: 'var(--color-accent)' }} />
        )}
      </button>

      {/* Theme Palette */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md hover:bg-[var(--color-hover)] transition-colors"
          title="Change theme color"
        >
          <Palette size={20} style={{ color: 'var(--color-accent)' }} />
        </button>
        
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <div 
              className="absolute right-0 top-12 p-4 z-50 shadow-2xl rounded-lg min-w-[200px]"
              style={{ 
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--color-border)'
              }}
            >
              <div 
                className="text-xs mb-3 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Theme Color
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {Object.entries(themes).map(([key, theme]) => (
                  <button
                    key={key}
                    onClick={() => {
                      changeTheme(key as ThemeColor)
                    }}
                    className={`group relative rounded-lg hover:scale-110 transition-all duration-200 ${
                      currentTheme === key ? 'ring-2 ring-offset-2 ring-offset-black' : ''
                    }`}
                    style={{
                      '--ring-color': theme.primary
                    } as React.CSSProperties}
                    title={theme.name}
                  >
                    <div 
                      className="w-10 h-10 rounded-lg shadow-md"
                      style={{ 
                        backgroundColor: theme.primary,
                        border: '2px solid rgba(255,255,255,0.2)'
                      }}
                    />
                  </button>
                ))}
              </div>
              <div 
                className="text-center text-sm font-medium pt-3"
                style={{ 
                  color: 'var(--color-accent)',
                  borderTop: '1px solid var(--color-border)'
                }}
              >
                {themes[currentTheme].name}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
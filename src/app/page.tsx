'use client'

import { useSession, signIn, signOut } from "next-auth/react"
import { useState, useEffect } from "react"
import Image from "next/image"
import UploadModal, { UploadOptions } from "@/components/UploadModal"
import { useTheme } from "@/components/ThemeSelector"
import ThemeControls from "@/components/ThemeControls"

export default function Home() {
  useTheme() // Initialize theme system
  const { data: session, status } = useSession()
  const [handcashConnected, setHandcashConnected] = useState(false)
  const [handcashProfile, setHandcashProfile] = useState<{handle?: string; displayName?: string} | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    // Check HandCash connection status
    if (session?.user) {
      checkHandCashConnection()
    }
  }, [session])

  const checkHandCashConnection = async () => {
    try {
      const response = await fetch('/api/handcash/profile')
      if (response.ok) {
        const data = await response.json()
        setHandcashConnected(true)
        setHandcashProfile(data)
      }
    } catch (error) {
      console.error('Error checking HandCash connection:', error)
    }
  }

  const connectHandCash = async () => {
    try {
      const response = await fetch('/api/handcash/connect')
      const data = await response.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch (error) {
      console.error('Error connecting HandCash:', error)
    }
  }

  const handleFileUpload = async (file: File, options: UploadOptions) => {
    console.log('Uploading file:', file.name, options)
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('options', JSON.stringify(options))
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        // TODO: Refresh file list
      } else {
        console.error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-2xl" style={{ color: 'var(--color-accent)' }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--foreground)' }}>
        <div className="text-center space-y-8">
          <h1 className="text-6xl font-bold" style={{ color: 'var(--color-accent)' }}>
            Bitcoin Drive
          </h1>
          <p className="text-xl" style={{ color: 'var(--color-secondary)' }}>
            Store your files forever on the Bitcoin SV blockchain
          </p>
          <button
            onClick={() => signIn("google")}
            className="px-8 py-4 font-semibold rounded-lg transition-all flex items-center gap-3 mx-auto hover:opacity-90"
            style={{ 
              backgroundColor: 'var(--color-primary)', 
              color: 'var(--bg-primary)'
            }}
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <div className="w-64 border-r" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>Bitcoin Drive</h1>
        </div>
        
        <div className="p-4">
          <div className="space-y-4">
            {/* User Profile */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center space-x-3">
                {session.user?.image && (
                  <Image
                    src={session.user.image}
                    alt="Profile"
                    width={40}
                    height={40}
                    className="rounded-full border-2"
                    style={{ borderColor: 'var(--color-primary)' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--color-accent)' }}>
                    {session.user?.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {session.user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* HandCash Status */}
            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--color-border)' }}>
              {handcashConnected ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>HandCash</span>
                    <span className="text-xs" style={{ color: 'var(--color-primary)' }}>Connected</span>
                  </div>
                  {handcashProfile && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      @{handcashProfile.handle}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectHandCash}
                  className="w-full text-left text-sm transition-opacity hover:opacity-80"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Connect HandCash Wallet
                </button>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
                My Files
              </button>
              <button className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-[var(--color-hover)]"
                style={{ color: 'var(--color-accent)' }}>
                New Document
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-[var(--color-hover)]"
                style={{ color: 'var(--color-accent)' }}>
                Upload File
              </button>
            </nav>

            {/* Sign Out */}
            <button
              onClick={() => signOut()}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--color-border)' }}>
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-accent)' }}>My Files</h2>
            <ThemeControls />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
          <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--color-border)' }}>
            <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--color-primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-accent)' }}>No files yet</h3>
            <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>Upload your first file to get started</p>
            <button 
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 font-semibold rounded-md transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--bg-primary)' }}>
              Upload File
            </button>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal 
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleFileUpload}
      />
    </div>
  )
}
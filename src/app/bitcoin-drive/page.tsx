'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BitcoinDriveRedirect() {
  const router = useRouter()
  
  // Redirect to main app
  useEffect(() => {
    router.push('/')
  }, [router])

  // Show a loading message while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
      <div className="text-center">
        <div className="text-2xl font-bold mb-4" style={{ color: '#00ff88' }}>
          Redirecting to Bitcoin Drive...
        </div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#00ff88' }}></div>
      </div>
    </div>
  )
}
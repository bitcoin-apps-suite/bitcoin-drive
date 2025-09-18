import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET(request: Request) {
  try {
    // Check for auth token in the Authorization header
    const authHeader = request.headers.get('authorization')
    const authToken = authHeader?.replace('Bearer ', '')
    
    // In a real app, you'd validate this token with HandCash API
    // For now, just check if token exists
    const connected = Boolean(authToken)
    
    return NextResponse.json({ 
      connected,
      profile: connected ? {
        handle: 'user_handle',
        displayName: 'HandCash User',
        avatarUrl: '',
        authToken: authToken
      } : null
    })
  } catch (error) {
    console.error('HandCash profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get HandCash profile' },
      { status: 500 }
    )
  }
}
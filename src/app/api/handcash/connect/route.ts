import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // HandCash OAuth URL with proper parameters
    const appId = process.env.HANDCASH_APP_ID!
    const redirectUrl = `https://app.handcash.io/#/authorizeApp?appId=${appId}`
    
    return NextResponse.json({ redirectUrl })
  } catch (error) {
    console.error('HandCash connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect HandCash' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { authToken } = await request.json()

    if (!authToken) {
      return NextResponse.json(
        { error: 'Auth token required' },
        { status: 400 }
      )
    }

    // TODO: Save HandCash connection to database
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      profile: {
        handle: 'user_handle',
        displayName: 'User',
        avatarUrl: ''
      }
    })
  } catch (error) {
    console.error('HandCash auth error:', error)
    return NextResponse.json(
      { error: 'Failed to authenticate with HandCash' },
      { status: 500 }
    )
  }
}
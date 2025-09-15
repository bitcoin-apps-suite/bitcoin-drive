import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Get HandCash info from database
    // For now, return not connected
    return NextResponse.json({ 
      connected: false
    })
  } catch (error) {
    console.error('HandCash profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get HandCash profile' },
      { status: 500 }
    )
  }
}
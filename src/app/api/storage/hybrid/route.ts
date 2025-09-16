import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { HybridStorage, TimelockConfig } from '@/lib/storage/hybrid-storage'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession() as { accessToken?: string } | null
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const timelockEnabled = formData.get('timelock') === 'true'
    const timelockDate = formData.get('timelockDate') as string
    const encrypt = formData.get('encrypt') === 'true'
    const shareOnTwitter = formData.get('shareOnTwitter') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Configure timelock if enabled
    let timelock: TimelockConfig | undefined
    if (timelockEnabled && timelockDate) {
      timelock = {
        enabled: true,
        unlockDate: new Date(timelockDate),
        unlockConditions: [
          {
            type: 'time',
            value: new Date(timelockDate)
          }
        ]
      }
    }

    // Initialize hybrid storage
    const storage = new HybridStorage(session.accessToken)

    // Upload file with hybrid storage
    const metadata = await storage.uploadFile(
      buffer,
      file.name,
      file.type,
      {
        timelock,
        encrypt
      }
    )

    // Share on Twitter if requested
    let twitterUrl: string | undefined
    if (shareOnTwitter) {
      const message = timelock 
        ? `🔒 New timelocked file uploaded! Unlocks on ${timelock.unlockDate.toLocaleDateString()}`
        : `📁 New file uploaded to Bitcoin Drive!`
      
      twitterUrl = await storage.shareOnTwitter(
        metadata.fileId,
        message,
        metadata
      )
    }

    return NextResponse.json({
      success: true,
      metadata,
      twitterUrl
    })
  } catch (error) {
    console.error('Hybrid storage error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession() as { accessToken?: string } | null
    
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const googleDriveId = searchParams.get('googleDriveId')
    const expectedHash = searchParams.get('hash')
    const encryptionKey = searchParams.get('key')

    if (!fileId || !googleDriveId || !expectedHash) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Initialize hybrid storage
    const storage = new HybridStorage(session.accessToken)

    // Retrieve and verify file
    const { file, verified } = await storage.retrieveFile(
      fileId,
      googleDriveId,
      expectedHash,
      encryptionKey || undefined
    )

    if (!verified) {
      return NextResponse.json(
        { error: 'File verification failed' },
        { status: 403 }
      )
    }

    // Return file as response
    return new NextResponse(file as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'X-Hash-Verified': 'true'
      }
    })
  } catch (error) {
    console.error('Hybrid storage retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve file' },
      { status: 500 }
    )
  }
}
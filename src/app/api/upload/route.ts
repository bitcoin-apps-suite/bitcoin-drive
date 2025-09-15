import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsStr = formData.get('options') as string
    const options = JSON.parse(optionsStr)

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log(`Uploading ${file.name} with options:`, options)

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(buffer).digest('hex')

    const result: {[key: string]: string | number | Date | undefined} = {
      fileName: file.name,
      fileSize: file.size,
      fileHash,
      storageMode: options.storageMode,
      uploadedAt: new Date().toISOString()
    }

    if (options.storageMode === 'full-bsv') {
      // Full BSV upload - store entire file on blockchain
      console.log('Full BSV upload for:', file.name)
      
      // TODO: Implement actual BSV upload
      // For now, simulate the upload
      result.bsvTxId = 'simulated_' + crypto.randomBytes(16).toString('hex')
      result.bUrl = `b://${result.bsvTxId}`
      result.estimatedCost = (file.size / 1024) * 0.0001 // $0.0001 per KB
      
      // In production, this would:
      // 1. Connect to HandCash
      // 2. Create B:// protocol transaction
      // 3. Upload file data to BSV
      // 4. Return actual transaction ID
      
    } else if (options.storageMode === 'hybrid') {
      // Hybrid mode - store metadata on BSV, file on Google Drive
      console.log('Hybrid upload for:', file.name)
      
      // TODO: Upload to Google Drive
      // For now, simulate the upload
      const googleDriveId = 'gdrive_' + crypto.randomBytes(8).toString('hex')
      
      // Create metadata object for BSV
      // const metadata = {
      //   fileName: file.name,
      //   fileSize: file.size,
      //   fileHash,
      //   googleDriveId,
      //   mimeType: file.type,
      //   price: options.price,
      //   currency: options.currency,
      //   description: options.description,
      //   uploadedBy: session.user.email,
      //   uploadedAt: new Date().toISOString()
      // }
      
      // TODO: Upload metadata to BSV
      result.googleDriveId = googleDriveId
      result.metadataTxId = 'meta_' + crypto.randomBytes(16).toString('hex')
      result.estimatedCost = 0.0001 // Just metadata cost
    }

    // Set pricing if specified
    if (options.price) {
      result.price = options.price
      result.currency = options.currency
    }

    // TODO: Save to database
    // await prisma.file.create({
    //   data: {
    //     ...result,
    //     userId: session.user.id
    //   }
    // })

    return NextResponse.json({
      success: true,
      file: result
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle it with formData
  },
}
// Mock BSV Upload for Testing
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const { file, options } = req.body;
    
    if (!file || !file.data) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock successful BSV upload
    const mockTxId = generateMockTxId();
    const mockNftTxId = options.createNFT ? generateMockTxId() : null;
    
    // Calculate costs
    const fileSize = file.size;
    const storageCost = calculateStorageCost(fileSize, options.storageMethod);
    const nftCost = options.createNFT ? 0.05 : 0;
    const updatesCost = options.enableUpdates ? 0.02 : 0;
    const serviceFee = storageCost * 0.02;
    const totalCost = storageCost + nftCost + updatesCost + serviceFee;

    // Store file info (mock storage)
    const fileRecord = {
      id: mockTxId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      storageMethod: options.storageMethod,
      encrypted: options.encrypt,
      uploadedAt: new Date().toISOString(),
      txId: mockTxId,
      nftTxId: mockNftTxId,
      downloadUrl: `https://bico.media/${mockTxId}`,
      cost: totalCost,
      publishType: options.publishType,
      paywallPrice: options.paywallOptions?.accessPrice || 0
    };

    console.log('Mock BSV Upload:', {
      file: file.name,
      size: fileSize,
      options: options,
      cost: totalCost,
      txId: mockTxId
    });

    res.status(200).json({
      success: true,
      txId: mockTxId,
      fileUrl: `https://bico.media/${mockTxId}`,
      nftTxId: mockNftTxId,
      cost: totalCost,
      protocol: options.storageMethod === 'b_protocol' ? 'B://' : 'BCAT://',
      message: `Mock upload successful! File would be stored on BSV blockchain.`
    });

  } catch (error) {
    console.error('Mock BSV upload error:', error);
    res.status(500).json({ 
      error: 'Mock upload failed',
      message: error.message,
      details: 'This is a mock endpoint for testing. Real BSV integration pending.'
    });
  }
}

function generateMockTxId() {
  return Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}

function calculateStorageCost(fileSize, storageMethod) {
  // Mock BSV pricing calculation
  const BSV_PRICE_USD = 50;
  const SATOSHIS_PER_BYTE = 0.5;
  const SATOSHIS_PER_BSV = 100000000;
  
  const baseSatoshis = fileSize * SATOSHIS_PER_BYTE;
  const baseUSD = (baseSatoshis / SATOSHIS_PER_BSV) * BSV_PRICE_USD;
  
  if (storageMethod === 'b_protocol') {
    return Math.max(0.001, baseUSD);
  } else {
    return Math.max(0.002, baseUSD * 1.2);
  }
}
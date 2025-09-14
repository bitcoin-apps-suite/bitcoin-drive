import { HandCashConnect } from '@handcash/handcash-connect';

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET
});

// BSV Protocol constants
const BSV_PROTOCOLS = {
  B_PROTOCOL: '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut',
  BCAT_PROTOCOL: '15DHFxWZJT58f9nhyGnsRBqrgwK4W6h4Up',
  MAP_PROTOCOL: '1PuQa7K62MiKCtssSLKy1kh56WWU7MtUR5',
  AIP_PROTOCOL: '15PciHG22SNLQJXMoSUaWVi7WSqc7hCfva'
};

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

    // Get HandCash account
    const account = handCashConnect.getAccountFromAuthToken(authToken);
    const profile = await account.profile.getCurrentProfile();
    
    // Check balance
    const balance = await account.wallet.getSpendableBalance();
    if (balance.spendableSatoshis < 10000) { // Minimum 10k satoshis
      return res.status(400).json({ 
        error: 'Insufficient BSV balance',
        required: '0.0001 BSV minimum',
        current: `${balance.spendableSatoshis / 100000000} BSV`
      });
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(file.data, 'base64');
    
    // Upload to BSV blockchain
    const result = await uploadToBSV(account, profile, {
      name: file.name,
      type: file.type,
      size: file.size,
      buffer: fileBuffer
    }, options);

    res.status(200).json({
      success: true,
      txId: result.txId,
      fileUrl: result.fileUrl,
      nftTxId: result.nftTxId,
      cost: result.cost,
      message: 'File uploaded to BSV blockchain successfully'
    });

  } catch (error) {
    console.error('BSV upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload to BSV blockchain',
      details: error.toString()
    });
  }
}

async function uploadToBSV(account, profile, fileData, options) {
  const { name, type, size, buffer } = fileData;
  const {
    storageMethod,
    encrypt,
    createNFT,
    enableUpdates,
    publishType,
    nftOptions,
    paywallOptions
  } = options;

  let uploadResult;
  let totalCost = 0;

  try {
    // Step 1: Upload file using appropriate protocol
    if (storageMethod === 'b_protocol' || size < 90000) {
      uploadResult = await uploadViaBProtocol(account, fileData);
    } else {
      uploadResult = await uploadViaBCATProtocol(account, fileData);
    }

    totalCost += uploadResult.cost;

    // Step 2: Create NFT container if requested
    let nftResult = null;
    if (createNFT) {
      nftResult = await createNFTContainer(account, profile, fileData, uploadResult, nftOptions);
      totalCost += nftResult.cost;
    }

    // Step 3: Set up paywall if requested
    if (publishType === 'paywall' && paywallOptions.accessPrice > 0) {
      await createPaywall(account, uploadResult.txId, paywallOptions);
      totalCost += 0.01; // Paywall setup fee
    }

    // Step 4: Enable updates if requested
    if (enableUpdates) {
      await enableFileUpdates(account, uploadResult.txId);
      totalCost += 0.02;
    }

    // Calculate bitcoin.drive service fee (2%)
    const serviceFee = totalCost * 0.02;
    if (serviceFee > 0.0001) { // Minimum service fee
      await payServiceFee(account, serviceFee);
    }

    return {
      txId: uploadResult.txId,
      fileUrl: `https://bico.media/${uploadResult.txId}`,
      nftTxId: nftResult?.txId,
      cost: totalCost + serviceFee,
      protocol: storageMethod,
      chunks: uploadResult.chunks
    };

  } catch (error) {
    console.error('BSV upload process error:', error);
    throw new Error(`Upload failed: ${error.message}`);
  }
}

async function uploadViaBProtocol(account, fileData) {
  const { name, type, buffer } = fileData;
  
  try {
    // Build B:// protocol transaction
    const outputs = [{
      script: buildBProtocolScript(buffer, type, name),
      currencyCode: 'BSV'
    }];

    const payment = {
      to: outputs,
      description: `Upload ${name} via B:// protocol`
    };

    const result = await account.wallet.pay(payment);
    
    return {
      txId: result.transactionId,
      cost: result.fee / 100000000, // Convert satoshis to BSV
      protocol: 'B://',
      url: `b://${result.transactionId}`
    };

  } catch (error) {
    throw new Error(`B:// protocol upload failed: ${error.message}`);
  }
}

async function uploadViaBCATProtocol(account, fileData) {
  const { name, type, buffer } = fileData;
  const CHUNK_SIZE = 90000;
  
  try {
    const chunks = [];
    const chunkTxIds = [];
    
    // Split file into chunks
    for (let i = 0; i < buffer.length; i += CHUNK_SIZE) {
      chunks.push(buffer.slice(i, i + CHUNK_SIZE));
    }

    // Upload each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunkScript = buildBCATChunkScript(chunks[i]);
      
      const payment = {
        to: [{
          script: chunkScript,
          currencyCode: 'BSV'
        }],
        description: `Upload chunk ${i + 1}/${chunks.length} of ${name}`
      };
      
      const result = await account.wallet.pay(payment);
      chunkTxIds.push(result.transactionId);
    }

    // Create BCAT manifest
    const manifestScript = buildBCATManifestScript(chunkTxIds, type, name);
    
    const manifestPayment = {
      to: [{
        script: manifestScript,
        currencyCode: 'BSV'
      }],
      description: `Create BCAT manifest for ${name}`
    };
    
    const manifestResult = await account.wallet.pay(manifestPayment);

    return {
      txId: manifestResult.transactionId,
      cost: 0.001 * chunks.length, // Estimate cost
      protocol: 'BCAT://',
      chunks: chunkTxIds,
      url: `bcat://${manifestResult.transactionId}`
    };

  } catch (error) {
    throw new Error(`BCAT:// protocol upload failed: ${error.message}`);
  }
}

async function createNFTContainer(account, profile, fileData, uploadResult, nftOptions) {
  try {
    const nftMetadata = {
      name: nftOptions.name || fileData.name,
      description: nftOptions.description || `NFT of ${fileData.name}`,
      image: uploadResult.url,
      creator: profile.handle,
      attributes: [
        { trait_type: 'File Type', value: fileData.type },
        { trait_type: 'File Size', value: `${(fileData.size / 1024).toFixed(2)} KB` },
        { trait_type: 'Protocol', value: uploadResult.protocol },
        { trait_type: 'Created', value: new Date().toISOString() }
      ],
      properties: {
        files: [{
          uri: uploadResult.url,
          type: fileData.type
        }]
      },
      royalty: {
        percentage: nftOptions.royaltyPercent,
        address: profile.publicProfile?.paymail
      },
      collection: {
        name: 'Bitcoin Drive',
        supply: nftOptions.maxSupply
      }
    };

    // Upload NFT metadata using MAP protocol
    const mapScript = buildMAPScript({
      app: 'bitcoin-drive',
      type: 'nft',
      subType: 'metadata',
      data: JSON.stringify(nftMetadata)
    });

    const payment = {
      to: [{
        script: mapScript,
        currencyCode: 'BSV'
      }],
      description: `Create NFT metadata for ${fileData.name}`
    };

    const result = await account.wallet.pay(payment);

    return {
      txId: result.transactionId,
      cost: 0.05,
      metadata: nftMetadata
    };

  } catch (error) {
    throw new Error(`NFT creation failed: ${error.message}`);
  }
}

async function createPaywall(account, fileId, paywallOptions) {
  // Create paywall entry using MAP protocol
  const paywallData = {
    fileId: fileId,
    price: paywallOptions.accessPrice,
    currency: 'USD',
    created: new Date().toISOString()
  };

  const mapScript = buildMAPScript({
    app: 'bitcoin-drive',
    type: 'paywall',
    fileId: fileId,
    data: JSON.stringify(paywallData)
  });

  const payment = {
    to: [{
      script: mapScript,
      currencyCode: 'BSV'
    }],
    description: `Create paywall for file ${fileId}`
  };

  await account.wallet.pay(payment);
}

async function enableFileUpdates(account, fileId) {
  // Create update capability using MAP protocol
  const updateData = {
    fileId: fileId,
    updatable: true,
    created: new Date().toISOString()
  };

  const mapScript = buildMAPScript({
    app: 'bitcoin-drive',
    type: 'update-capability',
    fileId: fileId,
    data: JSON.stringify(updateData)
  });

  const payment = {
    to: [{
      script: mapScript,
      currencyCode: 'BSV'
    }],
    description: `Enable updates for file ${fileId}`
  };

  await account.wallet.pay(payment);
}

async function payServiceFee(account, feeAmount) {
  // Pay service fee to bitcoin.drive wallet
  const BITCOIN_DRIVE_ADDRESS = '1BitcoinDriveServiceFeeAddress'; // Replace with actual address

  const payment = {
    to: [{
      address: BITCOIN_DRIVE_ADDRESS,
      currencyCode: 'BSV',
      amount: feeAmount
    }],
    description: 'Bitcoin Drive service fee (2%)'
  };

  await account.wallet.pay(payment);
}

// Protocol script builders
function buildBProtocolScript(data, mediaType, filename) {
  const chunks = [
    'OP_RETURN',
    Buffer.from(BSV_PROTOCOLS.B_PROTOCOL, 'hex'),
    data,
    Buffer.from(mediaType, 'utf8'),
    Buffer.from('binary', 'utf8'),
    Buffer.from(filename, 'utf8')
  ];
  
  return chunks.map(chunk => {
    if (typeof chunk === 'string' && chunk === 'OP_RETURN') {
      return '6a';
    }
    return chunk.toString('hex');
  }).join('');
}

function buildBCATChunkScript(chunkData) {
  const chunks = [
    'OP_RETURN',
    Buffer.from(BSV_PROTOCOLS.BCAT_PROTOCOL, 'hex'),
    chunkData
  ];
  
  return chunks.map(chunk => {
    if (typeof chunk === 'string' && chunk === 'OP_RETURN') {
      return '6a';
    }
    return chunk.toString('hex');
  }).join('');
}

function buildBCATManifestScript(txIds, mediaType, filename) {
  const manifest = {
    info: 'BCAT',
    mediaType: mediaType,
    filename: filename,
    chunks: txIds
  };
  
  const chunks = [
    'OP_RETURN',
    Buffer.from(BSV_PROTOCOLS.BCAT_PROTOCOL, 'hex'),
    Buffer.from(JSON.stringify(manifest), 'utf8')
  ];
  
  return chunks.map(chunk => {
    if (typeof chunk === 'string' && chunk === 'OP_RETURN') {
      return '6a';
    }
    return chunk.toString('hex');
  }).join('');
}

function buildMAPScript(data) {
  const chunks = [
    'OP_RETURN',
    Buffer.from(BSV_PROTOCOLS.MAP_PROTOCOL, 'hex'),
    Buffer.from('SET', 'utf8')
  ];
  
  // Add key-value pairs
  Object.entries(data).forEach(([key, value]) => {
    chunks.push(Buffer.from(key, 'utf8'));
    chunks.push(Buffer.from(value.toString(), 'utf8'));
  });
  
  return chunks.map(chunk => {
    if (typeof chunk === 'string' && chunk === 'OP_RETURN') {
      return '6a';
    }
    return chunk.toString('hex');
  }).join('');
}
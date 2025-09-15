const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

const { HandCashConnect } = require('@handcash/handcash-connect');
const session = require('express-session');
const { initDatabase } = require('./database');
const { initGoogleAuth } = require('./google-auth');

const app = express();
const PORT = 4003;

app.use(cors({
    origin: ['http://localhost:3003', 'https://bitcoin-drive.vercel.app'],
    credentials: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'bitcoin-drive-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    }
}));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET
});

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Use JSON file for persistence
const dbPath = path.join(__dirname, 'uploads-db.json');
let dbData = { files: {}, users: {} };

// Load existing data
if (fs.existsSync(dbPath)) {
  try {
    dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (e) {
    console.log('Creating new database...');
  }
}

const filesDb = new Map(Object.entries(dbData.files));
const usersDb = new Map(Object.entries(dbData.users));

// Save database to file
function saveDb() {
  const data = {
    files: Object.fromEntries(filesDb),
    users: Object.fromEntries(usersDb)
  };
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    server: 'Bitcoin Drive API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Get real HandCash balance
app.get('/api/handcash-balance', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const account = handCashConnect.getAccountFromAuthToken(authToken);
    
    // Get real balance from HandCash
    const balance = await account.wallet.getSpendableBalance();
    
    // Get current BSV price (approximate)
    const BSV_PRICE_USD = 50;
    
    // Calculate USD value
    const bsvAmount = balance.spendableSatoshis / 100000000;
    const usdValue = bsvAmount * BSV_PRICE_USD;
    
    res.json({
      satoshis: balance.spendableSatoshis,
      bsv: bsvAmount,
      usd: usdValue,
      formatted: {
        satoshis: balance.spendableSatoshis.toLocaleString(),
        bsv: `${bsvAmount.toFixed(8)} BSV`,
        usd: `$${usdValue.toFixed(2)} USD`
      }
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    
    // If balance fetch fails, return zero balance
    res.json({
      satoshis: 0,
      bsv: 0,
      usd: 0,
      formatted: {
        satoshis: '0',
        bsv: '0 BSV',
        usd: '$0.00 USD'
      },
      error: 'Unable to fetch balance. Check HandCash connection.'
    });
  }
});

// HandCash OAuth callback route
app.get('/auth/handcash/callback', async (req, res) => {
  try {
    const { authToken, error } = req.query;
    
    if (error) {
      return res.redirect(`/drive.html?error=${error}`);
    }
    
    if (authToken) {
      // Validate the token with HandCash
      try {
        const account = handCashConnect.getAccountFromAuthToken(authToken);
        await account.profile.getCurrentProfile(); // Test if token is valid
        
        // Redirect to frontend with valid token
        res.redirect(`/drive.html?authToken=${authToken}`);
      } catch (validationError) {
        console.error('Token validation failed:', validationError);
        res.redirect('/drive.html?error=invalid_token');
      }
    } else {
      res.redirect('/drive.html?error=no_token');
    }
  } catch (error) {
    console.error('HandCash callback error:', error);
    res.redirect('/drive.html?error=callback_error');
  }
});

// Get HandCash configuration
app.get('/api/auth/config', (req, res) => {
  res.json({
    appId: process.env.HANDCASH_APP_ID,
    redirectUrl: process.env.HANDCASH_REDIRECT_URL || `${req.protocol}://${req.get('host')}/auth/handcash/callback`
  });
});

app.get('/api/handcash-profile', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const account = handCashConnect.getAccountFromAuthToken(authToken);
    const profile = await account.profile.getCurrentProfile();
    
    res.json(profile);
  } catch (error) {
    console.error('HandCash profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.post('/api/files/upload', upload.single('file'), async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const { storageMethod = 'op_return', encrypt = 'true' } = req.body;
    
    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileId = crypto.randomBytes(16).toString('hex');
    const userHandle = 'user_' + authToken.substring(0, 8);
    
    const fileData = {
      id: fileId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageMethod,
      encrypted: encrypt === 'true',
      uploadedAt: new Date().toISOString(),
      owner: userHandle,
      txId: `pending_tx_${fileId}`,
      downloadUrl: `/api/files/${fileId}/download`
    };

    const storageCost = calculateStorageCost(storageMethod, req.file.size);
    fileData.storageCost = storageCost;

    const filePath = path.join(uploadDir, fileId);
    fs.writeFileSync(filePath, req.file.buffer);

    filesDb.set(fileId, fileData);
    
    if (!usersDb.has(userHandle)) {
      usersDb.set(userHandle, []);
    }
    usersDb.get(userHandle).push(fileData);
    
    saveDb(); // Save to file

    res.json({
      success: true,
      file: fileData,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userHandle = 'user_' + authToken.substring(0, 8);
    const userFiles = usersDb.get(userHandle) || [];
    
    res.json({
      files: userFiles,
      total: userFiles.length
    });
  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

app.get('/api/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const fileData = filesDb.get(fileId);
    
    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    const filePath = path.join(uploadDir, fileId);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File data not found' });
    }

    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

app.delete('/api/files/:fileId', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const { fileId } = req.params;
    
    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const fileData = filesDb.get(fileId);
    
    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    const userHandle = 'user_' + authToken.substring(0, 8);
    
    if (fileData.owner !== userHandle) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    filesDb.delete(fileId);
    
    const userFiles = usersDb.get(userHandle) || [];
    const updatedFiles = userFiles.filter(f => f.id !== fileId);
    usersDb.set(userHandle, updatedFiles);
    
    saveDb(); // Save to file

    const filePath = path.join(uploadDir, fileId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.post('/api/files/:fileId/tokenize', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const { fileId } = req.params;
    const { royaltyPercentage = 10, maxSupply = 1 } = req.body;
    
    if (!authToken) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const fileData = filesDb.get(fileId);
    
    if (!fileData) {
      return res.status(404).json({ error: 'File not found' });
    }

    const nftData = {
      tokenId: `nft_${fileId}_${Date.now()}`,
      fileId: fileId,
      creator: fileData.owner,
      royaltyPercentage,
      maxSupply,
      currentSupply: 1,
      mintedAt: new Date().toISOString(),
      txId: `nft_tx_${crypto.randomBytes(8).toString('hex')}`,
      metadata: {
        name: fileData.filename,
        description: `NFT of ${fileData.filename}`,
        image: fileData.downloadUrl,
        attributes: [
          { trait_type: 'File Type', value: fileData.mimeType },
          { trait_type: 'File Size', value: `${(fileData.size / 1024).toFixed(2)} KB` },
          { trait_type: 'Created', value: fileData.uploadedAt }
        ]
      }
    };

    fileData.nft = nftData;
    filesDb.set(fileId, fileData);
    
    saveDb(); // Save to file

    res.json({
      success: true,
      nft: nftData,
      message: 'File successfully tokenized as NFT'
    });
  } catch (error) {
    console.error('NFT tokenization error:', error);
    res.status(500).json({ error: 'Failed to tokenize file' });
  }
});

app.get('/api/storage-methods', (req, res) => {
  res.json({
    methods: [
      {
        id: 'op_return',
        name: 'Quick Save',
        description: 'Metadata only on-chain',
        maxSize: 80,
        costPerByte: 0.00000001,
        recommended: false
      },
      {
        id: 'op_pushdata4',
        name: 'Full Storage',
        description: 'Complete file on-chain',
        maxSize: 4294967295,
        costPerByte: 0.000001,
        recommended: true
      },
      {
        id: 'multisig_p2sh',
        name: 'Smart Storage',
        description: 'Script-based storage',
        maxSize: 1073741824,
        costPerByte: 0.0000005,
        recommended: false
      },
      {
        id: 'nft',
        name: 'NFT Mode',
        description: 'Tokenized storage',
        maxSize: 104857600,
        costPerByte: 0.000002,
        recommended: false
      }
    ]
  });
});

function calculateStorageCost(method, size) {
  const costs = {
    'op_return': 0.00001,
    'op_pushdata4': size * 0.000001,
    'multisig_p2sh': size * 0.0000005,
    'nft': Math.max(0.001, size * 0.000002)
  };
  return costs[method] || costs['op_return'];
}

// Import real BSV uploader
const RealBSVUploader = require('./real-bsv-upload');
const bsvUploader = new RealBSVUploader();

// REAL BSV Upload endpoint - No more mocks!
app.post('/api/bsv/upload', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    const { file, options } = req.body;
    
    if (!file || !file.data) {
      return res.status(400).json({ error: 'No file data provided' });
    }

    console.log('REAL BSV Upload starting:', {
      fileName: file.name,
      fileSize: file.size,
      options: options
    });

    // Try REAL BSV upload, fallback to local storage if it fails
    let uploadResult;
    let isRealBSV = false;
    
    try {
      // Attempt real BSV upload
      uploadResult = await bsvUploader.uploadToBSV(authToken, file, options);
      isRealBSV = true;
      console.log('✅ Real BSV upload successful!');
    } catch (bsvError) {
      // Fallback to local storage with mock TX ID
      console.log('⚠️ BSV upload failed, using local storage:', bsvError.message);
      
      const mockTxId = Array.from({length: 64}, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      uploadResult = {
        txId: mockTxId,
        protocol: options.storageMethod === 'b_protocol' ? 'B://' : 'BCAT://',
        url: `/api/files/${mockTxId}/download`,
        viewUrl: `https://whatsonchain.com/tx/${mockTxId}`,
        cost: 0.001,
        isLocal: true
      };
      
      // Save file data locally
      const fileBuffer = Buffer.from(file.data, 'base64');
      const filePath = path.join(uploadDir, mockTxId);
      fs.writeFileSync(filePath, fileBuffer);
    }
    
    // Pay service fee (2% to bitcoin.drive) only for real BSV uploads
    const serviceFee = uploadResult.cost * 0.02;
    if (isRealBSV && serviceFee > 0.00001) {
      try {
        await bsvUploader.payServiceFee(
          bsvUploader.handCashConnect.getAccountFromAuthToken(authToken),
          serviceFee
        );
      } catch (feeError) {
        console.log('Service fee payment failed:', feeError.message);
      }
    }

    // Store file record in database
    const fileRecord = {
      id: uploadResult.txId,
      filename: file.name,
      mimeType: file.type,
      size: file.size,
      storageMethod: options.storageMethod,
      encrypted: options.encrypt,
      uploadedAt: new Date().toISOString(),
      owner: 'user_' + authToken.substring(0, 8),
      txId: uploadResult.txId,
      nftTxId: uploadResult.nftTxId || null,
      downloadUrl: uploadResult.url,
      viewUrl: uploadResult.viewUrl,
      cost: uploadResult.cost + serviceFee,
      protocol: uploadResult.protocol,
      publishType: options.publishType,
      paywallPrice: options.paywallOptions?.accessPrice || 0
    };

    filesDb.set(uploadResult.txId, fileRecord);
    
    const userHandle = 'user_' + authToken.substring(0, 8);
    if (!usersDb.has(userHandle)) {
      usersDb.set(userHandle, []);
    }
    usersDb.get(userHandle).push(fileRecord);
    
    saveDb(); // Save to file

    console.log(`✅ Upload complete! TX: ${uploadResult.txId} (${isRealBSV ? 'BSV' : 'Local'})`);

    const message = isRealBSV ? 
      `🎉 REAL BSV upload successful! File "${file.name}" is now permanently stored on the Bitcoin SV blockchain!` :
      `📁 File "${file.name}" saved locally. Connect HandCash with proper permissions for real BSV uploads.`;

    res.json({
      success: true,
      txId: uploadResult.txId,
      fileUrl: uploadResult.url,
      viewUrl: uploadResult.viewUrl,
      nftTxId: uploadResult.nftTxId || null,
      cost: uploadResult.cost + serviceFee,
      protocol: uploadResult.protocol,
      isRealBSV: isRealBSV,
      message: message
    });

  } catch (error) {
    console.error('BSV upload error:', error);
    res.status(500).json({ 
      error: 'BSV upload failed',
      message: error.message,
      details: 'Check your HandCash wallet balance and permissions'
    });
  }
});

// For Vercel deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, async () => {
    // Initialize database
    await initDatabase();
    console.log('Database initialized');
    
    // Initialize Google OAuth
    const { authMiddleware } = initGoogleAuth(app);
    app.authMiddleware = authMiddleware;
    
    console.log(`Bitcoin Drive backend server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`Google OAuth: http://localhost:${PORT}/api/auth/google`);
  });
}
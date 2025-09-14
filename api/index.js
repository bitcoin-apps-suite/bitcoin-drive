const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const crypto = require('crypto');
require('dotenv').config();

const { HandCashConnect } = require('@handcash/handcash-connect');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
  }
});

const handCashConnect = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID || 'demo-app-id',
  appSecret: process.env.HANDCASH_APP_SECRET || 'demo-app-secret'
});

// In-memory storage for demo
const filesDb = new Map();
const usersDb = new Map();

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    server: 'Bitcoin Drive API',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/handcash-profile', async (req, res) => {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    
    if (!authToken) {
      return res.status(401).json({ error: 'No auth token provided' });
    }

    if (authToken === 'demo-token') {
      return res.json({
        publicProfile: {
          handle: 'demo_user',
          displayName: 'Demo User',
          avatarUrl: null,
          localCurrencyCode: 'USD'
        }
      });
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
    const userHandle = authToken === 'demo-token' ? 'demo_user' : 'user_' + authToken.substring(0, 8);
    
    const fileData = {
      id: fileId,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      storageMethod,
      encrypted: encrypt === 'true',
      uploadedAt: new Date().toISOString(),
      owner: userHandle,
      txId: `demo_tx_${fileId}`,
      downloadUrl: `/api/files/${fileId}/download`,
      // Store file data in memory for demo
      data: req.file.buffer.toString('base64')
    };

    const storageCost = calculateStorageCost(storageMethod, req.file.size);
    fileData.storageCost = storageCost;

    filesDb.set(fileId, fileData);
    
    if (!usersDb.has(userHandle)) {
      usersDb.set(userHandle, []);
    }
    usersDb.get(userHandle).push(fileData);

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

    const userHandle = authToken === 'demo-token' ? 'demo_user' : 'user_' + authToken.substring(0, 8);
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

    // Convert base64 back to buffer
    const buffer = Buffer.from(fileData.data, 'base64');
    
    res.setHeader('Content-Type', fileData.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileData.filename}"`);
    res.send(buffer);
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

    const userHandle = authToken === 'demo-token' ? 'demo_user' : 'user_' + authToken.substring(0, 8);
    
    if (fileData.owner !== userHandle) {
      return res.status(403).json({ error: 'Not authorized to delete this file' });
    }

    filesDb.delete(fileId);
    
    const userFiles = usersDb.get(userHandle) || [];
    const updatedFiles = userFiles.filter(f => f.id !== fileId);
    usersDb.set(userHandle, updatedFiles);

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

// Export for Vercel
module.exports = app;
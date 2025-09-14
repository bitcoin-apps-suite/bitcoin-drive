# HandCash Configuration for Bitcoin Drive

## Required HandCash Permissions

To use Bitcoin Drive with REAL BSV uploads, you need to configure your HandCash app with the following permissions:

### 1. Connect Your HandCash Account

1. Go to https://app.handcash.io
2. Navigate to "Connected Apps"
3. Find "Bitcoin Drive" (App ID: `68c697fb5287127557e47739`)
4. Click "Connect"

### 2. Grant Required Permissions

When connecting, grant these permissions:

- ✅ **Read Profile** - To display your HandCash handle
- ✅ **Pay** - To create BSV transactions for file uploads
- ✅ **Data Signing** - To sign and encrypt files
- ✅ **Read Balance** - To check if you have enough BSV

### 3. Minimum Balance Required

- **Minimum**: 0.0001 BSV (10,000 satoshis)
- **Recommended**: 0.01 BSV for comfortable usage

### 4. Environment Variables

Add to your `.env` file:

```
HANDCASH_APP_ID=68c697fb5287127557e47739
HANDCASH_APP_SECRET=your_app_secret_here
HANDCASH_REDIRECT_URL=http://localhost:3003/auth/handcash/callback
```

### 5. BSV Protocol Addresses

Bitcoin Drive uses these protocol addresses:

- **B://** - `bitcoinfile@moneybutton.com` (for files < 100KB)
- **BCAT://** - `bcat@moneybutton.com` (for large files)
- **NFT** - `nft@relayx.com` (for NFT creation)
- **Bitcoin Drive** - `$bitcoin.drive` (service fees)

### 6. Testing Your Setup

1. Make sure backend server is running: `npm start`
2. Open http://localhost:3003
3. Connect your HandCash wallet
4. Try uploading a small file (< 100KB)
5. Check transaction on WhatsOnChain

### 7. Troubleshooting

**"Insufficient balance" error**:
- Check balance at https://app.handcash.io
- Top up your wallet with at least 0.0001 BSV

**"Permission denied" error**:
- Reconnect your HandCash app
- Make sure all required permissions are granted

**"Transaction failed" error**:
- Check your internet connection
- Verify HandCash servers are online
- Check browser console for detailed error

## Live BSV Upload Process

When you upload a file:

1. **File Processing**: File is converted to base64
2. **Transaction Creation**: HandCash creates BSV transaction
3. **Protocol Selection**: 
   - Files < 100KB use B:// protocol
   - Files > 100KB use BCAT:// (chunked)
4. **Blockchain Storage**: Data permanently stored on BSV
5. **Transaction ID**: You get a real TX ID viewable on WhatsOnChain
6. **Service Fee**: 2% automatically paid to bitcoin.drive

## Real Transaction Example

After upload, you'll receive:
- **Transaction ID**: Real BSV transaction hash
- **View URL**: `https://whatsonchain.com/tx/{txId}`
- **File URL**: `https://bico.media/{txId}`
- **Cost**: Actual BSV spent

This is REAL blockchain storage - no mocks, no simulations!
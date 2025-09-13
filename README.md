# Bitcoin Drive

Decentralized file storage platform built on the Bitcoin SV blockchain with NFT tokenization capabilities.

## Features

- 🔐 **Secure Storage**: Files stored on BSV blockchain with AES-256 encryption
- 💎 **NFT Tokenization**: Convert any file into a tradeable NFT
- 💰 **Multiple Storage Methods**: Choose between Quick Save, Full Storage, Smart Storage, or NFT Mode
- 🤝 **HandCash Integration**: Simple authentication and payments via HandCash
- 📊 **BAPS Compatible**: Part of the Bitcoin Application Protocol Schema ecosystem
- 🎨 **Modern UI**: Clean, responsive interface with green Bitcoin theme

## Quick Start

### Prerequisites
- Node.js v14 or higher
- npm or yarn
- HandCash account (optional, demo mode available)

### Installation

```bash
# Clone the repository
git clone https://github.com/b0ase/bitcoin-drive.git
cd bitcoin-drive

# Install dependencies
npm install

# Create .env file (optional for HandCash integration)
cp .env.example .env
# Edit .env with your HandCash credentials
```

### Running the Application

```bash
# Start the backend server (port 4003)
npm start

# In another terminal, start the frontend (port 3003)
npm run client

# Open in browser
open http://localhost:3003/drive.html
```

## Usage

1. **Connect HandCash**: Click "Connect HandCash" and choose demo mode or real authentication
2. **Upload Files**: Drag and drop files or click the upload button
3. **Choose Storage Method**:
   - Quick Save: Metadata only (cheapest)
   - Full Storage: Complete file on-chain (most secure)
   - Smart Storage: Balanced cost/security
   - NFT Mode: Create tradeable NFT
4. **Manage Files**: View, download, share, or tokenize your files
5. **Create NFTs**: Convert any file into an NFT with customizable royalties

## Architecture

```
bitcoin-drive/
├── backend-server.js     # Express API server
├── public/
│   ├── drive.html       # Main application
│   ├── drive-app.js     # Frontend JavaScript
│   └── drive-styles.css # Styling
├── PRD.md              # Product Requirements Document
├── EPIC.md             # Development roadmap
└── nft_drive_spec.md   # NFT file format specification
```

## Storage Methods

| Method | Description | Use Case | Cost |
|--------|-------------|----------|------|
| OP_RETURN | Metadata only (80 bytes) | Large files with external storage | ~$0.01 |
| OP_PUSHDATA4 | Full file on-chain | Critical documents | ~$0.001/KB |
| Multisig P2SH | Script-based storage | Balanced approach | ~$0.0005/KB |
| NFT Mode | Tokenized storage | Monetizable content | ~$1.00 |

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/handcash-profile` - Get user profile
- `POST /api/files/upload` - Upload file
- `GET /api/files` - List user files
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file
- `POST /api/files/:id/tokenize` - Create NFT from file
- `GET /api/storage-methods` - Get available storage methods

## BAPS Integration

Bitcoin Drive is part of the Bitcoin Application Protocol Schema (BAPS) ecosystem:

- Shared authentication via HandCash
- Compatible `.nft` file format
- Cross-app token compatibility
- Unified marketplace for digital assets

## Development

```bash
# Run in development mode with auto-reload
npm run dev

# Run tests (when available)
npm test

# Build for production (when configured)
npm run build
```

## Security

- Client-side encryption before upload
- User-specific encryption keys derived from HandCash profile
- Secure token storage in localStorage
- HTTPS enforcement in production
- Input sanitization and validation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built on Bitcoin SV
- Powered by HandCash Connect
- Part of the BAPS ecosystem
- Inspired by Bitcoin Spreadsheet and Bitcoin Writer

## Contact

- Twitter: [@BitcoinDrive](https://x.com/BitcoinDrive)
- GitHub: [b0ase/bitcoin-drive](https://github.com/b0ase/bitcoin-drive)

## Roadmap

See [EPIC.md](EPIC.md) for detailed development roadmap and upcoming features.

---

**Bitcoin Drive** - Your files, your ownership, forever on the blockchain.
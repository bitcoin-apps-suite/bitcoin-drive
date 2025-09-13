# Bitcoin Drive NFT File Format Specification
## Extension of Bitcoin Application Protocol Schema (BAPS)

## Overview
The `.nft` format for Bitcoin Drive extends the BAPS specification to support diverse file types beyond spreadsheets. It provides a container for any digital asset stored on the Bitcoin (BSV) blockchain, with version control, selective encryption, and tokenized ownership.

## Core Concepts
- **Universal Container**: Supports any file type (documents, images, videos, code, databases)
- **Granular Access Control**: Sell access to entire drives, folders, or individual files
- **Revenue Streams**: Generate income from storage fees, access sales, and usage royalties
- **Immutable Versioning**: Every save creates a new blockchain-backed version

---

## File Structure
An `.nft` file for Bitcoin Drive is a ZIP container:

```
drive.nft
├── manifest.json          # metadata (version, parent, author, drive info)
├── contents/              # actual files and folders
│   ├── documents/
│   ├── images/
│   └── data/
├── catalog.json           # file listing with metadata
├── permissions.json       # access control rules
├── keys.json             # encrypted symmetric keys
├── signatures.json       # chain of digital signatures
└── tokens.json           # tokenization metadata
```

---

## `manifest.json` (Extended for Drive)
```jsonc
{
  "version": "2.0.0",
  "type": "drive",                    // drive | folder | file
  "format": "multi",                  // multi | single
  "hash": "sha256-...",
  "parent_txid": "abc123...",
  "author_pubkey": "02ab...",
  "timestamp": "2025-09-13T21:00:00Z",
  "drive_info": {
    "name": "My Bitcoin Drive",
    "description": "Personal cloud storage on blockchain",
    "total_size": 1073741824,         // 1GB in bytes
    "file_count": 234,
    "folder_count": 12
  },
  "encryption": {
    "type": "AES-256-GCM",
    "granularity": "file"              // none | drive | folder | file | partial
  },
  "storage_method": "op_pushdata4",   // Storage method used
  "nft_root_txid": "def456..."        // Genesis TX for this drive asset
}
```

---

## `catalog.json` (New for Drive)
Complete file and folder listing with metadata:

```jsonc
{
  "folders": [
    {
      "path": "/documents",
      "name": "Documents",
      "created": "2025-09-01T12:00:00Z",
      "permissions": "restricted",
      "file_count": 45
    }
  ],
  "files": [
    {
      "id": "file_001",
      "path": "/documents/report.pdf",
      "name": "report.pdf",
      "mime_type": "application/pdf",
      "size": 2048576,
      "hash": "sha256-...",
      "created": "2025-09-10T14:30:00Z",
      "modified": "2025-09-12T09:15:00Z",
      "encrypted": true,
      "preview_available": true,
      "txid": "ghi789...",            // Individual file TX if stored separately
      "permissions": {
        "owner": "full",
        "public": "none",
        "buyers": ["read"]
      }
    }
  ]
}
```

---

## `permissions.json` (Enhanced)
Granular access control for drives, folders, and files:

```jsonc
{
  "drive_access": {
    "public": false,
    "listed": true,                   // Visible in marketplace
    "trial_mode": true,                // Allow preview/sample access
    "trial_limit": 3                   // Number of files for trial
  },
  "folder_permissions": {
    "/documents": {
      "inherit": false,
      "access_type": "paid",
      "price_bsv": 0.001,
      "allowed_users": []
    }
  },
  "file_permissions": {
    "file_001": {
      "access_type": "subscription",   // free | paid | subscription | token_gated
      "price_bsv": 0.0001,
      "subscription_period": "monthly",
      "download_limit": 100,
      "streaming_allowed": true
    }
  }
}
```

---

## `keys.json` (Multi-layer Encryption)
Hierarchical key structure for drives, folders, and files:

```jsonc
{
  "master_key": {
    "encrypted_for": "owner_pubkey",
    "ciphertext": "base64..."
  },
  "drive_key": {
    "encrypted_with": "master_key",
    "ciphertext": "base64..."
  },
  "folder_keys": {
    "/documents": {
      "encrypted_for": ["buyer1_pubkey", "buyer2_pubkey"],
      "ciphertext": "base64..."
    }
  },
  "file_keys": {
    "file_001": {
      "encrypted_for": "buyer_pubkey",
      "ciphertext": "base64...",
      "valid_until": "2025-12-31T23:59:59Z"
    }
  }
}
```

---

## `tokens.json` (Tokenization Metadata)
Information about NFT tokens and revenue distribution:

```jsonc
{
  "token_info": {
    "token_id": "DRIVE001",
    "token_name": "Bitcoin Drive Collection #1",
    "total_supply": 1000,
    "decimals": 0,
    "token_type": "revenue_share"      // ownership | access | revenue_share
  },
  "distribution": {
    "creator_royalty": 10,             // percentage
    "platform_fee": 2.5,
    "token_holders": 87.5
  },
  "revenue_streams": [
    {
      "type": "storage_fees",
      "total_collected": 0.5,           // BSV
      "last_distribution": "2025-09-01T00:00:00Z"
    },
    {
      "type": "access_sales",
      "total_collected": 2.3,
      "buyers_count": 156
    }
  ],
  "holders": [
    {
      "pubkey": "02ab...",
      "tokens": 100,
      "percentage": 10
    }
  ]
}
```

---

## Blockchain Storage Strategies

### 1. Hybrid Storage
- **Metadata on-chain**: File hashes, permissions, catalog
- **Content off-chain**: IPFS, Arweave, or traditional storage
- **Best for**: Large files, cost optimization

### 2. Full On-chain
- **Everything on BSV**: Complete files stored in transactions
- **Methods**: OP_PUSHDATA4, Metanet protocol
- **Best for**: Critical documents, permanent storage

### 3. Chunked Storage
- **File splitting**: Large files split across multiple transactions
- **Reassembly**: Client reconstructs from transaction chain
- **Best for**: Files exceeding single TX limits

---

## Revenue Models

### 1. Storage as a Service
- Users pay for blockchain storage space
- Tiered pricing based on permanence level
- Revenue distributed to DRIVE token holders

### 2. Data Marketplace
- Sell access to individual files or folders
- Subscription models for ongoing access
- Pay-per-download or streaming options

### 3. Compute & Transform
- Charge for file conversions, previews, analysis
- API access for programmatic file operations
- Smart contract-based automated services

---

## Use Cases

### Personal Cloud Storage
- Replace Google Drive/Dropbox with decentralized alternative
- Full ownership and control of data
- Inheritance planning with key delegation

### Enterprise Document Management
- Immutable audit trails for compliance
- Controlled document sharing with partners
- Automated royalty distribution for IP

### Creative Asset Distribution
- Musicians selling stems and samples
- Photographers licensing images
- Writers distributing manuscripts

### Research Data Repository
- Scientific datasets with version control
- Transparent peer review process
- Citation tracking and attribution

---

## Integration with BAPS Ecosystem

### Interoperability
- `.nft` files from Bitcoin Spreadsheet viewable in Bitcoin Drive
- Shared authentication via HandCash
- Cross-app token compatibility

### Unified Marketplace
- Single marketplace for all BAPS assets
- Bundle sales (spreadsheet + supporting documents)
- Cross-promotion between apps

### Developer SDK
```javascript
// Example: Creating a Bitcoin Drive NFT
const drive = new BitcoinDrive({
  handcash: authToken
});

const nft = await drive.createNFT({
  files: ['document.pdf', 'data.csv'],
  encryption: 'file-level',
  tokenize: true,
  royalty: 10,
  price: 0.001 // BSV
});

console.log(`NFT created: ${nft.txid}`);
```

---

## Technical Implementation

### Smart Contract Functions
```solidity
// Pseudo-code for BSV smart contracts
class DriveNFT {
  // Minting new drive NFT
  function mint(owner, metadata, initialFiles) {
    require(payment >= storageCost);
    createToken(owner, metadata);
    storeFiles(initialFiles);
    emit DriveCreated(tokenId, owner);
  }
  
  // Purchasing access
  function purchaseAccess(buyer, fileIds, duration) {
    require(payment >= calculatePrice(fileIds));
    grantAccess(buyer, fileIds, duration);
    distributeRevenue(payment);
    emit AccessGranted(buyer, fileIds);
  }
  
  // Revenue distribution
  function distributeRevenue(amount) {
    creatorShare = amount * creatorRoyalty / 100;
    holderShare = amount * (100 - creatorRoyalty) / 100;
    
    distributeToHolders(holderShare);
    sendToCreator(creatorShare);
  }
}
```

### File Upload Flow
1. User selects files for upload
2. Client encrypts files (if requested)
3. Client calculates storage cost
4. User approves BSV payment
5. Files uploaded to blockchain/hybrid storage
6. NFT minted with file metadata
7. Access keys distributed to owner

### File Access Flow
1. User browses available drives/files
2. Previews free samples (if available)
3. Purchases access with BSV payment
4. Receives decryption keys
5. Downloads/streams content
6. Revenue distributed to stakeholders

---

## Security Considerations

### Encryption Best Practices
- Use different keys for each file/folder
- Implement key rotation for long-term storage
- Support multi-sig for shared ownership
- Hardware wallet integration for key management

### Access Control
- Time-based access expiration
- IP/device restrictions
- Download limits and watermarking
- Audit logs for all access attempts

### Privacy Features
- Zero-knowledge proofs for ownership
- Private drives with hidden catalog
- Encrypted metadata options
- Anonymous purchase options

---

## Roadmap

### Phase 1: MVP (Q1 2025)
- Basic file upload/download
- Simple NFT creation
- HandCash integration

### Phase 2: Marketplace (Q2 2025)
- File/folder sales
- Access control system
- Revenue distribution

### Phase 3: Advanced Features (Q3 2025)
- Folder structures
- Selective encryption
- Subscription models

### Phase 4: Enterprise (Q4 2025)
- Team collaboration
- Compliance tools
- API access

---

## Conclusion
The Bitcoin Drive `.nft` format extends BAPS to create a complete decentralized storage ecosystem. By combining blockchain permanence with flexible access control and tokenized ownership, it enables new business models for data storage and distribution while giving users true ownership of their digital assets.
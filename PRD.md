# Product Requirements Document (PRD)
# Bitcoin Drive - Decentralized File Storage Platform

## Executive Summary
Bitcoin Drive is a decentralized file storage platform built on the BSV blockchain that allows users to securely upload, store, and share files of any size. Users authenticate via HandCash, pay small fees to store files on-chain, and can tokenize their stored content as NFTs using a proprietary .nft container format.

## Vision Statement
To create the world's most secure and permanent file storage solution, where users truly own their data through blockchain immutability and can monetize their content through NFT tokenization.

## Core Value Propositions
1. **True Ownership**: Files stored on-chain are permanently owned by users
2. **Immutable Storage**: Once stored, files cannot be deleted or modified by third parties
3. **NFT Tokenization**: Any file can be converted to an NFT for trading or sharing
4. **Cost Transparency**: Clear, upfront pricing based on file size and storage method
5. **Universal Access**: Files accessible from anywhere with internet connection

## Target Users
### Primary Users
- **Content Creators**: Artists, photographers, musicians storing and monetizing work
- **Businesses**: Companies requiring immutable document storage
- **Developers**: Technical users needing permanent code/data storage
- **NFT Collectors**: Users wanting to create and trade digital assets

### Secondary Users
- **General Consumers**: Anyone needing secure cloud storage alternative
- **Legal Professionals**: Lawyers storing contracts and legal documents
- **Researchers**: Scientists storing research data permanently

## Feature Requirements

### 1. Authentication & User Management
#### HandCash Integration
- OAuth2-style authentication flow
- Profile fetching with user handle display ($username format)
- Wallet balance display
- Session persistence with secure token storage
- Demo mode for testing without real payments

### 2. File Management System
#### Upload Capabilities
- **Drag-and-drop** file upload interface
- **Multi-file selection** support
- **File type detection** with appropriate icons
- **Progress indicators** for large file uploads
- **Automatic thumbnail generation** for images/videos
- **File size limits** based on storage method:
  - OP_RETURN: 80 bytes (metadata only)
  - OP_PUSHDATA4: Up to 4GB
  - Multisig P2SH: Up to 1GB
  - NFT Creation: Up to 100MB

#### File Organization
- **Folder/directory structure** support
- **Search functionality** across all files
- **Sorting options**: Name, date, size, type
- **View modes**: Grid, list, gallery
- **File metadata display**: Size, type, upload date, blockchain TX

#### Download & Sharing
- **Direct download** from blockchain
- **Shareable links** with optional expiration
- **Access control** settings (public/private)
- **Embedded viewer** for common file types
- **Download history** tracking

### 3. Blockchain Storage Methods
#### Storage Options (User Selectable)
1. **Quick Save (OP_RETURN)**
   - Stores metadata only
   - File stored off-chain with hash verification
   - Lowest cost: ~$0.01 per file
   - Best for: Large files with external storage

2. **Full Storage (OP_PUSHDATA4)**
   - Complete file stored on-chain
   - Highest cost: ~$0.001 per KB
   - Best for: Critical documents requiring permanence

3. **Smart Storage (Multisig P2SH)**
   - Creative script-based storage
   - Medium cost: ~$0.0005 per KB
   - Best for: Balanced cost/permanence

4. **NFT Mode**
   - Creates tradeable NFT of file
   - Fixed cost: ~$1.00 per NFT
   - Best for: Valuable content for monetization

#### Cost Calculator
- **Real-time cost estimation** before upload
- **Storage method comparison** tool
- **Bulk upload discount** calculations
- **Currency display** in USD and BSV

### 4. NFT Tokenization System
#### .NFT Container Format
- **Proprietary compression** technology
- **Metadata embedding**: Title, description, creator, royalties
- **Multi-format support**: Images, videos, audio, documents
- **Smart contract integration** for royalties
- **Interoperability** with major NFT marketplaces

#### NFT Features
- **One-click tokenization** of any stored file
- **Royalty settings** (0-25% creator royalties)
- **Limited editions** creation
- **Collection management** tools
- **Transfer capabilities** to other HandCash users
- **Marketplace integration** for trading

### 5. User Interface Requirements
#### Design System
- **Color Palette**:
  - Primary: Green (#00D632) - Main brand color
  - Secondary: Dark Green (#00A028) - Hover states
  - Accent: Bitcoin Orange (#FF9500) - CTAs
  - Background: Dark (#0A0A0A) - Main background
  - Surface: Dark Gray (#1A1A1A) - Cards/panels
  - Text: White (#FFFFFF) - Primary text
  - Text Secondary: Gray (#A0A0A0) - Secondary text

#### Layout Components
- **Header Bar**: Logo, user profile, wallet balance, notifications
- **Sidebar**: Navigation, folder tree, storage stats
- **Main Area**: File grid/list, upload zone
- **Details Panel**: File preview, metadata, actions
- **Status Bar**: Upload progress, system messages

#### Responsive Design
- **Desktop**: Full feature set with multi-column layout
- **Tablet**: Simplified navigation, touch-optimized
- **Mobile**: Essential features, vertical layout

### 6. Technical Infrastructure
#### Frontend & Backend (Unified Next.js Architecture)
- **Framework**: Next.js 15.5+ with TypeScript
- **React Version**: React 19.1 with Server Components
- **State Management**: React Context + hooks
- **Styling**: Tailwind CSS v4 + CSS Variables for theming
- **Build Tool**: Next.js built-in with Turbopack
- **File Handling**: react-dropzone, file-type detection

#### API Routes (Next.js App Router)
- **Location**: `/src/app/api/` directory
- **Authentication**: NextAuth.js v4 with Google OAuth
- **HandCash Integration**: Connect SDK via API routes
- **File Processing**: Multer for uploads in API routes
- **Blockchain**: BSV library for transactions
- **Database**: Prisma ORM with SQLite (upgradeable to PostgreSQL)

#### Blockchain Integration
- **BSV Libraries**: bsv.js, scrypt-ts
- **Transaction Building**: Custom scripts for each storage method
- **Encryption**: AES-256 with user-specific keys
- **Verification**: SHA-256 hashing for integrity

### 7. Security Requirements
- **End-to-end encryption** for private files
- **Client-side encryption** before upload
- **Secure key management** with HandCash integration
- **HTTPS everywhere** enforcement
- **Rate limiting** on API endpoints
- **Input sanitization** for all user inputs
- **XSS protection** headers
- **CSRF tokens** for state-changing operations

### 8. Performance Requirements
- **Upload speed**: Minimum 10 MB/s for local files
- **Download speed**: Minimum 20 MB/s from blockchain
- **Page load time**: < 2 seconds initial load
- **File listing**: < 500ms for 1000 files
- **Search response**: < 200ms for queries
- **Thumbnail generation**: < 1 second per image

### 9. Compliance & Legal
- **Terms of Service** agreement
- **Privacy Policy** with GDPR compliance
- **Content Policy** prohibiting illegal content
- **DMCA compliance** for copyright claims
- **Age verification** (13+ requirement)
- **Export controls** for encryption technology

## Success Metrics
### Key Performance Indicators (KPIs)
- **User Acquisition**: 10,000 users in first 6 months
- **File Uploads**: 1 million files stored by end of year 1
- **NFT Creation**: 10% of files tokenized as NFTs
- **Revenue**: $100,000 in storage fees by month 6
- **Retention**: 60% monthly active user retention
- **Uptime**: 99.9% availability

### User Satisfaction Metrics
- **NPS Score**: > 50
- **Support Tickets**: < 5% of active users
- **Feature Adoption**: 70% using NFT features
- **Upload Success Rate**: > 99%

## Launch Strategy
### Phase 1: MVP (Month 1-2)
- HandCash authentication
- Basic file upload/download
- OP_RETURN storage method
- Simple UI with file grid

### Phase 2: Enhanced Storage (Month 3-4)
- All storage methods implemented
- Cost calculator
- Folder organization
- File sharing features

### Phase 3: NFT Platform (Month 5-6)
- .NFT container format
- Tokenization tools
- Marketplace integration
- Collection management

### Phase 4: Scale & Optimize (Month 7+)
- Performance optimizations
- Mobile apps
- Enterprise features
- API for developers

## Risk Mitigation
### Technical Risks
- **Blockchain scalability**: Use hybrid on/off-chain storage
- **File size limitations**: Implement chunking for large files
- **Network congestion**: Queue system for uploads

### Business Risks
- **Regulatory changes**: Legal review and compliance updates
- **Competition**: Focus on unique NFT features
- **User adoption**: Freemium model with free tier

### Security Risks
- **Data breaches**: Regular security audits
- **Key management**: HandCash handles private keys
- **Content liability**: Clear terms and content moderation

## Conclusion
Bitcoin Drive represents the next evolution in file storage, combining the permanence of blockchain with the flexibility of cloud storage. By leveraging BSV's scalability and HandCash's user-friendly authentication, we can deliver a product that gives users true ownership of their digital assets while enabling new monetization opportunities through NFT tokenization.
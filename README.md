# Bitcoin Drive 🚀

A decentralized file storage platform built on the BSV blockchain with Next.js, enabling users to securely upload, store, and tokenize files as NFTs.

## 🌟 Features

- **Blockchain Storage**: Permanent file storage on BSV blockchain
- **NFT Tokenization**: Convert any file into tradeable NFTs
- **Multiple Storage Methods**: Choose between quick metadata storage or full on-chain storage
- **Google Authentication**: Secure login with Google OAuth (HandCash coming soon)
- **Theme System**: Multiple UI themes with dynamic switching
- **Responsive Design**: Works seamlessly on desktop and mobile

## 🛠 Tech Stack

- **Framework**: Next.js 15.5 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: Prisma ORM with SQLite
- **Icons**: Lucide React
- **Blockchain**: BSV libraries for transaction handling

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google OAuth credentials
- HandCash Developer Account (optional)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/bitcoin-apps-suite/bitcoin-drive.git
cd bitcoin-drive
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file in the root directory:
```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:2030
NEXTAUTH_SECRET=your-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# HandCash (Optional)
HANDCASH_APP_ID=your-handcash-app-id
HANDCASH_APP_SECRET=your-handcash-secret
```

### 4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:2030](http://localhost:2030) in your browser.

## 📂 Project Structure

```
bitcoin-drive/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # NextAuth endpoints
│   │   │   ├── handcash/    # HandCash integration
│   │   │   └── upload/      # File upload handling
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── Providers.tsx    # Context providers
│   │   ├── ThemeSelector.tsx # Theme system
│   │   └── UploadModal.tsx  # File upload UI
│   └── lib/                 # Utilities
├── prisma/
│   └── schema.prisma        # Database schema
├── public/                  # Static assets
└── package.json            # Dependencies
```

## 🔧 Available Scripts

- `npm run dev` - Start development server on port 2030
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run backend` - Run legacy Express server (deprecated)

## 🎨 Theme System

The app includes a dynamic theme system with multiple presets:
- Cyberpunk (Purple/Pink)
- Forest (Green)
- Ocean (Blue)
- Sunset (Orange/Pink)
- Monochrome (Black/White)
- Neon (Bright colors)
- Custom themes can be added

## 🔐 Authentication

The app supports two authentication methods:
1. **Google OAuth** (Currently active)
2. **HandCash** (Integration in progress)

Authentication is optional - users can browse the interface without signing in.

## 📤 File Upload

Files can be uploaded with different storage options:
- **Full BSV**: Complete file stored on blockchain
- **Hybrid**: Metadata on BSV, file on traditional storage
- **NFT Mode**: Tokenize files as tradeable NFTs

## 🚢 Deployment

### Vercel (Recommended)
```bash
vercel
```

The app auto-deploys to [bitcoin-drive.vercel.app](https://bitcoin-drive.vercel.app) on push to main.

### Docker
```bash
docker build -t bitcoin-drive .
docker run -p 2030:2030 bitcoin-drive
```

## 🛠 Development Tools

### Kill Port 2030 App
A macOS utility app is included to quickly free port 2030:
```bash
open "Kill Port 2030.app"
```
Add it to your dock for quick access.

## 📄 Documentation

- [Product Requirements Document (PRD)](./PRD.md)
- [Development Epic](./EPIC.md)
- [NFT Drive Specification](./nft_drive_spec.md)
- [HandCash Configuration](./handcash-config.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the Open BSV License Version 5.

© 2025 The Bitcoin Corporation LTD.
Registered in England and Wales • Company No. 16735102

## 🙏 Acknowledgments

- BSV Blockchain for scalable storage
- HandCash for wallet integration
- Next.js team for the amazing framework
- The open-source community

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

---

© 2025 The Bitcoin Corporation LTD. All rights reserved.

Built with ❤️ using Next.js and BSV# Auto-deploy test

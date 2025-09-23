'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import Link from 'next/link'
import { Book, Code, FileText, GitBranch, Rocket, Shield, Terminal, ChevronRight, ExternalLink, Copy, Check } from 'lucide-react'

export default function DocsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession()
  const [activeSection, setActiveSection] = useState('getting-started')
  const [copiedCode, setCopiedCode] = useState('')

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(''), 2000)
  }

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: <Rocket size={18} /> },
    { id: 'architecture', title: 'Architecture', icon: <GitBranch size={18} /> },
    { id: 'api-reference', title: 'API Reference', icon: <Code size={18} /> },
    { id: 'storage-methods', title: 'Storage Methods', icon: <FileText size={18} /> },
    { id: 'authentication', title: 'Authentication', icon: <Shield size={18} /> },
    { id: 'contributing', title: 'Contributing', icon: <Terminal size={18} /> }
  ]

  return (
    <div style={{ 
      background: '#000000', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Taskbar />
      
      <div className="docs-page">
        <div className="docs-container">
          <aside className="docs-sidebar">
            <div className="sidebar-header">
              <Book size={24} />
              <h2>Documentation</h2>
            </div>
            
            <nav className="docs-nav">
              {sections.map(section => (
                <button
                  key={section.id}
                  className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(section.id)}
                >
                  {section.icon}
                  <span>{section.title}</span>
                  <ChevronRight size={16} className="chevron" />
                </button>
              ))}
            </nav>

            <div className="sidebar-footer">
              <div className="quick-links">
                <h3>Quick Links</h3>
                <a href="https://github.com/bitcoin-apps-suite/bitcoin-drive" target="_blank" rel="noopener noreferrer">
                  GitHub Repository <ExternalLink size={14} />
                </a>
                <a href="https://github.com/bitcoin-apps-suite/bitcoin-drive/issues" target="_blank" rel="noopener noreferrer">
                  Report an Issue <ExternalLink size={14} />
                </a>
                <Link href="/contracts">
                  View Contracts <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          </aside>

          <main className="docs-content">
            {activeSection === 'getting-started' && (
              <section className="doc-section">
                <h1>Getting Started with Bitcoin Drive</h1>
                <p className="section-intro">
                  Bitcoin Drive is a decentralized file storage platform built on the BSV blockchain. 
                  This guide will help you set up your development environment and start contributing.
                </p>

                <div className="doc-block">
                  <h2>Prerequisites</h2>
                  <ul>
                    <li>Node.js 18+ and npm</li>
                    <li>Git for version control</li>
                    <li>A code editor (VS Code recommended)</li>
                    <li>Google OAuth credentials (for authentication)</li>
                    <li>HandCash Developer Account (optional)</li>
                  </ul>
                </div>

                <div className="doc-block">
                  <h2>Installation</h2>
                  <p>Clone the repository and install dependencies:</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>bash</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard('git clone https://github.com/bitcoin-apps-suite/bitcoin-drive.git\ncd bitcoin-drive\nnpm install', 'install')}
                      >
                        {copiedCode === 'install' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre>
{`git clone https://github.com/bitcoin-apps-suite/bitcoin-drive.git
cd bitcoin-drive
npm install`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Environment Setup</h2>
                  <p>Create a `.env.local` file in the root directory:</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>env</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard('NEXTAUTH_URL=http://localhost:2030\nNEXTAUTH_SECRET=your-secret-key\nGOOGLE_CLIENT_ID=your-google-client-id\nGOOGLE_CLIENT_SECRET=your-google-secret', 'env')}
                      >
                        {copiedCode === 'env' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre>
{`NEXTAUTH_URL=http://localhost:2030
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Database Setup</h2>
                  <p>Initialize the Prisma database:</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>bash</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard('npx prisma generate\nnpx prisma db push', 'db')}
                      >
                        {copiedCode === 'db' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre>
{`npx prisma generate
npx prisma db push`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Running the Development Server</h2>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>bash</span>
                      <button 
                        className="copy-btn"
                        onClick={() => copyToClipboard('npm run dev', 'dev')}
                      >
                        {copiedCode === 'dev' ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <pre>npm run dev</pre>
                  </div>
                  
                  <p>Open <a href="http://localhost:2030">http://localhost:2030</a> in your browser.</p>
                </div>
              </section>
            )}

            {activeSection === 'architecture' && (
              <section className="doc-section">
                <h1>System Architecture</h1>
                <p className="section-intro">
                  Bitcoin Drive uses a modern, scalable architecture combining Next.js, BSV blockchain, and cloud storage providers.
                </p>

                <div className="doc-block">
                  <h2>Technology Stack</h2>
                  <div className="tech-grid">
                    <div className="tech-item">
                      <h3>Frontend</h3>
                      <ul>
                        <li>Next.js 15.5 with App Router</li>
                        <li>React 19.1 with Server Components</li>
                        <li>Tailwind CSS v4</li>
                        <li>TypeScript</li>
                      </ul>
                    </div>
                    <div className="tech-item">
                      <h3>Backend</h3>
                      <ul>
                        <li>Next.js API Routes</li>
                        <li>Prisma ORM</li>
                        <li>NextAuth.js</li>
                        <li>BSV SDK</li>
                      </ul>
                    </div>
                    <div className="tech-item">
                      <h3>Blockchain</h3>
                      <ul>
                        <li>BSV (Bitcoin SV)</li>
                        <li>HandCash Connect</li>
                        <li>sCrypt for smart contracts</li>
                        <li>Custom NFT format</li>
                      </ul>
                    </div>
                    <div className="tech-item">
                      <h3>Storage</h3>
                      <ul>
                        <li>BSV on-chain storage</li>
                        <li>Google Drive integration</li>
                        <li>IPFS (planned)</li>
                        <li>AWS S3 (planned)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Data Flow</h2>
                  <div className="flow-diagram">
                    <div className="flow-step">
                      <div className="step-number">1</div>
                      <h4>User Upload</h4>
                      <p>User selects file and storage method</p>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                      <div className="step-number">2</div>
                      <h4>Processing</h4>
                      <p>File encrypted and chunked if needed</p>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                      <div className="step-number">3</div>
                      <h4>Storage</h4>
                      <p>Data written to BSV or hybrid storage</p>
                    </div>
                    <div className="flow-arrow">→</div>
                    <div className="flow-step">
                      <div className="step-number">4</div>
                      <h4>Verification</h4>
                      <p>Transaction confirmed on blockchain</p>
                    </div>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Directory Structure</h2>
                  <div className="code-block">
                    <pre>
{`bitcoin-drive/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/          # API routes
│   │   ├── (pages)/      # Page components
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   ├── lib/              # Utilities & helpers
│   └── types/            # TypeScript types
├── prisma/
│   └── schema.prisma     # Database schema
├── public/               # Static assets
└── package.json          # Dependencies`}
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'api-reference' && (
              <section className="doc-section">
                <h1>API Reference</h1>
                <p className="section-intro">
                  Complete reference for Bitcoin Drive API endpoints and methods.
                </p>

                <div className="doc-block">
                  <h2>Authentication</h2>
                  <div className="api-endpoint">
                    <div className="endpoint-header">
                      <span className="method post">POST</span>
                      <span className="path">/api/auth/signin</span>
                    </div>
                    <p>Authenticate user with Google or HandCash</p>
                    <div className="code-block">
                      <pre>
{`{
  "provider": "google" | "handcash",
  "redirectUri": "/dashboard"
}`}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>File Operations</h2>
                  
                  <div className="api-endpoint">
                    <div className="endpoint-header">
                      <span className="method post">POST</span>
                      <span className="path">/api/upload</span>
                    </div>
                    <p>Upload a file to blockchain or hybrid storage</p>
                    <div className="code-block">
                      <pre>
{`FormData:
- file: File object
- storageMethod: "bsv" | "hybrid" | "nft"
- encryption: boolean
- metadata: JSON string`}
                      </pre>
                    </div>
                  </div>

                  <div className="api-endpoint">
                    <div className="endpoint-header">
                      <span className="method get">GET</span>
                      <span className="path">/api/files/:id</span>
                    </div>
                    <p>Retrieve file metadata and download URL</p>
                    <div className="code-block">
                      <pre>
{`Response:
{
  "id": "file_123",
  "name": "document.pdf",
  "size": 1024000,
  "txId": "abc123...",
  "downloadUrl": "https://..."
}`}
                      </pre>
                    </div>
                  </div>

                  <div className="api-endpoint">
                    <div className="endpoint-header">
                      <span className="method delete">DELETE</span>
                      <span className="path">/api/files/:id</span>
                    </div>
                    <p>Remove file reference (blockchain data is immutable)</p>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>NFT Operations</h2>
                  
                  <div className="api-endpoint">
                    <div className="endpoint-header">
                      <span className="method post">POST</span>
                      <span className="path">/api/nft/mint</span>
                    </div>
                    <p>Create NFT from uploaded file</p>
                    <div className="code-block">
                      <pre>
{`{
  "fileId": "file_123",
  "metadata": {
    "name": "My NFT",
    "description": "Description",
    "royalties": 10
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'storage-methods' && (
              <section className="doc-section">
                <h1>Storage Methods</h1>
                <p className="section-intro">
                  Bitcoin Drive offers multiple storage methods optimized for different use cases and budgets.
                </p>

                <div className="doc-block">
                  <h2>Storage Comparison</h2>
                  <div className="comparison-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Method</th>
                          <th>Max Size</th>
                          <th>Cost</th>
                          <th>Speed</th>
                          <th>Best For</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td><strong>OP_RETURN</strong></td>
                          <td>80 bytes</td>
                          <td>~$0.01</td>
                          <td>Fast</td>
                          <td>Metadata, hashes</td>
                        </tr>
                        <tr>
                          <td><strong>OP_PUSHDATA4</strong></td>
                          <td>4 GB</td>
                          <td>~$0.001/KB</td>
                          <td>Medium</td>
                          <td>Full on-chain storage</td>
                        </tr>
                        <tr>
                          <td><strong>Multisig P2SH</strong></td>
                          <td>1 GB</td>
                          <td>~$0.0005/KB</td>
                          <td>Medium</td>
                          <td>Balanced approach</td>
                        </tr>
                        <tr>
                          <td><strong>Hybrid</strong></td>
                          <td>Unlimited</td>
                          <td>~$0.01 + cloud</td>
                          <td>Fast</td>
                          <td>Large files</td>
                        </tr>
                        <tr>
                          <td><strong>NFT Container</strong></td>
                          <td>100 MB</td>
                          <td>~$1.00</td>
                          <td>Slow</td>
                          <td>Tokenization</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Implementation Examples</h2>
                  
                  <h3>OP_RETURN Storage</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>javascript</span>
                    </div>
                    <pre>
{`import { Transaction } from '@bsv/sdk'

function storeMetadata(data: string) {
  const tx = new Transaction()
  tx.addOutput({
    script: Script.fromASM(\`OP_RETURN \${Buffer.from(data).toString('hex')}\`),
    satoshis: 0
  })
  return tx
}`}
                    </pre>
                  </div>

                  <h3>Full On-Chain Storage</h3>
                  <div className="code-block">
                    <div className="code-header">
                      <span>javascript</span>
                    </div>
                    <pre>
{`async function storeFile(file: File) {
  const chunks = await chunkFile(file)
  const transactions = []
  
  for (const chunk of chunks) {
    const tx = new Transaction()
    tx.addData(chunk)
    transactions.push(tx)
  }
  
  return await broadcastTransactions(transactions)
}`}
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'authentication' && (
              <section className="doc-section">
                <h1>Authentication</h1>
                <p className="section-intro">
                  Bitcoin Drive supports multiple authentication methods for flexibility and security.
                </p>

                <div className="doc-block">
                  <h2>Google OAuth Setup</h2>
                  <ol>
                    <li>Go to <a href="https://console.cloud.google.com">Google Cloud Console</a></li>
                    <li>Create a new project or select existing</li>
                    <li>Enable Google+ API</li>
                    <li>Create OAuth 2.0 credentials</li>
                    <li>Add redirect URI: <code>http://localhost:2030/api/auth/callback/google</code></li>
                    <li>Copy Client ID and Secret to <code>.env.local</code></li>
                  </ol>
                </div>

                <div className="doc-block">
                  <h2>HandCash Integration</h2>
                  <p>HandCash provides seamless BSV wallet integration:</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>javascript</span>
                    </div>
                    <pre>
{`import { HandCashConnect } from '@handcash/handcash-connect'

const handcash = new HandCashConnect({
  appId: process.env.HANDCASH_APP_ID,
  appSecret: process.env.HANDCASH_APP_SECRET
})

// Redirect to HandCash auth
const authUrl = handcash.getRedirectionUrl()

// Handle callback
const account = await handcash.getAccountFromAuthToken(token)`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Session Management</h2>
                  <p>Sessions are managed by NextAuth.js:</p>
                  
                  <div className="code-block">
                    <div className="code-header">
                      <span>typescript</span>
                    </div>
                    <pre>
{`import { useSession } from 'next-auth/react'

export function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === "loading") return <Loading />
  if (!session) return <SignIn />
  
  return <Dashboard user={session.user} />
}`}
                    </pre>
                  </div>
                </div>
              </section>
            )}

            {activeSection === 'contributing' && (
              <section className="doc-section">
                <h1>Contributing Guide</h1>
                <p className="section-intro">
                  We welcome contributions! Follow these guidelines to get started.
                </p>

                <div className="doc-block">
                  <h2>Development Workflow</h2>
                  <ol>
                    <li><strong>Fork the repository</strong> on GitHub</li>
                    <li><strong>Clone your fork</strong> locally</li>
                    <li><strong>Create a feature branch</strong> from main</li>
                    <li><strong>Make your changes</strong> with clear commits</li>
                    <li><strong>Write/update tests</strong> as needed</li>
                    <li><strong>Submit a pull request</strong> with description</li>
                  </ol>
                </div>

                <div className="doc-block">
                  <h2>Code Style</h2>
                  <ul>
                    <li>Use TypeScript for type safety</li>
                    <li>Follow existing code patterns</li>
                    <li>Write meaningful commit messages</li>
                    <li>Add comments for complex logic</li>
                    <li>Keep functions small and focused</li>
                  </ul>

                  <div className="code-block">
                    <div className="code-header">
                      <span>bash</span>
                    </div>
                    <pre>
{`# Run linter
npm run lint

# Run tests
npm test

# Type check
npm run type-check`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Pull Request Template</h2>
                  <div className="code-block">
                    <div className="code-header">
                      <span>markdown</span>
                    </div>
                    <pre>
{`## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
- [ ] Tests pass locally
- [ ] Added new tests
- [ ] Updated documentation

## Screenshots (if applicable)
Add screenshots here`}
                    </pre>
                  </div>
                </div>

                <div className="doc-block">
                  <h2>Earning $BDRIVE Tokens</h2>
                  <p>Quality contributions earn $BDRIVE tokens:</p>
                  <ul>
                    <li><strong>Bug fixes:</strong> 100-500 tokens</li>
                    <li><strong>New features:</strong> 500-5000 tokens</li>
                    <li><strong>Major improvements:</strong> 5000-10000 tokens</li>
                    <li><strong>Documentation:</strong> 50-200 tokens</li>
                  </ul>
                  <p>Token amounts are determined by impact and code quality.</p>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
      
      <style jsx>{`
        .docs-page {
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          overflow-x: hidden;
        }

        .docs-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100vh;
        }

        .docs-sidebar {
          background: #000000;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          position: sticky;
          top: 0;
          height: 100vh;
          overflow-y: auto;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          color: #00ff88;
        }

        .sidebar-header h2 {
          font-size: 20px;
          font-weight: 400;
          margin: 0;
        }

        .docs-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .nav-item.active {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border-left: 2px solid #00ff88;
        }

        .nav-item .chevron {
          margin-left: auto;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .nav-item.active .chevron,
        .nav-item:hover .chevron {
          opacity: 1;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .quick-links h3 {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 0 12px 0;
        }

        .quick-links a {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
        }

        .quick-links a:hover {
          color: #00ff88;
        }

        .docs-content {
          padding: 40px 60px;
          max-width: 900px;
        }

        .doc-section h1 {
          font-size: 36px;
          font-weight: 200;
          margin: 0 0 20px 0;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .section-intro {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .doc-block {
          margin-bottom: 40px;
        }

        .doc-block h2 {
          font-size: 24px;
          font-weight: 300;
          margin: 0 0 20px 0;
          color: #ffffff;
        }

        .doc-block h3 {
          font-size: 18px;
          font-weight: 400;
          margin: 20px 0 12px 0;
          color: #00ff88;
        }

        .doc-block p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.7;
          margin-bottom: 16px;
        }

        .doc-block ul,
        .doc-block ol {
          margin: 0 0 20px 20px;
          padding: 0;
        }

        .doc-block li {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.8;
          margin-bottom: 8px;
        }

        .code-block {
          background: #000000;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          overflow: hidden;
          margin: 20px 0;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .code-header span {
          font-size: 12px;
          color: #00ff88;
          font-weight: 600;
        }

        .copy-btn {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
        }

        .copy-btn:hover {
          color: #00ff88;
        }

        .code-block pre {
          margin: 0;
          padding: 16px;
          font-family: 'SF Mono', monospace;
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          overflow-x: auto;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .tech-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
        }

        .tech-item h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 12px 0;
          color: #00ff88;
        }

        .tech-item ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .tech-item li {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          padding: 4px 0;
        }

        .flow-diagram {
          display: flex;
          align-items: center;
          gap: 20px;
          margin: 30px 0;
          padding: 30px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .flow-step {
          flex: 1;
          text-align: center;
        }

        .step-number {
          width: 36px;
          height: 36px;
          background: #00ff88;
          color: #000;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .flow-step h4 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .flow-step p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .flow-arrow {
          color: #00ff88;
          font-size: 20px;
        }

        .api-endpoint {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .endpoint-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .method {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #000;
        }

        .method.get {
          background: #00ff88;
        }

        .method.post {
          background: #00aaff;
        }

        .method.delete {
          background: #ff4444;
        }

        .path {
          font-family: 'SF Mono', monospace;
          font-size: 14px;
          color: #ffffff;
        }

        .api-endpoint p {
          margin: 0 0 12px 0;
        }

        .comparison-table {
          overflow-x: auto;
        }

        .comparison-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .comparison-table th,
        .comparison-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .comparison-table th {
          background: rgba(0, 255, 136, 0.1);
          font-size: 14px;
          font-weight: 600;
          color: #00ff88;
        }

        .comparison-table td {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .comparison-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        @media (max-width: 768px) {
          .docs-container {
            grid-template-columns: 1fr;
          }

          .docs-sidebar {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }

          .docs-content {
            padding: 30px 20px;
          }

          .tech-grid {
            grid-template-columns: 1fr;
          }

          .flow-diagram {
            flex-direction: column;
          }

          .flow-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  )
}
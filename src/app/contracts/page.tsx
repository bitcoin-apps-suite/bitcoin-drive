'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import Link from 'next/link'
import { ExternalLink, DollarSign, Code, Zap } from 'lucide-react'

export default function ContractsPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession()
  interface GitHubIssue {
    id: number
    number: number
    title: string
    body?: string
    html_url: string
    labels?: Array<{ id: number; name: string; color: string }>
  }

  const [contracts, setContracts] = useState<GitHubIssue[]>([])

  useEffect(() => {
    fetch('https://api.github.com/repos/bitcoin-apps-suite/bitcoin-drive/issues')
      .then(res => res.json())
      .then(data => setContracts(data))
      .catch(err => console.error(err))
  }, [])

  const getPriorityColor = (labels?: Array<{ id: number; name: string; color: string }>) => {
    if (labels?.some(l => l.name === 'priority: high')) return '#ff4444'
    if (labels?.some(l => l.name === 'priority: medium')) return '#ffaa00'
    return '#00ff88'
  }

  const getEstimatedReward = (title: string) => {
    if (title.toLowerCase().includes('smart contract') || title.toLowerCase().includes('blockchain')) return '5000-10000'
    if (title.toLowerCase().includes('integration') || title.toLowerCase().includes('api')) return '2000-5000'
    if (title.toLowerCase().includes('ui') || title.toLowerCase().includes('frontend')) return '1000-3000'
    return '500-2000'
  }

  return (
    <div style={{ 
      background: '#000000', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Taskbar />
      
      <div className="contracts-page">
        <div className="contracts-container">
          <section className="contracts-hero">
            <h1>Open Development Contracts</h1>
            <p className="contracts-tagline">
              Build Bitcoin Drive and earn $BDRIVE tokens for your contributions
            </p>
            <div className="stats-bar">
              <div className="stat">
                <span className="stat-value">{contracts.length || 20}</span>
                <span className="stat-label">Open Contracts</span>
              </div>
              <div className="stat">
                <span className="stat-value">$50,000+</span>
                <span className="stat-label">Total Rewards Pool</span>
              </div>
              <div className="stat">
                <span className="stat-value">1-10K</span>
                <span className="stat-label">$BDRIVE per Contract</span>
              </div>
            </div>
          </section>

          <section className="contracts-info">
            <h2>How It Works</h2>
            <div className="info-grid">
              <div className="info-card">
                <Code size={24} />
                <h3>Pick a Contract</h3>
                <p>Choose from our list of open development tasks based on your skills and interests</p>
              </div>
              <div className="info-card">
                <Zap size={24} />
                <h3>Build & Submit</h3>
                <p>Fork the repo, implement the feature, and submit a high-quality pull request</p>
              </div>
              <div className="info-card">
                <DollarSign size={24} />
                <h3>Complete KYC & Earn</h3>
                <p>Submit KYC details to be registered on cap table and receive vested tokens</p>
              </div>
            </div>
          </section>

          <section className="legal-notice">
            <h2>⚠️ Important Legal Requirements</h2>
            <div className="legal-content">
              <div className="requirement-card">
                <h3>KYC Required for Token Distribution</h3>
                <p>
                  To receive $BDRIVE tokens for successful pull requests, contributors must:
                </p>
                <ul>
                  <li>Complete full KYC (Know Your Customer) verification</li>
                  <li>Be registered on The Bitcoin Corporation LTD cap table</li>
                  <li>Provide valid government-issued identification</li>
                  <li>Pass regulatory compliance checks</li>
                </ul>
              </div>
              
              <div className="requirement-card">
                <h3>Token Vesting & Multisig Lock</h3>
                <p>
                  All tokens distributed for work completed are subject to:
                </p>
                <ul>
                  <li>Mandatory lock-up period in multisig wallet</li>
                  <li>Joint control between contributor and The Bitcoin Corporation LTD</li>
                  <li>Vesting schedule to ensure long-term alignment</li>
                  <li>Release conditions as determined by the company</li>
                </ul>
              </div>

              <div className="requirement-card warning">
                <h3>Regulatory Compliance</h3>
                <p>
                  <strong>No tokens will be distributed without:</strong>
                </p>
                <ul>
                  <li>Completed KYC verification</li>
                  <li>Cap table registration</li>
                  <li>Signed contributor agreement</li>
                  <li>Multisig wallet setup</li>
                </ul>
                <p className="disclaimer">
                  The Bitcoin Corporation LTD reserves the right to refuse token distribution
                  to any contributor who does not meet regulatory requirements. Tokens are
                  not transferable until vesting conditions are met.
                </p>
              </div>
            </div>
          </section>

          <section className="contracts-list">
            <div className="list-header">
              <h2>Available Contracts</h2>
              <div className="filters">
                <button className="filter-btn active">All</button>
                <button className="filter-btn">High Priority</button>
                <button className="filter-btn">Frontend</button>
                <button className="filter-btn">Backend</button>
                <button className="filter-btn">Blockchain</button>
              </div>
            </div>

            <div className="contracts-grid">
              {contracts.length > 0 ? contracts.map((issue) => (
                <div key={issue.id} className="contract-card">
                  <div className="contract-header">
                    <h3>{issue.title}</h3>
                    <div className="contract-meta">
                      <span className="issue-number">#{issue.number}</span>
                      <span 
                        className="priority"
                        style={{ color: getPriorityColor(issue.labels) }}
                      >
                        ●
                      </span>
                    </div>
                  </div>
                  
                  <p className="contract-description">
                    {issue.body?.split('\n')[0]?.substring(0, 150)}...
                  </p>

                  <div className="contract-tags">
                    {issue.labels?.map((label) => (
                      <span key={label.id} className="tag" style={{ 
                        backgroundColor: `#${label.color}20`,
                        borderColor: `#${label.color}40`
                      }}>
                        {label.name}
                      </span>
                    ))}
                  </div>

                  <div className="contract-footer">
                    <div className="reward">
                      <DollarSign size={14} />
                      <span>{getEstimatedReward(issue.title)} $BDRIVE</span>
                    </div>
                    <div className="actions">
                      <a 
                        href={issue.html_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-btn"
                      >
                        View Details <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </div>
              )) : (
                <>
                  <div className="contract-card">
                    <div className="contract-header">
                      <h3>Implement BSV Blockchain Storage</h3>
                      <div className="contract-meta">
                        <span className="issue-number">#1</span>
                        <span className="priority" style={{ color: '#ff4444' }}>●</span>
                      </div>
                    </div>
                    <p className="contract-description">
                      Implement complete on-chain file storage using OP_PUSHDATA4 for files up to 4GB...
                    </p>
                    <div className="contract-tags">
                      <span className="tag">blockchain</span>
                      <span className="tag">high-priority</span>
                    </div>
                    <div className="contract-footer">
                      <div className="reward">
                        <DollarSign size={14} />
                        <span>5000-10000 $BDRIVE</span>
                      </div>
                      <a href="https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/1" className="view-btn">
                        View Details <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <div className="contract-card">
                    <div className="contract-header">
                      <h3>HandCash Integration</h3>
                      <div className="contract-meta">
                        <span className="issue-number">#2</span>
                        <span className="priority" style={{ color: '#ff4444' }}>●</span>
                      </div>
                    </div>
                    <p className="contract-description">
                      Complete HandCash SDK integration for authentication and payment processing...
                    </p>
                    <div className="contract-tags">
                      <span className="tag">integration</span>
                      <span className="tag">payments</span>
                    </div>
                    <div className="contract-footer">
                      <div className="reward">
                        <DollarSign size={14} />
                        <span>3000-5000 $BDRIVE</span>
                      </div>
                      <a href="https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/2" className="view-btn">
                        View Details <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>

                  <div className="contract-card">
                    <div className="contract-header">
                      <h3>NFT Container Format</h3>
                      <div className="contract-meta">
                        <span className="issue-number">#3</span>
                        <span className="priority" style={{ color: '#ff4444' }}>●</span>
                      </div>
                    </div>
                    <p className="contract-description">
                      Design and implement proprietary .nft container format for file tokenization...
                    </p>
                    <div className="contract-tags">
                      <span className="tag">nft</span>
                      <span className="tag">blockchain</span>
                    </div>
                    <div className="contract-footer">
                      <div className="reward">
                        <DollarSign size={14} />
                        <span>8000-10000 $BDRIVE</span>
                      </div>
                      <a href="https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/3" className="view-btn">
                        View Details <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>

          <section className="cta-section">
            <h2>Ready to Contribute?</h2>
            <p>Join our developer community and start earning $BDRIVE tokens today</p>
            <div className="cta-buttons">
              <a 
                href="https://github.com/bitcoin-apps-suite/bitcoin-drive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-btn primary"
              >
                View Repository
              </a>
              <Link href="/docs" className="cta-btn secondary">
                Read Documentation
              </Link>
            </div>
          </section>
        </div>
      </div>
      
      <style jsx>{`
        .contracts-page {
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-top: 24px;
          overflow-x: hidden;
        }

        .contracts-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .contracts-hero {
          text-align: center;
          padding: 60px 20px;
          background: #000000;
          margin: -24px -40px 40px -40px;
        }

        .contracts-hero h1 {
          font-size: 42px;
          font-weight: 200;
          margin: 0 0 16px 0;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contracts-tagline {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 40px 0;
        }

        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 60px;
          margin-top: 40px;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 32px;
          font-weight: 200;
          color: #00ff88;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .contracts-info {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .contracts-info h2 {
          text-align: center;
          font-size: 28px;
          font-weight: 200;
          margin: 0 0 40px 0;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        .info-card {
          text-align: center;
          padding: 30px;
        }

        .info-card svg {
          color: #00ff88;
          margin-bottom: 20px;
        }

        .info-card h3 {
          font-size: 20px;
          font-weight: 300;
          margin: 0 0 12px 0;
        }

        .info-card p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
        }

        .legal-notice {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 0, 0, 0.2);
          border-bottom: 1px solid rgba(255, 0, 0, 0.2);
          background: rgba(255, 0, 0, 0.02);
          margin: 40px 0;
        }

        .legal-notice h2 {
          text-align: center;
          font-size: 28px;
          font-weight: 300;
          margin: 0 0 40px 0;
          color: #ffaa00;
        }

        .legal-content {
          display: grid;
          gap: 30px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .requirement-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 30px;
        }

        .requirement-card.warning {
          background: rgba(255, 170, 0, 0.05);
          border-color: rgba(255, 170, 0, 0.3);
        }

        .requirement-card h3 {
          font-size: 20px;
          font-weight: 400;
          margin: 0 0 16px 0;
          color: #00ff88;
        }

        .requirement-card.warning h3 {
          color: #ffaa00;
        }

        .requirement-card p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .requirement-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .requirement-card li {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 0 8px 24px;
          position: relative;
        }

        .requirement-card li:before {
          content: '•';
          position: absolute;
          left: 8px;
          color: #00ff88;
        }

        .requirement-card.warning li:before {
          color: #ffaa00;
        }

        .disclaimer {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        .contracts-list {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .list-header h2 {
          font-size: 28px;
          font-weight: 200;
          margin: 0;
        }

        .filters {
          display: flex;
          gap: 12px;
        }

        .filter-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.6);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          border-color: #00ff88;
          color: #00ff88;
        }

        .filter-btn.active {
          background: #00ff88;
          color: #000;
          border-color: #00ff88;
        }

        .contracts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .contract-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 24px;
          transition: all 0.2s;
        }

        .contract-card:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .contract-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 16px;
        }

        .contract-header h3 {
          font-size: 18px;
          font-weight: 400;
          margin: 0;
          flex: 1;
          margin-right: 12px;
        }

        .contract-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .issue-number {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .priority {
          font-size: 12px;
        }

        .contract-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 16px 0;
        }

        .contract-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }

        .tag {
          font-size: 12px;
          padding: 4px 10px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.8);
        }

        .contract-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .reward {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #00ff88;
          font-size: 14px;
          font-weight: 500;
        }

        .view-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #00ff88;
          text-decoration: none;
          font-size: 14px;
          transition: opacity 0.2s;
        }

        .view-btn:hover {
          opacity: 0.8;
        }

        .cta-section {
          text-align: center;
          padding: 60px 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cta-section h2 {
          font-size: 32px;
          font-weight: 200;
          margin: 0 0 12px 0;
        }

        .cta-section p {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 30px 0;
        }

        .cta-buttons {
          display: inline-flex;
          gap: 16px;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          padding: 12px 24px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.2s;
        }

        .cta-btn.primary {
          background: linear-gradient(90deg, #00ff88, #00cc66);
          color: #000;
        }

        .cta-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 255, 136, 0.3);
        }

        .cta-btn.secondary {
          background: transparent;
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.5);
        }

        .cta-btn.secondary:hover {
          background: rgba(0, 255, 136, 0.1);
        }

        @media (max-width: 768px) {
          .contracts-hero h1 {
            font-size: 32px;
          }

          .stats-bar {
            flex-direction: column;
            gap: 20px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .list-header {
            flex-direction: column;
            gap: 20px;
          }

          .filters {
            width: 100%;
            overflow-x: auto;
          }

          .contracts-grid {
            grid-template-columns: 1fr;
          }

          .cta-buttons {
            flex-direction: column;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
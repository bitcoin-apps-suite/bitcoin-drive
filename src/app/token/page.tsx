'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'

export default function TokenPage() {
  const { data: session } = useSession()

  return (
    <div style={{ 
      background: '#000000', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Taskbar />
      
      <div className="token-page">
        <div className="token-container">
          {/* Hero Section */}
          <section className="token-hero">
            <h1><span style={{color: '#ffffff'}}>The</span> Bitcoin Drive <span style={{color: '#ffffff'}}>Token</span></h1>
            <p className="token-tagline">
              Decentralized storage meets sustainable economics
            </p>
            <div className="token-badge">$BDRIVE</div>
          </section>

          {/* Philosophy Section */}
          <section className="philosophy-section">
            <h2>Our Open-Source Philosophy</h2>
            <div className="philosophy-content">
              <p>
                Bitcoin Drive is an <strong>open-source project</strong> licensed under MIT and BSV licenses. 
                Our intention is to foster an open culture where forking, cloning, and adding to the code 
                and features is welcomed and encouraged.
              </p>
              <p>
                The $BDRIVE token represents our approach to creating a sustainable economic model that 
                aims to reward contributors while maintaining transparency and openness in decentralized storage.
              </p>
              <div className="philosophy-points">
                <div className="point">
                  <h3>Open Culture</h3>
                  <p>MIT & BSV Licensed, fork-friendly, collaborative</p>
                </div>
                <div className="point">
                  <h3>Community First</h3>
                  <p>Contributors earn tokens through meaningful work</p>
                </div>
                <div className="point">
                  <h3>Value Aligned</h3>
                  <p>Success shared with those who build it</p>
                </div>
              </div>
            </div>
          </section>

          {/* Token Model Section */}
          <section className="token-model-section">
            <h2>The $BDRIVE Token Model</h2>
            <div className="model-card">
              <h3>How It Works</h3>
              <ul>
                <li>
                  <strong>Token Distribution:</strong> Tokens are allocated at our discretion to developers 
                  who contribute meaningful code that gets merged into production
                </li>
                <li>
                  <strong>Revenue Sharing:</strong> The Bitcoin Corporation LTD intends to distribute 
                  dividends to token holders from storage subscription revenues and platform fees
                </li>
                <li>
                  <strong>Contribution = Ownership:</strong> Build value, receive tokens, share in success
                </li>
                <li>
                  <strong>Transparent Allocation:</strong> All token grants are recorded on-chain via BSV
                </li>
              </ul>
            </div>

            <div className="model-card warning">
              <h3>Important Notices</h3>
              <ul>
                <li>
                  <strong>No Guarantees:</strong> Token allocation is entirely discretionary with no promises 
                  of distribution for any particular contribution
                </li>
                <li>
                  <strong>Not Employment:</strong> Contributing and receiving tokens does not constitute 
                  an employment relationship or contract
                </li>
                <li>
                  <strong>Not a Public Offering:</strong> This is not a solicitation for investment or 
                  capital raising. $BDRIVE tokens are rewards for contribution, not investment instruments
                </li>
                <li>
                  <strong>Future Equity:</strong> The Bitcoin Corporation LTD may incorporate and offer 
                  regulated equity shares separately from the token system
                </li>
              </ul>
            </div>

            <div className="model-card warning">
              <h3>⚠️ KYC & Vesting Requirements</h3>
              <ul>
                <li>
                  <strong>Mandatory KYC:</strong> All contributors must complete full KYC verification 
                  to receive tokens. No exceptions will be made for regulatory compliance
                </li>
                <li>
                  <strong>Cap Table Registration:</strong> Contributors must be registered on The Bitcoin 
                  Corporation LTD cap table before any token distribution
                </li>
                <li>
                  <strong>Multisig Lock-up:</strong> All tokens distributed for work are locked in a 
                  multisig wallet jointly controlled by the contributor and The Bitcoin Corporation LTD
                </li>
                <li>
                  <strong>Vesting Schedule:</strong> Tokens are subject to vesting conditions and cannot 
                  be freely transferred until vesting requirements are met
                </li>
                <li>
                  <strong>Regulatory Compliance:</strong> The company reserves the right to refuse token 
                  distribution to any contributor who does not meet regulatory requirements
                </li>
              </ul>
            </div>
          </section>

          {/* Business Model Section */}
          <section className="business-section">
            <h2>The Bitcoin Corporation LTD</h2>
            <div className="business-content">
              <p className="intro">
                Our vision is to create sustainable open-source software through a hybrid model that 
                preserves freedom while generating value through decentralized storage solutions.
              </p>

              <div className="business-model">
                <h3>Revenue Model</h3>
                <div className="revenue-streams">
                  <div className="stream">
                    <h4>Free Tier</h4>
                    <p>Self-hosted, open-source</p>
                    <p className="price">$0/month</p>
                  </div>
                  <div className="stream featured">
                    <h4>Pro Tier</h4>
                    <p>Multi-cloud storage, premium features</p>
                    <p className="price">$29/month</p>
                  </div>
                  <div className="stream">
                    <h4>Enterprise</h4>
                    <p>Custom deployment, SLA, support</p>
                    <p className="price">$299/month</p>
                  </div>
                </div>
                
                <h3 style={{marginTop: '40px'}}>Platform Revenue</h3>
                <div className="revenue-streams">
                  <div className="stream">
                    <h4>NFT Container Sales</h4>
                    <p>Users tokenize & sell their files</p>
                    <p className="price">2.5% fee</p>
                  </div>
                  <div className="stream featured">
                    <h4>Share Trading</h4>
                    <p>Secondary market for file shares</p>
                    <p className="price">1.5% fee</p>
                  </div>
                  <div className="stream">
                    <h4>Storage Marketplace</h4>
                    <p>Premium storage & bandwidth</p>
                    <p className="price">3% fee</p>
                  </div>
                </div>
              </div>

              <div className="value-flow">
                <h3>Value Flow</h3>
                <div className="flow-diagram">
                  <div className="flow-item">
                    <span>Subscriptions + Platform fees</span>
                    <span className="arrow">→</span>
                  </div>
                  <div className="flow-item">
                    <span>Revenue to Bitcoin Corporation Ltd</span>
                    <span className="arrow">→</span>
                  </div>
                  <div className="flow-item">
                    <span>Dividends to $BDRIVE holders</span>
                    <span className="arrow">→</span>
                  </div>
                  <div className="flow-item">
                    <span>Contributors rewarded for building</span>
                  </div>
                </div>
                <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)'}}>
                  Bitcoin Drive enables users to tokenize files, create NFT containers, and trade storage shares,
                  generating platform fees that contribute to the ecosystem&apos;s sustainability.
                </p>
              </div>
            </div>
          </section>

          {/* How to Contribute Section */}
          <section className="contribute-section">
            <h2>How to Earn $BDRIVE Tokens</h2>
            <div className="contribute-steps">
              <div className="step">
                <div className="step-number">1</div>
                <h3>Fork & Build</h3>
                <p>Fork the repository and implement features, fixes, or improvements</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h3>Submit PR</h3>
                <p>Create a pull request with clear description and documentation</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h3>Get Merged</h3>
                <p>Quality code that adds value gets merged into production</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h3>Complete KYC</h3>
                <p>Submit KYC documents and get registered on cap table</p>
              </div>
              <div className="step">
                <div className="step-number">5</div>
                <h3>Receive Vested Tokens</h3>
                <p>Tokens locked in multisig with vesting schedule</p>
              </div>
            </div>

            <div className="contribution-examples">
              <h3>What We Value</h3>
              <ul>
                <li>✅ Storage provider integrations</li>
                <li>✅ Performance improvements</li>
                <li>✅ Security enhancements</li>
                <li>✅ Documentation and tests</li>
                <li>✅ UI/UX improvements</li>
                <li>✅ Blockchain integrations</li>
              </ul>
            </div>
          </section>

          {/* Token Stats Section */}
          <section className="stats-section">
            <h2>Token Statistics</h2>
            <div className="stats-grid">
              <div className="stat">
                <h3>Total Supply</h3>
                <p className="stat-value">1,000,000,000</p>
                <p className="stat-label">$BDRIVE tokens</p>
              </div>
              <div className="stat">
                <h3>Distributed</h3>
                <p className="stat-value">0</p>
                <p className="stat-label">Tokens allocated</p>
              </div>
              <div className="stat">
                <h3>Contributors</h3>
                <p className="stat-value">1</p>
                <p className="stat-label">Active developers</p>
              </div>
              <div className="stat">
                <h3>Network</h3>
                <p className="stat-value">BSV</p>
                <p className="stat-label">Blockchain</p>
              </div>
            </div>
          </section>

          {/* Legal Section */}
          <section className="legal-section">
            <h2>Legal & Regulatory Notice</h2>
            <div className="legal-content">
              <p>
                <strong>Revenue Sharing Model:</strong> The $BDRIVE token is designed to enable revenue 
                sharing with contributors through dividend distributions. Token holders may receive dividends 
                based on platform revenues from storage subscriptions and platform fees.
              </p>
              <p>
                <strong>KYC & Cap Table Requirements:</strong> All token recipients must complete KYC 
                verification and be registered on The Bitcoin Corporation LTD cap table. Tokens are 
                distributed only to verified contributors who meet regulatory compliance requirements.
              </p>
              <p>
                <strong>Multisig & Vesting:</strong> Tokens distributed for work performed are locked in 
                multisig wallets with joint control between the contributor and The Bitcoin Corporation LTD. 
                Tokens are subject to vesting schedules and cannot be freely transferred until conditions are met.
              </p>
              <p>
                <strong>Trading & Liquidity:</strong> Vested $BDRIVE tokens may become tradable on the 
                Bitcoin Drive platform and associated exchanges after vesting conditions are satisfied. 
                The company does not guarantee liquidity or price discovery mechanisms.
              </p>
              <p>
                <strong>$BSHARE Fundraising:</strong> The Bitcoin Corporation LTD intends to issue $BSHARE 
                tokens as a fundraising mechanism. These tokens will represent participation in the platform&apos;s 
                success and may be offered through appropriate channels.
              </p>
              <p>
                By participating in the token ecosystem, you acknowledge that token allocation is discretionary, 
                regulatory frameworks may evolve, and you should conduct your own due diligence regarding 
                tax and legal implications in your jurisdiction.
              </p>
              <p style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.8 }}>
                <strong>Offered by:</strong> The Bitcoin Corporation LTD (Company No. 16735102)<br />
                Registered in England and Wales<br />
                All tokens and offers are subject to the terms and conditions of The Bitcoin Corporation LTD.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <h2>Ready to Build the Future?</h2>
            <div className="cta-buttons">
              <a 
                href="https://github.com/bitcoin-apps-suite/bitcoin-drive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="cta-btn primary"
              >
                <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                View on GitHub
              </a>
              <a 
                href="/trading" 
                className="cta-btn secondary"
              >
                Visit Trading Platform
              </a>
            </div>
          </section>
        </div>
      </div>
      
      <style jsx>{`
        /* Token Page - Compact Refined Style */
        .token-page {
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-top: 24px;
          font-weight: 300;
        }

        .token-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        /* Token Hero - Full Width Black */
        .token-hero {
          min-height: 40vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px 40px;
          text-align: center;
          margin-bottom: 40px;
          background: #000000;
          /* Full viewport width - properly centered */
          margin-left: calc(-50vw + 50%);
          margin-right: calc(-50vw + 50%);
          margin-top: -24px;
          width: 100vw;
          position: relative;
          left: 0;
          right: 0;
        }

        .token-badge {
          display: inline-block;
          padding: 8px 20px;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-top: 20px;
          color: #000;
        }

        .token-hero h1 {
          font-size: 42px;
          font-weight: 200;
          margin: 0 0 16px 0;
          line-height: 1.1;
          letter-spacing: -1px;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .token-tagline {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.4;
          font-weight: 300;
        }

        /* Sections - Compact */
        section {
          padding: 40px 0;
          position: relative;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        section:first-of-type {
          border-top: none;
        }

        section h2 {
          font-size: 28px;
          font-weight: 200;
          margin-bottom: 30px;
          text-align: center;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        /* Philosophy Section - Compact */
        .philosophy-section {
          background: #0a0a0a;
        }

        .philosophy-content {
          max-width: 900px;
          margin: 0 auto;
        }

        .philosophy-content p {
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 18px;
          font-weight: 300;
        }

        .philosophy-content strong {
          font-weight: 500;
          color: #00ff88;
        }

        .philosophy-points {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 30px;
        }

        .point {
          padding: 20px;
          text-align: left;
          border-left: 2px solid #00ff88;
          padding-left: 20px;
        }

        .point h3 {
          font-size: 16px;
          font-weight: 400;
          margin: 0 0 8px 0;
          color: #00ff88;
          letter-spacing: 0;
        }

        .point p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
          line-height: 1.5;
          font-weight: 300;
        }

        /* Token Model Section - Compact Lists */
        .token-model-section {
          background: #0a0a0a;
        }

        .model-card {
          background: transparent;
          border-left: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 0;
          padding: 0 0 0 24px;
          margin-bottom: 30px;
        }

        .model-card.warning {
          border-left-color: rgba(255, 0, 0, 0.3);
        }

        .model-card h3 {
          font-size: 20px;
          font-weight: 300;
          margin: 0 0 20px 0;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .model-card ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .model-card li {
          padding: 12px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          font-size: 16px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 300;
        }

        .model-card li:last-child {
          border-bottom: none;
        }

        .model-card li strong {
          color: #00ff88;
          font-weight: 500;
          margin-right: 8px;
        }

        /* Business Section - Compact Grid */
        .business-section {
          background: #0a0a0a;
        }

        .business-content .intro {
          font-size: 18px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          max-width: 800px;
          margin: 0 auto 40px;
          font-weight: 300;
        }

        .business-model {
          margin-bottom: 40px;
        }

        .business-model h3 {
          font-size: 22px;
          font-weight: 300;
          margin-bottom: 24px;
          text-align: center;
          color: #00ff88;
          letter-spacing: -0.5px;
        }

        .revenue-streams {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }

        .stream {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          padding: 20px;
          text-align: center;
          transition: all 0.2s ease;
          position: relative;
        }

        .stream:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.01);
        }

        .stream.featured {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.01);
        }

        .stream.featured::before {
          content: 'POPULAR';
          position: absolute;
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #00ff88;
          color: #000;
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .stream h4 {
          font-size: 18px;
          font-weight: 400;
          margin: 0 0 10px 0;
          color: #00ff88;
        }

        .stream p {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 12px 0;
          line-height: 1.5;
          font-weight: 300;
        }

        .stream .price {
          font-size: 24px;
          font-weight: 200;
          color: #ffffff;
          margin: 0;
        }

        .value-flow {
          background: transparent;
          border: 1px solid rgba(0, 255, 136, 0.2);
          border-radius: 4px;
          padding: 24px;
        }

        .value-flow h3 {
          font-size: 18px;
          font-weight: 300;
          margin: 0 0 20px 0;
          text-align: center;
          color: #00ff88;
        }

        .flow-diagram {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .flow-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          font-weight: 300;
        }

        .flow-item .arrow {
          color: #00ff88;
          font-size: 14px;
        }

        /* Contribute Section - Compact Steps */
        .contribute-section {
          background: #0a0a0a;
        }

        .contribute-steps {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 20px;
          max-width: 100%;
          margin: 0 auto 40px;
        }

        .step {
          text-align: left;
          padding: 16px;
          border-left: 2px solid rgba(0, 255, 136, 0.3);
          padding-left: 16px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: transparent;
          border: 1px solid #00ff88;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 300;
          color: #00ff88;
          margin-bottom: 12px;
        }

        .step h3 {
          font-size: 15px;
          font-weight: 400;
          margin: 0 0 8px 0;
          color: #ffffff;
        }

        .step p {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
          line-height: 1.5;
          font-weight: 300;
        }

        .contribution-examples {
          background: transparent;
          border-left: 2px solid rgba(0, 255, 136, 0.3);
          padding-left: 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .contribution-examples h3 {
          font-size: 18px;
          font-weight: 300;
          margin: 0 0 16px 0;
          color: #00ff88;
        }

        .contribution-examples ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .contribution-examples li {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.8);
          padding-left: 20px;
          position: relative;
          font-weight: 300;
        }

        .contribution-examples li::before {
          content: '✓';
          position: absolute;
          left: 0;
          color: #4CAF50;
          font-size: 14px;
        }

        /* Stats Section - Compact Grid */
        .stats-section {
          background: #0a0a0a;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          max-width: 100%;
          margin: 0 auto;
        }

        .stat {
          text-align: center;
          padding: 20px 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 4px;
        }

        .stat:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.01);
        }

        .stat h3 {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: rgba(255, 255, 255, 0.4);
          margin: 0 0 12px 0;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 200;
          color: #00ff88;
          margin: 0 0 4px 0;
          letter-spacing: -1px;
        }

        .stat-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
          font-weight: 300;
        }

        /* Legal Section - Compact */
        .legal-section {
          background: #0a0a0a;
        }

        .legal-content {
          background: transparent;
          border-left: 2px solid rgba(255, 0, 0, 0.3);
          border-radius: 0;
          padding: 0 0 0 24px;
          max-width: 900px;
          margin: 0 auto;
        }

        .legal-content p {
          font-size: 15px;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 16px;
          font-weight: 300;
        }

        .legal-content p:last-child {
          margin-bottom: 0;
        }

        .legal-content strong {
          color: #ff4444;
          font-weight: 500;
        }

        /* CTA Section - Compact */
        .cta-section {
          text-align: center;
          padding: 60px 20px;
          background: #0a0a0a;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .cta-section h2 {
          font-size: 32px;
          font-weight: 200;
          margin: 0 0 24px 0;
          color: #ffffff;
          letter-spacing: -1px;
        }

        .cta-buttons {
          display: inline-flex;
          gap: 16px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 400;
          text-decoration: none;
          transition: all 0.2s ease;
          letter-spacing: 0.5px;
        }

        .cta-btn.primary {
          background: linear-gradient(90deg, #00ff88, #00cc66);
          color: #000;
          border: none;
        }

        .cta-btn.primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 255, 136, 0.2);
        }

        .cta-btn.secondary {
          background: transparent;
          color: #00ff88;
          border: 1px solid rgba(0, 255, 136, 0.5);
        }

        .cta-btn.secondary:hover {
          background: rgba(0, 255, 136, 0.05);
          border-color: #00ff88;
        }

        .cta-btn svg {
          width: 16px;
          height: 16px;
        }

        /* Typography Refinements */
        h1, h2, h3, h4, h5, h6 {
          font-weight: 300;
          letter-spacing: -0.5px;
        }

        p {
          font-weight: 300;
        }

        /* Responsive - Mobile Compact */
        @media (max-width: 768px) {
          .token-hero h1 {
            font-size: 32px;
          }
          
          .token-tagline {
            font-size: 14px;
          }
          
          section h2 {
            font-size: 24px;
          }
          
          .philosophy-points,
          .revenue-streams,
          .contribute-steps,
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .contribution-examples ul {
            grid-template-columns: 1fr;
          }
          
          .flow-diagram {
            flex-direction: column;
            gap: 8px;
          }
          
          .flow-item {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
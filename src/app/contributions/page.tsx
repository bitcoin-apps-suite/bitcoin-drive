'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import Link from 'next/link'
import { GitBranch, GitCommit, GitMerge, GitPullRequest, Star, TrendingUp, Award, ExternalLink, Calendar } from 'lucide-react'

interface Contribution {
  id: number
  type: string
  title: string
  description: string
  date: string
  status: string
  points: number
  tokens: number
  pr?: string
  issue?: string
  url?: string
}

interface UserStats {
  totalContributions: number
  pullRequests: number
  issues: number
  reviews: number
  totalPoints: number
  totalTokens: number
  currentStreak: number
  longestStreak: number
}

interface GitHubPR {
  id: number
  number: number
  title: string
  body?: string
  created_at: string
  merged_at?: string
  state: string
  html_url: string
}

interface GitHubIssue {
  id: number
  number: number
  title: string
  body?: string
  created_at: string
  state: string
  html_url: string
  pull_request?: unknown
}

export default function ContributionsPage() {
  const { data: session } = useSession()
  const [timeFilter, setTimeFilter] = useState('all')
  const [userContributions, setUserContributions] = useState<Contribution[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch user's contributions if they're signed in
    if (session?.user?.name) {
      const username = session.user.name
      
      // Fetch user's events/activity
      Promise.all([
        fetch(`https://api.github.com/users/${username}/events/public`).then(r => r.json()),
        fetch(`https://api.github.com/repos/bitcoin-apps-suite/bitcoin-drive/pulls?state=all&creator=${username}`).then(r => r.json()),
        fetch(`https://api.github.com/repos/bitcoin-apps-suite/bitcoin-drive/issues?state=all&creator=${username}`).then(r => r.json())
      ])
        .then(([ , pulls, issues]) => {
          // Process and combine the data
          const contributions: Contribution[] = []
          
          // Add pull requests
          if (Array.isArray(pulls)) {
            (pulls as GitHubPR[]).forEach((pr) => {
              contributions.push({
                id: pr.id,
                type: 'pull_request',
                title: pr.title,
                description: pr.body?.substring(0, 200) || '',
                date: new Date(pr.created_at).toLocaleDateString(),
                status: pr.merged_at ? 'merged' : pr.state,
                points: pr.merged_at ? 500 : 0,
                tokens: pr.merged_at ? 1000 : 0,
                pr: `#${pr.number}`,
                url: pr.html_url
              })
            })
          }

          // Add issues
          if (Array.isArray(issues)) {
            (issues as GitHubIssue[]).forEach((issue) => {
              if (!issue.pull_request) { // Skip if it's a PR
                contributions.push({
                  id: issue.id,
                  type: 'issue',
                  title: issue.title,
                  description: issue.body?.substring(0, 200) || '',
                  date: new Date(issue.created_at).toLocaleDateString(),
                  status: issue.state,
                  points: 100,
                  tokens: 0,
                  issue: `#${issue.number}`,
                  url: issue.html_url
                })
              }
            })
          }

          setUserContributions(contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
          
          // Calculate stats
          const stats = {
            totalContributions: contributions.length,
            pullRequests: pulls?.length || 0,
            issues: Array.isArray(issues) ? issues.filter((i: GitHubIssue) => !i.pull_request).length : 0,
            reviews: 0, // Would need different API endpoint
            totalPoints: contributions.reduce((sum, c) => sum + c.points, 0),
            totalTokens: contributions.reduce((sum, c) => sum + c.tokens, 0),
            currentStreak: 0, // Would need to calculate from events
            longestStreak: 0
          }
          setUserStats(stats)
          setLoading(false)
        })
        .catch(err => {
          console.error('Failed to fetch contributions:', err)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [session])

  const contributions = [
    {
      id: 1,
      type: 'pull_request',
      title: 'Implement file chunking for large uploads',
      description: 'Added support for uploading files larger than 100MB using chunking',
      date: '2024-01-15',
      status: 'merged',
      points: 750,
      tokens: 5000,
      pr: '#145'
    },
    {
      id: 2,
      type: 'issue',
      title: 'Bug: Upload progress bar stuck at 99%',
      description: 'Identified and documented upload progress calculation issue',
      date: '2024-01-12',
      status: 'closed',
      points: 100,
      tokens: 0,
      issue: '#142'
    },
    {
      id: 3,
      type: 'pull_request',
      title: 'Add dark mode support',
      description: 'Implemented system-wide dark mode with theme persistence',
      date: '2024-01-10',
      status: 'merged',
      points: 500,
      tokens: 3000,
      pr: '#138'
    },
    {
      id: 4,
      type: 'review',
      title: 'Code review: Stripe integration',
      description: 'Reviewed payment integration and suggested security improvements',
      date: '2024-01-08',
      status: 'approved',
      points: 200,
      tokens: 0,
      pr: '#135'
    },
    {
      id: 5,
      type: 'pull_request',
      title: 'Optimize thumbnail generation',
      description: 'Reduced thumbnail generation time by 60% using WebWorkers',
      date: '2024-01-05',
      status: 'merged',
      points: 600,
      tokens: 4000,
      pr: '#130'
    }
  ]

  const defaultStats = {
    totalContributions: 0,
    pullRequests: 0,
    issues: 0,
    reviews: 0,
    totalPoints: 0,
    totalTokens: 0,
    currentStreak: 0,
    longestStreak: 0
  }
  
  const stats = userStats || defaultStats

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'pull_request': return <GitPullRequest size={18} />
      case 'issue': return <GitBranch size={18} />
      case 'review': return <GitCommit size={18} />
      default: return <GitMerge size={18} />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'merged': return '#00ff88'
      case 'approved': return '#00ff88'
      case 'closed': return '#00aaff'
      case 'open': return '#ffaa00'
      default: return 'rgba(255,255,255,0.5)'
    }
  }

  return (
    <div style={{ 
      background: '#000000', 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Taskbar />
      
      <div className="contributions-page">
        <div className="contributions-container">
          <section className="contributions-hero">
            <h1>My Contributions</h1>
            <p className="contributions-tagline">
              Track your impact on the Bitcoin Drive ecosystem
            </p>
          </section>

          <section className="stats-overview">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <GitMerge size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalContributions}</span>
                  <span className="stat-label">Total Contributions</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Star size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalPoints.toLocaleString()}</span>
                  <span className="stat-label">Points Earned</span>
                </div>
              </div>
              
              <div className="stat-card highlight">
                <div className="stat-icon">
                  <Award size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.totalTokens.toLocaleString()}</span>
                  <span className="stat-label">$BDRIVE Tokens</span>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.currentStreak}</span>
                  <span className="stat-label">Day Streak</span>
                </div>
              </div>
            </div>

            <div className="breakdown">
              <h3>Contribution Breakdown</h3>
              <div className="breakdown-items">
                <div className="breakdown-item">
                  <GitPullRequest size={16} />
                  <span className="type">Pull Requests</span>
                  <span className="count">{stats.pullRequests}</span>
                </div>
                <div className="breakdown-item">
                  <GitBranch size={16} />
                  <span className="type">Issues Created</span>
                  <span className="count">{stats.issues}</span>
                </div>
                <div className="breakdown-item">
                  <GitCommit size={16} />
                  <span className="type">Code Reviews</span>
                  <span className="count">{stats.reviews}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="contributions-section">
            <div className="section-header">
              <h2>Contribution History</h2>
              <div className="time-filters">
                <button 
                  className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('all')}
                >
                  All Time
                </button>
                <button 
                  className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('month')}
                >
                  This Month
                </button>
                <button 
                  className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
                  onClick={() => setTimeFilter('week')}
                >
                  This Week
                </button>
              </div>
            </div>

            <div className="contributions-list">
              {!session ? (
                <div style={{ 
                  padding: '60px 20px', 
                  textAlign: 'center', 
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '12px', color: '#00ff88' }}>Sign in to View Your Contributions</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '20px' }}>
                    Connect your GitHub account to track your contributions and earn rewards
                  </p>
                  <Link href="/api/auth/signin" style={{
                    display: 'inline-block',
                    padding: '12px 24px',
                    background: 'linear-gradient(90deg, #00ff88, #00cc66)',
                    color: '#000',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}>
                    Sign In with GitHub
                  </Link>
                </div>
              ) : loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                  Loading your contributions...
                </div>
              ) : userContributions.length > 0 ? (
                userContributions.map(contribution => (
                <div key={contribution.id} className="contribution-card">
                  <div className="contribution-icon">
                    {getTypeIcon(contribution.type)}
                  </div>
                  
                  <div className="contribution-content">
                    <div className="contribution-header">
                      <h3>{contribution.title}</h3>
                      <span 
                        className="status"
                        style={{ color: getStatusColor(contribution.status) }}
                      >
                        {contribution.status}
                      </span>
                    </div>
                    
                    <p className="contribution-description">
                      {contribution.description}
                    </p>
                    
                    <div className="contribution-meta">
                      <div className="meta-left">
                        <Calendar size={14} />
                        <span>{contribution.date}</span>
                        {contribution.pr && (
                          <>
                            <span className="separator">•</span>
                            <a href={`https://github.com/bitcoin-apps-suite/bitcoin-drive/pull/${contribution.pr.slice(1)}`} className="pr-link">
                              {contribution.pr} <ExternalLink size={12} />
                            </a>
                          </>
                        )}
                        {contribution.issue && (
                          <>
                            <span className="separator">•</span>
                            <a href={`https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/${contribution.issue.slice(1)}`} className="pr-link">
                              {contribution.issue} <ExternalLink size={12} />
                            </a>
                          </>
                        )}
                      </div>
                      
                      <div className="rewards">
                        {contribution.points > 0 && (
                          <span className="points">
                            <Star size={14} />
                            {contribution.points} pts
                          </span>
                        )}
                        {contribution.tokens > 0 && (
                          <span className="tokens">
                            <Award size={14} />
                            {contribution.tokens.toLocaleString()} $BDRIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
              ) : (
                contributions.map(contribution => (
                  <div key={contribution.id} className="contribution-card">
                    <div className="contribution-icon">
                      {getTypeIcon(contribution.type)}
                    </div>
                    
                    <div className="contribution-content">
                      <div className="contribution-header">
                        <h3>{contribution.title}</h3>
                        <span 
                          className="status"
                          style={{ color: getStatusColor(contribution.status) }}
                        >
                          {contribution.status}
                        </span>
                      </div>
                      
                      <p className="contribution-description">
                        {contribution.description}
                      </p>
                      
                      <div className="contribution-meta">
                        <div className="meta-left">
                          <Calendar size={14} />
                          <span>{contribution.date}</span>
                          {contribution.pr && (
                            <>
                              <span className="separator">•</span>
                              <a href={`https://github.com/bitcoin-apps-suite/bitcoin-drive/pull/${contribution.pr.slice(1)}`} className="pr-link">
                                {contribution.pr} <ExternalLink size={12} />
                              </a>
                            </>
                          )}
                          {contribution.issue && (
                            <>
                              <span className="separator">•</span>
                              <a href={`https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/${contribution.issue.slice(1)}`} className="pr-link">
                                {contribution.issue} <ExternalLink size={12} />
                              </a>
                            </>
                          )}
                        </div>
                        
                        <div className="rewards">
                          {contribution.points > 0 && (
                            <span className="points">
                              <Star size={14} />
                              {contribution.points} pts
                            </span>
                          )}
                          {contribution.tokens > 0 && (
                            <span className="tokens">
                              <Award size={14} />
                              {contribution.tokens.toLocaleString()} $BDRIVE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="load-more">
              <button className="load-more-btn">Load More Contributions</button>
            </div>
          </section>

          <section className="achievements-section">
            <h2>Achievements</h2>
            <div className="achievements-grid">
              <div className="achievement unlocked">
                <div className="achievement-icon">🚀</div>
                <h4>First Contribution</h4>
                <p>Made your first contribution</p>
              </div>
              <div className="achievement unlocked">
                <div className="achievement-icon">⭐</div>
                <h4>Rising Star</h4>
                <p>Earned 1,000 points</p>
              </div>
              <div className="achievement unlocked">
                <div className="achievement-icon">🔥</div>
                <h4>On Fire</h4>
                <p>7 day contribution streak</p>
              </div>
              <div className="achievement">
                <div className="achievement-icon locked">🏆</div>
                <h4>Top Contributor</h4>
                <p>Reach top 10 leaderboard</p>
              </div>
              <div className="achievement">
                <div className="achievement-icon locked">💎</div>
                <h4>Token Whale</h4>
                <p>Earn 100,000 $BDRIVE</p>
              </div>
              <div className="achievement">
                <div className="achievement-icon locked">🌟</div>
                <h4>Core Team</h4>
                <p>50 merged pull requests</p>
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>Keep Building</h2>
            <p>Your contributions help shape the future of decentralized storage</p>
            <div className="cta-buttons">
              <Link href="/tasks" className="cta-btn primary">
                Browse Tasks
              </Link>
              <Link href="/contracts" className="cta-btn secondary">
                View Contracts
              </Link>
            </div>
          </section>
        </div>
      </div>
      
      <style jsx>{`
        .contributions-page {
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-top: 24px;
          overflow-x: hidden;
        }

        .contributions-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .contributions-hero {
          text-align: center;
          padding: 60px 20px 40px;
          background: #000000;
          margin: -24px -40px 40px -40px;
        }

        .contributions-hero h1 {
          font-size: 42px;
          font-weight: 200;
          margin: 0 0 16px 0;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .contributions-tagline {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .stats-overview {
          padding: 40px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.2s;
        }

        .stat-card:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.05), rgba(0, 255, 136, 0.02));
          border-color: rgba(0, 255, 136, 0.3);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ff88;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 200;
          color: #ffffff;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .breakdown {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 24px;
        }

        .breakdown h3 {
          font-size: 18px;
          font-weight: 300;
          margin: 0 0 20px 0;
          color: #00ff88;
        }

        .breakdown-items {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .breakdown-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breakdown-item svg {
          color: rgba(255, 255, 255, 0.5);
        }

        .breakdown-item .type {
          flex: 1;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }

        .breakdown-item .count {
          font-size: 18px;
          font-weight: 300;
          color: #00ff88;
        }

        .contributions-section {
          padding: 40px 0;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .section-header h2 {
          font-size: 28px;
          font-weight: 200;
          margin: 0;
        }

        .time-filters {
          display: flex;
          gap: 8px;
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

        .contributions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .contribution-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          display: flex;
          gap: 20px;
          transition: all 0.2s;
        }

        .contribution-card:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .contribution-icon {
          width: 40px;
          height: 40px;
          background: rgba(0, 255, 136, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00ff88;
          flex-shrink: 0;
        }

        .contribution-content {
          flex: 1;
        }

        .contribution-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .contribution-header h3 {
          font-size: 16px;
          font-weight: 400;
          margin: 0;
        }

        .status {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .contribution-description {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 12px 0;
          line-height: 1.6;
        }

        .contribution-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .meta-left {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .meta-left svg {
          color: rgba(255, 255, 255, 0.3);
        }

        .separator {
          color: rgba(255, 255, 255, 0.2);
        }

        .pr-link {
          color: #00ff88;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .pr-link:hover {
          opacity: 0.8;
        }

        .rewards {
          display: flex;
          gap: 16px;
        }

        .points, .tokens {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .points {
          color: #ffaa00;
        }

        .tokens {
          color: #00ff88;
        }

        .load-more {
          text-align: center;
          margin-top: 30px;
        }

        .load-more-btn {
          background: transparent;
          border: 1px solid rgba(0, 255, 136, 0.5);
          color: #00ff88;
          padding: 12px 32px;
          border-radius: 100px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .load-more-btn:hover {
          background: rgba(0, 255, 136, 0.1);
        }

        .achievements-section {
          padding: 40px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .achievements-section h2 {
          font-size: 28px;
          font-weight: 200;
          margin: 0 0 30px 0;
          text-align: center;
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 20px;
        }

        .achievement {
          text-align: center;
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .achievement.unlocked {
          background: rgba(0, 255, 136, 0.05);
          border-color: rgba(0, 255, 136, 0.3);
        }

        .achievement:hover {
          transform: translateY(-2px);
        }

        .achievement-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .achievement-icon.locked {
          opacity: 0.3;
          filter: grayscale(1);
        }

        .achievement h4 {
          font-size: 14px;
          font-weight: 500;
          margin: 0 0 4px 0;
        }

        .achievement p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
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
          .contributions-hero h1 {
            font-size: 32px;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .breakdown-items {
            grid-template-columns: 1fr;
          }

          .achievements-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .section-header {
            flex-direction: column;
            gap: 20px;
          }

          .time-filters {
            width: 100%;
            justify-content: center;
          }

          .contribution-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
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
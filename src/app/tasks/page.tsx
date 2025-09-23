'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Taskbar from '@/components/Taskbar'
import Link from 'next/link'
import { CheckCircle, Circle, Clock, Star, TrendingUp, Users, Award } from 'lucide-react'

export default function TasksPage() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: session } = useSession()
  const [filter, setFilter] = useState('all')
  const [contributors, setContributors] = useState<Array<{login: string, contributions: number}>>([])

  useEffect(() => {
    // Fetch real contributors from GitHub
    fetch('https://api.github.com/repos/bitcoin-apps-suite/bitcoin-drive/contributors')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setContributors(data.slice(0, 10)) // Top 10 contributors
        }
      })
      .catch(err => console.error('Failed to fetch contributors:', err))
  }, [])

  const tasks = [
    { id: 1, title: 'Complete HandCash OAuth integration', points: 500, status: 'in-progress', difficulty: 'medium', category: 'backend' },
    { id: 2, title: 'Write unit tests for storage module', points: 300, status: 'open', difficulty: 'easy', category: 'testing' },
    { id: 3, title: 'Design NFT container format specification', points: 1000, status: 'open', difficulty: 'hard', category: 'blockchain' },
    { id: 4, title: 'Implement file chunking for large uploads', points: 750, status: 'open', difficulty: 'hard', category: 'backend' },
    { id: 5, title: 'Create mobile responsive navigation', points: 200, status: 'completed', difficulty: 'easy', category: 'frontend' },
    { id: 6, title: 'Add Stripe webhook handlers', points: 400, status: 'open', difficulty: 'medium', category: 'backend' },
    { id: 7, title: 'Optimize image thumbnail generation', points: 350, status: 'in-progress', difficulty: 'medium', category: 'performance' },
    { id: 8, title: 'Document API endpoints', points: 250, status: 'open', difficulty: 'easy', category: 'documentation' },
    { id: 9, title: 'Implement rate limiting', points: 600, status: 'open', difficulty: 'medium', category: 'security' },
    { id: 10, title: 'Create contributor dashboard', points: 800, status: 'open', difficulty: 'hard', category: 'frontend' },
  ]

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    if (filter === 'open') return task.status === 'open'
    if (filter === 'in-progress') return task.status === 'in-progress'
    if (filter === 'completed') return task.status === 'completed'
    return task.category === filter
  })

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return '#00ff88'
      case 'medium': return '#ffaa00'
      case 'hard': return '#ff4444'
      default: return '#ffffff'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle size={18} color="#00ff88" />
      case 'in-progress': return <Clock size={18} color="#ffaa00" />
      default: return <Circle size={18} color="rgba(255,255,255,0.3)" />
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
      
      <div className="tasks-page">
        <div className="tasks-container">
          <section className="tasks-hero">
            <h1>Community Tasks</h1>
            <p className="tasks-tagline">
              Complete tasks, earn points, and climb the leaderboard
            </p>
            <div className="stats-bar">
              <div className="stat">
                <TrendingUp size={20} />
                <span className="stat-value">{tasks.filter(t => t.status === 'open').length}</span>
                <span className="stat-label">Open Tasks</span>
              </div>
              <div className="stat">
                <Users size={20} />
                <span className="stat-value">{contributors.length || '-'}</span>
                <span className="stat-label">Active Contributors</span>
              </div>
              <div className="stat">
                <Award size={20} />
                <span className="stat-value">5,250</span>
                <span className="stat-label">Total Points</span>
              </div>
            </div>
          </section>

          <section className="tasks-content">
            <div className="tasks-sidebar">
              <h3>Filters</h3>
              <div className="filter-group">
                <h4>Status</h4>
                <button 
                  className={`filter-option ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  All Tasks
                </button>
                <button 
                  className={`filter-option ${filter === 'open' ? 'active' : ''}`}
                  onClick={() => setFilter('open')}
                >
                  Open
                </button>
                <button 
                  className={`filter-option ${filter === 'in-progress' ? 'active' : ''}`}
                  onClick={() => setFilter('in-progress')}
                >
                  In Progress
                </button>
                <button 
                  className={`filter-option ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                >
                  Completed
                </button>
              </div>

              <div className="filter-group">
                <h4>Category</h4>
                <button 
                  className={`filter-option ${filter === 'frontend' ? 'active' : ''}`}
                  onClick={() => setFilter('frontend')}
                >
                  Frontend
                </button>
                <button 
                  className={`filter-option ${filter === 'backend' ? 'active' : ''}`}
                  onClick={() => setFilter('backend')}
                >
                  Backend
                </button>
                <button 
                  className={`filter-option ${filter === 'blockchain' ? 'active' : ''}`}
                  onClick={() => setFilter('blockchain')}
                >
                  Blockchain
                </button>
                <button 
                  className={`filter-option ${filter === 'testing' ? 'active' : ''}`}
                  onClick={() => setFilter('testing')}
                >
                  Testing
                </button>
              </div>

              <div className="leaderboard">
                <h3>Top Contributors</h3>
                <div className="leader-list">
                  {contributors.length > 0 ? (
                    contributors.slice(0, 5).map((contributor, index) => (
                      <div key={contributor.login} className="leader-item">
                        <span className="rank">{index + 1}</span>
                        <span className="name">@{contributor.login}</span>
                        <span className="points">{contributor.contributions}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>
                      Loading contributors...
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="tasks-main">
              <div className="tasks-header">
                <h2>Available Tasks ({filteredTasks.length})</h2>
                <select className="sort-select">
                  <option>Sort by Points</option>
                  <option>Sort by Difficulty</option>
                  <option>Sort by Date</option>
                </select>
              </div>

              <div className="tasks-list">
                {filteredTasks.map(task => (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      {getStatusIcon(task.status)}
                      <h3>{task.title}</h3>
                    </div>
                    
                    <div className="task-meta">
                      <span 
                        className="difficulty"
                        style={{ color: getDifficultyColor(task.difficulty) }}
                      >
                        {task.difficulty}
                      </span>
                      <span className="category">{task.category}</span>
                      <div className="points">
                        <Star size={14} />
                        <span>{task.points} pts</span>
                      </div>
                    </div>

                    <div className="task-actions">
                      {task.status === 'open' && (
                        <button className="claim-btn">Claim Task</button>
                      )}
                      {task.status === 'in-progress' && (
                        <span className="status-badge in-progress">In Progress</span>
                      )}
                      {task.status === 'completed' && (
                        <span className="status-badge completed">Completed</span>
                      )}
                      <a href={`https://github.com/bitcoin-apps-suite/bitcoin-drive/issues/${task.id}`} className="details-link">
                        View Details →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="cta-section">
            <h2>Start Contributing Today</h2>
            <p>Every task completed brings us closer to building the future of decentralized storage</p>
            <div className="cta-buttons">
              <Link href="/contracts" className="cta-btn primary">
                View Contracts
              </Link>
              <Link href="/contributions" className="cta-btn secondary">
                My Contributions
              </Link>
            </div>
          </section>
        </div>
      </div>
      
      <style jsx>{`
        .tasks-page {
          background: #0a0a0a;
          color: #ffffff;
          min-height: 100vh;
          font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding-top: 24px;
          overflow-x: hidden;
        }

        .tasks-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
        }

        .tasks-hero {
          text-align: center;
          padding: 60px 20px;
          background: #000000;
          margin: -24px -40px 40px -40px;
        }

        .tasks-hero h1 {
          font-size: 42px;
          font-weight: 200;
          margin: 0 0 16px 0;
          background: linear-gradient(90deg, #00ff88, #00cc66);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .tasks-tagline {
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
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .stat svg {
          color: #00ff88;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 200;
          color: #ffffff;
        }

        .stat-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
        }

        .tasks-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
          padding: 40px 0;
        }

        .tasks-sidebar {
          position: sticky;
          top: 100px;
          height: fit-content;
        }

        .tasks-sidebar h3 {
          font-size: 18px;
          font-weight: 300;
          margin: 0 0 20px 0;
          color: #00ff88;
        }

        .filter-group {
          margin-bottom: 30px;
        }

        .filter-group h4 {
          font-size: 14px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .filter-option {
          display: block;
          width: 100%;
          text-align: left;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 8px 12px;
          margin-bottom: 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .filter-option:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .filter-option.active {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
          border-left: 2px solid #00ff88;
        }

        .leaderboard {
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .leader-list {
          margin-top: 20px;
        }

        .leader-item {
          display: flex;
          align-items: center;
          padding: 12px;
          margin-bottom: 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }

        .leader-item .rank {
          width: 24px;
          height: 24px;
          background: rgba(0, 255, 136, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #00ff88;
          margin-right: 12px;
        }

        .leader-item .name {
          flex: 1;
          font-size: 14px;
        }

        .leader-item .points {
          font-size: 14px;
          color: #00ff88;
          font-weight: 500;
        }

        .tasks-main {
          min-height: 600px;
        }

        .tasks-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .tasks-header h2 {
          font-size: 24px;
          font-weight: 300;
          margin: 0;
        }

        .sort-select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #ffffff;
          padding: 8px 16px;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        .tasks-list {
          display: grid;
          gap: 16px;
        }

        .task-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .task-card:hover {
          border-color: rgba(0, 255, 136, 0.3);
          background: rgba(255, 255, 255, 0.03);
        }

        .task-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .task-header h3 {
          font-size: 16px;
          font-weight: 400;
          margin: 0;
          flex: 1;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .difficulty {
          font-size: 12px;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .category {
          font-size: 12px;
          padding: 4px 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 100px;
          color: rgba(255, 255, 255, 0.7);
        }

        .points {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          color: #00ff88;
          font-size: 14px;
          font-weight: 500;
        }

        .task-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .claim-btn {
          background: linear-gradient(90deg, #00ff88, #00cc66);
          color: #000;
          border: none;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .claim-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
        }

        .status-badge {
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.in-progress {
          background: rgba(255, 170, 0, 0.2);
          color: #ffaa00;
        }

        .status-badge.completed {
          background: rgba(0, 255, 136, 0.2);
          color: #00ff88;
        }

        .details-link {
          margin-left: auto;
          color: #00ff88;
          text-decoration: none;
          font-size: 14px;
        }

        .details-link:hover {
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
          .tasks-hero h1 {
            font-size: 32px;
          }

          .stats-bar {
            flex-direction: column;
            gap: 20px;
          }

          .tasks-content {
            grid-template-columns: 1fr;
          }

          .tasks-sidebar {
            position: static;
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
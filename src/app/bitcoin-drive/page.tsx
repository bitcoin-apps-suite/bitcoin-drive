'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Shield, Zap, Lock, Share2, HardDrive, Globe, ChevronRight, Check, Github, Twitter } from 'lucide-react'

export default function BitcoinDriveAbout() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Blockchain Verified",
      description: "Every file is hashed and stored on the Bitcoin SV blockchain for immutable proof of existence"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Timelock Files",
      description: "Set future unlock dates for sensitive documents with cryptographic time-based access control"
    },
    {
      icon: <HardDrive className="w-6 h-6" />,
      title: "Hybrid Storage",
      description: "Files on Google Drive, hashes on blockchain - the best of both worlds for speed and security"
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Social Sharing",
      description: "Share files directly to Twitter with automatic announcements and payment gateways"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Payments",
      description: "Accept Bitcoin SV payments through HandCash for premium file access"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Decentralized",
      description: "No single point of failure - your files are distributed and verified globally"
    }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      features: [
        "Up to 100MB storage",
        "Basic file sharing",
        "Blockchain verification",
        "Google Drive sync"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Pro",
      price: "9.99",
      features: [
        "Unlimited storage",
        "Timelock features",
        "Payment gateways",
        "Twitter integration",
        "Priority support",
        "Advanced encryption"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Everything in Pro",
        "Custom contracts",
        "API access",
        "Team collaboration",
        "SLA guarantee",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#000000' }}>
      {/* Navigation */}
      <nav className="border-b" style={{ borderColor: 'rgba(0, 255, 0, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold" style={{ color: '#00ff00' }}>₿</span>
                <span className="text-xl font-bold" style={{ color: '#00ff00' }}>Bitcoin Drive</span>
              </Link>
            </div>
            <div className="flex items-center space-x-6">
              <a 
                href="https://github.com/yourusername/bitcoin-drive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Github className="w-5 h-5" style={{ color: '#00ff00' }} />
              </a>
              <a 
                href="https://twitter.com/bitcoindrive" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
              >
                <Twitter className="w-5 h-5" style={{ color: '#00ff00' }} />
              </a>
              <Link 
                href="/"
                className="px-4 py-2 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ 
                  backgroundColor: '#00ff00',
                  color: '#000000'
                }}
              >
                Launch App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0, 255, 0, 0.3) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(0, 255, 0, 0.2) 0%, transparent 50%)`
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ color: '#00ff00' }}>
            Store Forever.
            <br />
            <span className="opacity-80">Verify Always.</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: 'rgba(0, 255, 0, 0.8)' }}>
            The first decentralized storage platform that combines Google Drive convenience 
            with Bitcoin SV blockchain immutability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
              style={{ 
                backgroundColor: '#00ff00',
                color: '#000000'
              }}
            >
              Start Storing Files
              <ChevronRight className="inline ml-2" />
            </Link>
            <a 
              href="#features"
              className="px-8 py-4 rounded-lg font-bold text-lg transition-all hover:opacity-80"
              style={{ 
                border: '2px solid #00ff00',
                color: '#00ff00'
              }}
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#00ff00' }}>
            Why Bitcoin Drive?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl transition-all cursor-pointer"
                style={{ 
                  backgroundColor: hoveredFeature === index ? 'rgba(0, 255, 0, 0.1)' : 'rgba(0, 255, 0, 0.05)',
                  border: '1px solid rgba(0, 255, 0, 0.2)'
                }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="mb-4" style={{ color: '#00ff00' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#00ff00' }}>
                  {feature.title}
                </h3>
                <p style={{ color: 'rgba(0, 255, 0, 0.7)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4" style={{ backgroundColor: 'rgba(0, 255, 0, 0.02)' }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#00ff00' }}>
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: '#00ff00' }}>1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#00ff00' }}>Upload</h3>
              <p style={{ color: 'rgba(0, 255, 0, 0.7)' }}>
                Drag and drop your files or connect your Google Drive
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: '#00ff00' }}>2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#00ff00' }}>Verify</h3>
              <p style={{ color: 'rgba(0, 255, 0, 0.7)' }}>
                Files are hashed and stored on the Bitcoin SV blockchain
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: 'rgba(0, 255, 0, 0.2)' }}>
                <span className="text-2xl font-bold" style={{ color: '#00ff00' }}>3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#00ff00' }}>Share</h3>
              <p style={{ color: 'rgba(0, 255, 0, 0.7)' }}>
                Share securely with timelock, payments, or social media
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12" style={{ color: '#00ff00' }}>
            Simple Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className="p-8 rounded-xl relative"
                style={{ 
                  backgroundColor: 'rgba(0, 255, 0, 0.05)',
                  border: plan.popular ? '2px solid #00ff00' : '1px solid rgba(0, 255, 0, 0.2)'
                }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold"
                          style={{ backgroundColor: '#00ff00', color: '#000000' }}>
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#00ff00' }}>
                  {plan.name}
                </h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold" style={{ color: '#00ff00' }}>
                    ${plan.price}
                  </span>
                  {plan.price !== "Custom" && (
                    <span style={{ color: 'rgba(0, 255, 0, 0.6)' }}>/month</span>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start">
                      <Check className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#00ff00' }} />
                      <span style={{ color: 'rgba(0, 255, 0, 0.8)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className="w-full py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                  style={{ 
                    backgroundColor: plan.popular ? '#00ff00' : 'transparent',
                    color: plan.popular ? '#000000' : '#00ff00',
                    border: plan.popular ? 'none' : '2px solid #00ff00'
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4" style={{ backgroundColor: 'rgba(0, 255, 0, 0.02)' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: '#00ff00' }}>
            Ready to Decentralize Your Storage?
          </h2>
          <p className="text-xl mb-8" style={{ color: 'rgba(0, 255, 0, 0.8)' }}>
            Join thousands of users who trust Bitcoin Drive with their most important files.
          </p>
          <Link 
            href="/"
            className="inline-block px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105"
            style={{ 
              backgroundColor: '#00ff00',
              color: '#000000'
            }}
          >
            Get Started Free
            <ChevronRight className="inline ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'rgba(0, 255, 0, 0.2)' }}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <span className="text-xl font-bold" style={{ color: '#00ff00' }}>₿</span>
            <span style={{ color: 'rgba(0, 255, 0, 0.6)' }}>
              © 2025 Bitcoin Drive. Built on Bitcoin SV.
            </span>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(0, 255, 0, 0.6)' }}>
              Privacy
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(0, 255, 0, 0.6)' }}>
              Terms
            </a>
            <a href="#" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(0, 255, 0, 0.6)' }}>
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
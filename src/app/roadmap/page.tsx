'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle, Circle, Clock, Zap, Users, Brain, Coins, Target, Settings, BarChart3, CreditCard, MessageCircle, Book, Shield, ArrowRight, Star, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function RoadmapPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'ai' | 'community' | 'monetization' | 'growth'>('all')

  const features = {
    // ✅ IMPLEMENTED FEATURES
    implemented: [
      {
        id: 'auth-system',
        title: 'User Authentication System',
        description: 'Complete login/signup with Supabase integration',
        category: 'core',
        priority: 'high',
        pages: ['/login', '/signup'],
        techStack: ['Next.js', 'Supabase', 'TypeScript']
      },
      {
        id: 'dashboard',
        title: 'Personalized Dashboard',
        description: 'Dynamic dashboard with avatar-based problem detection and AI coaching',
        category: 'core',
        priority: 'high',
        pages: ['/dashboard'],
        techStack: ['Next.js', 'Framer Motion', 'TypeScript']
      },
      {
        id: 'ai-coaching',
        title: 'AI Personal Coaching System',
        description: 'OpenAI-powered coaching with 5 personality avatars (Marcus, Alex, Ryan, Jake, Ethan)',
        category: 'ai',
        priority: 'high',
        pages: ['/dashboard'],
        techStack: ['OpenAI API', 'Next.js API Routes']
      },
      {
        id: 'coin-system',
        title: 'AlphaRise Coins Economy',
        description: 'Complete coin earning/spending system with anti-fraud protection',
        category: 'monetization',
        priority: 'high',
        pages: ['/coins', '/coins-guide'],
        techStack: ['TypeScript', 'Local Storage', 'Supabase']
      },
      {
        id: 'community-platform',
        title: 'Community Q&A Platform',
        description: 'Question asking, answering, voting system with coin rewards',
        category: 'community',
        priority: 'high',
        pages: ['/community'],
        techStack: ['Supabase', 'Real-time subscriptions']
      },
      {
        id: 'profile-management',
        title: 'User Profile Management',
        description: 'Complete profile editing with avatar selection and stats display',
        category: 'core',
        priority: 'medium',
        pages: ['/profile'],
        techStack: ['React forms', 'Local Storage']
      },
      {
        id: 'settings-system',
        title: 'Comprehensive Settings',
        description: 'Notifications, privacy, appearance, accessibility, language settings',
        category: 'core',
        priority: 'medium',
        pages: ['/settings'],
        techStack: ['React state management', 'Local Storage']
      },
      {
        id: 'analytics-dashboard',
        title: 'User Analytics & Progress',
        description: 'Detailed analytics with stats, charts, goals, and activity tracking',
        category: 'growth',
        priority: 'medium',
        pages: ['/analytics'],
        techStack: ['Chart libraries', 'Data visualization']
      },
      {
        id: 'billing-system',
        title: 'Subscription & Billing',
        description: 'Plan management, payment history, subscription controls',
        category: 'monetization',
        priority: 'medium',
        pages: ['/billing'],
        techStack: ['Stripe integration ready']
      },
      {
        id: 'assessment-tool',
        title: 'Confidence Assessment',
        description: 'Initial assessment to determine user avatar type and starting point',
        category: 'core',
        priority: 'high',
        pages: ['/assessment'],
        techStack: ['Form validation', 'Algorithm-based scoring']
      }
    ],

    // 🚧 IN PROGRESS FEATURES
    inProgress: [
      {
        id: 'stripe-integration',
        title: 'Stripe Payment Integration',
        description: 'Connect billing system to actual Stripe payments for subscriptions',
        category: 'monetization',
        priority: 'high',
        estimatedTime: '1-2 weeks',
        blockers: ['Stripe API keys', 'Webhook setup']
      },
      {
        id: 'real-community',
        title: 'Real Community Backend',
        description: 'Connect community features to Supabase with real data persistence',
        category: 'community',
        priority: 'high',
        estimatedTime: '2-3 weeks',
        blockers: ['Database schema finalization']
      }
    ],

    // 📋 PLANNED FEATURES
    planned: [
      {
        id: 'mobile-app',
        title: 'Mobile Application',
        description: 'React Native mobile app with push notifications and offline support',
        category: 'growth',
        priority: 'high',
        estimatedTime: '2-3 months',
        dependencies: ['Core platform stability']
      },
      {
        id: 'video-coaching',
        title: 'Video Coaching Sessions',
        description: 'Live and recorded video sessions with certified coaches',
        category: 'ai',
        priority: 'medium',
        estimatedTime: '1-2 months',
        dependencies: ['Video streaming infrastructure']
      },
      {
        id: 'gamification',
        title: 'Advanced Gamification',
        description: 'Achievements, leaderboards, challenges, and social features',
        category: 'growth',
        priority: 'medium',
        estimatedTime: '3-4 weeks',
        dependencies: ['Analytics system', 'Community platform']
      },
      {
        id: 'ai-matching',
        title: 'AI-Powered User Matching',
        description: 'Connect users with similar goals and experience levels',
        category: 'ai',
        priority: 'medium',
        estimatedTime: '4-6 weeks',
        dependencies: ['User data analysis', 'ML models']
      },
      {
        id: 'content-library',
        title: 'Comprehensive Content Library',
        description: 'Articles, exercises, worksheets, and interactive modules',
        category: 'core',
        priority: 'high',
        estimatedTime: '6-8 weeks',
        dependencies: ['Content creation team']
      },
      {
        id: 'progress-tracking',
        title: 'Advanced Progress Tracking',
        description: 'Detailed habit tracking, mood journaling, and confidence metrics',
        category: 'growth',
        priority: 'medium',
        estimatedTime: '3-4 weeks',
        dependencies: ['Analytics foundation']
      },
      {
        id: 'expert-network',
        title: 'Expert Network Integration',
        description: 'Connect with certified dating and confidence coaches',
        category: 'community',
        priority: 'medium',
        estimatedTime: '4-6 weeks',
        dependencies: ['Expert onboarding system']
      },
      {
        id: 'social-features',
        title: 'Social Features & Groups',
        description: 'Private groups, friend system, and social challenges',
        category: 'community',
        priority: 'low',
        estimatedTime: '6-8 weeks',
        dependencies: ['Community platform maturity']
      }
    ],

    // 💡 FUTURE IDEAS
    future: [
      {
        id: 'vr-practice',
        title: 'VR Social Practice Environment',
        description: 'Virtual reality scenarios for practicing social interactions',
        category: 'ai',
        priority: 'low',
        estimatedTime: '6+ months',
        dependencies: ['VR technology adoption', 'Significant funding']
      },
      {
        id: 'ai-wingman',
        title: 'AI Wingman Assistant',
        description: 'Real-time AI assistance during dates and social interactions',
        category: 'ai',
        priority: 'low',
        estimatedTime: '6+ months',
        dependencies: ['Advanced AI models', 'Real-time processing']
      },
      {
        id: 'marketplace',
        title: 'Services Marketplace',
        description: 'Platform for coaches, photographers, stylists, and other services',
        category: 'monetization',
        priority: 'low',
        estimatedTime: '4-6 months',
        dependencies: ['Large user base', 'Service provider network']
      }
    ]
  }

  const categories = {
    all: { name: 'All Features', icon: <Star className="w-4 h-4" />, color: 'gray' },
    core: { name: 'Core Platform', icon: <Zap className="w-4 h-4" />, color: 'purple' },
    ai: { name: 'AI & Coaching', icon: <Brain className="w-4 h-4" />, color: 'blue' },
    community: { name: 'Community', icon: <Users className="w-4 h-4" />, color: 'green' },
    monetization: { name: 'Monetization', icon: <Coins className="w-4 h-4" />, color: 'yellow' },
    growth: { name: 'Growth & Analytics', icon: <BarChart3 className="w-4 h-4" />, color: 'pink' }
  }

  const priorityColors = {
    high: 'text-red-400 bg-red-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    low: 'text-green-400 bg-green-500/20'
  }

  const statusConfig = {
    implemented: { 
      icon: <CheckCircle className="w-5 h-5 text-green-400" />, 
      label: 'Implemented', 
      color: 'border-green-500/30 bg-green-500/10' 
    },
    inProgress: { 
      icon: <Clock className="w-5 h-5 text-yellow-400" />, 
      label: 'In Progress', 
      color: 'border-yellow-500/30 bg-yellow-500/10' 
    },
    planned: { 
      icon: <Circle className="w-5 h-5 text-blue-400" />, 
      label: 'Planned', 
      color: 'border-blue-500/30 bg-blue-500/10' 
    },
    future: { 
      icon: <AlertTriangle className="w-5 h-5 text-purple-400" />, 
      label: 'Future Ideas', 
      color: 'border-purple-500/30 bg-purple-500/10' 
    }
  }

  const FeatureCard = ({ feature, status }: { feature: any, status: keyof typeof statusConfig }) => {
    const categoryColor = categories[feature.category as keyof typeof categories]?.color || 'gray'
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-xl border ${statusConfig[status].color} hover:border-gray-500 transition-all`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {statusConfig[status].icon}
            <div>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {feature.priority && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[feature.priority as keyof typeof priorityColors]}`}>
                {feature.priority}
              </span>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${categoryColor}-500/20 text-${categoryColor}-400`}>
              {feature.category}
            </span>
          </div>
        </div>

        {feature.pages && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Pages:</div>
            <div className="flex flex-wrap gap-1">
              {feature.pages.map((page: string) => (
                <Link
                  key={page}
                  href={page}
                  className="text-xs bg-gray-700/50 hover:bg-gray-600/50 px-2 py-1 rounded transition-colors text-blue-400"
                >
                  {page}
                </Link>
              ))}
            </div>
          </div>
        )}

        {feature.techStack && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Tech Stack:</div>
            <div className="flex flex-wrap gap-1">
              {feature.techStack.map((tech: string) => (
                <span key={tech} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {feature.estimatedTime && (
          <div className="text-sm text-gray-400 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Estimated: {feature.estimatedTime}
          </div>
        )}

        {feature.dependencies && (
          <div className="text-sm text-orange-400 mb-2">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            Depends on: {feature.dependencies.join(', ')}
          </div>
        )}

        {feature.blockers && (
          <div className="text-sm text-red-400">
            <Shield className="w-4 h-4 inline mr-1" />
            Blockers: {feature.blockers.join(', ')}
          </div>
        )}
      </motion.div>
    )
  }

  const filteredFeatures = {
    implemented: features.implemented.filter(f => selectedCategory === 'all' || f.category === selectedCategory),
    inProgress: features.inProgress.filter(f => selectedCategory === 'all' || f.category === selectedCategory),
    planned: features.planned.filter(f => selectedCategory === 'all' || f.category === selectedCategory),
    future: features.future.filter(f => selectedCategory === 'all' || f.category === selectedCategory)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              AlphaRise Development Roadmap
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              Complete overview of implemented features, current development, and future plans for the AlphaRise confidence-building platform
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(categories).map(([key, category]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === key
                    ? `bg-${category.color}-500/20 text-${category.color}-400 border border-${category.color}-500/30`
                    : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{features.implemented.length}</div>
            <div className="text-sm text-gray-400">Implemented</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{features.inProgress.length}</div>
            <div className="text-sm text-gray-400">In Progress</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{features.planned.length}</div>
            <div className="text-sm text-gray-400">Planned</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{features.future.length}</div>
            <div className="text-sm text-gray-400">Future Ideas</div>
          </div>
        </div>

        {/* Implemented Features */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">✅ Implemented Features</h2>
            <span className="text-green-400 font-semibold">({filteredFeatures.implemented.length})</span>
          </div>
          <div className="grid gap-6">
            {filteredFeatures.implemented.map((feature) => (
              <FeatureCard key={feature.id} feature={feature} status="implemented" />
            ))}
          </div>
        </section>

        {/* In Progress Features */}
        {filteredFeatures.inProgress.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold text-white">🚧 In Progress</h2>
              <span className="text-yellow-400 font-semibold">({filteredFeatures.inProgress.length})</span>
            </div>
            <div className="grid gap-6">
              {filteredFeatures.inProgress.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} status="inProgress" />
              ))}
            </div>
          </section>
        )}

        {/* Planned Features */}
        {filteredFeatures.planned.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Circle className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">📋 Planned Features</h2>
              <span className="text-blue-400 font-semibold">({filteredFeatures.planned.length})</span>
            </div>
            <div className="grid gap-6">
              {filteredFeatures.planned.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} status="planned" />
              ))}
            </div>
          </section>
        )}

        {/* Future Ideas */}
        {filteredFeatures.future.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">💡 Future Ideas</h2>
              <span className="text-purple-400 font-semibold">({filteredFeatures.future.length})</span>
            </div>
            <div className="grid gap-6">
              {filteredFeatures.future.map((feature) => (
                <FeatureCard key={feature.id} feature={feature} status="future" />
              ))}
            </div>
          </section>
        )}

        {/* Development Guidelines */}
        <section className="bg-gray-800/30 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">🛠️ Development Guidelines</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-3">Tech Stack</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Frontend:</strong> Next.js 15 with TypeScript</li>
                <li>• <strong>Styling:</strong> Tailwind CSS + Framer Motion</li>
                <li>• <strong>Database:</strong> Supabase (PostgreSQL)</li>
                <li>• <strong>Authentication:</strong> Supabase Auth</li>
                <li>• <strong>AI:</strong> OpenAI API (GPT-4)</li>
                <li>• <strong>Payments:</strong> Stripe (planned)</li>
                <li>• <strong>Deployment:</strong> Vercel</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Code Standards</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Use TypeScript for all new code</li>
                <li>• Follow Next.js App Router conventions</li>
                <li>• Implement responsive design (mobile-first)</li>
                <li>• Use Framer Motion for animations</li>
                <li>• Follow existing UI/UX patterns</li>
                <li>• Write comprehensive error handling</li>
                <li>• Test on multiple devices and browsers</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-white mb-6">🔗 Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Link href="/dashboard" className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg p-4 transition-colors">
              <div className="text-purple-400 font-semibold">Dashboard</div>
            </Link>
            <Link href="/coins-guide" className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 rounded-lg p-4 transition-colors">
              <div className="text-yellow-400 font-semibold">Coins Guide</div>
            </Link>
            <Link href="/community" className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg p-4 transition-colors">
              <div className="text-green-400 font-semibold">Community</div>
            </Link>
            <Link href="/analytics" className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-lg p-4 transition-colors">
              <div className="text-pink-400 font-semibold">Analytics</div>
            </Link>
            <Link href="/billing" className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg p-4 transition-colors">
              <div className="text-blue-400 font-semibold">Billing</div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SupabaseUserManager, DbUser } from '@/lib/supabase'
import { simpleCoinHelpers } from '@/lib/simple-coin-system'
import { BarChart3, ArrowLeft, TrendingUp, TrendingDown, Coins, Users, MessageCircle, Award, Calendar, Target, Zap, Star, Clock, Activity } from 'lucide-react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    const loadData = async () => {
      try {
        const username = localStorage.getItem('username') || 'testuser1'
        const userData = await SupabaseUserManager.getUserByUsername(username)
        
        if (userData) {
          setUser(userData)
          // Get user stats from coin system
          const userStats = simpleCoinHelpers.getUserStats(userData.id)
          setStats(userStats)
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error('Error loading data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [router, timeRange])

  // Mock data for charts - in real app, this would come from your analytics API
  const mockChartData = {
    coinsOverTime: [
      { date: '2025-01-01', earned: 5, spent: 2 },
      { date: '2025-01-02', earned: 8, spent: 5 },
      { date: '2025-01-03', earned: 12, spent: 3 },
      { date: '2025-01-04', earned: 6, spent: 8 },
      { date: '2025-01-05', earned: 15, spent: 4 },
      { date: '2025-01-06', earned: 9, spent: 6 },
      { date: '2025-01-07', earned: 18, spent: 7 }
    ],
    activityHeatmap: [
      { day: 'Mon', hour: 9, activity: 4 },
      { day: 'Mon', hour: 14, activity: 8 },
      { day: 'Mon', hour: 20, activity: 12 },
      { day: 'Tue', hour: 10, activity: 6 },
      { day: 'Tue', hour: 15, activity: 15 },
      // ... more data points
    ]
  }

  const StatCard = ({ 
    icon, 
    title, 
    value, 
    change, 
    changeType, 
    description,
    color = 'purple'
  }: {
    icon: React.ReactNode
    title: string
    value: string | number
    change?: string
    changeType?: 'positive' | 'negative' | 'neutral'
    description: string
    color?: string
  }) => (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-${color}-500/20`}>
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-sm ${
            changeType === 'positive' ? 'text-purple-300' : 
            changeType === 'negative' ? 'text-purple-500' : 'text-gray-400'
          }`}>
            {changeType === 'positive' ? <TrendingUp className="w-4 h-4" /> : 
             changeType === 'negative' ? <TrendingDown className="w-4 h-4" /> : null}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-xs text-gray-500 mt-2">{description}</div>
    </div>
  )

  const SimpleChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      <div className="space-y-2">
        {data.slice(0, 5).map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">{item.date}</span>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                <span className="text-white font-bold text-sm">+{item.earned}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-white font-bold text-sm">-{item.spent}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading analytics...
          </h2>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-purple-500/20 p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Analytics</h1>
              <p className="text-gray-400">Track your progress and performance</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  timeRange === range 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'All Time' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Coins className="w-6 h-6 text-yellow-400" />}
            title="Total Coins Earned"
            value={user.total_earned || 0}
            change="+12%"
            changeType="positive"
            description="All-time earnings from community participation"
            color="yellow"
          />
          
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-purple-400" />}
            title="Current Level"
            value={user.level || 1}
            change="Recently leveled up"
            changeType="positive"
            description="Your experience and contribution level"
            color="green"
          />
          
          <StatCard
            icon={<Activity className="w-6 h-6 text-purple-400" />}
            title="Streak Days"
            value={user.streak || 0}
            change="+3 this week"
            changeType="positive"
            description="Consecutive days of activity"
            color="blue"
          />
          
          <StatCard
            icon={<MessageCircle className="w-6 h-6 text-purple-400" />}
            title="Answers Given"
            value={stats?.community?.answersGiven || 0}
            change="5 this week"
            changeType="positive"
            description="Total helpful answers provided"
            color="purple"
          />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SimpleChart 
              data={mockChartData.coinsOverTime} 
              title="Coins Activity (Last 7 Days)" 
            />
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Confidence Score</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-600 rounded-full">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${(user.confidence_score / 100) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{user.confidence_score}/100</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Monthly Earnings</span>
                <span className="text-yellow-400 font-bold">{user.monthly_earnings} coins</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Helpfulness Ratio</span>
                <span className="text-white font-bold">
                  {stats?.community?.helpfulnessRatio?.toFixed(1) || '0.0'}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Best Answers</span>
                <span className="text-white font-bold">{stats?.community?.bestAnswersCount || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity Breakdown */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Activity Breakdown</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Daily Logins</span>
                </div>
                <span className="text-white font-semibold">{user.streak} days</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Questions Asked</span>
                </div>
                <span className="text-white font-semibold">8</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Votes Received</span>
                </div>
                <span className="text-white font-semibold">{stats?.community?.totalVotesReceived || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Badges Earned</span>
                </div>
                <span className="text-white font-semibold">{user.badges?.length || 0}</span>
              </div>
            </div>
          </div>

          {/* Goals & Achievements */}
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Goals & Progress</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">Reach Level 5</span>
                  <span className="text-white font-bold text-sm">{user.level}/5</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full" 
                    style={{ width: `${(user.level / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Keep answering questions to level up!</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-yellow-400 font-medium">Earn 100 Coins</span>
                  <span className="text-white font-bold text-sm">{user.total_earned}/100</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-400 h-2 rounded-full" 
                    style={{ width: `${Math.min((user.total_earned / 100) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Almost there! Keep helping the community.</p>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium">30-Day Streak</span>
                  <span className="text-white font-bold text-sm">{user.streak}/30</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div 
                    className="bg-purple-300 h-2 rounded-full" 
                    style={{ width: `${(user.streak / 30) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">Stay consistent with daily logins!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="flex-1">
                <div className="text-yellow-400 font-medium">Earned 5 coins</div>
                <div className="text-gray-400 text-sm">Answer marked as helpful • 2 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Posted an answer</div>
                <div className="text-gray-400 text-sm">Helped with confidence building • 4 hours ago</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-gray-700/30 rounded-lg">
              <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium">Daily login streak</div>
                <div className="text-gray-400 text-sm">Maintained {user.streak}-day streak • 1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
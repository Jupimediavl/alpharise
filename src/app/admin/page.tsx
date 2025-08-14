'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Temporary interfaces until we create the actual files
interface BotProfile {
  id: string
  username: string
  realName: string
  age: number
  location: string
  background: string
  expertise: string[]
  personality: string
  coinBalance: number
  reputation: 'Legend' | 'Expert' | 'Veteran' | 'Rising Star'
  joinedDays: number
  avatar: string
  bio: string
  specialties: string[]
  responseStyle: string
  activityPattern: string
  status: 'INACTIVE' | 'ACTIVE' | 'MANUAL' | 'SCHEDULED'
  postsPerDay: number
  responseRate: number
  humanBehavior: {
    typoFrequency: number
    casualGrammar: boolean
    emotionalResponses: boolean
    personalReferences: boolean
  }
}

// Mock data for demo purposes - will be replaced with actual imports
const mockBots: BotProfile[] = [
  {
    id: 'coach_rodriguez',
    username: 'Coach_Rodriguez',
    realName: 'Miguel Rodriguez',
    age: 34,
    location: 'Miami, FL',
    background: 'Former gym trainer who overcame premature ejaculation through discipline.',
    expertise: ['premature-ejaculation', 'lasting-longer', 'confidence-building'],
    personality: 'Direct, practical, motivational',
    coinBalance: 2840,
    reputation: 'Expert',
    joinedDays: 245,
    avatar: 'premature-ejaculation',
    bio: '10+ years helping men build confidence. Overcame struggles at 24.',
    specialties: ['Kegel exercises', 'Stop-start technique', 'Breathing methods'],
    responseStyle: 'Detailed step-by-step instructions',
    activityPattern: 'Posts 2-3 times daily',
    status: 'INACTIVE',
    postsPerDay: 3,
    responseRate: 85,
    humanBehavior: { typoFrequency: 5, casualGrammar: true, emotionalResponses: true, personalReferences: true }
  },
  {
    id: 'survivordan',
    username: 'SurvivorDan', 
    realName: 'Daniel Chen',
    age: 28,
    location: 'San Francisco, CA',
    background: 'Software engineer using data-driven approaches.',
    expertise: ['premature-ejaculation', 'lasting-longer', 'first-time'],
    personality: 'Nerdy but confident, science-backed',
    coinBalance: 1950,
    reputation: 'Veteran',
    joinedDays: 180,
    avatar: 'lasting-longer',
    bio: 'Data-driven transformation. Helping analytical guys.',
    specialties: ['Mindfulness techniques', 'Performance tracking', 'Scientific methods'],
    responseStyle: 'Scientific approach with studies',
    activityPattern: 'Evening and late night posts',
    status: 'INACTIVE',
    postsPerDay: 2,
    responseRate: 75,
    humanBehavior: { typoFrequency: 2, casualGrammar: false, emotionalResponses: true, personalReferences: true }
  },
  {
    id: 'veteran_mike',
    username: 'Veteran_Mike',
    realName: 'Michael Thompson', 
    age: 42,
    location: 'Austin, TX',
    background: 'Army veteran, married 15 years, father figure.',
    expertise: ['first-time', 'confidence-building', 'real-connections'],
    personality: 'Wise, patient, father-figure energy',
    coinBalance: 3200,
    reputation: 'Legend',
    joinedDays: 320,
    avatar: 'first-time',
    bio: 'Married high school sweetheart. Army veteran. Father of two.',
    specialties: ['First time advice', 'Communication skills', 'Emotional maturity'],
    responseStyle: 'Caring mentor tone',
    activityPattern: 'Morning posts before work',
    status: 'INACTIVE',
    postsPerDay: 2,
    responseRate: 90,
    humanBehavior: { typoFrequency: 3, casualGrammar: false, emotionalResponses: true, personalReferences: true }
  },
  {
    id: 'anxiety_slayer',
    username: 'AnxietySlayer_K',
    realName: 'Kevin Park',
    age: 26,
    location: 'Seattle, WA', 
    background: 'Overcame severe social anxiety and panic attacks.',
    expertise: ['approach-anxiety', 'social-anxiety', 'confidence-building'],
    personality: 'Empathetic, understanding, practical',
    coinBalance: 1800,
    reputation: 'Veteran',
    joinedDays: 150,
    avatar: 'approach-anxiety',
    bio: 'From panic attacks to confident approaches. Psychology background.',
    specialties: ['CBT techniques', 'Exposure therapy', 'Mindset shifts'],
    responseStyle: 'Understanding and supportive',
    activityPattern: 'Evening anxiety peak hours',
    status: 'INACTIVE',
    postsPerDay: 3,
    responseRate: 80,
    humanBehavior: { typoFrequency: 4, casualGrammar: true, emotionalResponses: true, personalReferences: true }
  },
  {
    id: 'dating_ninja',
    username: 'DatingNinja_S',
    realName: 'Samuel Kim',
    age: 27,
    location: 'Los Angeles, CA',
    background: 'Dating coach, modern app expert.',
    expertise: ['dating-apps', 'approach-anxiety', 'multiple-dating'],
    personality: 'Strategic, analytical, modern expert',
    coinBalance: 2200,
    reputation: 'Expert',
    joinedDays: 190,
    avatar: 'dating-apps',
    bio: '200+ dates analyzed. LA dating scene expert.',
    specialties: ['Profile optimization', 'Texting game', 'App algorithms'],
    responseStyle: 'Strategic and tactical',
    activityPattern: 'Dating app prime time',
    status: 'INACTIVE',
    postsPerDay: 4,
    responseRate: 75,
    humanBehavior: { typoFrequency: 3, casualGrammar: true, emotionalResponses: false, personalReferences: true }
  }
]

export default function AdminDashboard() {
  const [bots, setBots] = useState<BotProfile[]>(mockBots)
  const [selectedBot, setSelectedBot] = useState<BotProfile | null>(null)
  const [showBotDetails, setShowBotDetails] = useState(false)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [statusHistory, setStatusHistory] = useState<any[]>([])

  // Simulated admin user
  const adminId = 'admin_001'

  const getStats = () => {
    return {
      total: bots.length,
      byStatus: {
        active: bots.filter(b => b.status === 'ACTIVE').length,
        inactive: bots.filter(b => b.status === 'INACTIVE').length,
        manual: bots.filter(b => b.status === 'MANUAL').length,
        scheduled: bots.filter(b => b.status === 'SCHEDULED').length
      },
      byReputation: {
        legend: bots.filter(b => b.reputation === 'Legend').length,
        expert: bots.filter(b => b.reputation === 'Expert').length,
        veteran: bots.filter(b => b.reputation === 'Veteran').length,
        risingStar: bots.filter(b => b.reputation === 'Rising Star').length
      },
      totalCoins: bots.reduce((sum, bot) => sum + bot.coinBalance, 0),
      averageResponseRate: bots.reduce((sum, bot) => sum + bot.responseRate, 0) / bots.length
    }
  }

  const handleBotStatusChange = async (botId: string, newStatus: BotProfile['status']) => {
    setActionInProgress(botId)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Update bot status
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.id === botId ? { ...bot, status: newStatus } : bot
        )
      )

      // Add to history
      const historyEntry = {
        botId,
        newStatus,
        updatedBy: adminId,
        timestamp: new Date().toISOString()
      }
      setStatusHistory(prev => [historyEntry, ...prev].slice(0, 10))
      
      console.log(`Bot ${botId} status changed to ${newStatus}`)
    } catch (error) {
      console.error('Failed to update bot status:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  const handleEmergencyStop = async () => {
    setActionInProgress('emergency')
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Deactivate all active bots
      setBots(prevBots => 
        prevBots.map(bot => 
          bot.status === 'ACTIVE' ? { ...bot, status: 'INACTIVE' } : bot
        )
      )

      // Add to history
      const activeBotsCount = bots.filter(b => b.status === 'ACTIVE').length
      if (activeBotsCount > 0) {
        const historyEntry = {
          botId: 'ALL',
          newStatus: 'INACTIVE' as const,
          updatedBy: adminId,
          timestamp: new Date().toISOString(),
          reason: 'EMERGENCY STOP'
        }
        setStatusHistory(prev => [historyEntry, ...prev].slice(0, 10))
      }
      
      alert(`Emergency stop executed! ${activeBotsCount} bots deactivated.`)
    } catch (error) {
      console.error('Emergency stop failed:', error)
    } finally {
      setActionInProgress(null)
    }
  }

  const getStatusColor = (status: BotProfile['status']) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-500/20'
      case 'INACTIVE': return 'text-gray-400 bg-gray-500/20'
      case 'MANUAL': return 'text-yellow-400 bg-yellow-500/20'
      case 'SCHEDULED': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getReputationColor = (reputation: BotProfile['reputation']) => {
    switch (reputation) {
      case 'Legend': return 'text-purple-400'
      case 'Expert': return 'text-blue-400'
      case 'Veteran': return 'text-green-400'
      case 'Rising Star': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AlphaRise Admin Dashboard</h1>
        <p className="text-gray-400">Bot Management & Community Control</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-bold text-blue-400">{stats.total}</div>
          <div className="text-sm text-gray-400">Total Bots</div>
        </motion.div>

        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="text-2xl font-bold text-green-400">{stats.byStatus.active}</div>
          <div className="text-sm text-gray-400">Active Bots</div>
        </motion.div>

        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="text-2xl font-bold text-yellow-400">{stats.totalCoins.toLocaleString()}</div>
          <div className="text-sm text-gray-400">Total Coins</div>
        </motion.div>

        <motion.div 
          className="bg-white/5 border border-white/10 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="text-2xl font-bold text-purple-400">{stats.averageResponseRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-400">Avg Response Rate</div>
        </motion.div>
      </div>

      {/* Emergency Controls */}
      <div className="mb-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-4">🚨 Emergency Controls</h3>
          <div className="flex gap-4">
            <button
              onClick={handleEmergencyStop}
              disabled={actionInProgress === 'emergency'}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg font-semibold transition-colors"
            >
              {actionInProgress === 'emergency' ? 'Stopping...' : '❌ Emergency Stop All Bots'}
            </button>
            
            <button
              onClick={() => alert('Global settings feature coming soon!')}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
            >
              ⚙️ Global Settings
            </button>
            
            <button
              onClick={() => alert('OpenAI integration coming soon!')}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
            >
              🤖 Connect AI
            </button>
          </div>
      )}
    </div>
  )
}
        </div>
      </div>

      {/* Bot Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        {bots.map((bot, index) => (
          <motion.div
            key={bot.id}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Bot Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-semibold">{bot.username}</h3>
                  <p className="text-sm text-gray-400">{bot.realName}</p>
                </div>
              </div>
              
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(bot.status)}`}>
                {bot.status}
              </div>
            </div>

            {/* Bot Info */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Reputation:</span>
                <span className={getReputationColor(bot.reputation)}>{bot.reputation}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Coins:</span>
                <span className="text-yellow-400">{bot.coinBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Posts/Day:</span>
                <span>{bot.postsPerDay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Response Rate:</span>
                <span>{bot.responseRate}%</span>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {bot.expertise.slice(0, 3).map((skill) => (
                <span key={skill} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                  {skill}
                </span>
              ))}
              {bot.expertise.length > 3 && (
                <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded">
                  +{bot.expertise.length - 3} more
                </span>
              )}
            </div>

            {/* Controls */}
            <div className="space-y-2">
              <div className="flex gap-2">
                {bot.status === 'INACTIVE' && (
                  <button
                    onClick={() => handleBotStatusChange(bot.id, 'ACTIVE')}
                    disabled={actionInProgress === bot.id}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {actionInProgress === bot.id ? 'Activating...' : '▶️ Activate'}
                  </button>
                )}
                
                {bot.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleBotStatusChange(bot.id, 'INACTIVE')}
                    disabled={actionInProgress === bot.id}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                  >
                    {actionInProgress === bot.id ? 'Stopping...' : '⏸️ Stop'}
                  </button>
                )}
                
                <button
                  onClick={() => handleBotStatusChange(bot.id, 'MANUAL')}
                  disabled={actionInProgress === bot.id}
                  className="flex-1 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
                >
                  🎮 Manual
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedBot(bot)
                    setShowBotDetails(true)
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  ⚙️ Settings
                </button>
                
                <button
                  onClick={() => alert(`Simulating post from ${bot.username}...`)}
                  className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
                >
                  🧪 Test Post
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">📋 Recent Activity</h2>
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          {statusHistory.length > 0 ? (
            <div className="space-y-3">
              {statusHistory.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(activity.newStatus).split(' ')[1]}`}></div>
                    <span className="font-medium">
                      {activity.botId === 'ALL' ? 'All Bots' : bots.find(b => b.id === activity.botId)?.username || activity.botId}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className={getStatusColor(activity.newStatus).split(' ')[0]}>
                      {activity.newStatus}
                    </span>
                    {activity.reason && (
                      <span className="text-xs text-red-400">({activity.reason})</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    by {activity.updatedBy} • {new Date(activity.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              No recent activity
            </div>
          )}
        </div>
      </div>

      {/* Bot Details Modal */}
      {showBotDetails && selectedBot && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            className="bg-gray-900 border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">{selectedBot.username}</h2>
                <p className="text-gray-400">{selectedBot.realName} • {selectedBot.age} years old</p>
              </div>
              <button
                onClick={() => setShowBotDetails(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">📍 Basic Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span>{selectedBot.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined:</span>
                      <span>{selectedBot.joinedDays} days ago</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={getStatusColor(selectedBot.status)}>{selectedBot.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Reputation:</span>
                      <span className={getReputationColor(selectedBot.reputation)}>{selectedBot.reputation}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">🎯 Expertise</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBot.expertise.map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">⚙️ Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Posts per Day</label>
                      <input 
                        type="number" 
                        value={selectedBot.postsPerDay} 
                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                        onChange={(e) => {
                          setSelectedBot({...selectedBot, postsPerDay: parseInt(e.target.value)})
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Response Rate (%)</label>
                      <input 
                        type="number" 
                        value={selectedBot.responseRate} 
                        max="100"
                        className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                        onChange={(e) => {
                          setSelectedBot({...selectedBot, responseRate: parseInt(e.target.value)})
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">📖 Background</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedBot.background}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">💭 Bio</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedBot.bio}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">🎭 Personality</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedBot.personality}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">📝 Response Style</h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedBot.responseStyle}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">🤖 Human Behavior</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Typo Frequency:</span>
                      <span>{selectedBot.humanBehavior.typoFrequency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Casual Grammar:</span>
                      <span>{selectedBot.humanBehavior.casualGrammar ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Emotional Responses:</span>
                      <span>{selectedBot.humanBehavior.emotionalResponses ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Personal References:</span>
                      <span>{selectedBot.humanBehavior.personalReferences ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  // Update the bot in the main list
                  setBots(prevBots => 
                    prevBots.map(bot => 
                      bot.id === selectedBot.id ? selectedBot : bot
                    )
                  )
                  alert('Settings saved successfully!')
                  setShowBotDetails(false)
                }}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
              >
                💾 Save Changes
              </button>
              
              <button
                onClick={() => alert(`Generating test post for ${selectedBot.username}...`)}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
              >
                🧪 Test AI Response
              </button>
              
              <button
                onClick={() => alert('AI Prompt editor coming soon!')}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
              >
                🎯 Edit AI Prompt
              </button>
              
              <button
                onClick={() => setShowBotDetails(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
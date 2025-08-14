'use client'

import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'

function CommunityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [avatarType, setAvatarType] = useState('marcus')
  const [userName, setUserName] = useState('Future Alpha')
  const [activeTab, setActiveTab] = useState('all')
  const [coins, setCoins] = useState(200)
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionBody, setNewQuestionBody] = useState('')

  // Real problem-based communities
  const communities = [
    // Performance & Physical
    { 
      id: 'premature-ejaculation', 
      name: 'Premature Ejaculation Solutions', 
      icon: '🕐', 
      count: 23,
      description: 'Proven techniques to last longer and build confidence',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'lasting-longer', 
      name: 'Lasting Longer in Bed', 
      icon: '⏱️', 
      count: 18,
      description: 'Performance tips and stamina building',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'first-time', 
      name: 'First Time & Virgin Questions', 
      icon: '🆕', 
      count: 31,
      description: 'From zero to experience - all the basics',
      color: 'from-purple-500 to-purple-600'
    },
    
    // Mental & Confidence
    { 
      id: 'approach-anxiety', 
      name: 'Approach Anxiety & Rejection', 
      icon: '😰', 
      count: 27,
      description: 'Overcome fear of approaching women',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 'social-anxiety', 
      name: 'Social Anxiety in Dating', 
      icon: '👥', 
      count: 22,
      description: 'Master conversations and social skills',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'confidence-building', 
      name: 'Confidence Building', 
      icon: '💪', 
      count: 34,
      description: 'Build unshakeable self-esteem and presence',
      color: 'from-orange-500 to-orange-600'
    },
    
    // Relationships & Connection
    { 
      id: 'getting-her-back', 
      name: 'Getting Her Back', 
      icon: '💔', 
      count: 19,
      description: 'Ex relationships and reconciliation strategies',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      id: 'dating-apps', 
      name: 'Dating App Success', 
      icon: '📱', 
      count: 25,
      description: 'Tinder, Bumble profiles and conversations',
      color: 'from-cyan-500 to-cyan-600'
    },
    { 
      id: 'real-connections', 
      name: 'Building Real Connections', 
      icon: '❤️', 
      count: 16,
      description: 'Emotional intimacy and meaningful relationships',
      color: 'from-rose-500 to-rose-600'
    },
    
    // Specific Situations
    { 
      id: 'workplace-confidence', 
      name: 'Workplace & Professional Confidence', 
      icon: '👔', 
      count: 14,
      description: 'Career success and leadership presence',
      color: 'from-gray-500 to-gray-600'
    },
    { 
      id: 'age-gap', 
      name: 'Age Gap Relationships', 
      icon: '📅', 
      count: 12,
      description: 'Navigate younger/older women dynamics',
      color: 'from-indigo-500 to-indigo-600'
    },
    { 
      id: 'long-distance', 
      name: 'Long Distance Relationships', 
      icon: '✈️', 
      count: 9,
      description: 'Maintain connection across distance',
      color: 'from-sky-500 to-sky-600'
    },
    
    // Advanced & Lifestyle
    { 
      id: 'alpha-lifestyle', 
      name: 'Alpha Lifestyle & Habits', 
      icon: '👑', 
      count: 21,
      description: 'Daily routines for success and discipline',
      color: 'from-amber-500 to-amber-600'
    },
    { 
      id: 'sexual-techniques', 
      name: 'Sexual Techniques & Pleasure', 
      icon: '🔥', 
      count: 17,
      description: 'Advanced intimacy and satisfaction skills',
      color: 'from-red-600 to-red-700'
    },
    { 
      id: 'multiple-dating', 
      name: 'Multiple Dating & Options', 
      icon: '🎲', 
      count: 11,
      description: 'Managing multiple relationships ethically',
      color: 'from-violet-500 to-violet-600'
    }
  ]

  // Add "All Communities" option
  const allCommunities = [
    { 
      id: 'all', 
      name: 'All Communities', 
      icon: '🌟', 
      count: communities.reduce((sum, c) => sum + c.count, 0),
      description: 'Real problems, real solutions from men who\'ve been there',
      color: 'from-red-500 to-red-600'
    },
    ...communities
  ]

  // Mock questions updated for real problems
  const mockQuestions = [
    {
      id: 1,
      title: "I finish in under 2 minutes - need practical solutions",
      body: "I've tried breathing techniques but nothing seems to work. My girlfriend is understanding but I can see she's frustrated. What actually works?",
      author: "StrugglingGuy_25",
      authorAvatar: "premature-ejaculation",
      category: "premature-ejaculation",
      coins: 8,
      timeAgo: "2h ago",
      replies: 12,
      lastReply: "30min ago",
      isAnswered: true,
      topAnswer: {
        author: "ExpertCoach_Dan",
        text: "The stop-start technique combined with kegel exercises changed my life. Start with 3-second holds and build up to 10 seconds...",
        coins: 15,
        rating: 5
      }
    },
    {
      id: 2,
      title: "How do I approach women without my heart racing?",
      body: "Every time I see an attractive woman I want to talk to, my heart starts pounding and I freeze up. How do you guys overcome this?",
      author: "NervousNate",
      authorAvatar: "approach-anxiety",
      category: "approach-anxiety",
      coins: 5,
      timeAgo: "4h ago",
      replies: 18,
      lastReply: "1h ago",
      isAnswered: true,
      topAnswer: {
        author: "ConfidentKing",
        text: "Start with low-stakes interactions. Ask for directions, compliment something non-physical. Build your comfort level gradually...",
        coins: 12,
        rating: 5
      }
    },
    {
      id: 3,
      title: "Complete virgin at 24 - where do I even start?",
      body: "Never been with a woman. I'm embarrassed and don't know the basics. How do I gain experience without making it obvious I'm inexperienced?",
      author: "LateStarter_24",
      authorAvatar: "first-time",
      category: "first-time",
      coins: 3,
      timeAgo: "6h ago",
      replies: 24,
      lastReply: "2h ago",
      isAnswered: true,
      topAnswer: {
        author: "BeenThereBro",
        text: "Honesty is your superpower. Many women find it refreshing. Focus on learning her body and what she likes rather than performing...",
        coins: 10,
        rating: 4
      }
    },
    {
      id: 4,
      title: "My Tinder matches never respond - what am I doing wrong?",
      body: "I get matches but my opening messages get ignored. My profile seems decent. What are the best conversation starters that actually work?",
      author: "TinderStruggler",
      authorAvatar: "dating-apps",
      category: "dating-apps",
      coins: 4,
      timeAgo: "8h ago",
      replies: 15,
      lastReply: "3h ago",
      isAnswered: true,
      topAnswer: {
        author: "AppMaster_Mike",
        text: "Generic 'hey' messages are death. Comment on something specific in her photos or bio. Ask engaging questions that require more than yes/no...",
        coins: 8,
        rating: 4
      }
    },
    {
      id: 5,
      title: "How to get my ex back after I messed up badly?",
      body: "I was jealous and controlling and she left me 3 months ago. I've been working on myself but she won't talk to me. Is there still hope?",
      author: "RegretfulGuy",
      authorAvatar: "getting-her-back",
      category: "getting-her-back",
      coins: 7,
      timeAgo: "1d ago",
      replies: 11,
      lastReply: "5h ago",
      isAnswered: false
    },
    {
      id: 6,
      title: "Best daily habits to build natural confidence?",
      body: "I want to develop unshakeable confidence from the inside out. What daily practices have made the biggest difference for you guys?",
      author: "BuildingMyself",
      authorAvatar: "confidence-building",
      category: "confidence-building",
      coins: 6,
      timeAgo: "1d ago",
      replies: 19,
      lastReply: "4h ago",
      isAnswered: true,
      topAnswer: {
        author: "AlphaHabits",
        text: "Cold showers, gym, meditation, and approaching 3 strangers daily. Small wins compound into massive confidence over time...",
        coins: 14,
        rating: 5
      }
    }
  ]

  // Get current community data
  const getCurrentCommunity = () => {
    if (activeTab === 'all') {
      return {
        name: 'All Communities',
        description: 'Real problems, real solutions from men who\'ve been there',
        icon: '🌟',
        color: 'from-red-500 to-red-600'
      }
    }
    return communities.find(c => c.id === activeTab) || {
      name: 'All Communities',
      description: 'Real problems, real solutions from men who\'ve been there',
      icon: '🌟',
      color: 'from-red-500 to-red-600'
    }
  }

  const currentCommunity = getCurrentCommunity()
  const filteredQuestions = activeTab === 'all' 
    ? mockQuestions 
    : mockQuestions.filter(q => q.category === activeTab)

  useEffect(() => {
    const avatar = searchParams.get('avatar') || 'marcus'
    const name = searchParams.get('name') || 'Future Alpha'
    setAvatarType(avatar)
    setUserName(name)
  }, [searchParams])

  const handleAskQuestion = () => {
    if (!newQuestionTitle.trim() || !newQuestionBody.trim()) return
    
    // In real app: submit to API
    console.log('New question:', { title: newQuestionTitle, body: newQuestionBody, cost: 2 })
    setCoins(prev => prev - 2)
    setNewQuestionTitle('')
    setNewQuestionBody('')
    setShowNewQuestion(false)
    
    // Show success message
    alert('Question posted! The community will help you soon. (-2 coins)')
  }

  const handleAnswerQuestion = (questionId: number) => {
    alert('Answer feature coming soon! (+5-10 coins for helpful answers)')
  }

  const goToDashboard = () => {
    router.push(`/dashboard?avatar=${avatarType}&name=${encodeURIComponent(userName)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-4 lg:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={goToDashboard}
              className="text-xl lg:text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              title="Back to Dashboard"
            >
              AlphaRise
            </button>
            <span className="text-white/40 hidden lg:inline">•</span>
            <span className="text-base lg:text-lg font-semibold hidden lg:inline">Community</span>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 ml-6">
              <button 
                onClick={goToDashboard}
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                Dashboard
              </button>
              <button 
                className="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 rounded-lg"
              >
                Community
              </button>
              <button 
                onClick={() => alert('Profile coming soon!')}
                className="px-3 py-1.5 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
              >
                Profile
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold">
              <span>🪙</span>
              <span>{coins}</span>
            </div>
            <div className="text-sm opacity-70 hidden lg:block">Hey {userName}!</div>
          </div>
        </div>
        
        {/* Mobile Welcome Message */}
        <div className="lg:hidden mt-3">
          <div className="text-center py-2">
            <span className="text-lg font-bold text-white">Hey {userName}!</span>
            <p className="text-sm opacity-70 mt-1">Welcome to the brotherhood</p>
          </div>
        </div>
      </header>

      {/* Mobile Back Button */}
      <div className="lg:hidden fixed bottom-6 left-6 z-40">
        <motion.button
          onClick={goToDashboard}
          className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Back to Dashboard"
        >
          <span className="text-lg">←</span>
        </motion.button>
      </div>

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Mobile Category Tabs */}
        <div className="lg:hidden mb-6">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {allCommunities.map((community) => (
              <motion.button
                key={community.id}
                onClick={() => setActiveTab(community.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                  activeTab === community.id 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                    : 'bg-white/10 text-white/70'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{community.icon}</span>
                  <span className="whitespace-nowrap">{community.name}</span>
                  <span className="text-xs opacity-60">({community.count})</span>
                </div>
              </motion.button>
            ))}
          </div>
          
          {/* Mobile Ask Question Button */}
          <motion.button
            onClick={() => setShowNewQuestion(true)}
            className="w-full mt-4 p-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold"
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 justify-center">
              <span>❓</span>
              <span>Ask Question (-2 🪙)</span>
            </div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          
          {/* Desktop Sidebar - Categories */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sticky top-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-bold mb-6">Communities</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {allCommunities.map((community) => (
                  <motion.button
                    key={community.id}
                    onClick={() => setActiveTab(community.id)}
                    className={`w-full p-3 rounded-lg transition-all duration-300 text-left flex items-center justify-between ${
                      activeTab === community.id 
                        ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                    }`}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{community.icon}</span>
                      <div>
                        <div className="font-semibold text-xs leading-tight">{community.name}</div>
                        {community.description && (
                          <div className="text-xs opacity-60 mt-1">{community.description}</div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs opacity-60 flex-shrink-0">{community.count}</span>
                  </motion.button>
                ))}
              </div>

              {/* Desktop Ask Question Button */}
              <motion.button
                onClick={() => setShowNewQuestion(true)}
                className="w-full mt-6 p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold transition-all duration-300 hover:from-red-700 hover:to-red-800"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-2 justify-center">
                  <span>❓</span>
                  <span>Ask Question (-2 🪙)</span>
                </div>
              </motion.button>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Community Header */}
            <motion.div 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 lg:p-6 mb-6 lg:mb-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center gap-3 lg:gap-4 mb-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br ${currentCommunity.color} flex items-center justify-center text-xl lg:text-2xl`}>
                  {currentCommunity.icon}
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold">
                    {currentCommunity.name}
                  </h1>
                  <p className="text-sm lg:text-base opacity-70">
                    {currentCommunity.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 lg:gap-4 text-center">
                <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                  <div className="text-xl lg:text-2xl font-bold text-blue-400">{filteredQuestions.length}</div>
                  <div className="text-xs opacity-70">Questions</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                  <div className="text-xl lg:text-2xl font-bold text-green-400">
                    {filteredQuestions.reduce((sum, q) => sum + q.replies, 0)}
                  </div>
                  <div className="text-xs opacity-70">Answers</div>
                </div>
                <div className="bg-white/10 rounded-lg p-2 lg:p-3">
                  <div className="text-xl lg:text-2xl font-bold text-yellow-400">
                    {filteredQuestions.filter(q => q.isAnswered).length}
                  </div>
                  <div className="text-xs opacity-70">Solved</div>
                </div>
              </div>
            </motion.div>

            {/* Questions List */}
            <div className="space-y-4 lg:space-y-6">
              {filteredQuestions.map((question, index) => (
                <motion.div
                  key={question.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl lg:rounded-2xl p-4 lg:p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    {/* Avatar */}
                    <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br ${communities.find(c => c.id === question.authorAvatar)?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-base lg:text-lg flex-shrink-0`}>
                      {communities.find(c => c.id === question.authorAvatar)?.icon || '👤'}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-2 lg:mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base lg:text-lg font-bold mb-1 leading-tight pr-2">{question.title}</h3>
                          <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm opacity-70 flex-wrap">
                            <span className="font-semibold text-blue-400">{question.author}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{question.timeAgo}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="flex items-center gap-1">
                              <span>🪙</span>
                              <span>{question.coins}</span>
                            </span>
                          </div>
                        </div>
                        {question.isAnswered && (
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold ml-2 flex-shrink-0">
                            ✓ Solved
                          </div>
                        )}
                      </div>

                      {/* Question Body */}
                      <p className="text-sm lg:text-base opacity-90 mb-3 lg:mb-4 leading-relaxed">{question.body}</p>

                      {/* Top Answer Preview */}
                      {question.topAnswer && (
                        <div className="bg-white/10 rounded-lg p-3 lg:p-4 mb-3 lg:mb-4">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-green-400 font-semibold text-xs lg:text-sm">🏆 Top Answer</span>
                            <span className="text-xs opacity-70">by {question.topAnswer.author}</span>
                            <div className="flex items-center gap-1 ml-auto">
                              {[...Array(question.topAnswer.rating)].map((_, i) => (
                                <span key={i} className="text-yellow-400 text-sm">⭐</span>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs lg:text-sm opacity-90 leading-relaxed">{question.topAnswer.text}</p>
                          <div className="text-xs text-yellow-400 mt-2">+{question.topAnswer.coins} coins earned</div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 lg:gap-4 text-xs lg:text-sm">
                        <button 
                          onClick={() => handleAnswerQuestion(question.id)}
                          className="flex items-center gap-1 lg:gap-2 font-semibold text-green-400 hover:text-green-300 transition-colors"
                        >
                          <span>💡</span>
                          <span className="hidden sm:inline">Answer (+5-10 🪙)</span>
                          <span className="sm:hidden">Answer</span>
                        </button>
                        <div className="opacity-60">
                          <span className="hidden sm:inline">{question.replies} replies • Last reply {question.lastReply}</span>
                          <span className="sm:hidden">{question.replies} replies</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* New Question Modal */}
      {showNewQuestion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 lg:p-6">
          <motion.div 
            className="bg-gray-900 border border-white/20 rounded-2xl p-6 lg:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6">Ask Your Question</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Question Title</label>
                <input 
                  type="text"
                  placeholder="How do I..."
                  value={newQuestionTitle}
                  onChange={(e) => setNewQuestionTitle(e.target.value)}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors text-sm lg:text-base"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-red-400 mb-2">Details</label>
                <textarea 
                  placeholder="Describe your situation in detail..."
                  value={newQuestionBody}
                  onChange={(e) => setNewQuestionBody(e.target.value)}
                  rows={4}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors resize-none text-sm lg:text-base"
                />
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
              <div className="text-yellow-400 font-semibold text-sm mb-1">💰 Cost: 2 coins</div>
              <div className="text-xs opacity-70">Quality answers typically earn 5-10+ coins back</div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:gap-4">
              <button 
                onClick={() => setShowNewQuestion(false)}
                className="flex-1 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleAskQuestion}
                disabled={!newQuestionTitle.trim() || !newQuestionBody.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                Post Question (-2 🪙)
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold">Loading community...</h2>
        </div>
      </div>
    }>
      <CommunityContent />
    </Suspense>
  )
}
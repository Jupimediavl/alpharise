'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense } from 'react'
import { Search, Clock, Star, Award, ThumbsUp, MessageCircle, Filter } from 'lucide-react'
import { useAlphaRise, withUserAuth } from '@/lib/user-context'
import { coinEconomyManager } from '@/lib/coin-economy-system'
import { liveQAManager, qaHelpers, Question, Answer } from '@/lib/qa-system'

function CommunityContent() {
  const { user, avatar, navigation } = useAlphaRise()
  const [activeTab, setActiveTab] = useState('all')
  const [questions, setQuestions] = useState<Question[]>([])
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionBody, setNewQuestionBody] = useState('')
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState('regular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'urgent' | 'unsolved'>('newest')
  const [userCoins, setUserCoins] = useState(0)
  const [loading, setLoading] = useState(false)

  // Communities configuration
  const communities = [
    { 
      id: 'premature-ejaculation', 
      name: 'Premature Ejaculation Solutions', 
      icon: '🕐', 
      description: 'Proven techniques to last longer and build confidence',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'lasting-longer', 
      name: 'Lasting Longer in Bed', 
      icon: '⏱️', 
      description: 'Performance tips and stamina building',
      color: 'from-green-500 to-green-600'
    },
    { 
      id: 'first-time', 
      name: 'First Time & Virgin Questions', 
      icon: '🆕', 
      description: 'From zero to experience - all the basics',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'approach-anxiety', 
      name: 'Approach Anxiety & Rejection', 
      icon: '😰', 
      description: 'Overcome fear of approaching women',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 'social-anxiety', 
      name: 'Social Anxiety in Dating', 
      icon: '👥', 
      description: 'Master conversations and social skills',
      color: 'from-yellow-500 to-yellow-600'
    },
    { 
      id: 'confidence-building', 
      name: 'Confidence Building', 
      icon: '💪', 
      description: 'Build unshakeable self-esteem and presence',
      color: 'from-orange-500 to-orange-600'
    },
    { 
      id: 'dating-apps', 
      name: 'Dating App Success', 
      icon: '📱', 
      description: 'Tinder, Bumble profiles and conversations',
      color: 'from-cyan-500 to-cyan-600'
    },
    { 
      id: 'real-connections', 
      name: 'Building Real Connections', 
      icon: '❤️', 
      description: 'Emotional intimacy and meaningful relationships',
      color: 'from-rose-500 to-rose-600'
    }
  ]

  const allCommunities = [
    { 
      id: 'all', 
      name: 'All Communities', 
      icon: '⭐', 
      description: 'Real problems, real solutions from men who\'ve been there',
      color: 'from-red-500 to-red-600'
    },
    ...communities
  ]

  const questionTypes = [
    { id: 'regular', name: 'Regular Question', cost: 2, description: 'Standard community question', icon: '❓' },
    { id: 'urgent', name: 'Urgent Question', cost: 5, description: 'Guaranteed response in 6 hours', icon: '🚨' },
    { id: 'private', name: 'Private Question', cost: 8, description: 'Only experts can see and answer', icon: '🔒' },
    { id: 'vip', name: 'VIP Question', cost: 15, description: 'Direct answer from avatar coaches', icon: '👑' },
  ]

  // Initialize data
  useEffect(() => {
    loadQuestions()
    if (user) {
      setUserCoins(user.coins)
    }
  }, [activeTab, sortBy, user])

  // Load questions based on current filters
  const loadQuestions = () => {
    setLoading(true)
    
    const filters: any = {
      category: activeTab === 'all' ? undefined : activeTab,
      limit: 20,
      sortBy: sortBy === 'unsolved' ? 'newest' : sortBy
    }

    if (sortBy === 'unsolved') {
      filters.isAnswered = false
    }

    let loadedQuestions = qaHelpers.getQuestions(filters)

    // Apply search if query exists
    if (searchQuery.trim()) {
      loadedQuestions = qaHelpers.searchQuestions(searchQuery, activeTab === 'all' ? undefined : activeTab)
    }

    setQuestions(loadedQuestions)
    setLoading(false)
  }

  // Handle asking new question
  const handleAskQuestion = async () => {
    if (!user || !newQuestionTitle.trim() || !newQuestionBody.trim()) return

    const questionType = questionTypes.find(qt => qt.id === selectedQuestionType)
    if (!questionType) return

    if (userCoins < questionType.cost) {
      alert(`Insufficient coins! You need ${questionType.cost} coins but only have ${userCoins}. Answer questions to earn more coins.`)
      return
    }

    setLoading(true)

    try {
      // Deduct coins first
      coinEconomyManager.askQuestion(user.userName || 'user', selectedQuestionType)
      setUserCoins(prev => prev - questionType.cost)

      // Create question
      const newQuestion = qaHelpers.askQuestion({
        title: newQuestionTitle,
        body: newQuestionBody,
        authorId: user.userName || 'user',
        authorName: user.userName || 'Anonymous',
        category: activeTab === 'all' ? 'confidence-building' : activeTab,
        questionType: selectedQuestionType,
        tags: []
      })

      // Reset form
      setNewQuestionTitle('')
      setNewQuestionBody('')
      setSelectedQuestionType('regular')
      setShowNewQuestion(false)

      // Reload questions
      loadQuestions()

      alert(`Question posted successfully! Cost: ${questionType.cost} coins. You now have ${userCoins - questionType.cost} coins remaining.`)
      
    } catch (error) {
      alert('Error posting question. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle answering question
  const handleAnswerQuestion = async () => {
    if (!user || !selectedQuestion || !newAnswerContent.trim()) return

    setLoading(true)

    try {
      const newAnswer = qaHelpers.answerQuestion({
        questionId: selectedQuestion.id,
        authorId: user.userName || 'user',
        authorName: user.userName || 'Anonymous',
        content: newAnswerContent
      })

      if (newAnswer) {
        // Reset form
        setNewAnswerContent('')
        setShowAnswerModal(false)
        setSelectedQuestion(null)

        // Reload questions to show new answer
        loadQuestions()

        alert('Answer submitted successfully! You\'ll earn coins when it gets rated by the community.')
      }
      
    } catch (error) {
      alert('Error submitting answer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle rating an answer
  const handleRateAnswer = async (answerId: string, rating: number) => {
    if (!user) return

    try {
      const result = qaHelpers.rateAnswer(answerId, rating, user.userName || 'user')
      
      if (result.coinEarnings > 0) {
        // Find the answer to get author info
        const answer = questions
          .flatMap(q => q.answers)
          .find(a => a.id === answerId);
        
        if (answer) {
          // Reward the answer author with coins
          coinEconomyManager.rewardAnswer(
            answer.authorId,
            selectedQuestion?.id || '',
            rating,
            false
          );
        }
        
        loadQuestions(); // Reload to show updated ratings
        alert(`Rating submitted! The answer author earned ${result.coinEarnings} coins.`);
      }
      
    } catch (error) {
      alert('Error submitting rating. Please try again.')
    }
  }

  // Handle marking best answer
  const handleMarkBestAnswer = async (questionId: string, answerId: string): Promise<void> => {
    if (!user) return

    try {
      const success = qaHelpers.markBestAnswer(questionId, answerId, user.userName || 'user')
      
      if (success) {
        loadQuestions(); // Reload to show best answer
        alert('Best answer marked! The author received bonus coins.');
      } else {
        alert('Only the question author can mark the best answer.');
      }
      
    } catch (error) {
      alert('Error marking best answer. Please try again.');
    }
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  // Get current community
  const getCurrentCommunity = () => {
    return activeTab === 'all' 
      ? allCommunities[0]
      : communities.find(c => c.id === activeTab) || allCommunities[0]
  }

  const currentCommunity = getCurrentCommunity()

  if (!user || !avatar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold">Loading community...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="p-4 lg:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={navigation.goToDashboard}
              className="text-xl lg:text-2xl font-black bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              AlphaRise
            </button>
            <span className="text-white/40 hidden lg:inline">•</span>
            <span className="text-base lg:text-lg font-semibold hidden lg:inline">Live Q&A Community</span>
          </div>
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold">
              <span>🪙</span>
              <span>{userCoins}</span>
            </div>
            <div className="text-sm opacity-70 hidden lg:block">Hey {user.userName || 'Alpha'}!</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadQuestions()}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none"
              />
            </div>

            {/* Sort Filter */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-red-500 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
                <option value="urgent">Urgent First</option>
                <option value="unsolved">Unsolved Only</option>
              </select>

              <button
                onClick={() => setShowNewQuestion(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all"
              >
                Ask Question
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {allCommunities.map((community) => (
              <button
                key={community.id}
                onClick={() => setActiveTab(community.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === community.id 
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{community.icon}</span>
                  <span className="whitespace-nowrap">{community.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{questions.length}</div>
            <div className="text-sm opacity-70">Questions</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {questions.reduce((sum, q) => sum + q.answers.length, 0)}
            </div>
            <div className="text-sm opacity-70">Answers</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {questions.filter(q => q.isSolved).length}
            </div>
            <div className="text-sm opacity-70">Solved</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {questions.filter(q => q.questionType === 'urgent').length}
            </div>
            <div className="text-sm opacity-70">Urgent</div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg">Loading questions...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤔</div>
              <div className="text-lg mb-2">No questions found</div>
              <div className="text-sm opacity-70">Be the first to ask a question in this category!</div>
            </div>
          ) : (
            questions.map((question, index) => (
              <motion.div
                key={question.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                {/* Question Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{question.title}</h3>
                      {question.isSolved && (
                        <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                          ✓ Solved
                        </div>
                      )}
                      {question.questionType !== 'regular' && (
                        <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
                          {questionTypes.find(qt => qt.id === question.questionType)?.name}
                        </div>
                      )}
                      {question.urgentDeadline && question.urgentDeadline > new Date() && (
                        <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Urgent</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm opacity-70 mb-3">
                      <span className="font-semibold text-blue-400">{question.authorName}</span>
                      <span>•</span>
                      <span>{formatTimeAgo(question.timestamp)}</span>
                      <span>•</span>
                      <span>{question.views} views</span>
                      {question.coinBounty > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400">🪙 {question.coinBounty} bounty</span>
                        </>
                      )}
                    </div>
                    
                    <p className="text-base opacity-90 leading-relaxed">{question.body}</p>
                  </div>
                </div>

                {/* Answers Section */}
                {question.answers.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="text-sm font-semibold text-gray-300">
                      {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                    </div>
                    
                    {question.answers
                      .sort((a, b) => {
                        if (a.isBestAnswer) return -1;
                        if (b.isBestAnswer) return 1;
                        return b.rating - a.rating;
                      })
                      .slice(0, 2) // Show top 2 answers
                      .map((answer) => (
                        <div
                          key={answer.id}
                          className={`p-4 rounded-lg ${
                            answer.isBestAnswer ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-blue-400">{answer.authorName}</span>
                              {answer.isBestAnswer && (
                                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  <span>Best Answer</span>
                                </div>
                              )}
                              <span className="text-xs opacity-70">{formatTimeAgo(answer.timestamp)}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {answer.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                  <span className="text-sm">{answer.rating.toFixed(1)}</span>
                                </div>
                              )}
                              {answer.votes > 0 && (
                                <div className="flex items-center gap-1">
                                  <ThumbsUp className="h-4 w-4 text-blue-400" />
                                  <span className="text-sm">{answer.votes}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm leading-relaxed mb-3">{answer.content}</p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {!answer.ratedBy.includes(user.userName || 'user') && answer.authorId !== (user.userName || 'user') && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs opacity-70">Rate:</span>
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                      key={rating}
                                      onClick={() => handleRateAnswer(answer.id, rating)}
                                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                                    >
                                      <Star className="h-4 w-4" />
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {question.authorId === (user.userName || 'user') && !question.bestAnswerId && (
                                <button
                                  onClick={() => handleMarkBestAnswer(question.id, answer.id)}
                                  className="text-green-400 hover:text-green-300 text-xs font-semibold transition-colors"
                                >
                                  Mark as Best Answer
                                </button>
                              )}
                            </div>
                            
                            {answer.coinEarnings > 0 && (
                              <div className="text-yellow-400 text-xs font-semibold">
                                +{answer.coinEarnings} 🪙 earned
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    
                    {question.answers.length > 2 && (
                      <button className="text-blue-400 hover:text-blue-300 text-sm font-semibold">
                        View all {question.answers.length} answers
                      </button>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => {
                      setSelectedQuestion(question)
                      setShowAnswerModal(true)
                    }}
                    className="flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Answer (+3-12 🪙)</span>
                  </button>
                  
                  <div className="text-sm opacity-60">
                    {question.answers.length} answers • Last activity {formatTimeAgo(question.lastActivity)}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* New Question Modal */}
      <AnimatePresence>
        {showNewQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-2xl font-bold mb-6">Ask Your Question</h3>
              
              {/* Question Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-red-400 mb-3">Question Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedQuestionType(type.id)}
                      disabled={userCoins < type.cost}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedQuestionType === type.id
                          ? 'border-red-500 bg-red-500/20'
                          : userCoins >= type.cost
                          ? 'border-white/20 bg-white/5 hover:border-red-500/50'
                          : 'border-gray-600 bg-gray-800 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <span className="font-semibold">{type.name}</span>
                        </div>
                        <div className={`flex items-center gap-1 font-bold ${
                          userCoins >= type.cost ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                          <span>🪙</span>
                          <span>{type.cost}</span>
                        </div>
                      </div>
                      <div className="text-sm opacity-70">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">Question Title</label>
                  <input 
                    type="text"
                    placeholder="How do I..."
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-red-400 mb-2">Details</label>
                  <textarea 
                    placeholder="Describe your situation in detail..."
                    value={newQuestionBody}
                    onChange={(e) => setNewQuestionBody(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowNewQuestion(false)}
                  className="flex-1 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAskQuestion}
                  disabled={!newQuestionTitle.trim() || !newQuestionBody.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold disabled:opacity-50 transition-all"
                >
                  {loading ? 'Posting...' : `Post Question (-${questionTypes.find(qt => qt.id === selectedQuestionType)?.cost || 2} 🪙)`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Answer Modal */}
      <AnimatePresence>
        {showAnswerModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-2xl font-bold mb-4">Answer Question</h3>
              
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">{selectedQuestion.title}</h4>
                <p className="text-sm opacity-70">{selectedQuestion.body}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-red-400 mb-2">Your Answer</label>
                <textarea 
                  placeholder="Share your experience and advice..."
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:border-red-500 focus:outline-none transition-colors resize-none"
                />
                <div className="text-xs opacity-60 mt-2">
                  Helpful answers earn 3-12 coins based on community ratings
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowAnswerModal(false)
                    setSelectedQuestion(null)
                    setNewAnswerContent('')
                  }}
                  className="flex-1 py-3 border border-white/20 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAnswerQuestion}
                  disabled={!newAnswerContent.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-semibold disabled:opacity-50 transition-all"
                >
                  {loading ? 'Submitting...' : 'Submit Answer'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CommunityPage() {
  const CommunityWithAuth = withUserAuth(CommunityContent);
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-bold">Loading community...</h2>
        </div>
      </div>
    }>
      <CommunityWithAuth />
    </Suspense>
  )
}
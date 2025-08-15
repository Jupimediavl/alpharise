// Enhanced Community page.tsx with Load More answers and Smart Sorting

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense, useRef } from 'react'
import { Search, Clock, Star, Award, ThumbsUp, MessageCircle, RefreshCw, Coins, ChevronDown, ChevronUp } from 'lucide-react'
import { useAlphaRise, withUserAuth } from '@/lib/user-context'
import { 
  SupabaseQuestionManager, 
  SupabaseAnswerManager, 
  SupabaseCoinManager, 
  SupabaseUserManager,
  supabaseHelpers 
} from '@/lib/supabase'
import DynamicRating from '@/components/DynamicRating'

interface QuestionWithAnswers {
  id: string
  title: string
  body: string
  author_id: string
  author_name: string
  category: string
  question_type: 'regular' | 'urgent' | 'private' | 'vip'
  coin_cost: number
  coin_bounty: number
  views: number
  is_answered: boolean
  is_solved: boolean
  best_answer_id?: string
  created_at: string
  last_activity: string
  answers: Array<{
    id: string
    author_id: string
    author_name: string
    content: string
    rating: number
    rated_by: string[]
    coin_earnings: number
    is_best_answer: boolean
    votes: number
    voted_by: string[]
    created_at: string
  }>
}

// Answer sorting types
type AnswerSortType = 'best-first' | 'newest-first' | 'most-helpful'

function CommunityContent() {
  const { user, avatar, navigation, updateUser } = useAlphaRise()
  const [activeTab, setActiveTab] = useState('all')
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])
  const [showNewQuestion, setShowNewQuestion] = useState(false)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithAnswers | null>(null)
  const [newQuestionTitle, setNewQuestionTitle] = useState('')
  const [newQuestionBody, setNewQuestionBody] = useState('')
  const [newAnswerContent, setNewAnswerContent] = useState('')
  const [selectedQuestionType, setSelectedQuestionType] = useState('regular')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'urgent' | 'unsolved'>('newest')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null)

  // Answer display management
  const [visibleAnswersCount, setVisibleAnswersCount] = useState<Record<string, number>>({})
  const [answerSortType, setAnswerSortType] = useState<AnswerSortType>('best-first')
  const INITIAL_ANSWERS_SHOW = 3
  const LOAD_MORE_INCREMENT = 5

  // Ref to maintain scroll position
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Communities configuration
  const communities = [
    { 
      id: 'premature-ejaculation', 
      name: 'Premature Ejaculation Solutions', 
      icon: '🕒', 
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

  // Smart Answer Sorting Function
  const sortAnswers = (answers: QuestionWithAnswers['answers'], sortType: AnswerSortType) => {
    return [...answers].sort((a, b) => {
      switch (sortType) {
        case 'best-first':
          // 1. Best answer always first
          if (a.is_best_answer && !b.is_best_answer) return -1
          if (b.is_best_answer && !a.is_best_answer) return 1
          
          // 2. Then by rating quality (higher is better)
          if (a.rating !== b.rating) return b.rating - a.rating
          
          // 3. If same rating, newest first
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

        case 'newest-first':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

        case 'most-helpful':
          // Sort by votes, then rating, then newest
          if (a.votes !== b.votes) return b.votes - a.votes
          if (a.rating !== b.rating) return b.rating - a.rating
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()

        default:
          return 0
      }
    })
  }

  // Initialize visible answers count for a question
  const initializeVisibleCount = (questionId: string, totalAnswers: number) => {
    if (!(questionId in visibleAnswersCount)) {
      setVisibleAnswersCount(prev => ({
        ...prev,
        [questionId]: Math.min(INITIAL_ANSWERS_SHOW, totalAnswers)
      }))
    }
  }

  // Load more answers for a specific question
  const loadMoreAnswers = (questionId: string, totalAnswers: number) => {
    setVisibleAnswersCount(prev => ({
      ...prev,
      [questionId]: Math.min((prev[questionId] || INITIAL_ANSWERS_SHOW) + LOAD_MORE_INCREMENT, totalAnswers)
    }))
  }

  // Show fewer answers for a specific question  
  const showFewerAnswers = (questionId: string) => {
    setVisibleAnswersCount(prev => ({
      ...prev,
      [questionId]: INITIAL_ANSWERS_SHOW
    }))
  }

  // Check if question should redirect to dedicated page
  const shouldRedirectToFullView = (answersCount: number) => {
    return answersCount >= 20
  }

  // Initialize user in database and load questions
  useEffect(() => {
    if (user?.userName) {
      initializeUserInDB()
      loadQuestions()
    }
  }, [user, activeTab, sortBy])

  // Initialize visible counts when questions load
  useEffect(() => {
    questions.forEach(question => {
      initializeVisibleCount(question.id, question.answers.length)
    })
  }, [questions])

  // Initialize user in Supabase
  const initializeUserInDB = async () => {
    if (!user?.userName) return

    try {
      console.log('🔄 Initializing user in DB:', {
        userName: user.userName,
        userEmail: user.userEmail,
        avatarType: user.avatarType
      })

      const dbUser = await supabaseHelpers.initializeUser(
        user.userName,
        user.userEmail || `${user.userName}@alpharise.com`,
        user.avatarType
      )

      if (dbUser) {
        setCurrentUserProfile(dbUser)
        console.log('✅ User initialized in DB:', dbUser)
      }
    } catch (error) {
      console.error('❌ Error initializing user:', error)
    }
  }

  // Sync user data after coin transactions
  const syncUserData = async () => {
    if (!user?.userName) return;
    
    try {
      const updatedUser = await SupabaseUserManager.getUserByUsername(user.userName);
      if (updatedUser) {
        updateUser({
          coins: updatedUser.coins,
          totalEarned: updatedUser.total_earned,
          monthlyEarnings: updatedUser.monthly_earnings,
          streak: updatedUser.streak,
          level: updatedUser.level
        });
        
        setCurrentUserProfile(updatedUser);
        
        console.log('✅ User data synced after transaction:', {
          username: user.userName,
          newCoins: updatedUser.coins,
          totalEarned: updatedUser.total_earned
        });
      }
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
    }
  };

  // Save scroll position before updates
  const saveScrollPosition = () => {
    if (containerRef.current) {
      setScrollPosition(containerRef.current.scrollTop)
    }
  }

  // Restore scroll position after updates
  const restoreScrollPosition = () => {
    setTimeout(() => {
      if (containerRef.current && scrollPosition > 0) {
        containerRef.current.scrollTop = scrollPosition
      }
    }, 100)
  }

  // Load questions from Supabase
  const loadQuestions = async () => {
    setLoading(true)
    
    try {
      let loadedQuestions: QuestionWithAnswers[] = []

      if (searchQuery.trim()) {
        const searchResults = await SupabaseQuestionManager.searchQuestions(
          searchQuery, 
          activeTab === 'all' ? undefined : activeTab
        )
        
        for (const question of searchResults) {
          const { answers } = await SupabaseQuestionManager.getQuestionWithAnswers(question.id)
          loadedQuestions.push({
            ...question,
            answers: answers || []
          })
        }
      } else {
        const filters: any = {
          category: activeTab === 'all' ? undefined : activeTab,
          limit: 20,
          sortBy: sortBy === 'unsolved' ? 'newest' : sortBy
        }

        if (sortBy === 'unsolved') {
          filters.is_answered = false
        }

        loadedQuestions = await supabaseHelpers.getQuestionsWithAnswers(filters)
      }

      setQuestions(loadedQuestions)
    } catch (error) {
      console.error('❌ Error loading questions:', error)
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  // Refresh questions
  const refreshQuestions = async () => {
    setRefreshing(true)
    saveScrollPosition()
    await loadQuestions()
    restoreScrollPosition()
    setRefreshing(false)
  }

  // Handle asking new question
  const handleAskQuestion = async () => {
    if (!user?.userName || !newQuestionTitle.trim() || !newQuestionBody.trim()) {
      console.log('❌ Missing required data for question')
      return;
    }

    const questionType = questionTypes.find(qt => qt.id === selectedQuestionType);
    if (!questionType) return;

    if ((user.coins || 0) < questionType.cost) {
      alert(`Insufficient AlphaCoins! You need ${questionType.cost} AlphaCoins but only have ${user.coins || 0}. Answer questions to earn more.`);
      return;
    }

    setLoading(true);

    try {
      const success = await SupabaseCoinManager.processQuestionPosting(
        user.userName,
        selectedQuestionType,
        questionType.cost
      );

      if (!success) {
        throw new Error('Failed to process AlphaCoin transaction');
      }

      const newQuestion = await SupabaseQuestionManager.createQuestion({
        title: newQuestionTitle,
        body: newQuestionBody,
        author_id: user.userName,
        author_name: user.userName,
        category: activeTab === 'all' ? 'confidence-building' : activeTab,
        question_type: selectedQuestionType as any,
        coin_cost: questionType.cost,
        coin_bounty: 0,
        tags: [],
        views: 0,
        is_answered: false,
        is_solved: false,
        is_private: selectedQuestionType === 'private',
        urgent_deadline: selectedQuestionType === 'urgent' 
          ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          : undefined,
        allowed_responders: []
      });

      if (newQuestion) {
        await syncUserData();
        setNewQuestionTitle('');
        setNewQuestionBody('');
        setSelectedQuestionType('regular');
        setShowNewQuestion(false);
        saveScrollPosition();
        await loadQuestions();
        restoreScrollPosition();
        alert(`Question posted successfully! Cost: ${questionType.cost} AlphaCoins.`);
      } else {
        throw new Error('Failed to create question');
      }
      
    } catch (error) {
      console.error('❌ Error posting question:', error);
      alert('Error posting question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle answering question
  const handleAnswerQuestion = async () => {
    if (!user?.userName || !selectedQuestion || !newAnswerContent.trim()) {
      console.log('❌ Missing required data for answer')
      return;
    }

    setLoading(true);
    saveScrollPosition();

    try {
      const newAnswer = await SupabaseAnswerManager.createAnswer({
        question_id: selectedQuestion.id,
        author_id: user.userName,
        author_name: user.userName,
        content: newAnswerContent,
        rating: 0,
        rated_by: [],
        coin_earnings: 0,
        is_best_answer: false,
        is_helpful: false,
        votes: 0,
        voted_by: []
      });

      if (newAnswer) {
        setNewAnswerContent('');
        setShowAnswerModal(false);
        setSelectedQuestion(null);

        // Update questions list and show the new answer
        setQuestions(prevQuestions => {
          return prevQuestions.map(q => {
            if (q.id === selectedQuestion.id) {
              const updatedAnswers = [newAnswer, ...q.answers]
              // Ensure we can see the new answer
              setVisibleAnswersCount(prev => ({
                ...prev,
                [q.id]: Math.max(prev[q.id] || INITIAL_ANSWERS_SHOW, INITIAL_ANSWERS_SHOW)
              }))
              return {
                ...q,
                answers: updatedAnswers,
                is_answered: true
              }
            }
            return q
          })
        });

        restoreScrollPosition();
        console.log('✅ Answer submitted successfully');
      } else {
        throw new Error('Failed to create answer');
      }
      
    } catch (error) {
      console.error('❌ Error submitting answer:', error);
      alert('Error submitting answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle answer update from DynamicRating
  const handleAnswerUpdate = (questionIndex: number, answerIndex: number, newRating: number, newCoinEarnings: number, newRatedBy: string[]) => {
    setQuestions(prevQuestions => {
      const updated = [...prevQuestions]
      updated[questionIndex].answers[answerIndex] = {
        ...updated[questionIndex].answers[answerIndex],
        rating: newRating,
        coin_earnings: newCoinEarnings,
        rated_by: newRatedBy
      }
      return updated
    })
  }

  // Handle user coins update
  const handleUserCoinsUpdate = (earnedCoins: number) => {
    console.log('🪙 User earned coins:', earnedCoins)
    updateUser({
      coins: (user?.coins || 0) + earnedCoins,
      totalEarned: (user?.totalEarned || 0) + earnedCoins,
      monthlyEarnings: (user?.monthlyEarnings || 0) + earnedCoins
    })
  }

  // Handle marking best answer
  const handleMarkBestAnswer = async (questionId: string, answerId: string): Promise<void> => {
    if (!user?.userName) return;

    try {
      saveScrollPosition();
      
      const result = await SupabaseAnswerManager.markBestAnswer(
        questionId, 
        answerId, 
        user.userName
      );
      
      if (result.success) {
        const answer = questions
          .flatMap(q => q.answers)
          .find(a => a.id === answerId);
        
        if (answer && answer.author_id === user.userName) {
          await syncUserData();
        }
        
        await loadQuestions();
        restoreScrollPosition();
        alert(result.message);
      } else {
        alert(result.message);
      }
      
    } catch (error) {
      console.error('❌ Error marking best answer:', error);
      alert('Error marking best answer. Please try again.');
    }
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white" ref={containerRef}>
      {/* Header */}
      <header className="p-4 lg:p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={navigation.goToDashboard}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
            
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
            <button
              onClick={refreshQuestions}
              disabled={refreshing}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh questions"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold">
              <Coins className="w-4 h-4" />
              <span>{user.coins || 0}</span>
            </div>
            <div className="text-sm opacity-70 hidden lg:block">Hey {user.userName || 'User'}!</div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
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

              {/* Answer Sort Toggle */}
              <select
                value={answerSortType}
                onChange={(e) => setAnswerSortType(e.target.value as AnswerSortType)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:border-red-500 focus:outline-none text-sm"
                title="Sort answers by"
              >
                <option value="best-first">🏆 Best First</option>
                <option value="newest-first">🕐 Newest First</option>
                <option value="most-helpful">👍 Most Helpful</option>
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
              {questions.filter(q => q.is_solved).length}
            </div>
            <div className="text-sm opacity-70">Solved</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {questions.filter(q => q.question_type === 'urgent').length}
            </div>
            <div className="text-sm opacity-70">Urgent</div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <div className="text-lg">Loading questions from database...</div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🤔</div>
              <div className="text-lg mb-2">No questions found</div>
              <div className="text-sm opacity-70">Be the first to ask a question in this category!</div>
            </div>
          ) : (
            questions.map((question, index) => {
              const sortedAnswers = sortAnswers(question.answers, answerSortType)
              const visibleCount = visibleAnswersCount[question.id] || INITIAL_ANSWERS_SHOW
              const visibleAnswers = sortedAnswers.slice(0, visibleCount)
              const hasMoreAnswers = sortedAnswers.length > visibleCount
              const showingAll = visibleCount >= sortedAnswers.length

              return (
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
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold">{question.title}</h3>
                        {question.is_solved && (
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                            ✓ Solved
                          </div>
                        )}
                        {question.question_type !== 'regular' && (
                          <div className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
                            {questionTypes.find(qt => qt.id === question.question_type)?.name}
                          </div>
                        )}
                        {question.question_type === 'urgent' && (
                          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Urgent</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm opacity-70 mb-3 flex-wrap">
                        <span className="font-semibold text-blue-400">{question.author_name}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(question.created_at)}</span>
                        <span>•</span>
                        <span>{question.views} views</span>
                        {question.coin_bounty > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400 flex items-center gap-1">
                              <Coins className="w-3 h-3" />
                              {question.coin_bounty} bounty
                            </span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-base opacity-90 leading-relaxed">{question.body}</p>
                    </div>
                  </div>

                  {/* Answers Section - ENHANCED WITH SMART SORTING & LOAD MORE */}
                  {question.answers.length > 0 && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold text-gray-300">
                          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                        </div>
                        
                        {/* Show current sorting method */}
                        <div className="text-xs opacity-60">
                          {answerSortType === 'best-first' && '🏆 Best answers first'}
                          {answerSortType === 'newest-first' && '🕐 Newest first'}
                          {answerSortType === 'most-helpful' && '👍 Most helpful first'}
                        </div>
                      </div>
                      
                      {/* Render Visible Answers */}
                      {visibleAnswers.map((answer, answerIndex) => (
                        <div
                          key={answer.id}
                          className={`p-4 rounded-lg ${
                            answer.is_best_answer ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-blue-400">{answer.author_name}</span>
                              {answer.is_best_answer && (
                                <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  <span>Best Answer</span>
                                </div>
                              )}
                              <span className="text-xs opacity-70">{formatTimeAgo(answer.created_at)}</span>
                            </div>
                          </div>
                          
                          <p className="text-sm leading-relaxed mb-4">{answer.content}</p>
                          
                          {/* Dynamic Rating Component */}
                          <DynamicRating
                            answerId={answer.id}
                            authorId={answer.author_id}
                            currentRating={answer.rating}
                            ratedBy={answer.rated_by}
                            coinEarnings={answer.coin_earnings}
                            currentUser={user?.userName || 'user'}
                            onRatingUpdate={(newRating, newCoinEarnings, newRatedBy) => 
                              handleAnswerUpdate(index, answerIndex, newRating, newCoinEarnings, newRatedBy)
                            }
                            onCoinsEarned={handleUserCoinsUpdate}
                          />

                          {/* Mark as Best Answer Button */}
                          <div className="mt-3 pt-3 border-t border-white/10">
                            {question.author_id === (user?.userName || 'user') && 
                             answer.author_id !== (user?.userName || 'user') && 
                             !question.best_answer_id && (
                              <button
                                onClick={() => handleMarkBestAnswer(question.id, answer.id)}
                                className="text-green-400 hover:text-green-300 text-xs font-semibold transition-colors"
                              >
                                Mark as Best Answer
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      
                      {/* Load More / View Less Controls - ENHANCED */}
                      {question.answers.length > INITIAL_ANSWERS_SHOW && (
                        <div className="text-center pt-4 border-t border-white/5">
                          {shouldRedirectToFullView(question.answers.length) ? (
                            /* For 20+ answers, redirect to dedicated page */
                            <div className="space-y-3">
                              {hasMoreAnswers && (
                                <button
                                  onClick={() => loadMoreAnswers(question.id, question.answers.length)}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors flex items-center justify-center gap-2 mx-auto"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                  Load {Math.min(LOAD_MORE_INCREMENT, question.answers.length - visibleCount)} More Answers
                                </button>
                              )}
                              
                              <button
                                onClick={() => {/* Navigate to dedicated page */}}
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                              >
                                <MessageCircle className="w-4 h-4" />
                                View Full Discussion ({question.answers.length} answers)
                              </button>
                            </div>
                          ) : (
                            /* For less than 20 answers, use load more */
                            <div className="flex items-center justify-center gap-4">
                              {hasMoreAnswers && (
                                <button
                                  onClick={() => loadMoreAnswers(question.id, question.answers.length)}
                                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                  <ChevronDown className="w-4 h-4" />
                                  Load {Math.min(LOAD_MORE_INCREMENT, question.answers.length - visibleCount)} More
                                </button>
                              )}
                              
                              {visibleCount > INITIAL_ANSWERS_SHOW && (
                                <button
                                  onClick={() => showFewerAnswers(question.id)}
                                  className="text-gray-400 hover:text-gray-300 text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </button>
                              )}
                            </div>
                          )}
                          
                          {/* Answer count indicator */}
                          <div className="text-xs opacity-50 mt-2">
                            Showing {visibleCount} of {question.answers.length} answers
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Help & Answer Section */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-2xl">💡</span>
                        <div>
                          <div className="text-sm font-medium text-gray-300">Help & Earn AlphaCoins</div>
                          <div className="text-xs opacity-70">Share your experience and get rewarded</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          setSelectedQuestion(question)
                          setShowAnswerModal(true)
                        }}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-[1.02] w-full sm:w-auto"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Answer Question</span>
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs opacity-60 mt-3">
                      <span>{question.answers.length} answers • Last activity {formatTimeAgo(question.last_activity)}</span>
                      <span className="hidden sm:inline">Earn 3-8 AlphaCoins per helpful answer</span>
                    </div>
                  </div>
                </motion.div>
              )
            })
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
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-red-400 mb-3">Question Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questionTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedQuestionType(type.id)}
                      disabled={(user?.coins || 0) < type.cost}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedQuestionType === type.id
                          ? 'border-red-500 bg-red-500/20'
                          : (user?.coins || 0) >= type.cost
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
                          (user?.coins || 0) >= type.cost ? 'text-yellow-400' : 'text-gray-500'
                        }`}>
                          <Coins className="w-4 h-4" />
                          <span>{type.cost}</span>
                        </div>
                      </div>
                      <div className="text-sm opacity-70">{type.description}</div>
                      {(user?.coins || 0) < type.cost && (
                        <div className="text-xs text-red-400 mt-2">
                          Need {type.cost - (user?.coins || 0)} more AlphaCoins
                        </div>
                      )}
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

              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6">
                <div className="text-yellow-400 font-semibold text-sm mb-1 flex items-center gap-1">
                  <Coins className="w-4 h-4" />
                  Cost: {questionTypes.find(qt => qt.id === selectedQuestionType)?.cost || 2} AlphaCoins
                </div>
                <div className="text-xs opacity-70">
                  Your balance: {user?.coins || 0} AlphaCoins
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
                  disabled={!newQuestionTitle.trim() || !newQuestionBody.trim() || loading || (user?.coins || 0) < (questionTypes.find(qt => qt.id === selectedQuestionType)?.cost || 2)}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                >
                  {loading ? 'Posting...' : (
                    <>
                      Post Question 
                      <span className="flex items-center gap-1">
                        (-{questionTypes.find(qt => qt.id === selectedQuestionType)?.cost || 2} <Coins className="w-4 h-4" />)
                      </span>
                    </>
                  )}
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
                <div className="text-xs opacity-60 mt-2 flex items-center gap-1">
                  Helpful answers earn 3-8 AlphaCoins based on community ratings
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
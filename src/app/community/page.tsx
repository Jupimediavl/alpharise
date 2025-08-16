// Enhanced Community page.tsx with Simple Coin System Integration - COMPLETE FIXED VERSION

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense, useRef } from 'react'
import { Search, Clock, Star, Award, ThumbsUp, MessageCircle, RefreshCw, Coins, ChevronDown, ChevronUp } from 'lucide-react'
import { useAlphaRise, withUserAuth } from '@/lib/user-context'
import { 
  SupabaseQuestionManager, 
  SupabaseAnswerManager, 
  SupabaseUserManager,
  supabaseHelpers 
} from '@/lib/supabase'
import { simpleCoinHelpers, simpleCoinManager } from '@/lib/simple-coin-system'
import { SimpleAnswerVoting, QuestionCostDisplay } from '@/components/SimpleCoinIntegration'

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

  // Answer display management - simplified to show/hide
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  const [visibleAnswersCount, setVisibleAnswersCount] = useState<Record<string, number>>({})
  const INITIAL_ANSWERS_SHOW = 3
  const LOAD_MORE_INCREMENT = 5

  // FIXED: Coin system integration - prioritize Supabase coins
  const [userCoins, setUserCoins] = useState(0) // Simple coin system fallback
  const [supabaseCoins, setSupabaseCoins] = useState(0) // Primary source from Supabase

  // Ref to maintain scroll position
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Simplified Communities - Consolidated from 8 to 4 core categories
  const communities = [
    { 
      id: 'performance', 
      name: 'Sexual Performance', 
      icon: '🔥', 
      description: 'Premature ejaculation, lasting longer, bedroom confidence',
      color: 'from-red-500 to-red-600'
    },
    { 
      id: 'confidence', 
      name: 'Confidence & Mindset', 
      icon: '💪', 
      description: 'Self-esteem, approach anxiety, social skills',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      id: 'dating', 
      name: 'Dating & Apps', 
      icon: '📱', 
      description: 'First dates, dating apps, meeting women',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'relationships', 
      name: 'Relationships', 
      icon: '❤️', 
      description: 'Real connections, emotional intimacy, long-term success',
      color: 'from-green-500 to-green-600'
    }
  ]

  const allCommunities = [
    { 
      id: 'all', 
      name: 'All Communities', 
      icon: '⭐', 
      description: 'Real problems, real solutions from men who\'ve been there',
      color: 'from-purple-500 to-magenta-600'
    },
    ...communities
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

  // Toggle answers visibility
  const toggleAnswers = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
        // Initialize visible count when expanding
        if (!visibleAnswersCount[questionId]) {
          setVisibleAnswersCount(prevCount => ({
            ...prevCount,
            [questionId]: INITIAL_ANSWERS_SHOW
          }))
        }
      }
      return newSet
    })
  }

  // CLEAN: Filter out questions from non-existent users
  const filterValidQuestions = async (questions: QuestionWithAnswers[]): Promise<QuestionWithAnswers[]> => {
    const validQuestions: QuestionWithAnswers[] = []
    
    // Define known phantom users to filter out
    const phantomUsers = ['BuildingMyself', 'StrugglingGuy_25', 'Anonymous', 'user_struggling', 'user_building', 'user_anon']
    
    for (const question of questions) {
      try {
        // First check against known phantom users (check both author_id and author_name)
        if (phantomUsers.includes(question.author_id) || phantomUsers.includes(question.author_name)) {
          console.log('🧹 Filtering out question from known phantom user:', question.author_id, question.author_name, question.title)
          continue
        }
        
        // Then check if user exists in Supabase
        const userExists = await SupabaseUserManager.getUserByUsername(question.author_id)
        if (userExists && userExists.username) {
          validQuestions.push(question)
        } else {
          console.log('🧹 Filtering out question from non-existent user:', question.author_id, question.title)
        }
      } catch (error) {
        console.error('❌ Error checking user existence:', question.author_id, error)
        // For phantom users, don't keep them even on error
        if (phantomUsers.includes(question.author_id) || phantomUsers.includes(question.author_name)) {
          console.log('🧹 Filtering out phantom user on error:', question.author_id, question.author_name)
          continue
        }
        // Keep real questions if we can't verify (to avoid losing data due to temporary errors)
        validQuestions.push(question)
      }
    }
    
    console.log(`🧹 Filtered questions: ${questions.length} → ${validQuestions.length}`)
    return validQuestions
  }

  // FIXED: Utility function to sync coin systems
  const syncCoinSystems = async (username: string) => {
    try {
      // Get fresh data from Supabase
      const updatedUser = await SupabaseUserManager.getUserByUsername(username);
      if (updatedUser) {
        setSupabaseCoins(updatedUser.coins || 0);
        console.log('💰 Synced coins from Supabase:', updatedUser.coins);
        
        // CRITICAL: Sync simple coin system with Supabase coins
        const simpleProfile = simpleCoinManager.getUserProfile(username);
        if (simpleProfile) {
          // Update simple coin system balance to match Supabase
          simpleProfile.currentBalance = updatedUser.coins || 0;
          simpleCoinManager.userProfiles.set(username, simpleProfile);
          console.log('🔄 Synced simple coin system:', updatedUser.coins);
        }
        
        const simpleCoins = simpleCoinHelpers.getUserCoins(username);
        setUserCoins(simpleCoins);
        
        return updatedUser.coins;
      }
    } catch (error) {
      console.error('❌ Error syncing coin systems:', error);
    }
    return null;
  }

  // Initialize user in database and load questions
  useEffect(() => {
    if (user?.userName) {
      console.log('🐛 Debug - User effect triggered:', {
        userName: user.userName,
        currentSupabaseCoins: supabaseCoins,
        currentUserCoins: userCoins
      });
      
      initializeUserInDB()
      loadQuestions()
      
      // Load user coins from simple system as fallback
      const coins = simpleCoinHelpers.getUserCoins(user.userName)
      setUserCoins(coins)
    }
  }, [user, activeTab, sortBy])

  // Initialize visible counts when questions load
  useEffect(() => {
    questions.forEach(question => {
      initializeVisibleCount(question.id, question.answers.length)
    })
  }, [questions])

  // FIXED: Initialize user in Supabase with proper coin loading
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
        
        // FIXED: Load coins from Supabase as primary source
        setSupabaseCoins(dbUser.coins || 0)
        console.log('✅ User initialized in DB:', dbUser)
        console.log('💰 Coins loaded from Supabase:', dbUser.coins)
        
        // CRITICAL FIX: Initialize user in simple coin system if not exists
        const simpleProfile = simpleCoinHelpers.getUserStats(user.userName)
        if (!simpleProfile) {
          console.log('🔧 Creating user in simple coin system...')
          // Create user profile in simple coin system with current Supabase balance
          const newProfile = {
            userId: user.userName,
            username: user.userName,
            currentBalance: dbUser.coins || 0,
            totalEarned: dbUser.coins || 0,
            totalSpent: 0,
            subscriptionType: 'trial' as const,
            streak: 1,
            lastActivity: new Date(),
            monthlyEarnings: 0,
          }
          simpleCoinManager.userProfiles.set(user.userName, newProfile)
          console.log('✅ User created in simple coin system with', dbUser.coins, 'coins')
        }
        
        // Process daily login in simple coin system
        const dailyReward = simpleCoinHelpers.dailyLogin(user.userName)
        if (dailyReward) {
          console.log('🎉 Daily login reward:', dailyReward)
          // Sync both systems after daily reward
          await syncCoinSystems(user.userName)
        }
      }
    } catch (error) {
      console.error('❌ Error initializing user:', error)
    }
  }

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

      // CLEAN: Filter out questions from non-existent users
      const validQuestions = await filterValidQuestions(loadedQuestions)
      setQuestions(validQuestions)
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
    
    // Also sync coins on refresh
    if (user?.userName) {
      await syncCoinSystems(user.userName)
    }
    
    restoreScrollPosition()
    setRefreshing(false)
  }

  // FIXED: Handle asking new question with proper coin sync
  const handleAskQuestion = async () => {
    if (!user?.userName || !newQuestionTitle.trim() || !newQuestionBody.trim()) {
      console.log('❌ Missing required data for question')
      return;
    }

    // VALIDATE: Ensure user exists in database before allowing question creation
    try {
      const userExists = await SupabaseUserManager.getUserByUsername(user.userName)
      if (!userExists) {
        console.error('❌ User not found in database:', user.userName)
        alert('Account verification required. Please refresh the page and try again.')
        return;
      }
    } catch (error) {
      console.error('❌ Error validating user:', error)
      alert('Unable to verify account. Please try again.')
      return;
    }

    setLoading(true);

    try {
      // Use simple coin system for question posting
      const result = simpleCoinHelpers.askQuestion(user.userName, selectedQuestionType);
      
      if (!result.success) {
        alert(result.message);
        setLoading(false);
        return;
      }

      // Create question in Supabase
      const newQuestion = await SupabaseQuestionManager.createQuestion({
        title: newQuestionTitle,
        body: newQuestionBody,
        author_id: user.userName,
        author_name: user.userName,
        category: activeTab === 'all' ? 'confidence-building' : activeTab,
        question_type: selectedQuestionType as any,
        coin_cost: simpleCoinHelpers.canAffordQuestion(user.userName, selectedQuestionType) ? 
                   (selectedQuestionType === 'urgent' ? 5 : 2) : 0,
        coin_bounty: 0,
        tags: [],
        views: 0,
        is_answered: false,
        is_solved: false,
        is_private: false,
        urgent_deadline: selectedQuestionType === 'urgent' 
          ? new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
          : undefined,
        allowed_responders: []
      });

      if (newQuestion) {
        // CRITICAL: Update Supabase coins to match simple coin system
        const updatedBalance = simpleCoinHelpers.getUserCoins(user.userName);
        await SupabaseUserManager.updateUserCoins(user.userName, updatedBalance);
        console.log('💰 Updated Supabase coins after question:', updatedBalance);
        
        // FIXED: Sync both coin systems
        await syncCoinSystems(user.userName);
        
        setNewQuestionTitle('');
        setNewQuestionBody('');
        setSelectedQuestionType('regular');
        setShowNewQuestion(false);
        saveScrollPosition();
        await loadQuestions();
        restoreScrollPosition();
        alert(result.message);
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

  // FIXED: Handle answering question with proper coin sync
  const handleAnswerQuestion = async () => {
    if (!user?.userName || !selectedQuestion || !newAnswerContent.trim()) {
      console.log('❌ Missing required data for answer')
      return;
    }

    // Check if answering own question (no coin reward, but allowed for clarifications)
    const isOwnQuestion = selectedQuestion.author_id === user.userName;

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
        // ANTI-FRAUD: Only reward coins if answering someone else's question
        if (!isOwnQuestion) {
          // Reward user with simple coin system (1 coin for posting answer)
          const answerReward = simpleCoinHelpers.answerPosted(
            user.userName, 
            selectedQuestion.id, 
            newAnswer.id
          );
          
          console.log('🪙 Answer posted reward:', answerReward);
          
          // CRITICAL: Update Supabase coins to match simple coin system
          const updatedBalance = simpleCoinHelpers.getUserCoins(user.userName);
          await SupabaseUserManager.updateUserCoins(user.userName, updatedBalance);
          console.log('💰 Updated Supabase coins after answer:', updatedBalance);
          
          // FIXED: Sync both coin systems
          await syncCoinSystems(user.userName);
        } else {
          console.log('💬 Answer posted to own question - no coin reward');
        }

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
        
        if (!isOwnQuestion) {
          alert(`Answer submitted! You earned 1 AlphaCoin. Total: ${supabaseCoins || userCoins} coins.`);
        } else {
          alert('Answer submitted! (No coins earned for answering your own question)');
        }
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

  // FIXED: Handle vote success with proper coin sync
  const handleVoteSuccess = async (answerId: string, coinsEarned: number, totalVotes: number, isBestAnswer: boolean) => {
    console.log('🎉 Vote successful:', { answerId, coinsEarned, totalVotes, isBestAnswer });
    
    // Update the answer author's coins in Supabase if they earned any
    if (coinsEarned > 0) {
      // Find the answer author
      const answerData = simpleCoinHelpers.getAnswerData(answerId);
      if (answerData && answerData.authorId) {
        const updatedBalance = simpleCoinHelpers.getUserCoins(answerData.authorId);
        await SupabaseUserManager.updateUserCoins(answerData.authorId, updatedBalance);
        console.log('💰 Updated answer author coins in Supabase:', answerData.authorId, updatedBalance);
      }
    }
    
    // Sync current user's coin systems (in case they voted)
    if (user?.userName) {
      await syncCoinSystems(user.userName);
    }
    
    // Update question data to reflect new vote counts and best answer status
    setQuestions(prevQuestions => {
      return prevQuestions.map(question => {
        const updatedAnswers = question.answers.map(answer => {
          if (answer.id === answerId) {
            return {
              ...answer,
              votes: totalVotes,
              is_best_answer: isBestAnswer,
              coin_earnings: answer.coin_earnings + coinsEarned
            };
          }
          return answer;
        });
        
        // Update best_answer_id if this became the best answer
        const bestAnswerId = isBestAnswer ? answerId : question.best_answer_id;
        
        return {
          ...question,
          answers: updatedAnswers,
          best_answer_id: bestAnswerId,
          is_solved: isBestAnswer || question.is_solved
        };
      });
    });
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading community...
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white" ref={containerRef}>
      {/* FIXED: Header with proper coin display */}
      <header className="p-4 lg:p-6 border-b border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 lg:gap-4">
            <button 
              onClick={navigation.goToDashboard}
              className="flex items-center gap-2 px-3 py-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={navigation.goToDashboard}
              className="text-xl lg:text-2xl font-black text-white hover:opacity-80 transition-opacity"
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
              className="p-2 bg-white/10 hover:bg-purple-500/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh questions"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            {/* FIXED: Display Supabase coins as primary, with fallback */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-magenta-500/20 text-white px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold border border-purple-500/30">
              <Coins className="w-4 h-4" />
              <span>{supabaseCoins || userCoins}</span>
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
                className="w-full pl-10 pr-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-black/30 border border-purple-500/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="newest">Newest</option>
                <option value="unsolved">Unsolved</option>
              </select>

              <button
                onClick={() => setShowNewQuestion(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold hover:from-purple-700 hover:to-magenta-700 transition-all"
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
                    ? 'bg-purple-500/20 border border-purple-500/30 text-purple-400' 
                    : 'bg-white/10 text-white/70 hover:bg-purple-500/10'
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
              const isExpanded = expandedQuestions.has(question.id)
              const sortedAnswers = sortAnswers(question.answers, 'best-first')
              const visibleCount = visibleAnswersCount[question.id] || INITIAL_ANSWERS_SHOW
              const visibleAnswers = sortedAnswers.slice(0, visibleCount)
              const hasMoreAnswers = sortedAnswers.length > visibleCount

              return (
                <motion.div
                  key={question.id}
                  className="bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg"
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
                        {question.question_type === 'urgent' && (
                          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Urgent</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm opacity-70 mb-3 flex-wrap">
                        <span className="font-semibold text-purple-400">{question.author_name}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(question.created_at)}</span>
                        {question.answers.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}</span>
                          </>
                        )}
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

                  {/* View Answers Button */}
                  {question.answers.length > 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => toggleAnswers(question.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-colors font-medium text-sm"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>
                          {isExpanded ? 'Hide' : 'View'} {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
                        </span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.div>
                      </button>
                    </div>
                  )}

                  {/* Answers Section - Only shown when expanded */}
                  {isExpanded && question.answers.length > 0 && (
                    <motion.div 
                      className="mt-4 space-y-4 border-t border-purple-500/20 pt-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      
                      {/* Render Visible Answers */}
                      {visibleAnswers.map((answer) => (
                        <div
                          key={answer.id}
                          className={`p-4 rounded-lg ${
                            answer.is_best_answer ? 'bg-green-500/10 border border-green-500/30' : 'bg-black/20 border border-purple-500/10'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="font-semibold text-purple-400">{answer.author_name}</span>
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
                          
                          {/* Simple Answer Voting Component */}
                          <SimpleAnswerVoting
                            answerId={answer.id}
                            authorId={answer.author_id}
                            currentUserId={user?.userName || ''}
                            questionAuthorId={question.author_id}
                            onVoteSuccess={(coinsEarned, totalVotes, isBestAnswer) => 
                              handleVoteSuccess(answer.id, coinsEarned, totalVotes, isBestAnswer)
                            }
                          />
                        </div>
                      ))}
                      
                      {/* Load More / View Less Controls */}
                      {question.answers.length > INITIAL_ANSWERS_SHOW && (
                        <div className="text-center pt-4 border-t border-white/5">
                          <div className="flex items-center justify-center gap-4">
                            {hasMoreAnswers && (
                              <button
                                onClick={() => loadMoreAnswers(question.id, question.answers.length)}
                                className="text-purple-400 hover:text-purple-300 text-sm font-semibold transition-colors flex items-center gap-2"
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
                          
                          {/* Answer count indicator */}
                          <div className="text-xs opacity-50 mt-2">
                            Showing {visibleCount} of {question.answers.length} answers
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Help & Answer Section */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-gray-400">
                        <span className="text-xl">💡</span>
                        <div className="text-sm font-medium text-gray-300">Help others & earn coins</div>
                      </div>
                      
                      {/* Simplified answer button */}
                      {question.author_id === user?.userName ? (
                        <button
                          onClick={() => {
                            setSelectedQuestion(question)
                            setShowAnswerModal(true)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-medium transition-colors text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Add Clarification</span>
                          <span className="sm:hidden">Clarify</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedQuestion(question)
                            setShowAnswerModal(true)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors text-sm"
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="hidden sm:inline">Answer</span>
                          <span className="sm:hidden">Reply</span>
                          <span className="text-xs opacity-80">+1</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* FIXED: New Question Modal - WITH SIMPLE COIN INTEGRATION */}
      <AnimatePresence>
        {showNewQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gray-900 border border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-purple-400">Ask Your Question</h3>
              
              {/* Question Cost Display - Simple Coin System */}
              <div className="mb-6">
                <QuestionCostDisplay
                  questionType={selectedQuestionType}
                  userCoins={supabaseCoins || userCoins}
                  onChange={setSelectedQuestionType}
                />
              </div>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-purple-400 mb-2">Question Title</label>
                  <input 
                    type="text"
                    placeholder="How do I..."
                    value={newQuestionTitle}
                    onChange={(e) => setNewQuestionTitle(e.target.value)}
                    className="w-full p-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-purple-400 mb-2">Details</label>
                  <textarea 
                    placeholder="Describe your situation in detail..."
                    value={newQuestionBody}
                    onChange={(e) => setNewQuestionBody(e.target.value)}
                    rows={4}
                    className="w-full p-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setShowNewQuestion(false)}
                  className="flex-1 py-3 border border-purple-500/30 rounded-lg font-semibold hover:bg-purple-500/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAskQuestion}
                  disabled={
                    !newQuestionTitle.trim() || 
                    !newQuestionBody.trim() || 
                    loading || 
                    !simpleCoinHelpers.canAffordQuestion(user?.userName || '', selectedQuestionType)
                  }
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                >
                  {loading ? 'Posting...' : (
                    <>
                      Post Question 
                      <span className="flex items-center gap-1">
                        (-{selectedQuestionType === 'urgent' ? 5 : 2} <Coins className="w-4 h-4" />)
                      </span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FIXED: Answer Modal */}
      <AnimatePresence>
        {showAnswerModal && selectedQuestion && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              className="bg-gray-900 border border-purple-500/20 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-purple-400">
                {selectedQuestion.author_id === user?.userName ? 'Add Clarification' : 'Answer Question'}
              </h3>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">{selectedQuestion.title}</h4>
                <p className="text-sm opacity-70">{selectedQuestion.body}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-400 mb-2">
                  {selectedQuestion.author_id === user?.userName ? 'Your Clarification' : 'Your Answer'}
                </label>
                <textarea 
                  placeholder={selectedQuestion.author_id === user?.userName ? "Add more details or clarify your question..." : "Share your experience and advice..."}
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
                <div className="text-xs opacity-60 mt-2 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {selectedQuestion.author_id === user?.userName 
                    ? "No coins earned for clarifying your own question" 
                    : "You'll earn 1 AlphaCoin for posting this answer, plus more coins for helpful votes!"
                  }
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setShowAnswerModal(false)
                    setSelectedQuestion(null)
                    setNewAnswerContent('')
                  }}
                  className="flex-1 py-3 border border-purple-500/30 rounded-lg font-semibold hover:bg-purple-500/10 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAnswerQuestion}
                  disabled={!newAnswerContent.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      {selectedQuestion.author_id === user?.userName ? 'Submit Clarification' : 'Submit Answer'}
                      <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                        {selectedQuestion.author_id === user?.userName ? 'No coins' : (
                          <>+1 <Coins className="w-3 h-3" /></>
                        )}
                      </div>
                    </>
                  )}
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
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 via-magenta-500 to-pink-500 bg-clip-text text-transparent">
            Loading community...
          </h2>
        </div>
      </div>
    }>
      <CommunityWithAuth />
    </Suspense>
  )
}
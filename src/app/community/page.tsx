// Enhanced Community page.tsx with Simple Coin System Integration - COMPLETE FIXED VERSION

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, Star, Award, ThumbsUp, MessageCircle, RefreshCw, Coins, ChevronDown, ChevronUp, Trash2, Shield, Bell, X, Menu, Check } from 'lucide-react'
import { 
  SupabaseQuestionManager, 
  SupabaseAnswerManager, 
  SupabaseUserManager,
  SupabaseAuthManager,
  supabaseHelpers,
  supabase,
  DbUser
} from '@/lib/supabase'
// Removed simple coin system dependencies - using Supabase only
import CoinAnimation from '@/components/CoinAnimation'
import UserDropdownMenu from '@/components/UserDropdownMenu'

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
  const router = useRouter()
  const [user, setUser] = useState<DbUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
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
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMoreQuestions, setHasMoreQuestions] = useState(true)
  const [totalQuestionsCount, setTotalQuestionsCount] = useState(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const QUESTIONS_PER_PAGE = 15

  // Answer display management - simplified to show/hide
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())
  
  // Coin animation state
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [coinAnimationAmount, setCoinAnimationAmount] = useState(0)
  const [coinAnimationPosition, setCoinAnimationPosition] = useState({ x: 0, y: 0 })
  const [visibleAnswersCount, setVisibleAnswersCount] = useState<Record<string, number>>({})
  const INITIAL_ANSWERS_SHOW = 3
  const LOAD_MORE_INCREMENT = 5

  // FIXED: Coin system integration - prioritize Supabase coins
  const [userCoins, setUserCoins] = useState(0) // Simple coin system fallback
  const [supabaseCoins, setSupabaseCoins] = useState(0) // Primary source from Supabase
  
  // Personal content tracking
  const [notifications, setNotifications] = useState<Array<{
    id: string
    type: 'new_answer' | 'helpful_vote' | 'best_answer'
    message: string
    question_id: string
    created_at: string
    read: boolean
  }>>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  // Ref to maintain scroll position
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const categoryDropdownRef = useRef<HTMLDivElement>(null)

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
    { 
      id: 'my-questions', 
      name: 'My Questions', 
      icon: '❓', 
      description: 'Questions you\'ve posted and their current status',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      id: 'my-answers', 
      name: 'My Answers', 
      icon: '💬', 
      description: 'Questions you\'ve contributed answers to',
      color: 'from-emerald-500 to-emerald-600'
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


  // Utility function to get fresh user coins from Supabase
  const refreshUserCoins = async (username: string) => {
    try {
      const updatedUser = await SupabaseUserManager.getUserByUsername(username);
      if (updatedUser) {
        setSupabaseCoins(updatedUser.coins || 0);
        console.log('💰 Refreshed coins from Supabase:', updatedUser.coins);
        return updatedUser.coins;
      }
    } catch (error) {
      console.error('❌ Error refreshing coins:', error);
    }
    return null;
  }

  // Trigger coin animation
  const showCoinChangeAnimation = (amount: number, position: { x: number; y: number }) => {
    setCoinAnimationAmount(amount)
    setCoinAnimationPosition(position)
    setShowCoinAnimation(true)
  }

  // Helper to get click position from event
  const getClickPosition = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    let clientX: number, clientY: number
    
    if ('touches' in event && event.touches.length > 0) {
      // Touch event
      clientX = event.touches[0].clientX
      clientY = event.touches[0].clientY
    } else if ('changedTouches' in event && event.changedTouches.length > 0) {
      // Touch end event
      clientX = event.changedTouches[0].clientX
      clientY = event.changedTouches[0].clientY
    } else {
      // Mouse event
      clientX = (event as MouseEvent).clientX
      clientY = (event as MouseEvent).clientY
    }
    
    return { x: clientX, y: clientY }
  }

  // Set client-side flag after hydration to prevent SSR mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])


  // Load user session and initialize data
  useEffect(() => {
    const loadUserAndData = async () => {
      try {
        setIsLoading(true)
        
        // Get current session from Supabase Auth
        const session = await SupabaseAuthManager.getCurrentSession()
        if (!session || !session.user) {
          console.log('No valid session, redirecting to login...')
          router.push('/login')
          return
        }
        
        // Get user profile from our users table using the email
        const userData = await SupabaseUserManager.getUserByEmail(session.user.email!)
        if (!userData) {
          console.error('User profile not found for:', session.user.email)
          router.push('/signup')
          return
        }

        // Check admin status
        setIsAdmin(userData.is_admin === true)
        if (userData.is_admin) {
          console.log(`👑 Admin access: ${userData.username} has moderation privileges`)
        }
        
        console.log('✅ User authenticated for community:', userData.username)
        setUser(userData)
        
        // Load questions and notifications
        await loadQuestions()
        await loadNotifications()
        
      } catch (error) {
        console.error('Error loading user data:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndData()
  }, [activeTab, sortBy])

  // Initialize visible counts when questions load
  useEffect(() => {
    questions.forEach(question => {
      initializeVisibleCount(question.id, question.answers.length)
    })
  }, [questions])

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false)
      }
    }

    if (showCategoryDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCategoryDropdown])

  // Handle search query changes with debouncing
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      loadQuestions() // Trigger search or reload all if empty
    }, 500) // 500ms debounce

    return () => clearTimeout(searchTimeout)
  }, [searchQuery])

  // FIXED: Initialize user in Supabase with proper coin loading
  const initializeUserInDB = async () => {
    if (!user?.username) return

    try {
      console.log('🔄 Initializing user in DB:', {
        userName: user.username,
        userEmail: user.email,
        avatarType: user.coach
      })

      const dbUser = await supabaseHelpers.initializeUser(
        user.username,
        user.email || `${user.username}@alpharise.com`,
        user.coach
      )

      if (dbUser) {
        setCurrentUserProfile(dbUser)
        
        // FIXED: Load coins from Supabase as primary source
        setSupabaseCoins(dbUser.coins || 0)
        console.log('✅ User initialized in DB:', dbUser)
        console.log('💰 Coins loaded from Supabase:', dbUser.coins)
        
        // No simple coin system initialization needed anymore
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

  // Load questions from Supabase with personal content filters  
  const loadQuestions = async (isLoadMore: boolean = false) => {
    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
      setCurrentPage(1)
      setHasMoreQuestions(true)
    }
    
    try {
      let loadedQuestions: QuestionWithAnswers[] = []
      // Fix offset calculation: use questions.length for load more to avoid duplicates
      const offset = isLoadMore ? questions.length : 0
      const limit = QUESTIONS_PER_PAGE

      // Handle personal content filters
      if (activeTab === 'my-questions') {
        // Load only user's questions
        if (user?.username) {
          const { data, error } = await supabase
            .from('questions')
            .select(`
              *,
              answers(
                id, author_id, author_name, content, rating, rated_by, 
                coin_earnings, is_best_answer, votes, voted_by, created_at
              )
            `)
            .eq('author_id', user.username)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

          if (!error && data) {
            loadedQuestions = data.map(q => ({
              ...q,
              answers: q.answers || []
            }))
          }
        }
      } else if (activeTab === 'my-answers') {
        // Load questions where user has answered
        if (user?.username) {
          const { data, error } = await supabase
            .from('questions')
            .select(`
              *,
              answers!inner(
                id, author_id, author_name, content, rating, rated_by, 
                coin_earnings, is_best_answer, votes, voted_by, created_at
              )
            `)
            .eq('answers.author_id', user.username)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

          if (!error && data) {
            // Get all answers for these questions, not just user's answers
            const questionIds = data.map(q => q.id)
            const { data: allAnswers } = await supabase
              .from('answers')
              .select('*')
              .in('question_id', questionIds)
              .order('created_at', { ascending: true })

            const answersByQuestion = allAnswers?.reduce((acc, answer) => {
              if (!acc[answer.question_id]) acc[answer.question_id] = []
              acc[answer.question_id].push(answer)
              return acc
            }, {} as Record<string, any[]>) || {}

            loadedQuestions = data.map(q => ({
              ...q,
              answers: answersByQuestion[q.id] || []
            }))
          }
        }
      } else {
        // Standard loading for 'all' tab
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
            limit: limit,
            offset: offset,
            sortBy: sortBy === 'unsolved' ? 'newest' : sortBy
          }

          if (sortBy === 'unsolved') {
            filters.is_answered = false
          }

          loadedQuestions = await supabaseHelpers.getQuestionsWithAnswers(filters)
        }
      }

      // Handle pagination logic
      if (isLoadMore) {
        // Append new questions to existing ones
        setQuestions(prev => [...prev, ...loadedQuestions])
      } else {
        // Replace questions (first load or refresh)
        setQuestions(loadedQuestions)
        setTotalQuestionsCount(0) // Will be updated when we add count query
      }
      
      // Check if there are more questions to load
      setHasMoreQuestions(loadedQuestions.length === QUESTIONS_PER_PAGE)
      
    } catch (error) {
      console.error('❌ Error loading questions:', error)
      if (!isLoadMore) {
        setQuestions([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Process notifications for smart grouping and summarization
  const processNotificationsForDisplay = (rawNotifications: typeof notifications) => {
    if (rawNotifications.length <= 5) {
      // Show all individual notifications if 5 or fewer
      return {
        individual: rawNotifications,
        groups: []
      }
    }

    // Group notifications by type and question
    const newAnswersByQuestion = rawNotifications
      .filter(n => n.type === 'new_answer')
      .reduce((acc, n) => {
        const key = n.question_id
        if (!acc[key]) acc[key] = []
        acc[key].push(n)
        return acc
      }, {} as Record<string, typeof rawNotifications>)

    const helpfulVotes = rawNotifications.filter(n => n.type === 'helpful_vote')
    
    const groups = []
    const individual = []

    // Show max 3 most recent individual notifications
    const recentIndividual = rawNotifications.slice(0, 3)
    individual.push(...recentIndividual)

    // Group multiple answers to same question
    Object.values(newAnswersByQuestion).forEach(answers => {
      if (answers.length > 1) {
        const questionTitle = answers[0].message.split('"')[1] || 'your question'
        groups.push({
          id: `grouped-answers-${answers[0].question_id}`,
          type: 'grouped_answers',
          count: answers.length,
          message: `${answers.length} new answers to "${questionTitle}"`,
          question_id: answers[0].question_id,
          created_at: answers[0].created_at,
          items: answers
        })
      }
    })

    // Group helpful votes
    if (helpfulVotes.length > 3) {
      const totalVotes = helpfulVotes.reduce((sum, vote) => {
        const voteMatch = vote.message.match(/(\d+) helpful vote/)
        return sum + (voteMatch ? parseInt(voteMatch[1]) : 1)
      }, 0)
      
      groups.push({
        id: 'grouped-votes',
        type: 'grouped_votes',
        count: helpfulVotes.length,
        message: `Your answers received ${totalVotes} helpful votes`,
        question_id: '',
        created_at: helpfulVotes[0].created_at,
        items: helpfulVotes
      })
    }

    return { individual: individual.slice(0, 3), groups }
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadNotifications(0)
    setShowNotifications(false)
  }

  // Load user notifications
  const loadNotifications = async () => {
    if (!user?.username) {
      console.log('🔔 Cannot load notifications: no username')
      return
    }

    console.log('🔔 Loading notifications for user:', user.username)

    try {
      // Get new answers to user's questions
      const { data: newAnswers } = await supabase
        .from('answers')
        .select(`
          id, content, created_at, question_id, author_id
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false })

      // Filter for answers to user's questions and get question titles
      let userQuestionAnswers = []
      if (newAnswers?.length > 0) {
        const questionIds = [...new Set(newAnswers.map(a => a.question_id))]
        const { data: questions } = await supabase
          .from('questions')
          .select('id, title, author_id')
          .in('id', questionIds)
          .eq('author_id', user.username)
        
        if (questions) {
          const questionMap = new Map(questions.map(q => [q.id, q]))
          userQuestionAnswers = newAnswers.filter(answer => 
            answer.author_id !== user.username && // Not user's own answers
            questionMap.has(answer.question_id)
          ).map(answer => ({
            ...answer,
            questionTitle: questionMap.get(answer.question_id)?.title
          }))
        }
      }

      // Get helpful votes on user's answers  
      const { data: helpfulVotes } = await supabase
        .from('answers')
        .select(`
          id, votes, voted_by, created_at, question_id,
          questions(title)
        `)
        .eq('author_id', user.username)
        .gte('votes', 1)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const notificationsList = []

      // Process new answers
      if (userQuestionAnswers) {
        console.log('🔔 Debug userQuestionAnswers:', userQuestionAnswers.length, 'answers found')
        for (const answer of userQuestionAnswers) {
          notificationsList.push({
            id: `answer-${answer.id}`,
            type: 'new_answer' as const,
            message: `New answer to your question "${answer.questionTitle || 'Untitled Question'}"`,
            question_id: answer.question_id,
            created_at: answer.created_at,
            read: false
          })
        }
      }

      // Process helpful votes (simplified - just show if has votes)
      if (helpfulVotes) {
        for (const vote of helpfulVotes) {
          if (vote.votes > 0) {
            notificationsList.push({
              id: `vote-${vote.id}`,
              type: 'helpful_vote' as const,
              message: `Your answer got ${vote.votes} helpful vote${vote.votes > 1 ? 's' : ''}`,
              question_id: vote.question_id,
              created_at: vote.created_at,
              read: false
            })
          }
        }
      }

      // Sort by newest first and limit to 10
      notificationsList.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      const limitedNotifications = notificationsList.slice(0, 10)

      console.log('🔔 Found notifications:', {
        newAnswers: newAnswers?.length || 0,
        helpfulVotes: helpfulVotes?.length || 0,
        total: limitedNotifications.length
      })

      setNotifications(limitedNotifications)
      setUnreadNotifications(limitedNotifications.length)

    } catch (error) {
      console.error('🔔 Error loading notifications:', error)
    }
  }

  // Load more questions (pagination)
  const loadMoreQuestions = async () => {
    if (loadingMore || !hasMoreQuestions) return
    await loadQuestions(true)
  }

  // Refresh questions
  const refreshQuestions = async () => {
    setRefreshing(true)
    saveScrollPosition()
    await loadQuestions()
    
    // Also refresh coins and notifications on refresh
    if (user?.username) {
      await refreshUserCoins(user.username)
      await loadNotifications()
    }
    
    restoreScrollPosition()
    setRefreshing(false)
  }

  // FIXED: Handle asking new question with proper coin sync
  const handleAskQuestion = async (event?: React.MouseEvent | React.TouchEvent) => {
    if (!user?.username || !newQuestionTitle.trim() || !newQuestionBody.trim()) {
      console.log('❌ Missing required data for question')
      return;
    }

    // VALIDATE: Ensure user exists in database before allowing question creation
    try {
      const userExists = await SupabaseUserManager.getUserByUsername(user.username)
      if (!userExists) {
        console.error('❌ User not found in database:', user.username)
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
      // Check if user has enough coins
      const questionCost = selectedQuestionType === 'urgent' ? 5 : 2
      if ((user.coins || 0) < questionCost) {
        alert(`Not enough coins! You need ${questionCost} coins to post this question.`)
        setLoading(false)
        return
      }

      console.log('🚀 Creating question with Supabase...')

      // Create question in Supabase
      const newQuestion = await SupabaseQuestionManager.createQuestion({
        title: newQuestionTitle,
        body: newQuestionBody,
        author_id: user.username,
        author_name: user.username,
        category: activeTab === 'all' ? 'confidence' : activeTab,
        question_type: selectedQuestionType as any,
        coin_cost: questionCost,
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
        // Deduct coins from user in Supabase
        const newBalance = (user.coins || 0) - questionCost
        await SupabaseUserManager.updateUserCoins(user.username, newBalance)
        
        // Update local user state
        setUser(prev => prev ? { ...prev, coins: newBalance } : null)
        
        // Show coin animation for cost
        const position = event ? getClickPosition(event) : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        showCoinChangeAnimation(-questionCost, position)
        
        console.log('✅ Question created successfully:', newQuestion.id)
        console.log('💰 Coins deducted. New balance:', newBalance)
        
        setNewQuestionTitle('');
        setNewQuestionBody('');
        setSelectedQuestionType('regular');
        setShowNewQuestion(false);
        saveScrollPosition();
        await loadQuestions();
        restoreScrollPosition();
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
  const handleAnswerQuestion = async (event?: React.MouseEvent | React.TouchEvent) => {
    if (!user?.username || !selectedQuestion || !newAnswerContent.trim()) {
      console.log('❌ Missing required data for answer')
      return;
    }

    // Check if answering own question (no coin reward, but allowed for clarifications)
    const isOwnQuestion = selectedQuestion.author_id === user.username;

    setLoading(true);
    saveScrollPosition();

    try {
      const newAnswer = await SupabaseAnswerManager.createAnswer({
        question_id: selectedQuestion.id,
        author_id: user.username,
        author_name: user.username,
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
          // Reward user with 1 coin for posting answer
          const rewardAmount = 1
          const newBalance = (user.coins || 0) + rewardAmount
          await SupabaseUserManager.updateUserCoins(user.username, newBalance)
          
          // Update local user state
          setUser(prev => prev ? { ...prev, coins: newBalance } : null)
          
          // Show coin animation for reward
          const position = event ? getClickPosition(event) : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
          showCoinChangeAnimation(+1, position)
          
          console.log('🪙 Answer posted reward: +1 coin')
          console.log('💰 Updated coins after answer:', newBalance)
        } else {
          console.log('💬 Answer posted to own question - no coin reward')
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
    
    // Refresh current user's coins if needed
    if (user?.username) {
      await refreshUserCoins(user.username);
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

  // Handle voting on answers
  const handleVoteAnswer = async (answerId: string, voteType: 'helpful') => {
    if (!user?.username) return

    try {
      console.log('🗳️ Voting on answer:', answerId, voteType)
      
      // Update answer votes in Supabase
      const { data, error } = await supabase
        .from('answers')
        .select('votes, voted_by, author_id')
        .eq('id', answerId)
        .single()

      if (error || !data) {
        console.error('Error getting answer data:', error)
        return
      }

      const votedBy = data.voted_by || []
      
      // Check if user already voted
      if (votedBy.includes(user.username)) {
        alert('You have already voted on this answer!')
        return
      }

      // ANTI-FRAUD: Prevent self-voting
      if (data.author_id === user.username) {
        alert('You cannot vote on your own answer!')
        return
      }

      // Update votes
      const newVotes = (data.votes || 0) + 1
      const newVotedBy = [...votedBy, user.username]

      const { error: updateError } = await supabase
        .from('answers')
        .update({
          votes: newVotes,
          voted_by: newVotedBy
        })
        .eq('id', answerId)

      if (updateError) {
        console.error('Error updating vote:', updateError)
        return
      }

      // Reward answer author with coins for helpful vote
      let coinsEarned = 0
      let isBestAnswer = false
      
      if (data.author_id && data.author_id !== user.username) {
        const authorData = await SupabaseUserManager.getUserByUsername(data.author_id)
        if (authorData) {
          // Starting from 5th vote, earn 1 coin per vote
          if (newVotes >= 5) {
            coinsEarned = 1
          }
          
          // At 7+ votes, automatically becomes Best Answer and earns 5 coin bonus
          if (newVotes >= 7) {
            isBestAnswer = true
            coinsEarned = 6 // 1 for vote + 5 bonus for best answer
            
            // Update answer as best answer in database
            await supabase
              .from('answers')
              .update({ is_best_answer: true })
              .eq('id', answerId)
            
            console.log('🏆 Auto Best Answer at 7+ votes:', answerId)
          }
          
          if (coinsEarned > 0) {
            const newAuthorBalance = (authorData.coins || 0) + coinsEarned
            await SupabaseUserManager.updateUserCoins(data.author_id, newAuthorBalance)
            console.log(`💰 Rewarded answer author: ${data.author_id}, +${coinsEarned} coins`)
          }
        }
      }

      // Update UI
      setQuestions(prevQuestions => {
        return prevQuestions.map(question => {
          const updatedAnswers = question.answers.map(answer => {
            if (answer.id === answerId) {
              return {
                ...answer,
                votes: newVotes,
                voted_by: newVotedBy,
                is_best_answer: isBestAnswer || answer.is_best_answer
              }
            }
            return answer
          })
          
          // Update question's best_answer_id if this became best answer
          const updatedQuestion = { ...question, answers: updatedAnswers }
          if (isBestAnswer) {
            updatedQuestion.best_answer_id = answerId
            updatedQuestion.is_solved = true
          }
          
          return updatedQuestion
        })
      })

      console.log('✅ Vote recorded successfully')
      
    } catch (error) {
      console.error('Error voting on answer:', error)
    }
  }

  // ADMIN: Delete question (admin version)
  const handleAdminDeleteQuestion = async (questionId: string, questionTitle: string) => {
    if (!isAdmin) {
      alert('⚠️ Access denied: Admin privileges required')
      return
    }

    const confirmDelete = prompt(`🗑️ DELETE QUESTION
    
Are you sure you want to permanently delete this question?

"${questionTitle}"

This will also delete:
• All answers to this question
• All votes on the question and answers
• This action CANNOT be undone!

Type "DELETE" to confirm:`)

    if (confirmDelete !== 'DELETE') {
      alert('Deletion cancelled')
      return
    }

    try {
      console.log(`🗑️ Admin ${user?.username} deleting question: ${questionId}`)
      
      // Get all answers for this question (for logging purposes)
      const { data: questionAnswers } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', questionId)

      // Delete all answers for this question
      // (votes are stored in voted_by arrays within answers, so they'll be deleted automatically)
      const { error: answersError } = await supabase
        .from('answers')
        .delete()
        .eq('question_id', questionId)

      if (answersError) {
        console.error('Error deleting answers:', answersError)
      } else {
        console.log(`🗑️ Deleted ${questionAnswers?.length || 0} answers with their votes`)
      }

      // Delete the question itself
      const { error: questionError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (questionError) {
        console.error('Error deleting question:', questionError)
        alert('❌ Error deleting question')
        return
      }

      // Update UI - remove question from list
      setQuestions(prev => prev.filter(q => q.id !== questionId))
      
      console.log(`✅ Admin deleted question: ${questionTitle}`)
      alert(`✅ Question "${questionTitle}" has been permanently deleted`)
      
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('❌ Error deleting question')
    }
  }

  // ADMIN: Delete answer (admin version)
  const handleAdminDeleteAnswer = async (answerId: string, questionId: string) => {
    if (!isAdmin) {
      alert('⚠️ Access denied: Admin privileges required')
      return
    }

    const confirmDelete = prompt(`🗑️ DELETE ANSWER
    
Are you sure you want to permanently delete this answer?

This will also delete:
• All votes on this answer
• This action CANNOT be undone!

Type "DELETE" to confirm:`)

    if (confirmDelete !== 'DELETE') {
      alert('Deletion cancelled')
      return
    }

    try {
      console.log(`🗑️ Admin ${user?.username} deleting answer: ${answerId}`)
      
      // Delete the answer itself (votes are stored in voted_by array, so they'll be deleted automatically)
      const { error: answerError } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      if (answerError) {
        console.error('Error deleting answer:', answerError)
        alert('❌ Error deleting answer')
        return
      }

      // Update UI - remove answer from question
      setQuestions(prev => 
        prev.map(question => {
          if (question.id === questionId) {
            return {
              ...question,
              answers: question.answers.filter(a => a.id !== answerId)
            }
          }
          return question
        })
      )
      
      console.log(`✅ Admin deleted answer: ${answerId}`)
      alert('✅ Answer has been permanently deleted')
      
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('❌ Error deleting answer')
    }
  }

  // Handle marking answer as best
  const handleMarkBestAnswer = async (answerId: string) => {
    if (!user?.username || !selectedQuestion) return

    try {
      console.log('⭐ Marking best answer:', answerId)

      // Update answer as best answer
      const { error } = await supabase
        .from('answers')
        .update({ is_best_answer: true })
        .eq('id', answerId)

      if (error) {
        console.error('Error marking best answer:', error)
        return
      }

      // Remove best answer from other answers of the same question
      await supabase
        .from('answers')
        .update({ is_best_answer: false })
        .eq('question_id', selectedQuestion.id)
        .neq('id', answerId)

      // Update UI
      setQuestions(prevQuestions => {
        return prevQuestions.map(question => {
          if (question.id === selectedQuestion.id) {
            const updatedAnswers = question.answers.map(answer => {
              return {
                ...answer,
                is_best_answer: answer.id === answerId
              }
            })
            return { ...question, answers: updatedAnswers }
          }
          return question
        })
      })

      console.log('✅ Best answer marked successfully')
      
    } catch (error) {
      console.error('Error marking best answer:', error)
    }
  }

  // Delete answer with coin penalty
  const handleDeleteAnswer = async (answerId: string) => {
    if (!user?.username) return

    try {
      console.log('🗑️ Deleting answer:', answerId)

      // Get answer details to check for coin penalties
      const { data: answerData, error: fetchError } = await supabase
        .from('answers')
        .select('author_id, votes, coin_earnings, created_at')
        .eq('id', answerId)
        .single()

      if (fetchError || !answerData) {
        console.error('Error fetching answer data:', fetchError)
        alert('Failed to delete answer. Please try again.')
        return
      }

      // Verify ownership
      if (answerData.author_id !== user.username) {
        alert('You can only delete your own answers!')
        return
      }

      // Calculate coin penalty
      let coinPenalty = 0
      
      // If answer earned coins from votes or was rewarded, apply penalty
      if (answerData.votes > 0) {
        coinPenalty += answerData.votes // 1 coin per helpful vote
      }
      if (answerData.coin_earnings > 0) {
        coinPenalty += answerData.coin_earnings
      }
      
      // Show confirmation with penalty warning
      const confirmMessage = coinPenalty > 0 
        ? `Delete this answer? This will cost you ${coinPenalty} coins (earned from votes/rewards).`
        : 'Delete this answer? This action cannot be undone.'
      
      if (!confirm(confirmMessage)) {
        return
      }

      // Check if user has enough coins to pay penalty
      if (coinPenalty > 0 && (user.coins || 0) < coinPenalty) {
        alert(`Insufficient coins! You need ${coinPenalty} coins to delete this answer.`)
        return
      }

      // Apply coin penalty FIRST (if applicable)
      let originalBalance = user.coins || 0
      if (coinPenalty > 0) {
        const newBalance = originalBalance - coinPenalty
        
        // Deduct coins immediately
        const { error: coinError } = await supabase
          .from('users')
          .update({ coins: newBalance })
          .eq('username', user.username)
        
        if (coinError) {
          console.error('Error applying coin penalty:', coinError)
          alert('Failed to process coin penalty. Please try again.')
          return
        }
        
        // Update local state
        setUser(prev => prev ? { ...prev, coins: newBalance } : null)
        originalBalance = newBalance
        
        console.log(`💰 Applied coin penalty first: -${coinPenalty}, new balance: ${newBalance}`)
      }

      // Then delete the answer
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      if (deleteError) {
        console.error('Error deleting answer:', deleteError)
        
        // ROLLBACK: Restore coins if deletion failed
        if (coinPenalty > 0) {
          const restoredBalance = originalBalance + coinPenalty
          await supabase
            .from('users')
            .update({ coins: restoredBalance })
            .eq('username', user.username)
          
          setUser(prev => prev ? { ...prev, coins: restoredBalance } : null)
          console.log(`💰 Rolled back coin penalty: +${coinPenalty}, restored balance: ${restoredBalance}`)
        }
        
        alert('Failed to delete answer. Your coins have been restored.')
        return
      }

      // Show coin animation for penalty only after successful deletion
      if (coinPenalty > 0) {
        const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        showCoinChangeAnimation(-coinPenalty, position)
      }

      // Update UI - remove answer from questions
      setQuestions(prevQuestions => {
        return prevQuestions.map(question => {
          return {
            ...question,
            answers: question.answers.filter(answer => answer.id !== answerId)
          }
        })
      })

      console.log('✅ Answer deleted successfully')
      
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('Failed to delete answer. Please try again.')
    }
  }

  // Delete question with time/condition restrictions
  const handleDeleteQuestion = async (questionId: string) => {
    if (!user?.username) return

    try {
      console.log('🗑️ Deleting question:', questionId)

      // Get question details
      const { data: questionData, error: fetchError } = await supabase
        .from('questions')
        .select('author_id, created_at, coin_cost, answers!inner(count)')
        .eq('id', questionId)
        .single()

      if (fetchError || !questionData) {
        console.error('Error fetching question data:', fetchError)
        alert('Failed to delete question. Please try again.')
        return
      }

      // Verify ownership
      if (questionData.author_id !== user.username) {
        alert('You can only delete your own questions!')
        return
      }

      // Check if question has answers
      const { count: answerCount } = await supabase
        .from('answers')
        .select('id', { count: 'exact' })
        .eq('question_id', questionId)

      if (answerCount && answerCount > 0) {
        alert(`Cannot delete question with ${answerCount} answers. This would disrupt the community conversation.`)
        return
      }

      // Check time restriction (10 minutes grace period)
      const createdAt = new Date(questionData.created_at)
      const now = new Date()
      const timeDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60) // minutes
      const gracePeriod = 10

      let confirmMessage = ''
      if (timeDiff <= gracePeriod) {
        confirmMessage = `Delete this question? You are within the ${gracePeriod}-minute grace period. Coins will NOT be refunded.`
      } else {
        confirmMessage = `Delete this question? Posted ${Math.round(timeDiff)} minutes ago. Coins will NOT be refunded.`
      }

      if (!confirm(confirmMessage)) {
        return
      }

      // Delete the question (coins are NEVER refunded)
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId)

      if (deleteError) {
        console.error('Error deleting question:', deleteError)
        alert('Failed to delete question. Please try again.')
        return
      }

      // Update UI - remove question from list
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId))

      // Close modal if this question was selected
      if (selectedQuestion?.id === questionId) {
        setSelectedQuestion(null)
        setShowAnswerModal(false)
      }

      console.log('✅ Question deleted successfully (no coin refund)')
      
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('Failed to delete question. Please try again.')
    }
  }

  if (isLoading || !user) {
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
              onClick={() => router.push('/dashboard')}
              className="flex items-center gap-2 px-3 py-2 bg-purple-700/50 hover:bg-purple-600/50 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Dashboard</span>
            </button>
            
            <button 
              onClick={() => router.push('/dashboard')}
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

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 bg-white/10 hover:bg-purple-500/20 rounded-lg transition-colors relative"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown - Mobile Responsive */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-screen max-w-sm sm:w-96 sm:max-w-none bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto -mr-4 sm:mr-0">
                  <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                    <h3 className="font-medium text-white">Recent Activity ({notifications.length})</h3>
                    <div className="flex gap-2">
                      {notifications.length > 0 ? (
                        <button
                          onClick={clearAllNotifications}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Clear All
                        </button>
                      ) : (
                        <button
                          onClick={loadNotifications}
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Refresh
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {(() => {
                    if (notifications.length === 0) {
                      return (
                        <div className="p-6 text-center">
                          <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-400 text-sm">No recent activity</p>
                          <p className="text-gray-500 text-xs mt-1">You'll see new answers and votes here</p>
                        </div>
                      )
                    }

                    const { individual, groups } = processNotificationsForDisplay(notifications)
                    return (
                      <div className="divide-y divide-gray-700">
                        {/* Grouped Notifications */}
                        {groups.map((group) => (
                          <div 
                            key={group.id}
                            className="p-3 hover:bg-gray-800 cursor-pointer"
                            onClick={() => {
                              if (group.question_id) {
                                const questionElement = document.getElementById(`question-${group.question_id}`)
                                if (questionElement) {
                                  questionElement.scrollIntoView({ behavior: 'smooth' })
                                  setShowNotifications(false)
                                }
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              {group.type === 'grouped_answers' && <MessageCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                              {group.type === 'grouped_votes' && <ThumbsUp className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full text-xs font-medium">
                                    {group.count}
                                  </span>
                                  <p className="text-sm text-white font-medium">{group.message}</p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(group.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Individual Notifications */}
                        {individual.map((notification) => (
                          <div 
                            key={notification.id} 
                            className="p-3 hover:bg-gray-800 cursor-pointer"
                            onClick={() => {
                              const questionElement = document.getElementById(`question-${notification.question_id}`)
                              if (questionElement) {
                                questionElement.scrollIntoView({ behavior: 'smooth' })
                                setShowNotifications(false)
                                // Mark as read
                                setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, read: true} : n))
                                setUnreadNotifications(prev => Math.max(0, prev - 1))
                              }
                            }}
                          >
                            <div className="flex items-start gap-2">
                              {notification.type === 'new_answer' && <MessageCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />}
                              {notification.type === 'helpful_vote' && <ThumbsUp className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />}
                              <div className="flex-1">
                                <p className="text-sm text-white">{notification.message}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Show summary if many notifications */}
                        {notifications.length > 8 && (
                          <div className="p-3 border-t border-gray-700 text-center">
                            <p className="text-xs text-gray-400">
                              Showing recent activity • {notifications.length} total notifications
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>
            
            {/* User Dropdown Menu */}
            <UserDropdownMenu user={user} userCoins={user?.coins || 0} />
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

          {/* Category Tabs - Desktop */}
          <div className="hidden md:flex overflow-x-auto space-x-2 pb-2">
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

          {/* Category Dropdown - Mobile */}
          <div className="md:hidden relative" ref={categoryDropdownRef}>
            <button
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/10 rounded-lg text-white hover:bg-purple-500/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{allCommunities.find(c => c.id === activeTab)?.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{allCommunities.find(c => c.id === activeTab)?.name}</div>
                  <div className="text-xs text-white/60">{allCommunities.find(c => c.id === activeTab)?.description}</div>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showCategoryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-purple-500/30 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto"
                >
                  {allCommunities.map((community) => (
                    <button
                      key={community.id}
                      onClick={() => {
                        setActiveTab(community.id)
                        setShowCategoryDropdown(false)
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-purple-500/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                        activeTab === community.id ? 'bg-purple-500/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{community.icon}</span>
                        <div>
                          <div className="font-semibold text-white">{community.name}</div>
                          <div className="text-xs text-white/60">{community.description}</div>
                        </div>
                      </div>
                      {activeTab === community.id && <Check className="h-4 w-4 text-purple-400" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
            <>
            {questions.map((question, index) => {
              const isExpanded = expandedQuestions.has(question.id)
              const sortedAnswers = sortAnswers(question.answers, 'best-first')
              const visibleCount = visibleAnswersCount[question.id] || INITIAL_ANSWERS_SHOW
              const visibleAnswers = sortedAnswers.slice(0, visibleCount)
              const hasMoreAnswers = sortedAnswers.length > visibleCount

              return (
                <div
                  key={question.id}
                  id={`question-${question.id}`}
                  className={`bg-gradient-to-r from-gray-900/80 via-gray-800/60 to-gray-900/80 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg transition-all duration-300 ${isClient ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ 
                    transitionDelay: isClient ? `${index * 100}ms` : '0ms'
                  }}
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold">{question.title}</h3>
                        
                        {/* Answer Status Indicators */}
                        {question.answers.length === 0 ? (
                          <div className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>No Answers</span>
                          </div>
                        ) : question.is_solved ? (
                          <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                            ✓ Solved
                          </div>
                        ) : (
                          <div className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {question.question_type === 'urgent' && (
                          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Urgent</span>
                          </div>
                        )}
                        {isAdmin && (
                          <div className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            <span>ADMIN</span>
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

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex flex-col gap-2 ml-4">
                        <button
                          onClick={() => handleAdminDeleteQuestion(question.id, question.title)}
                          className="p-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 rounded-lg text-red-400 hover:text-red-300 transition-colors"
                          title="Delete Question (Admin Only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                          {/* Supabase Voting System */}
                          <div className="flex items-center gap-4 mt-4">
                            {/* Show Helpful button only for answers by other users */}
                            {answer.author_id !== user?.username && (
                              <button
                                onClick={() => handleVoteAnswer(answer.id, 'helpful')}
                                className="flex items-center gap-2 px-3 py-1 bg-green-600/20 hover:bg-green-600/40 border border-green-500/30 rounded-lg transition-colors text-sm"
                              >
                                <ThumbsUp className="w-4 h-4" />
                                <span>Helpful ({answer.votes || 0})</span>
                              </button>
                            )}
                            
                            {/* Show vote count for own answers (without voting button) */}
                            {answer.author_id === user?.username && answer.votes && answer.votes > 0 && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-gray-600/20 border border-gray-500/30 rounded-lg text-sm">
                                <ThumbsUp className="w-4 h-4 text-gray-400" />
                                <span>Helpful ({answer.votes})</span>
                              </div>
                            )}
                            
                            {selectedQuestion?.author_id === user?.username && (
                              <button
                                onClick={() => handleMarkBestAnswer(answer.id)}
                                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                                  answer.is_best_answer 
                                    ? 'bg-yellow-600/40 border border-yellow-500/50 text-yellow-200'
                                    : 'bg-gray-600/20 hover:bg-yellow-600/20 border border-gray-500/30'
                                }`}
                              >
                                {answer.is_best_answer ? '✅ Best Answer' : 'Mark as Best'}
                              </button>
                            )}
                            
                            {/* Admin delete button */}
                            {isAdmin && (
                              <button
                                onClick={() => handleAdminDeleteAnswer(answer.id, question.id)}
                                className="px-3 py-1 bg-red-600/30 hover:bg-red-600/50 border border-red-500/50 rounded-lg transition-colors text-sm text-red-300 hover:text-red-200 flex items-center gap-1"
                                title="Delete Answer (Admin Only)"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Admin Delete</span>
                              </button>
                            )}
                            
                            {/* Delete button for own answers */}
                            {answer.author_id === user?.username && (
                              <button
                                onClick={() => handleDeleteAnswer(answer.id)}
                                className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-colors text-sm text-red-300 hover:text-red-200"
                                title={`Delete answer${answer.votes > 0 ? ` (costs ${answer.votes} coins)` : ''}`}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
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
                          {question.answers.length > 0 && (
                            <div className="text-xs opacity-50 mt-2">
                              Showing {visibleCount} of {question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}
                            </div>
                          )}
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
                      
                      {/* Own question actions */}
                      {question.author_id === user?.username ? (
                        <div className="flex items-center gap-2">
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
                          
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 rounded-lg transition-colors text-sm text-red-300 hover:text-red-200"
                            title={`Delete question${question.answers.length > 0 ? ' (requires no answers)' : ''}`}
                          >
                            <span className="hidden sm:inline">🗑️ Delete</span>
                            <span className="sm:hidden">🗑️</span>
                          </button>
                        </div>
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
                </div>
              )
            })}
            </>
          )}
          
          {/* Pagination Controls */}
          {questions.length > 0 && (
            <div className="mt-8 text-center">
              {/* Question count indicator */}
              <div className="text-gray-400 text-sm mb-4">
                Showing {questions.length} question{questions.length !== 1 ? 's' : ''}
                {totalQuestionsCount > 0 && totalQuestionsCount > questions.length && (
                  <span> of {totalQuestionsCount} total</span>
                )}
              </div>
              
              {/* Load More Button */}
              {hasMoreQuestions && (
                <div className="space-y-4">
                  <button
                    onClick={loadMoreQuestions}
                    disabled={loadingMore}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Loading...
                      </>
                    ) : (
                      <>
                        Load Next {QUESTIONS_PER_PAGE}
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  {/* Integrated Search Bar */}
                  <div className="max-w-md mx-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Or search for specific topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none transition-colors"
                      />
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="mt-2 text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 mx-auto"
                      >
                        <X className="w-3 h-3" />
                        Clear search
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              {/* No more results message */}
              {!hasMoreQuestions && questions.length >= QUESTIONS_PER_PAGE && (
                <div className="text-gray-400 text-sm">
                  🎉 You've reached the end! No more questions to load.
                </div>
              )}
            </div>
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
              {/* Question cost display */}
              <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-purple-400">Question Type</h4>
                    <p className="text-sm text-gray-400">
                      {selectedQuestionType === 'urgent' ? 'Urgent (5 coins)' : 'Regular (2 coins)'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedQuestionType('regular')}
                      className={`px-3 py-1 rounded text-sm ${selectedQuestionType === 'regular' ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      Regular
                    </button>
                    <button
                      onClick={() => setSelectedQuestionType('urgent')}
                      className={`px-3 py-1 rounded text-sm ${selectedQuestionType === 'urgent' ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      Urgent
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Your balance: {user?.coins || 0} coins
                </p>
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
                  onClick={(e) => handleAskQuestion(e)}
                  disabled={
                    !newQuestionTitle.trim() || 
                    !newQuestionBody.trim() || 
                    loading || 
                    (user?.coins || 0) < (selectedQuestionType === 'urgent' ? 5 : 2)
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
                {selectedQuestion.author_id === user?.username ? 'Add Clarification' : 'Answer Question'}
              </h3>
              
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">{selectedQuestion.title}</h4>
                <p className="text-sm opacity-70">{selectedQuestion.body}</p>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-purple-400 mb-2">
                  {selectedQuestion.author_id === user?.username ? 'Your Clarification' : 'Your Answer'}
                </label>
                <textarea 
                  placeholder={selectedQuestion.author_id === user?.username ? "Add more details or clarify your question..." : "Share your experience and advice..."}
                  value={newAnswerContent}
                  onChange={(e) => setNewAnswerContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 bg-black/60 border border-purple-500/30 rounded-lg text-white placeholder-white/60 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                />
                <div className="text-xs opacity-60 mt-2 flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {selectedQuestion.author_id === user?.username 
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
                  onClick={(e) => handleAnswerQuestion(e)}
                  disabled={!newAnswerContent.trim() || loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 rounded-lg font-semibold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Submitting...' : (
                    <>
                      {selectedQuestion.author_id === user?.username ? 'Submit Clarification' : 'Submit Answer'}
                      <div className="flex items-center gap-1 text-xs bg-white/20 px-2 py-1 rounded-full">
                        {selectedQuestion.author_id === user?.username ? 'No coins' : (
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
      
      {/* Floating Coin Animation */}
      <CoinAnimation
        show={showCoinAnimation}
        amount={coinAnimationAmount}
        position={coinAnimationPosition}
        onComplete={() => {
          setShowCoinAnimation(false)
          setCoinAnimationAmount(0)
        }}
      />
    </div>
  )
}

export default function CommunityPage() {
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
      <CommunityContent />
    </Suspense>
  )
}
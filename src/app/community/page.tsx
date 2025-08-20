// Enhanced Community page.tsx with Simple Coin System Integration - COMPLETE FIXED VERSION

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, Suspense, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Clock, Star, Award, ThumbsUp, MessageCircle, RefreshCw, Coins, ChevronDown, ChevronUp } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)
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
        
        console.log('✅ User authenticated for community:', userData.username)
        setUser(userData)
        
        // Load questions
        await loadQuestions()
        
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
    
    // Also refresh coins on refresh
    if (user?.username) {
      await refreshUserCoins(user.username)
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
        category: activeTab === 'all' ? 'confidence-building' : activeTab,
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
      if (data.author_id && data.author_id !== user.username) {
        const authorData = await SupabaseUserManager.getUserByUsername(data.author_id)
        if (authorData) {
          const newAuthorBalance = (authorData.coins || 0) + 1
          await SupabaseUserManager.updateUserCoins(data.author_id, newAuthorBalance)
          console.log('💰 Rewarded answer author:', data.author_id, '+1 coin')
          
          // Animation will be shown when that user logs in and sees updated balance
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
                voted_by: newVotedBy
              }
            }
            return answer
          })
          return { ...question, answers: updatedAnswers }
        })
      })

      console.log('✅ Vote recorded successfully')
      
    } catch (error) {
      console.error('Error voting on answer:', error)
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

      // Delete the answer
      const { error: deleteError } = await supabase
        .from('answers')
        .delete()
        .eq('id', answerId)

      if (deleteError) {
        console.error('Error deleting answer:', deleteError)
        alert('Failed to delete answer. Please try again.')
        return
      }

      // Apply coin penalty if applicable
      if (coinPenalty > 0) {
        const newBalance = (user.coins || 0) - coinPenalty
        await SupabaseUserManager.updateUserCoins(user.username, newBalance)
        setUser(prev => prev ? { ...prev, coins: newBalance } : null)
        
        // Show coin animation for penalty at center (no click event for delete)
        const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
        showCoinChangeAnimation(-coinPenalty, position)
        
        console.log(`💰 Applied coin penalty: -${coinPenalty}, new balance: ${newBalance}`)
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
            {/* FIXED: Display Supabase coins as primary, with fallback */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-magenta-500/20 text-white px-2 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-semibold border border-purple-500/30">
              <Coins className="w-4 h-4" />
              <span>{user?.coins || 0}</span>
            </div>
            <div className="text-sm opacity-70 hidden lg:block">Hey {user?.username || 'User'}!</div>
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
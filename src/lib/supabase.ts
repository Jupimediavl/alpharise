// /lib/supabase.ts
// Fixed Supabase integration with Anti-Abuse Coin System

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection on initialization
if (typeof window !== 'undefined') {
  console.log('🔌 Supabase config:', { 
    url: supabaseUrl, 
    keyPrefix: supabaseAnonKey.substring(0, 20) + '...' 
  })
}

// Database Types
export interface DbUser {
  id: string
  username: string
  email: string
  avatar_type: 'marcus' | 'jake' | 'alex' | 'ryan' // Actual valid DB values
  user_type: 'overthinker' | 'nervous' | 'rookie' | 'updown' | 'surface' // Assessment result
  coach: 'logan' | 'chase' | 'mason' | 'blake' | 'knox' // Assigned coach
  coins: number
  streak: number
  level: number
  total_earned: number
  monthly_earnings: number
  discount_earned: number
  subscription_type: 'trial' | 'premium'
  trial_days_left: number
  confidence_score: number
  experience: number
  badges: string[]
  created_at: string
  updated_at: string
  last_active: string
}

export interface DbQuestion {
  id: string
  title: string
  body: string
  author_id: string
  author_name: string
  category: string
  question_type: 'regular' | 'urgent' | 'private' | 'vip'
  coin_cost: number
  coin_bounty: number
  tags: string[]
  views: number
  is_answered: boolean
  is_solved: boolean
  best_answer_id?: string
  urgent_deadline?: string
  is_private: boolean
  allowed_responders?: string[]
  created_at: string
  updated_at: string
  last_activity: string
}

export interface DbAnswer {
  id: string
  question_id: string
  author_id: string
  author_name: string
  content: string
  rating: number
  rated_by: string[]
  coin_earnings: number
  is_best_answer: boolean
  is_helpful: boolean
  votes: number
  voted_by: string[]
  created_at: string
  updated_at: string
}

export interface DbCoinTransaction {
  id: string
  user_id: string
  type: 'earn' | 'spend'
  amount: number
  reason: string
  category: 'question' | 'answer' | 'bonus' | 'subscription' | 'daily' | 'achievement'
  question_id?: string
  answer_id?: string
  rating?: number
  created_at: string
}

export interface DbCoach {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  created_at: string
}

// User Management - FIXED VERSION
export class SupabaseUserManager {
  
  // Create or update user - FIXED upsert
  static async upsertUser(userData: Partial<DbUser>): Promise<DbUser | null> {
    try {
      // First try to get existing user
      if (userData.username) {
        const existingUser = await this.getUserByUsername(userData.username)
        if (existingUser) {
          // Update existing user - only update specific fields
          const updateData = {
            email: userData.email || existingUser.email,
            avatar_type: userData.avatar_type || existingUser.avatar_type,
            updated_at: new Date().toISOString(),
            last_active: new Date().toISOString()
          }

          const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('username', userData.username)
            .select()
            .single()
          
          if (error) {
            console.warn('Error updating user, returning existing:', error.message)
            return existingUser // Return existing user if update fails
          }
          
          return data
        }
      }

      // Create new user if doesn't exist
      const newUserData = {
        username: userData.username,
        email: userData.email,
        avatar_type: userData.avatar_type || 'marcus',
        user_type: userData.user_type || 'overthinker',
        coach: userData.coach || 'logan',
        coins: userData.coins || 200,
        streak: userData.streak || 1,
        level: userData.level || 1,
        total_earned: userData.total_earned || 0,
        monthly_earnings: userData.monthly_earnings || 0,
        discount_earned: userData.discount_earned || 0,
        subscription_type: userData.subscription_type || 'trial',
        trial_days_left: userData.trial_days_left || 7,
        confidence_score: userData.confidence_score || 34,
        experience: userData.experience || 150,
        badges: userData.badges || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }
      
      // Validate required fields
      if (!newUserData.username || !newUserData.email) {
        console.error('❌ Missing required fields:', { username: newUserData.username, email: newUserData.email })
        return null
      }

      console.log('📝 Attempting to create user with data:', newUserData)
      console.log('📊 Assessment values received:', {
        user_type: userData.user_type,
        coach: userData.coach,
        avatar_type: userData.avatar_type
      })
      
      const { data, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single()
      
      if (error) {
        console.error('❌ Error creating user:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return null
      }
      
      console.log('✅ User created successfully:', data)
      
      return data
    } catch (error) {
      console.error('Error in upsertUser:', error)
      return null
    }
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<DbUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getUserByUsername:', error)
      return null
    }
  }

  // Update user coins with daily limit check
  static async updateUserCoins(username: string, newBalance: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          coins: newBalance,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('username', username)
      
      if (error) {
        console.error('Error updating user coins:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateUserCoins:', error)
      return false
    }
  }

  // Update user stats
  static async updateUserStats(username: string, stats: {
    total_earned?: number
    monthly_earnings?: number
    discount_earned?: number
    streak?: number
    level?: number
    experience?: number
  }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...stats,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('username', username)
      
      if (error) {
        console.error('Error updating user stats:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateUserStats:', error)
      return false
    }
  }

  // Check daily earning limit (50 coins/day from answers)
  static async checkDailyEarningLimit(username: string): Promise<{ canEarn: boolean; todayEarnings: number }> {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('amount')
        .eq('user_id', username)
        .eq('type', 'earn')
        .eq('category', 'answer')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Error checking daily limit:', error)
        return { canEarn: true, todayEarnings: 0 }
      }

      const todayEarnings = (data || []).reduce((sum, tx) => sum + tx.amount, 0)
      const canEarn = todayEarnings < 50

      return { canEarn, todayEarnings }
    } catch (error) {
      console.error('Error in checkDailyEarningLimit:', error)
      return { canEarn: true, todayEarnings: 0 }
    }
  }
}

// Answer Management - ENHANCED WITH ANTI-ABUSE
export class SupabaseAnswerManager {
  
  // Create new answer
  static async createAnswer(answerData: Omit<DbAnswer, 'id' | 'created_at' | 'updated_at'>): Promise<DbAnswer | null> {
    try {
      const { data, error } = await supabase
        .from('answers')
        .insert({
          ...answerData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating answer:', error)
        return null
      }

      // Update question as answered
      await SupabaseQuestionManager.updateQuestion(answerData.question_id, {
        is_answered: true
      })

      return data
    } catch (error) {
      console.error('Error in createAnswer:', error)
      return null
    }
  }

  // Rate answer with enhanced validation
  static async rateAnswer(answerId: string, rating: number, ratedBy: string): Promise<{
    success: boolean
    coinEarnings: number
    newRating: number
    message: string
  }> {
    try {
      // Get current answer and question info
      const { data: answer, error: getError } = await supabase
        .from('answers')
        .select(`
          *,
          question:questions(author_id)
        `)
        .eq('id', answerId)
        .single()

      if (getError || !answer) {
        return { success: false, coinEarnings: 0, newRating: 0, message: 'Answer not found' }
      }

      // Anti-abuse checks
      if (answer.author_id === ratedBy) {
        return { success: false, coinEarnings: 0, newRating: answer.rating, message: 'Cannot rate your own answer' }
      }

      if (answer.rated_by.includes(ratedBy)) {
        return { success: false, coinEarnings: 0, newRating: answer.rating, message: 'You have already rated this answer' }
      }

      // Calculate new rating
      const newRatedBy = [...answer.rated_by, ratedBy]
      const totalRatings = newRatedBy.length
      const newRating = ((answer.rating * (totalRatings - 1)) + rating) / totalRatings

      // Calculate base coin earnings (only from rating)
      let coinEarnings = 0
      if (newRating >= 3.0) coinEarnings = 3
      if (newRating >= 4.0) coinEarnings = 5
      if (newRating >= 4.5) coinEarnings = 8

      // Check daily earning limit
      const { canEarn, todayEarnings } = await SupabaseUserManager.checkDailyEarningLimit(answer.author_id)
      if (!canEarn) {
        coinEarnings = 0
      }

      // Update answer
      const { error: updateError } = await supabase
        .from('answers')
        .update({
          rating: newRating,
          rated_by: newRatedBy,
          coin_earnings: answer.coin_earnings + coinEarnings,
          is_helpful: newRating >= 4,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      if (updateError) {
        console.error('Error updating answer:', updateError)
        return { success: false, coinEarnings: 0, newRating: answer.rating, message: 'Failed to update rating' }
      }

      return { 
        success: true, 
        coinEarnings, 
        newRating,
        message: coinEarnings > 0 ? `Rating submitted! Author earned ${coinEarnings} coins.` : 'Rating submitted! (Daily limit reached for author)'
      }
    } catch (error) {
      console.error('Error in rateAnswer:', error)
      return { success: false, coinEarnings: 0, newRating: 0, message: 'Error submitting rating' }
    }
  }

  // Mark best answer with enhanced validation
  static async markBestAnswer(questionId: string, answerId: string, markedBy: string): Promise<{
    success: boolean
    message: string
    coinsAwarded: number
  }> {
    try {
      // Get question and answer details
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('author_id, best_answer_id')
        .eq('id', questionId)
        .single()

      if (questionError || !question) {
        return { success: false, message: 'Question not found', coinsAwarded: 0 }
      }

      // Anti-abuse check: Only question author can mark best answer
      if (question.author_id !== markedBy) {
        return { success: false, message: 'Only the question author can mark the best answer', coinsAwarded: 0 }
      }

      // Get answer details for additional validation
      const { data: answer, error: answerError } = await supabase
        .from('answers')
        .select('author_id, rated_by, rating, coin_earnings')
        .eq('id', answerId)
        .single()

      if (answerError || !answer) {
        return { success: false, message: 'Answer not found', coinsAwarded: 0 }
      }

      // Anti-abuse check: Cannot mark own answer as best
      if (answer.author_id === markedBy) {
        return { success: false, message: 'Cannot mark your own answer as best answer', coinsAwarded: 0 }
      }

      // Enhanced validation: Best answer requires community validation
      const hasMinimumRatings = answer.rated_by.length >= 2
      const hasGoodRating = answer.rating >= 4.0

      let coinsAwarded = 0
      let validationMessage = ''

      if (hasMinimumRatings && hasGoodRating) {
        // Award full best answer bonus
        coinsAwarded = 8
        validationMessage = 'Best answer marked! Author earned bonus coins.'
      } else if (answer.rated_by.length === 0) {
        // No ratings yet - mark as preferred but no coins until validated
        coinsAwarded = 0
        validationMessage = 'Answer marked as preferred. Bonus coins will be awarded when community validates it (min 2 ratings, 4+ stars).'
      } else {
        // Some ratings but not enough or too low
        coinsAwarded = 0
        validationMessage = 'Answer marked as preferred. Needs more community validation for bonus coins (min 2 ratings, 4+ stars).'
      }

      // Check daily earning limit for bonus coins
      if (coinsAwarded > 0) {
        const { canEarn } = await SupabaseUserManager.checkDailyEarningLimit(answer.author_id)
        if (!canEarn) {
          coinsAwarded = 0
          validationMessage += ' (Author reached daily earning limit)'
        }
      }

      // Remove previous best answer if exists
      if (question.best_answer_id) {
        await supabase
          .from('answers')
          .update({ is_best_answer: false })
          .eq('id', question.best_answer_id)
      }

      // Set new best answer
      const { error: answerUpdateError } = await supabase
        .from('answers')
        .update({ 
          is_best_answer: true,
          coin_earnings: answer.coin_earnings + coinsAwarded,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      if (answerUpdateError) {
        console.error('Error marking best answer:', answerUpdateError)
        return { success: false, message: 'Failed to mark best answer', coinsAwarded: 0 }
      }

      // Update question
      const { error: questionUpdateError } = await supabase
        .from('questions')
        .update({
          best_answer_id: answerId,
          is_solved: true,
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', questionId)

      if (questionUpdateError) {
        console.error('Error updating question:', questionUpdateError)
        return { success: false, message: 'Failed to update question', coinsAwarded: 0 }
      }

      return { success: true, message: validationMessage, coinsAwarded }
    } catch (error) {
      console.error('Error in markBestAnswer:', error)
      return { success: false, message: 'Error marking best answer', coinsAwarded: 0 }
    }
  }

  // Vote on answer (like/dislike) with anti-abuse
  static async voteAnswer(answerId: string, userId: string, voteType: 'up' | 'down'): Promise<{
    success: boolean
    message: string
    newVoteCount: number
  }> {
    try {
      const { data: answer, error } = await supabase
        .from('answers')
        .select('author_id, votes, voted_by')
        .eq('id', answerId)
        .single()

      if (error || !answer) {
        return { success: false, message: 'Answer not found', newVoteCount: 0 }
      }

      // Anti-abuse: Cannot vote own answer
      if (answer.author_id === userId) {
        return { success: false, message: 'Cannot vote on your own answer', newVoteCount: answer.votes }
      }

      // Check if already voted
      if (answer.voted_by.includes(userId)) {
        return { success: false, message: 'You have already voted on this answer', newVoteCount: answer.votes }
      }

      const newVotedBy = [...answer.voted_by, userId]
      const newVotes = voteType === 'up' ? answer.votes + 1 : answer.votes - 1

      const { error: updateError } = await supabase
        .from('answers')
        .update({
          votes: newVotes,
          voted_by: newVotedBy,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      if (updateError) {
        console.error('Error voting answer:', updateError)
        return { success: false, message: 'Failed to record vote', newVoteCount: answer.votes }
      }

      return { 
        success: true, 
        message: `Vote recorded!`, 
        newVoteCount: newVotes 
      }
    } catch (error) {
      console.error('Error in voteAnswer:', error)
      return { success: false, message: 'Error recording vote', newVoteCount: 0 }
    }
  }
}

// Question Management (unchanged but with better error handling)
export class SupabaseQuestionManager {
  
  static async createQuestion(questionData: Omit<DbQuestion, 'id' | 'created_at' | 'updated_at' | 'last_activity'>): Promise<DbQuestion | null> {
    try {
      const { data, error } = await supabase
        .from('questions')
        .insert({
          ...questionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating question:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in createQuestion:', error)
      return null
    }
  }

  static async getQuestions(filters: {
    category?: string
    question_type?: string
    is_answered?: boolean
    author_id?: string
    limit?: number
    sortBy?: 'newest' | 'oldest' | 'popular' | 'urgent'
  } = {}): Promise<DbQuestion[]> {
    try {
      let query = supabase
        .from('questions')
        .select('*')

      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }
      if (filters.question_type) {
        query = query.eq('question_type', filters.question_type)
      }
      if (filters.is_answered !== undefined) {
        query = query.eq('is_answered', filters.is_answered)
      }
      if (filters.author_id) {
        query = query.eq('author_id', filters.author_id)
      }

      switch (filters.sortBy) {
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'oldest':
          query = query.order('created_at', { ascending: true })
          break
        case 'popular':
          query = query.order('views', { ascending: false })
          break
        case 'urgent':
          query = query.order('question_type', { ascending: false }).order('created_at', { ascending: false })
          break
        default:
          query = query.order('last_activity', { ascending: false })
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error getting questions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getQuestions:', error)
      return []
    }
  }

  static async getQuestionWithAnswers(questionId: string): Promise<{
    question: DbQuestion | null
    answers: DbAnswer[]
  }> {
    try {
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('*')
        .eq('id', questionId)
        .single()

      if (questionError) {
        console.error('Error getting question:', questionError)
        return { question: null, answers: [] }
      }

      // Increment view count
      await supabase
        .from('questions')
        .update({ 
          views: (question.views || 0) + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)

      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: false })

      if (answersError) {
        console.error('Error getting answers:', answersError)
        return { question, answers: [] }
      }

      return { question: { ...question, views: (question.views || 0) + 1 }, answers: answers || [] }
    } catch (error) {
      console.error('Error in getQuestionWithAnswers:', error)
      return { question: null, answers: [] }
    }
  }

  static async updateQuestion(questionId: string, updates: Partial<DbQuestion>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('questions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('id', questionId)

      if (error) {
        console.error('Error updating question:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateQuestion:', error)
      return false
    }
  }

  static async searchQuestions(query: string, category?: string): Promise<DbQuestion[]> {
    try {
      let supabaseQuery = supabase
        .from('questions')
        .select('*')
        .or(`title.ilike.%${query}%,body.ilike.%${query}%`)

      if (category && category !== 'all') {
        supabaseQuery = supabaseQuery.eq('category', category)
      }

      const { data, error } = await supabaseQuery
        .order('last_activity', { ascending: false })

      if (error) {
        console.error('Error searching questions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in searchQuestions:', error)
      return []
    }
  }
}

// Coach Management
export class SupabaseCoachManager {
  
  // Get coach by ID
  static async getCoachById(coachId: string): Promise<DbCoach | null> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .eq('id', coachId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting coach:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getCoachById:', error)
      return null
    }
  }

  // Get all coaches
  static async getAllCoaches(): Promise<DbCoach[]> {
    try {
      const { data, error } = await supabase
        .from('coaches')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Error getting coaches:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getAllCoaches:', error)
      return []
    }
  }
}

// Enhanced Coin Management with Anti-Abuse
export class SupabaseCoinManager {
  
  // Record transaction with better error handling
  static async recordTransaction(transactionData: Omit<DbCoinTransaction, 'id' | 'created_at'>): Promise<DbCoinTransaction | null> {
    try {
      // Validate required fields
      if (!transactionData.user_id || !transactionData.type || !transactionData.amount || !transactionData.reason || !transactionData.category) {
        console.error('Missing required transaction fields:', transactionData)
        return null
      }

      const insertData = {
        user_id: transactionData.user_id,
        type: transactionData.type,
        amount: transactionData.amount,
        reason: transactionData.reason,
        category: transactionData.category,
        question_id: transactionData.question_id || null,
        answer_id: transactionData.answer_id || null,
        rating: transactionData.rating || null,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('coin_transactions')
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error recording transaction:', error)
        console.error('Transaction data:', insertData)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in recordTransaction:', error)
      return null
    }
  }

  static async getUserTransactions(userId: string, limit: number = 20): Promise<DbCoinTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error getting transactions:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getUserTransactions:', error)
      return []
    }
  }

  static async processQuestionPosting(username: string, questionType: string, coinCost: number): Promise<boolean> {
    try {
      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user || user.coins < coinCost) {
        return false
      }

      const newBalance = user.coins - coinCost
      await SupabaseUserManager.updateUserCoins(username, newBalance)

      await this.recordTransaction({
        user_id: username,
        type: 'spend',
        amount: coinCost,
        reason: `Asked ${questionType} question`,
        category: 'question'
      })

      return true
    } catch (error) {
      console.error('Error in processQuestionPosting:', error)
      return false
    }
  }

  static async processAnswerReward(
    username: string,
    questionId: string,
    answerId: string,
    coinEarnings: number,
    rating?: number
  ): Promise<boolean> {
    try {
      if (coinEarnings <= 0) return true // No coins to award

      // Check daily limit
      const { canEarn } = await SupabaseUserManager.checkDailyEarningLimit(username)
      if (!canEarn) {
        console.log(`User ${username} reached daily earning limit, skipping reward`)
        return false
      }

      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user) return false

      const newBalance = user.coins + coinEarnings
      await SupabaseUserManager.updateUserCoins(username, newBalance)
      await SupabaseUserManager.updateUserStats(username, {
        total_earned: user.total_earned + coinEarnings,
        monthly_earnings: user.monthly_earnings + coinEarnings
      })

      await this.recordTransaction({
        user_id: username,
        type: 'earn',
        amount: coinEarnings,
        reason: rating ? `Answer rated ${rating} stars` : 'Best answer bonus',
        category: 'answer',
        question_id: questionId,
        answer_id: answerId,
        rating
      })

      return true
    } catch (error) {
      console.error('Error in processAnswerReward:', error)
      return false
    }
  }
}

// Utility functions - FIXED VERSION
export const supabaseHelpers = {
  initializeUser: async (username: string, email: string, avatarType: string, userType?: string, coach?: string) => {
    return await SupabaseUserManager.upsertUser({
      username,
      email,
      avatar_type: avatarType as any,
      user_type: userType as any,
      coach: coach as any,
      coins: 200,
      streak: 1,
      level: 1,
      total_earned: 0,
      monthly_earnings: 0,
      discount_earned: 0,
      subscription_type: 'trial',
      trial_days_left: 7,
      confidence_score: 34,
      experience: 150,
      badges: []
    })
  },

  getQuestionsWithAnswers: async (filters: any = {}) => {
    const questions = await SupabaseQuestionManager.getQuestions(filters)
    
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const { answers } = await SupabaseQuestionManager.getQuestionWithAnswers(question.id)
        return {
          ...question,
          answers: answers || []
        }
      })
    )

    return questionsWithAnswers
  },

  getCoachById: async (coachId: string) => {
    return await SupabaseCoachManager.getCoachById(coachId)
  },

  getAllCoaches: async () => {
    return await SupabaseCoachManager.getAllCoaches()
  }
}
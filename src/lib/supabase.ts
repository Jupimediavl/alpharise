// /lib/supabase.ts
// Fixed Supabase integration with Anti-Abuse Coin System

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_KEY'

// Environment variables configured

// Config validated

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Auth configuration
export const supabaseAuth = supabase.auth

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
  user_type: 'overthinker' | 'nervous' | 'rookie' | 'updown' | 'surface' | 'intimacy_boost' | 'body_confidence'
  coach: 'logan' | 'chase' | 'mason' | 'blake' | 'knox'
  age: number
  confidence_score: number
  coins: number // Current coin balance
  current_plan: 'trial' | 'basic' | 'premium'
  subscription_status: 'trial' | 'active' | 'cancelled' | 'expired'
  subscription_expires_at?: string
  trial_started_at: string
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
  title?: string
  avatar?: string
  helpsWith?: string
  userTypeProblem?: string
  personalMessage?: string
  urgentBenefit?: string
  specificPain?: string
  coachStyle?: string
  color?: string
  created_at: string
}

export interface DbPricingPlan {
  id: string
  plan_type: 'trial' | 'basic' | 'premium'
  name: string
  display_name: string
  price: number
  currency: string
  trial_price: number
  trial_days: number
  original_price?: number
  discounted_price?: number
  discount_percentage?: number
  discount_end_date?: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface DbPlanFeature {
  id: string
  plan_type: 'trial' | 'basic' | 'premium'
  feature_key: string
  feature_name: string
  feature_description?: string
  max_value?: number // -1 for unlimited, NULL for boolean features
  is_enabled: boolean
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
        user_type: userData.user_type || 'overthinker',
        coach: userData.coach || 'logan',
        age: userData.age || 25,
        confidence_score: userData.confidence_score || 25,
        coins: userData.coins || 200,
        current_plan: userData.current_plan || 'trial',
        subscription_status: userData.subscription_status || 'trial',
        trial_started_at: new Date().toISOString(),
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
      console.log('📊 Confidence test values received:', {
        user_type: userData.user_type,
        coach: userData.coach
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

  // Get user by email
  static async getUserByEmail(email: string): Promise<DbUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user by email:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getUserByEmail:', error)
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


  // Update user plan
  static async updateUserPlan(username: string, planType: 'trial' | 'basic' | 'premium', status: 'trial' | 'active' | 'cancelled' | 'expired'): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          current_plan: planType,
          subscription_status: status,
          updated_at: new Date().toISOString(),
          last_active: new Date().toISOString()
        })
        .eq('username', username)
      
      if (error) {
        console.error('Error updating user plan:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in updateUserPlan:', error)
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

  // Get all users (for admin)
  static async getAllUsers(): Promise<DbUser[]> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting all users:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllUsers:', error)
      return []
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
        .eq('moderation_status', 'approved') // Only show approved content in community

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
        .eq('moderation_status', 'approved') // Only show approved answers
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
        .eq('moderation_status', 'approved') // Only search approved content

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

// Plan Features Management
export class SupabasePlanManager {
  
  // Get all features for a specific plan
  static async getPlanFeatures(planType: 'trial' | 'basic' | 'premium'): Promise<DbPlanFeature[]> {
    try {
      const { data, error } = await supabase
        .from('plan_features')
        .select('*')
        .eq('plan_type', planType)
        .eq('is_enabled', true)
      
      if (error) {
        console.error('Error getting plan features:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getPlanFeatures:', error)
      return []
    }
  }

  // Check if user has specific feature
  static async userHasFeature(username: string, featureKey: string): Promise<boolean> {
    try {
      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user) return false

      const { data, error } = await supabase
        .from('plan_features')
        .select('is_enabled')
        .eq('plan_type', user.current_plan)
        .eq('feature_key', featureKey)
        .eq('is_enabled', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user feature:', error)
        return false
      }

      return !!data
    } catch (error) {
      console.error('Error in userHasFeature:', error)
      return false
    }
  }

  // Get user's feature limit
  static async getUserFeatureLimit(username: string, featureKey: string): Promise<number> {
    try {
      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user) return 0

      const { data, error } = await supabase
        .from('plan_features')
        .select('max_value')
        .eq('plan_type', user.current_plan)
        .eq('feature_key', featureKey)
        .eq('is_enabled', true)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error getting user feature limit:', error)
        return 0
      }

      return data?.max_value || 0
    } catch (error) {
      console.error('Error in getUserFeatureLimit:', error)
      return 0
    }
  }

  // Check if user can earn more coins today
  static async canUserEarnCoins(username: string): Promise<{ canEarn: boolean; dailyLimit: number; todayEarnings: number }> {
    try {
      const dailyLimit = await this.getUserFeatureLimit(username, 'max_coins_daily')
      
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('amount')
        .eq('user_id', username)
        .eq('type', 'earn')
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Error checking coin earnings:', error)
        return { canEarn: true, dailyLimit, todayEarnings: 0 }
      }

      const todayEarnings = (data || []).reduce((sum, tx) => sum + tx.amount, 0)
      const canEarn = dailyLimit === -1 || todayEarnings < dailyLimit

      return { canEarn, dailyLimit, todayEarnings }
    } catch (error) {
      console.error('Error in canUserEarnCoins:', error)
      return { canEarn: false, dailyLimit: 0, todayEarnings: 0 }
    }
  }

  // Check if user can ask more questions today
  static async canUserAskQuestion(username: string): Promise<{ canAsk: boolean; dailyLimit: number; todayQuestions: number }> {
    try {
      const dailyLimit = await this.getUserFeatureLimit(username, 'max_questions_daily')
      
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('questions')
        .select('id')
        .eq('author_id', username)
        .gte('created_at', `${today}T00:00:00.000Z`)
        .lt('created_at', `${today}T23:59:59.999Z`)

      if (error) {
        console.error('Error checking questions asked:', error)
        return { canAsk: true, dailyLimit, todayQuestions: 0 }
      }

      const todayQuestions = (data || []).length
      const canAsk = dailyLimit === -1 || todayQuestions < dailyLimit

      return { canAsk, dailyLimit, todayQuestions }
    } catch (error) {
      console.error('Error in canUserAskQuestion:', error)
      return { canAsk: false, dailyLimit: 0, todayQuestions: 0 }
    }
  }
}

// Pricing Management
export class SupabasePricingManager {
  
  // Get all active pricing plans
  static async getActivePricingPlans(): Promise<DbPricingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true })
      
      if (error) {
        console.error('Error getting pricing plans:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getActivePricingPlans:', error)
      return []
    }
  }

  // Get specific plan by type
  static async getPlanByType(planType: string): Promise<DbPricingPlan | null> {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .eq('plan_type', planType)
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error getting pricing plan:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getPlanByType:', error)
      return null
    }
  }

  // Get trial pricing info
  static async getTrialPricing(): Promise<{
    price: number
    days: number
    currency: string
  } | null> {
    try {
      const basicPlan = await this.getPlanByType('basic')
      if (!basicPlan) return null

      return {
        price: basicPlan.trial_price || 1,
        days: basicPlan.trial_days || 3,
        currency: basicPlan.currency
      }
    } catch (error) {
      console.error('Error in getTrialPricing:', error)
      return null
    }
  }

  // Get main subscription pricing
  static async getMainPricing(): Promise<{
    price: number
    currency: string
    name: string
  } | null> {
    try {
      const basicPlan = await this.getPlanByType('basic')
      if (!basicPlan) return null

      return {
        price: basicPlan.price,
        currency: basicPlan.currency,
        name: basicPlan.name
      }
    } catch (error) {
      console.error('Error in getMainPricing:', error)
      return null
    }
  }

  // Get pricing with discount info
  static async getPricingWithDiscount(): Promise<{
    originalPrice: number
    discountedPrice: number
    currentPrice: number
    discountPercentage: number
    hasDiscount: boolean
    discountEndsAt?: string
    currency: string
    trialPrice: number
    trialDays: number
  } | null> {
    try {
      const basicPlan = await this.getPlanByType('basic')
      if (!basicPlan) return null

      const hasDiscount = !!(basicPlan.original_price && basicPlan.discounted_price)
      const originalPrice = basicPlan.original_price || basicPlan.price
      const discountedPrice = basicPlan.discounted_price || basicPlan.price
      const currentPrice = hasDiscount ? discountedPrice : basicPlan.price
      
      return {
        originalPrice,
        discountedPrice, 
        currentPrice,
        discountPercentage: basicPlan.discount_percentage || 0,
        hasDiscount,
        discountEndsAt: basicPlan.discount_end_date,
        currency: basicPlan.currency,
        trialPrice: basicPlan.trial_price || 1,
        trialDays: basicPlan.trial_days || 3
      }
    } catch (error) {
      console.error('Error in getPricingWithDiscount:', error)
      return null
    }
  }

  // Admin: Update pricing plan
  static async updatePricingPlan(planId: string, updates: Partial<DbPricingPlan>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pricing_plans')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId)

      if (error) {
        console.error('Error updating pricing plan:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updatePricingPlan:', error)
      return false
    }
  }

  // Admin: Create new pricing plan
  static async createPricingPlan(planData: Omit<DbPricingPlan, 'id' | 'created_at' | 'updated_at'>): Promise<DbPricingPlan | null> {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .insert({
          ...planData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating pricing plan:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createPricingPlan:', error)
      return null
    }
  }

  // Get all pricing plans (for admin)
  static async getAllPricingPlans(): Promise<DbPricingPlan[]> {
    try {
      const { data, error } = await supabase
        .from('pricing_plans')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error getting all pricing plans:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllPricingPlans:', error)
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
      // Note: total_earned tracking removed in new DB structure
      // Coins are tracked via coin_transactions table

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
  initializeUser: async (username: string, email: string, userType?: string, coach?: string, age?: number, confidenceScore?: number) => {
    return await SupabaseUserManager.upsertUser({
      username,
      email,
      user_type: userType as any,
      coach: coach as any,
      age: age || 25,
      confidence_score: confidenceScore || 25,
      coins: 200,
      current_plan: 'trial',
      subscription_status: 'trial'
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
  },

  // Update confidence score (for lesson completion rewards)
  updateConfidenceScore: async (userId: string, pointsToAdd: number) => {
    try {
      const { data: currentUser, error: getUserError } = await supabase
        .from('users')
        .select('confidence_score')
        .eq('id', userId)
        .single()

      if (getUserError) {
        console.error('Error getting current user:', getUserError)
        return null
      }

      const currentScore = currentUser.confidence_score || 25
      const newScore = Math.min(100, currentScore + pointsToAdd) // Cap at 100

      const { data, error } = await supabase
        .from('users')
        .update({ 
          confidence_score: newScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating confidence score:', error)
        return null
      }

      console.log(`✅ Confidence score updated: ${currentScore} → ${newScore} (+${pointsToAdd})`)
      return data
    } catch (error) {
      console.error('Error in updateConfidenceScore:', error)
      return null
    }
  }
}

// Chat Conversations Types and Management
export interface DbChatMessage {
  id: string
  user_id: string
  username: string
  coach_type: 'logan' | 'chase' | 'mason' | 'blake' | 'knox'
  message_type: 'user' | 'coach'
  content: string
  session_id: string
  timestamp: string
  created_at: string
  user_age?: number
  user_type?: 'overthinker' | 'nervous' | 'rookie' | 'updown' | 'surface'
  is_read: boolean
  is_favorite: boolean
  ai_model?: string
  response_time_ms?: number
  token_count?: number
}

export interface ChatSession {
  session_id: string
  messages: DbChatMessage[]
  created_at: string
  last_message_at: string
  message_count: number
}

// Chat Management System
export class SupabaseChatManager {
  
  // Save a new chat message
  static async saveMessage(messageData: {
    user_id: string
    username: string
    coach_type: 'logan' | 'chase' | 'mason' | 'blake' | 'knox'
    message_type: 'user' | 'coach'
    content: string
    session_id?: string
    user_age?: number
    user_type?: string
    ai_model?: string
    response_time_ms?: number
    token_count?: number
  }): Promise<DbChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert([messageData])
        .select()
        .single()
      
      if (error) {
        console.error('Error saving chat message:', error)
        return null
      }
      
      console.log('✅ Chat message saved:', data.id)
      return data
    } catch (error) {
      console.error('Error in saveMessage:', error)
      return null
    }
  }

  // Get chat history for a user and coach
  static async getChatHistory(
    userId: string, 
    coachType: 'logan' | 'chase' | 'mason' | 'blake' | 'knox',
    limit: number = 50
  ): Promise<DbChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .eq('coach_type', coachType)
        .order('timestamp', { ascending: true })
        .limit(limit)
      
      if (error) {
        console.error('Error getting chat history:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getChatHistory:', error)
      return []
    }
  }

  // Get recent chat sessions for a user
  static async getChatSessions(userId: string, limit: number = 10): Promise<ChatSession[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('session_id, coach_type, timestamp, created_at')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .limit(limit * 10) // Get more to group by session
      
      if (error) {
        console.error('Error getting chat sessions:', error)
        return []
      }
      
      // Group messages by session_id
      const sessionMap = new Map<string, {
        session_id: string
        coach_type: string
        created_at: string
        last_message_at: string
        message_count: number
      }>()
      
      data?.forEach(msg => {
        const existing = sessionMap.get(msg.session_id)
        if (existing) {
          existing.message_count++
          if (msg.timestamp > existing.last_message_at) {
            existing.last_message_at = msg.timestamp
          }
        } else {
          sessionMap.set(msg.session_id, {
            session_id: msg.session_id,
            coach_type: msg.coach_type,
            created_at: msg.created_at,
            last_message_at: msg.timestamp,
            message_count: 1
          })
        }
      })
      
      // Convert to array and get full messages for each session
      const sessions: ChatSession[] = []
      for (const sessionData of Array.from(sessionMap.values()).slice(0, limit)) {
        const messages = await this.getSessionMessages(sessionData.session_id)
        sessions.push({
          ...sessionData,
          messages
        })
      }
      
      return sessions.sort((a, b) => 
        new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      )
    } catch (error) {
      console.error('Error in getChatSessions:', error)
      return []
    }
  }

  // Get all messages for a specific session
  static async getSessionMessages(sessionId: string): Promise<DbChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true })
      
      if (error) {
        console.error('Error getting session messages:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getSessionMessages:', error)
      return []
    }
  }

  // Create a new chat session
  static async createNewSession(
    userId: string,
    username: string,
    coachType: 'logan' | 'chase' | 'mason' | 'blake' | 'knox',
    initialMessage: string,
    userAge?: number,
    userType?: string
  ): Promise<string | null> {
    try {
      // Generate new session ID
      const sessionId = crypto.randomUUID()
      
      // Save the initial user message
      const message = await this.saveMessage({
        user_id: userId,
        username,
        coach_type: coachType,
        message_type: 'user',
        content: initialMessage,
        session_id: sessionId,
        user_age: userAge,
        user_type: userType
      })
      
      if (!message) {
        throw new Error('Failed to save initial message')
      }
      
      console.log('✅ New chat session created:', sessionId)
      return sessionId
    } catch (error) {
      console.error('Error in createNewSession:', error)
      return null
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(userId: string, sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .eq('message_type', 'coach') // Only mark coach messages as read
      
      if (error) {
        console.error('Error marking messages as read:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
      return false
    }
  }

  // Delete a chat session
  static async deleteSession(userId: string, sessionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('user_id', userId)
        .eq('session_id', sessionId)
      
      if (error) {
        console.error('Error deleting chat session:', error)
        return false
      }
      
      console.log('✅ Chat session deleted:', sessionId)
      return true
    } catch (error) {
      console.error('Error in deleteSession:', error)
      return false
    }
  }

  // Get chat statistics for analytics
  static async getChatStats(userId: string): Promise<{
    total_messages: number
    total_sessions: number
    favorite_coach: string
    avg_messages_per_session: number
  } | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('session_id, coach_type, message_type')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error getting chat stats:', error)
        return null
      }
      
      const totalMessages = data?.length || 0
      const uniqueSessions = new Set(data?.map(msg => msg.session_id)).size
      
      // Find favorite coach
      const coachCounts = data?.reduce((acc, msg) => {
        acc[msg.coach_type] = (acc[msg.coach_type] || 0) + 1
        return acc
      }, {} as Record<string, number>) || {}
      
      const favoriteCoach = Object.entries(coachCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'logan'
      
      return {
        total_messages: totalMessages,
        total_sessions: uniqueSessions,
        favorite_coach: favoriteCoach,
        avg_messages_per_session: uniqueSessions > 0 ? totalMessages / uniqueSessions : 0
      }
    } catch (error) {
      console.error('Error in getChatStats:', error)
      return null
    }
  }
}

// Learning System Types
export interface DbProblem {
  id: string
  title: string
  description: string
  user_type: 'overthinker' | 'nervous' | 'rookie' | 'updown' | 'surface' | 'intimacy_boost' | 'body_confidence'
  order_index: number
  created_at: string
  updated_at: string
  total_exercises?: number // For join queries that include exercise count
}

export interface DbExercise {
  id: string
  problem_id: string
  title: string
  description: string
  content: string
  difficulty: 'easy' | 'medium' | 'hard'
  points_reward: number
  estimated_minutes: number
  order_index: number
  created_at: string
  updated_at: string
}

export interface DbMilestone {
  id: string
  title: string
  description: string
  points_required: number
  badge_icon: string
  order_index: number
  is_active: boolean
  welcome_message?: string
  created_at: string
}

export interface DbUserExerciseProgress {
  id: string
  user_id: string
  username: string
  exercise_id: string
  problem_id: string
  status: 'not_started' | 'in_progress' | 'completed'
  points_earned: number
  completed_at?: string
  started_at: string
  created_at: string
  updated_at: string
}

// Legacy interfaces for backward compatibility
export interface DbSolution extends DbExercise {}
export interface DbUserSolutionProgress extends DbUserExerciseProgress {
  solution_id: string
}

// Learning System Manager
export class SupabaseLearningManager {
  // Get problems for user type
  static async getProblemsForUserType(userType: string): Promise<DbProblem[]> {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_type', userType)
        .order('order_index')
      
      if (error) {
        console.error('Error getting problems:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getProblemsForUserType:', error)
      return []
    }
  }

  // Get exercises for problem
  static async getExercisesForProblem(problemId: string): Promise<DbExercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('problem_id', problemId)
        .order('order_index')

      if (error) {
        console.error('Error getting exercises:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getExercisesForProblem:', error)
      return []
    }
  }

  // Get user progress for all exercises
  static async getUserProgress(userId: string): Promise<DbUserExerciseProgress[]> {
    try {
      const { data, error } = await supabase
        .from('user_exercise_progress')
        .select('*')
        .eq('user_id', userId)
      
      if (error) {
        console.error('Error getting user progress:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getUserProgress:', error)
      return []
    }
  }

  // Legacy methods for backward compatibility
  static async getSolutionsForProblem(problemId: string): Promise<DbSolution[]> {
    return this.getExercisesForProblem(problemId)
  }

  // Toggle exercise completion status
  static async toggleExerciseCompletion(userId: string, username: string, exerciseId: string, problemId: string): Promise<{points: number, isCompleted: boolean}> {
    try {
      console.log('🔄 Toggling exercise:', { userId, exerciseId, problemId })
      
      // Check current progress
      const { data: existingProgress, error: progressError } = await supabase
        .from('user_exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_id', exerciseId)
        .maybeSingle()

      if (progressError) {
        console.error('Error fetching progress:', progressError)
        return { points: 0, isCompleted: false }
      }

      // Get exercise points
      const { data: exercise, error: exerciseError } = await supabase
        .from('exercises')
        .select('points_reward')
        .eq('id', exerciseId)
        .single()
      
      if (exerciseError || !exercise) {
        console.error('Error fetching exercise:', exerciseError)
        return { points: 0, isCompleted: false }
      }

      if (existingProgress && existingProgress.status === 'completed') {
        // Mark as incomplete (reverse)
        console.log('🔙 Marking as incomplete...')
        const { error } = await supabase
          .from('user_exercise_progress')
          .update({
            status: 'not_started',
            points_earned: 0,
            completed_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('exercise_id', exerciseId)
        
        if (error) {
          console.error('Error uncompleting exercise:', error)
          return { points: 0, isCompleted: true }
        }

        console.log('✅ Exercise marked as incomplete')
        return { points: -exercise.points_reward, isCompleted: false }
      } else {
        // Mark as completed
        console.log('✅ Marking as completed...')
        
        if (existingProgress) {
          // Update existing record
          const { error } = await supabase
            .from('user_exercise_progress')
            .update({
              status: 'completed',
              points_earned: exercise.points_reward,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId)
            .eq('exercise_id', exerciseId)
          
          if (error) {
            console.error('Error updating exercise completion:', error)
            console.error('Error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            return { points: 0, isCompleted: false }
          }
        } else {
          // Insert new record
          const { error } = await supabase
            .from('user_exercise_progress')
            .insert({
              user_id: userId,
              username: username,
              exercise_id: exerciseId,
              problem_id: problemId,
              status: 'completed',
              points_earned: exercise.points_reward,
              completed_at: new Date().toISOString(),
              started_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (error) {
            console.error('Error inserting exercise completion:', error)
            console.error('Error details:', {
              message: error.message,
              details: error.details,
              hint: error.hint,
              code: error.code
            })
            return { points: 0, isCompleted: false }
          }
        }

        console.log('🎉 Exercise marked as completed')
        return { points: exercise.points_reward, isCompleted: true }
      }
    } catch (error) {
      console.error('Error in toggleExerciseCompletion:', error)
      return { points: 0, isCompleted: false }
    }
  }

  // Legacy method for backward compatibility
  static async toggleSolutionCompletion(userId: string, username: string, solutionId: string, problemId: string): Promise<{points: number, isCompleted: boolean}> {
    return this.toggleExerciseCompletion(userId, username, solutionId, problemId)
  }

  // Legacy method for backward compatibility
  static async completeSolution(userId: string, username: string, solutionId: string, problemId: string): Promise<number> {
    const result = await this.toggleSolutionCompletion(userId, username, solutionId, problemId)
    return result.isCompleted ? result.points : 0
  }

  // Get milestones
  static async getMilestones(): Promise<DbMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .select('*')
        .eq('is_active', true)
        .order('order_index')
      
      if (error) {
        console.error('Error getting milestones:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getMilestones:', error)
      return []
    }
  }

  // Admin methods for managing problems and exercises

  // Get all problems (for admin)
  static async getAllProblems(): Promise<DbProblem[]> {
    try {
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .order('user_type', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error getting all problems:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllProblems:', error)
      return []
    }
  }

  // Get all exercises (for admin)
  static async getAllExercises(): Promise<DbExercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          problems (
            id,
            title,
            user_type
          )
        `)
        .order('problem_id', { ascending: true })
        .order('order_index', { ascending: true })

      if (error) {
        console.error('Error getting all exercises:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllExercises:', error)
      return []
    }
  }

  // Create new problem (for admin)
  static async createProblem(problemData: {
    title: string
    description: string
    user_type: string
    order_index: number
  }): Promise<DbProblem | null> {
    try {
      console.log('Attempting to create problem via API:', problemData)
      
      const response = await fetch('/api/admin/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(problemData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Successfully created problem via API:', data)
      return data
    } catch (error) {
      console.error('Error in createProblem:', error)
      throw error
    }
  }

  // Create new exercise (for admin)
  static async createExercise(exerciseData: {
    title: string
    description: string
    content?: string
    problem_id: string
    difficulty: 'easy' | 'medium' | 'hard'
    points_reward: number
    estimated_minutes: number
    order_index: number
  }): Promise<DbExercise | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('exercises')
        .insert([{
          ...exerciseData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating exercise:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in createExercise:', error)
      return null
    }
  }

  // Update problem (for admin) - via API route
  static async updateProblem(problemId: string, updates: Partial<DbProblem>): Promise<DbProblem | null> {
    try {
      console.log('Attempting to update problem via API with ID:', problemId)
      console.log('Update data:', updates)

      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Successfully updated problem via API:', data)
      return data
    } catch (error) {
      console.error('Error in updateProblem:', error)
      throw error
    }
  }

  // Update exercise (for admin)  
  static async updateExercise(exerciseId: string, updates: Partial<DbExercise>): Promise<DbExercise | null> {
    try {
      console.log('Updating exercise:', exerciseId, 'with updates:', updates)
      
      const response = await fetch(`/api/admin/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('API Error updating exercise:', errorData)
        return null
      }

      const result = await response.json()
      return result.data
    } catch (error) {
      console.error('Error in updateExercise:', error)
      return null
    }
  }

  // Delete problem (for admin) - via API route
  static async deleteProblem(problemId: string): Promise<boolean> {
    try {
      console.log('Attempting to delete problem via API with ID:', problemId)
      
      const response = await fetch(`/api/admin/problems/${problemId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log('Successfully deleted problem via API:', data)
      return true
    } catch (error) {
      console.error('Error in deleteProblem:', error)
      throw error
    }
  }

  // Delete exercise (for admin)
  static async deleteExercise(exerciseId: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('exercises')
        .delete()
        .eq('id', exerciseId)

      if (error) {
        console.error('Error deleting exercise:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in deleteExercise:', error)
      return false
    }
  }
}

// Authentication Manager for Supabase Auth
export class SupabaseAuthManager {
  
  // Sign up with email and temporary password
  static async signUpUser(
    email: string, 
    temporaryPassword: string,
    userData: {
      username: string
      user_type: string
      coach: string
      age: number
      confidence_score: number
    }
  ): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      // Create auth user with temporary password
      const { data, error } = await supabaseAuth.signUp({
        email,
        password: temporaryPassword,
        options: {
          data: {
            username: userData.username,
            user_type: userData.user_type,
            coach: userData.coach,
            age: userData.age,
            confidence_score: userData.confidence_score,
            display_name: userData.username,  // Add display name for Supabase dashboard
            full_name: userData.username,     // Some systems expect full_name
            temporary_password: temporaryPassword  // Include temp password in metadata for email template
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Supabase Auth signup error:', error)
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Failed to create user account' }
      }

      // Create user profile in our users table
      const userProfile = await SupabaseUserManager.upsertUser({
        id: data.user.id, // Use Supabase auth ID
        username: userData.username,
        email: email,
        user_type: userData.user_type as any,
        coach: userData.coach as any,
        age: userData.age,
        confidence_score: userData.confidence_score,
        coins: 200,
        current_plan: 'trial',
        subscription_status: 'trial'
      })

      if (!userProfile) {
        return { success: false, error: 'Failed to create user profile' }
      }

      console.log('✅ User created successfully:', data.user.email)
      return { 
        success: true, 
        user: {
          id: data.user.id,
          email: data.user.email,
          ...userData
        }
      }
    } catch (error) {
      console.error('Error in signUpUser:', error)
      return { success: false, error: 'Unexpected error during signup' }
    }
  }

  // Sign in with email and password
  static async signInUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    try {
      const { data, error } = await supabaseAuth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('Supabase Auth signin error:', error)
        
        // Check if error is due to email not confirmed
        if (error.message.includes('Email not confirmed')) {
          return { 
            success: false, 
            error: 'Please check your email and click the confirmation link. If you didn\'t receive it, contact support or try signing up again.' 
          }
        }
        
        return { success: false, error: error.message }
      }

      if (!data.user) {
        return { success: false, error: 'Invalid login credentials' }
      }

      // Get full user profile from our users table
      const userProfile = await SupabaseUserManager.getUserByEmail(email)
      
      if (!userProfile) {
        return { success: false, error: 'User profile not found' }
      }

      console.log('✅ User signed in successfully:', data.user.email)
      return { 
        success: true, 
        user: userProfile
      }
    } catch (error) {
      console.error('Error in signInUser:', error)
      return { success: false, error: 'Unexpected error during signin' }
    }
  }

  // Sign in with Google
  static async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { data, error } = await supabaseAuth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('Google OAuth error:', error)
        return { success: false, error: error.message }
      }

      console.log('🔄 Redirecting to Google OAuth...')
      return { success: true }
    } catch (error) {
      console.error('Error in signInWithGoogle:', error)
      return { success: false, error: 'Unexpected error during Google signin' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAuth.signOut()
      
      if (error) {
        console.error('Supabase signout error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ User signed out successfully')
      return { success: true }
    } catch (error) {
      console.error('Error in signOut:', error)
      return { success: false, error: 'Unexpected error during signout' }
    }
  }

  // Get current auth session
  static async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabaseAuth.getSession()
      
      if (error) {
        console.error('Error getting session:', error)
        return null
      }

      return session
    } catch (error) {
      console.error('Error in getCurrentSession:', error)
      return null
    }
  }

  // Get current auth user
  static async getCurrentAuthUser() {
    try {
      const { data: { user }, error } = await supabaseAuth.getUser()
      
      if (error) {
        console.error('Error getting auth user:', error)
        return null
      }

      return user
    } catch (error) {
      console.error('Error in getCurrentAuthUser:', error)
      return null
    }
  }

  // Reset password (send email)
  static async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAuth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) {
        console.error('Password reset error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Password reset email sent')
      return { success: true }
    } catch (error) {
      console.error('Error in resetPassword:', error)
      return { success: false, error: 'Unexpected error during password reset' }
    }
  }

  // Update password (for authenticated user)
  static async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseAuth.updateUser({
        password: newPassword
      })

      if (error) {
        console.error('Password update error:', error)
        return { success: false, error: error.message }
      }

      console.log('✅ Password updated successfully')
      return { success: true }
    } catch (error) {
      console.error('Error in updatePassword:', error)
      return { success: false, error: 'Unexpected error during password update' }
    }
  }

  // Generate temporary password
  static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }
}
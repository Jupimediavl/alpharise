// /lib/supabase.ts
// Supabase integration for AlphaRise

import { createClient } from '@supabase/supabase-js'

// Supabase configuration - replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types (based on AlphaRise schema)
export interface DbUser {
  id: string
  username: string
  email: string
  avatar_type: 'marcus' | 'jake' | 'alex' | 'ryan' | 'ethan'
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

// User Management
export class SupabaseUserManager {
  
  // Create or update user
  static async upsertUser(userData: Partial<DbUser>): Promise<DbUser | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(userData, { onConflict: 'username' })
        .select()
        .single()
      
      if (error) {
        console.error('Error upserting user:', error)
        return null
      }
      
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
      
      if (error) {
        console.error('Error getting user:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getUserByUsername:', error)
      return null
    }
  }

  // Update user coins
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
}

// Question Management
export class SupabaseQuestionManager {
  
  // Create new question
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

  // Get questions with filters
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

      // Apply filters
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

      // Apply sorting
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

  // Get single question with answers
  static async getQuestionWithAnswers(questionId: string): Promise<{
    question: DbQuestion | null
    answers: DbAnswer[]
  }> {
    try {
      // Get question
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

      // Get answers
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

  // Update question
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

  // Search questions
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

// Answer Management
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

  // Rate answer
  static async rateAnswer(answerId: string, rating: number, ratedBy: string): Promise<{
    success: boolean
    coinEarnings: number
    newRating: number
  }> {
    try {
      // Get current answer
      const { data: answer, error: getError } = await supabase
        .from('answers')
        .select('*')
        .eq('id', answerId)
        .single()

      if (getError || !answer) {
        console.error('Error getting answer:', getError)
        return { success: false, coinEarnings: 0, newRating: 0 }
      }

      // Check if user already rated
      if (answer.rated_by.includes(ratedBy)) {
        return { success: false, coinEarnings: 0, newRating: answer.rating }
      }

      // Calculate new rating
      const newRatedBy = [...answer.rated_by, ratedBy]
      const totalRatings = newRatedBy.length
      const newRating = ((answer.rating * (totalRatings - 1)) + rating) / totalRatings

      // Calculate coin earnings
      let coinEarnings = 3 // Base earning
      if (newRating >= 4) coinEarnings = 5
      if (newRating >= 4.5) coinEarnings = 8
      if (newRating === 5) coinEarnings = 12

      // Weekend bonus
      const isWeekend = [0, 6].includes(new Date().getDay())
      if (isWeekend) coinEarnings *= 2

      // Update answer
      const { error: updateError } = await supabase
        .from('answers')
        .update({
          rating: newRating,
          rated_by: newRatedBy,
          coin_earnings: coinEarnings,
          is_helpful: newRating >= 4,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      if (updateError) {
        console.error('Error updating answer:', updateError)
        return { success: false, coinEarnings: 0, newRating: answer.rating }
      }

      return { success: true, coinEarnings, newRating }
    } catch (error) {
      console.error('Error in rateAnswer:', error)
      return { success: false, coinEarnings: 0, newRating: 0 }
    }
  }

  // Mark best answer
  static async markBestAnswer(questionId: string, answerId: string, markedBy: string): Promise<boolean> {
    try {
      // Verify question ownership
      const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('author_id, best_answer_id')
        .eq('id', questionId)
        .single()

      if (questionError || !question || question.author_id !== markedBy) {
        return false
      }

      // Remove previous best answer if exists
      if (question.best_answer_id) {
        await supabase
          .from('answers')
          .update({ is_best_answer: false })
          .eq('id', question.best_answer_id)
      }

      // Get current answer to update coin earnings
      const { data: currentAnswer } = await supabase
        .from('answers')
        .select('coin_earnings')
        .eq('id', answerId)
        .single()

      // Set new best answer
      const { error: answerError } = await supabase
        .from('answers')
        .update({ 
          is_best_answer: true,
          coin_earnings: (currentAnswer?.coin_earnings || 0) + 5,
          updated_at: new Date().toISOString()
        })
        .eq('id', answerId)

      if (answerError) {
        console.error('Error marking best answer:', answerError)
        return false
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
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markBestAnswer:', error)
      return false
    }
  }
}

// Coin Transaction Management
export class SupabaseCoinManager {
  
  // Record coin transaction
  static async recordTransaction(transactionData: Omit<DbCoinTransaction, 'id' | 'created_at'>): Promise<DbCoinTransaction | null> {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .insert({
          ...transactionData,
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('Error recording transaction:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in recordTransaction:', error)
      return null
    }
  }

  // Get user transactions
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

  // Process question posting (spend coins)
  static async processQuestionPosting(
    username: string, 
    questionType: string, 
    coinCost: number
  ): Promise<boolean> {
    try {
      // Get current user
      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user || user.coins < coinCost) {
        return false
      }

      // Update user coins
      const newBalance = user.coins - coinCost
      await SupabaseUserManager.updateUserCoins(username, newBalance)

      // Record transaction
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

  // Process answer reward (earn coins)
  static async processAnswerReward(
    username: string,
    questionId: string,
    answerId: string,
    coinEarnings: number,
    rating: number
  ): Promise<boolean> {
    try {
      // Get current user
      const user = await SupabaseUserManager.getUserByUsername(username)
      if (!user) return false

      // Update user coins and stats
      const newBalance = user.coins + coinEarnings
      await SupabaseUserManager.updateUserCoins(username, newBalance)
      await SupabaseUserManager.updateUserStats(username, {
        total_earned: user.total_earned + coinEarnings,
        monthly_earnings: user.monthly_earnings + coinEarnings
      })

      // Record transaction
      await this.recordTransaction({
        user_id: username,
        type: 'earn',
        amount: coinEarnings,
        reason: `Answer rated ${rating} stars`,
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

// Utility functions
export const supabaseHelpers = {
  // Initialize user session
  initializeUser: async (username: string, email: string, avatarType: string) => {
    return await SupabaseUserManager.upsertUser({
      username,
      email,
      avatar_type: avatarType as any,
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
      badges: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_active: new Date().toISOString()
    })
  },

  // Get questions with answers for community page
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
  }
}
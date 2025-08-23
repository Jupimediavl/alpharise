// =====================================================
// AlphaRise Adaptive Learning System - Supabase Client
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type {
  LearningModule,
  Lesson,
  MicroLearning,
  DailyChallenge,
  UserLearningProfile,
  UserProgress,
  UserActivityLog,
  Achievement,
  UserAchievement,
  Leaderboard,
  AILearningPath,
  ContentEffectiveness,
  UserJourneyAnalytics,
  ProgressUpdate,
  XPTransaction,
  CoinTransaction
} from './als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// CONTENT MANAGEMENT
// =====================================================

export class ALSContentManager {
  // Get modules for a specific coach
  static async getModulesByCoach(coachId: string): Promise<LearningModule[]> {
    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('order_priority', { ascending: true })

    if (error) {
      console.error('Error fetching modules:', error)
      return []
    }
    return data || []
  }

  // Get unlocked modules based on user's confidence score
  static async getUnlockedModules(userId: string, confidenceScore: number): Promise<LearningModule[]> {
    const profile = await this.getUserProfile(userId)
    if (!profile) return []

    const { data, error } = await supabase
      .from('learning_modules')
      .select('*')
      .eq('coach_id', profile.coach_id)
      .lte('unlock_at_score', confidenceScore)
      .eq('is_active', true)
      .order('order_priority', { ascending: true })

    if (error) {
      console.error('Error fetching unlocked modules:', error)
      return []
    }
    return data || []
  }

  // Get lessons for a module
  static async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .eq('is_active', true)
      .order('lesson_number', { ascending: true })

    if (error) {
      console.error('Error fetching lessons:', error)
      return []
    }
    return data || []
  }

  // Get micro-learnings for user
  static async getMicroLearnings(coachId: string, limit: number = 5): Promise<MicroLearning[]> {
    const { data, error } = await supabase
      .from('micro_learnings')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching micro-learnings:', error)
      return []
    }
    return data || []
  }

  // Get daily challenges
  static async getDailyChallenges(coachId: string): Promise<DailyChallenge[]> {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('difficulty', { ascending: true })

    if (error) {
      console.error('Error fetching daily challenges:', error)
      return []
    }
    return data || []
  }

  // Get user's profile
  static async getUserProfile(userId: string): Promise<UserLearningProfile | null> {
    const { data, error } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
    return data
  }
}

// =====================================================
// USER PROGRESS MANAGEMENT
// =====================================================

export class ALSProgressManager {
  // Create or update user learning profile
  static async upsertUserProfile(profile: Partial<UserLearningProfile>): Promise<UserLearningProfile | null> {
    const { data, error } = await supabase
      .from('user_learning_profiles')
      .upsert(profile, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error('Error upserting user profile:', error)
      return null
    }
    return data
  }

  // Update lesson progress
  static async updateLessonProgress(userId: string, update: ProgressUpdate): Promise<boolean> {
    const progressData = {
      user_id: userId,
      lesson_id: update.lesson_id,
      status: update.status,
      progress_percentage: update.progress_percentage || 0,
      time_spent_minutes: update.time_spent || 0,
      quiz_score: update.quiz_score,
      notes: update.notes,
      engagement_level: update.engagement_level,
      found_helpful: update.found_helpful,
      completion_date: update.status === 'completed' ? new Date().toISOString() : null
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(progressData, { onConflict: 'user_id,lesson_id' })

    if (error) {
      console.error('Error updating lesson progress:', error)
      return false
    }

    // If completed, update XP and coins
    if (update.status === 'completed') {
      await this.awardLessonCompletion(userId, update.lesson_id)
    }

    return true
  }

  // Award XP and coins for lesson completion
  static async awardLessonCompletion(userId: string, lessonId: string): Promise<void> {
    // Get lesson rewards
    const { data: lesson } = await supabase
      .from('lessons')
      .select('xp_reward, coins_reward')
      .eq('id', lessonId)
      .single()

    if (!lesson) return

    // Add XP transaction
    await this.addXPTransaction(userId, {
      amount: lesson.xp_reward,
      type: 'lesson_complete',
      source_id: lessonId,
      source_type: 'lesson',
      description: 'Lesson completed'
    })

    // Add coins transaction
    await this.addCoinTransaction(userId, {
      amount: lesson.coins_reward,
      type: 'earned',
      source_id: lessonId,
      source_type: 'lesson',
      description: 'Lesson completed'
    })

    // Update user profile
    await this.updateUserStats(userId, {
      xp: lesson.xp_reward,
      coins: lesson.coins_reward,
      lessons_completed: 1
    })
  }

  // Add XP transaction
  static async addXPTransaction(userId: string, transaction: XPTransaction): Promise<boolean> {
    try {
      console.log('🔍 Attempting XP transaction:', {
        user_id: userId,
        amount: transaction.amount,
        transaction_type: transaction.type,
        source_id: transaction.source_id,
        source_type: transaction.source_type,
        description: transaction.description
      })

      const { data, error } = await supabase.from('xp_transactions').insert({
        user_id: userId,
        amount: transaction.amount,
        transaction_type: transaction.type,
        source_id: transaction.source_id,
        source_type: transaction.source_type,
        description: transaction.description
      })

      if (error) {
        console.error('❌ XP transaction error details:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return false
      }
      
      console.log('✅ XP transaction successful:', data)
      return true
    } catch (error) {
      console.error('❌ Exception in addXPTransaction:', error)
      return false
    }
  }

  // Add coin transaction
  static async addCoinTransaction(userId: string, transaction: CoinTransaction): Promise<boolean> {
    try {
      // Get current balance
      const { data: profile } = await supabase
        .from('user_learning_profiles')
        .select('total_coins')
        .eq('user_id', userId)
        .single()

      const newBalance = (profile?.total_coins || 0) + transaction.amount

      console.log('🔍 Attempting coin transaction:', {
        user_id: userId,
        amount: transaction.amount,
        transaction_type: transaction.type,
        source_id: transaction.source_id,
        source_type: transaction.source_type,
        description: transaction.description,
        balance_after: newBalance,
        current_balance: profile?.total_coins || 0
      })

      const { data, error } = await supabase.from('coins_transactions').insert({
        user_id: userId,
        amount: transaction.amount,
        transaction_type: transaction.type,
        source_id: transaction.source_id,
        source_type: transaction.source_type,
        description: transaction.description,
        balance_after: newBalance
      })

      if (error) {
        console.error('❌ Coin transaction error details:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        return false
      }
      
      console.log('✅ Coin transaction successful:', data)
      return true
    } catch (error) {
      console.error('❌ Exception in addCoinTransaction:', error)
      return false
    }
  }

  // Update user stats
  static async updateUserStats(userId: string, updates: {
    xp?: number,
    coins?: number,
    lessons_completed?: number,
    challenges_completed?: number,
    streak?: number
  }): Promise<void> {
    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) return

    const updateData: any = {}
    
    if (updates.xp) {
      updateData.total_xp = profile.total_xp + updates.xp
      // Calculate level based on XP (100 XP per level)
      updateData.current_level = Math.floor(updateData.total_xp / 100) + 1
    }
    
    if (updates.coins) {
      updateData.total_coins = profile.total_coins + updates.coins
    }
    
    if (updates.streak !== undefined) {
      updateData.current_streak = updates.streak
      if (updates.streak > profile.longest_streak) {
        updateData.longest_streak = updates.streak
      }
    }

    await supabase
      .from('user_learning_profiles')
      .update(updateData)
      .eq('user_id', userId)

    // Log daily activity
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('user_activity_log')
      .upsert({
        user_id: userId,
        activity_date: today,
        lessons_completed: updates.lessons_completed || 0,
        challenges_completed: updates.challenges_completed || 0,
        xp_earned: updates.xp || 0,
        coins_earned: updates.coins || 0,
        confidence_score: profile.current_confidence_score
      }, { onConflict: 'user_id,activity_date' })
  }

  // Get user's progress for a module
  static async getModuleProgress(userId: string, moduleId: string): Promise<{
    completed: number,
    total: number,
    percentage: number
  }> {
    // Get all lessons in module
    const { data: lessons } = await supabase
      .from('lessons')
      .select('id')
      .eq('module_id', moduleId)

    if (!lessons) return { completed: 0, total: 0, percentage: 0 }

    // Get user's progress for these lessons
    const lessonIds = lessons.map(l => l.id)
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .in('lesson_id', lessonIds)
      .eq('status', 'completed')

    const completed = progress?.length || 0
    const total = lessons.length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  }

  // Update confidence score
  static async updateConfidenceScore(userId: string, newScore: number): Promise<void> {
    await supabase
      .from('user_learning_profiles')
      .update({ current_confidence_score: newScore })
      .eq('user_id', userId)

    // Log in activity
    const today = new Date().toISOString().split('T')[0]
    await supabase
      .from('user_activity_log')
      .update({ confidence_score: newScore })
      .eq('user_id', userId)
      .eq('activity_date', today)
  }
}

// =====================================================
// GAMIFICATION MANAGEMENT
// =====================================================

export class ALSGamificationManager {
  // Get user's achievements
  static async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      if (error) {
        console.error('Error fetching user achievements:', error)
        // Return empty array for missing table or relationship errors
        return []
      }
      return data || []
    } catch (error) {
      console.error('Error fetching user achievements:', error)
      return []
    }
  }

  // Check and unlock achievements
  static async checkAchievements(userId: string): Promise<Achievement[]> {
    const profile = await ALSContentManager.getUserProfile(userId)
    if (!profile) return []

    // Get all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)

    if (!achievements) return []

    // Get user's current achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId)

    const unlockedIds = userAchievements?.map(ua => ua.achievement_id) || []
    const newlyUnlocked: Achievement[] = []

    // Check each achievement
    for (const achievement of achievements) {
      if (unlockedIds.includes(achievement.id)) continue

      // Check if requirements are met
      if (this.checkAchievementRequirements(profile, achievement.requirements)) {
        // Unlock achievement
        await supabase.from('user_achievements').insert({
          user_id: userId,
          achievement_id: achievement.id
        })

        // Award XP and coins
        await ALSProgressManager.addXPTransaction(userId, {
          amount: achievement.xp_reward,
          type: 'achievement',
          source_id: achievement.id,
          description: `Achievement unlocked: ${achievement.title}`
        })

        await ALSProgressManager.addCoinTransaction(userId, {
          amount: achievement.coins_reward,
          type: 'earned',
          source_id: achievement.id,
          description: `Achievement unlocked: ${achievement.title}`
        })

        newlyUnlocked.push(achievement)
      }
    }

    return newlyUnlocked
  }

  // Check if achievement requirements are met
  private static checkAchievementRequirements(profile: UserLearningProfile, requirements: any): boolean {
    // Check various requirement types
    if (requirements.lessons_completed && profile.total_xp / 20 < requirements.lessons_completed) {
      return false
    }
    if (requirements.streak_days && profile.current_streak < requirements.streak_days) {
      return false
    }
    if (requirements.confidence_increase) {
      const increase = profile.current_confidence_score - profile.initial_confidence_score
      if (increase < requirements.confidence_increase) return false
    }
    // Add more requirement checks as needed
    return true
  }

  // Get leaderboard
  static async getLeaderboard(period: 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Leaderboard[]> {
    const { data, error } = await supabase
      .from('leaderboards')
      .select('*')
      .eq('period_type', period)
      .order(period === 'weekly' ? 'weekly_rank' : period === 'monthly' ? 'monthly_rank' : 'total_rank', { ascending: true })
      .limit(limit)

    if (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
    return data || []
  }

  // Update user's leaderboard position
  static async updateLeaderboardPosition(userId: string): Promise<void> {
    const profile = await ALSContentManager.getUserProfile(userId)
    if (!profile) return

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    // Get weekly stats
    const { data: weeklyActivity } = await supabase
      .from('user_activity_log')
      .select('xp_earned, challenges_completed')
      .eq('user_id', userId)
      .gte('activity_date', weekStart.toISOString())

    const weeklyXP = weeklyActivity?.reduce((sum, day) => sum + day.xp_earned, 0) || 0
    const weeklyChallenges = weeklyActivity?.reduce((sum, day) => sum + day.challenges_completed, 0) || 0

    // Update leaderboard
    await supabase
      .from('leaderboards')
      .upsert({
        user_id: userId,
        coach_id: profile.coach_id,
        weekly_xp: weeklyXP,
        weekly_streak: profile.current_streak,
        weekly_challenges: weeklyChallenges,
        total_xp: profile.total_xp,
        period_start: weekStart.toISOString().split('T')[0],
        period_type: 'weekly'
      }, { onConflict: 'user_id,period_start,period_type' })
  }
}

// =====================================================
// AI LEARNING PATH MANAGEMENT
// =====================================================

export class ALSPathManager {
  // Get or create AI learning path
  static async getAILearningPath(userId: string): Promise<AILearningPath | null> {
    let { data, error } = await supabase
      .from('ai_learning_paths')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!data) {
      // Create new path
      const profile = await ALSContentManager.getUserProfile(userId)
      if (!profile) return null

      const newPath = {
        user_id: userId,
        difficulty_adjustment: 1.0,
        pace_adjustment: 1.0,
        content_mix: { video: 40, text: 30, interactive: 30 },
        strengths: [],
        improvement_areas: [],
        breakthrough_moments: [],
        recommended_modules: [],
        recommended_challenges: [],
        recommended_micro_learnings: []
      }

      const { data: created } = await supabase
        .from('ai_learning_paths')
        .insert(newPath)
        .select()
        .single()

      data = created
    }

    return data
  }

  // Update AI recommendations
  static async updateRecommendations(userId: string): Promise<void> {
    const profile = await ALSContentManager.getUserProfile(userId)
    if (!profile) return

    const path = await this.getAILearningPath(userId)
    if (!path) return

    // Get user's progress history
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20)

    // Analyze patterns
    const recommendations = this.analyzeAndRecommend(profile, progress || [], path)

    // Update path
    await supabase
      .from('ai_learning_paths')
      .update({
        recommended_modules: recommendations.modules,
        recommended_challenges: recommendations.challenges,
        recommended_micro_learnings: recommendations.microLearnings,
        next_best_action: recommendations.nextAction,
        last_recalculated: new Date().toISOString()
      })
      .eq('user_id', userId)
  }

  // Analyze user patterns and generate recommendations
  private static analyzeAndRecommend(
    profile: UserLearningProfile,
    progress: UserProgress[],
    path: AILearningPath
  ): {
    modules: string[],
    challenges: string[],
    microLearnings: string[],
    nextAction: any
  } {
    // Complex recommendation logic would go here
    // For now, return mock recommendations
    return {
      modules: [],
      challenges: [],
      microLearnings: [],
      nextAction: {
        type: 'lesson',
        id: 'next-lesson-id',
        reason: 'Based on your recent progress'
      }
    }
  }

  // Track content effectiveness
  static async trackContentEffectiveness(
    contentType: string,
    contentId: string,
    metrics: {
      completed?: boolean,
      timeSpent?: number,
      rating?: number,
      bounced?: boolean
    }
  ): Promise<void> {
    // Get existing effectiveness data
    const { data: existing } = await supabase
      .from('content_effectiveness')
      .select('*')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .single()

    if (existing) {
      // Update metrics
      const updates: any = {
        total_views: existing.total_views + 1
      }

      if (metrics.completed) {
        updates.total_completions = existing.total_completions + 1
        updates.completion_rate = (updates.total_completions / updates.total_views) * 100
      }

      if (metrics.timeSpent) {
        updates.average_time_spent = ((existing.average_time_spent || 0) * existing.total_views + metrics.timeSpent) / updates.total_views
      }

      if (metrics.rating) {
        updates.average_rating = ((existing.average_rating || 0) * existing.total_views + metrics.rating) / updates.total_views
      }

      if (metrics.bounced) {
        updates.bounce_rate = ((existing.bounce_rate * existing.total_views / 100) + 1) / updates.total_views * 100
      }

      await supabase
        .from('content_effectiveness')
        .update(updates)
        .eq('id', existing.id)
    } else {
      // Create new effectiveness record
      await supabase
        .from('content_effectiveness')
        .insert({
          content_type: contentType,
          content_id: contentId,
          total_views: 1,
          total_completions: metrics.completed ? 1 : 0,
          completion_rate: metrics.completed ? 100 : 0,
          average_time_spent: metrics.timeSpent || 0,
          average_rating: metrics.rating || null,
          bounce_rate: metrics.bounced ? 100 : 0
        })
    }
  }
}
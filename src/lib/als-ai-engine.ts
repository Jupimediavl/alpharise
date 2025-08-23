// =====================================================
// AlphaRise Adaptive Learning System - AI Engine
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type {
  UserLearningProfile,
  UserProgress,
  AILearningPath,
  LearningModule,
  Lesson,
  MicroLearning,
  DailyChallenge,
  UserActivityLog
} from './als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// =====================================================
// AI RECOMMENDATION ENGINE
// =====================================================

export interface RecommendationResult {
  nextBestAction: {
    type: 'lesson' | 'challenge' | 'micro_learning' | 'break' | 'review'
    content: any
    reason: string
    confidence: number
  }
  personalizedModules: LearningModule[]
  adaptiveChallenges: DailyChallenge[]
  microLearningQueue: MicroLearning[]
  difficultyAdjustment: number
  paceAdjustment: number
  contentMixRecommendation: {
    video: number
    text: number
    interactive: number
  }
}

export class ALSAIEngine {
  
  // =====================================================
  // MAIN RECOMMENDATION FUNCTION
  // =====================================================
  
  static async generateRecommendations(userId: string): Promise<RecommendationResult> {
    try {
      // Get user profile and learning data
      const profile = await this.getUserProfile(userId)
      if (!profile) {
        throw new Error('User profile not found')
      }

      const recentProgress = await this.getRecentProgress(userId, 20)
      const activityHistory = await this.getActivityHistory(userId, 30)
      const currentPath = await this.getAILearningPath(userId)

      // Analyze learning patterns
      const patterns = this.analyzeLearningPatterns(profile, recentProgress, activityHistory)
      
      // Generate personalized recommendations
      const recommendations = await this.generatePersonalizedContent(
        profile, 
        patterns, 
        currentPath
      )

      // Adjust difficulty and pace based on performance
      const adjustments = this.calculateDifficultyPaceAdjustments(patterns)

      // Determine next best action
      const nextAction = this.determineNextBestAction(profile, patterns, recommendations)

      return {
        nextBestAction: nextAction,
        personalizedModules: recommendations.modules,
        adaptiveChallenges: recommendations.challenges,
        microLearningQueue: recommendations.microLearnings,
        difficultyAdjustment: adjustments.difficulty,
        paceAdjustment: adjustments.pace,
        contentMixRecommendation: this.optimizeContentMix(patterns)
      }

    } catch (error) {
      console.error('Error generating AI recommendations:', error)
      return this.getFallbackRecommendations()
    }
  }

  // =====================================================
  // PATTERN ANALYSIS
  // =====================================================

  static analyzeLearningPatterns(
    profile: UserLearningProfile,
    progress: UserProgress[],
    activity: UserActivityLog[]
  ) {
    // Completion rate analysis
    const completionRate = progress.length > 0 
      ? progress.filter(p => p.status === 'completed').length / progress.length 
      : 0

    // Time-based patterns
    const avgSessionTime = activity.length > 0
      ? activity.reduce((sum, a) => sum + a.time_spent_minutes, 0) / activity.length
      : 0

    // Engagement analysis
    const engagementScore = progress.length > 0
      ? progress.reduce((sum, p) => {
          switch (p.engagement_level) {
            case 'high': return sum + 3
            case 'medium': return sum + 2
            case 'low': return sum + 1
            default: return sum + 1
          }
        }, 0) / progress.length
      : 2

    // Difficulty preference analysis
    const difficultyPreference = this.analyzeDifficultyPreference(progress)

    // Content type effectiveness
    const contentTypeEffectiveness = this.analyzeContentTypePreference(progress)

    // Learning velocity (XP per day)
    const recentActivity = activity.slice(0, 7) // Last 7 days
    const learningVelocity = recentActivity.length > 0
      ? recentActivity.reduce((sum, a) => sum + a.xp_earned, 0) / recentActivity.length
      : 0

    // Consistency analysis
    const consistencyScore = this.calculateConsistencyScore(activity)

    // Breakthrough moments detection
    const breakthroughMoments = this.detectBreakthroughMoments(progress, activity)

    return {
      completionRate,
      avgSessionTime,
      engagementScore,
      difficultyPreference,
      contentTypeEffectiveness,
      learningVelocity,
      consistencyScore,
      breakthroughMoments,
      strengths: this.identifyStrengths(profile, progress),
      improvementAreas: this.identifyImprovementAreas(profile, progress),
      optimalLearningTimes: this.identifyOptimalLearningTimes(activity)
    }
  }

  static analyzeDifficultyPreference(progress: UserProgress[]) {
    // Analyze performance across different difficulty levels
    const difficultyPerformance = progress.reduce((acc, p) => {
      // We'd need to get lesson difficulty from the lessons table
      // For now, using a simplified approach
      const difficulty = 3 // Default to medium
      if (!acc[difficulty]) acc[difficulty] = { total: 0, completed: 0 }
      acc[difficulty].total++
      if (p.status === 'completed') acc[difficulty].completed++
      return acc
    }, {} as Record<number, { total: number, completed: number }>)

    // Find optimal difficulty level
    let bestDifficulty = 3
    let bestPerformance = 0

    Object.entries(difficultyPerformance).forEach(([diff, perf]) => {
      const performance = perf.completed / perf.total
      if (performance > bestPerformance) {
        bestPerformance = performance
        bestDifficulty = parseInt(diff)
      }
    })

    return {
      optimal: bestDifficulty,
      performance: difficultyPerformance
    }
  }

  static analyzeContentTypePreference(progress: UserProgress[]) {
    // Would analyze which content types user performs best with
    return {
      video: 0.4,
      text: 0.3,
      interactive: 0.3
    }
  }

  static calculateConsistencyScore(activity: UserActivityLog[]): number {
    if (activity.length < 7) return 0.5

    // Calculate how consistently user engages (daily activity)
    const last7Days = activity.slice(0, 7)
    const activeDays = last7Days.filter(a => a.lessons_completed > 0 || a.challenges_completed > 0).length
    
    return activeDays / 7
  }

  static detectBreakthroughMoments(progress: UserProgress[], activity: UserActivityLog[]) {
    const breakthroughs = []

    // Detect sudden confidence jumps
    for (let i = 1; i < activity.length; i++) {
      const current = activity[i]
      const previous = activity[i - 1]
      
      if (current.confidence_score && previous.confidence_score) {
        const confidenceJump = current.confidence_score - previous.confidence_score
        if (confidenceJump >= 10) {
          breakthroughs.push({
            type: 'confidence_breakthrough',
            date: current.activity_date,
            improvement: confidenceJump,
            context: 'Significant confidence increase detected'
          })
        }
      }
    }

    return breakthroughs
  }

  static identifyStrengths(profile: UserLearningProfile, progress: UserProgress[]): string[] {
    const strengths = []

    if (profile.current_streak >= 7) strengths.push('consistency')
    if (profile.engagement_score >= 80) strengths.push('engagement')
    if (profile.mastery_level >= 3) strengths.push('mastery')

    // Analyze progress patterns for specific strengths
    const highEngagementCount = progress.filter(p => p.engagement_level === 'high').length
    if (highEngagementCount / progress.length > 0.6) {
      strengths.push('high_engagement')
    }

    return strengths
  }

  static identifyImprovementAreas(profile: UserLearningProfile, progress: UserProgress[]): string[] {
    const areas = []

    if (profile.current_streak < 3) areas.push('consistency')
    if (profile.engagement_score < 60) areas.push('engagement')
    
    const incompletionRate = progress.filter(p => p.status === 'skipped').length / progress.length
    if (incompletionRate > 0.3) areas.push('completion')

    return areas
  }

  static identifyOptimalLearningTimes(activity: UserActivityLog[]): string[] {
    // Analyze when user is most active and engaged
    const timePatterns = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    }

    activity.forEach(a => {
      if (a.login_time) {
        const hour = new Date(a.login_time).getHours()
        if (hour >= 6 && hour < 12) timePatterns.morning++
        else if (hour >= 12 && hour < 17) timePatterns.afternoon++
        else if (hour >= 17 && hour < 22) timePatterns.evening++
        else timePatterns.night++
      }
    })

    // Return times sorted by activity level
    return Object.entries(timePatterns)
      .sort(([,a], [,b]) => b - a)
      .map(([time]) => time)
  }

  // =====================================================
  // CONTENT GENERATION
  // =====================================================

  static async generatePersonalizedContent(
    profile: UserLearningProfile,
    patterns: any,
    currentPath: AILearningPath | null
  ) {
    // Get available content
    const allModules = await this.getAvailableModules(profile.coach_id)
    const allChallenges = await this.getAvailableChallenges(profile.coach_id)
    const allMicroLearnings = await this.getAvailableMicroLearnings(profile.coach_id)

    // Filter and rank based on user patterns
    const personalizedModules = this.rankModules(allModules, profile, patterns)
    const personalizedChallenges = this.rankChallenges(allChallenges, profile, patterns)
    const personalizedMicroLearnings = this.rankMicroLearnings(allMicroLearnings, profile, patterns)

    return {
      modules: personalizedModules.slice(0, 5),
      challenges: personalizedChallenges.slice(0, 3),
      microLearnings: personalizedMicroLearnings.slice(0, 5)
    }
  }

  static rankModules(modules: LearningModule[], profile: UserLearningProfile, patterns: any): LearningModule[] {
    return modules
      .filter(m => m.unlock_at_score <= profile.current_confidence_score)
      .sort((a, b) => {
        // Prioritize based on difficulty preference
        const aDiffScore = Math.abs(a.difficulty_level - patterns.difficultyPreference.optimal)
        const bDiffScore = Math.abs(b.difficulty_level - patterns.difficultyPreference.optimal)
        
        return aDiffScore - bDiffScore
      })
  }

  static rankChallenges(challenges: DailyChallenge[], profile: UserLearningProfile, patterns: any): DailyChallenge[] {
    return challenges.sort((a, b) => {
      // Prioritize challenges that match user's improvement areas
      let aScore = 0
      let bScore = 0

      patterns.improvementAreas.forEach((area: string) => {
        if (a.tags?.includes(area)) aScore += 2
        if (b.tags?.includes(area)) bScore += 2
      })

      return bScore - aScore
    })
  }

  static rankMicroLearnings(microLearnings: MicroLearning[], profile: UserLearningProfile, patterns: any): MicroLearning[] {
    return microLearnings.sort((a, b) => {
      // Prioritize based on engagement patterns and quick wins
      let aScore = 0
      let bScore = 0

      // Favor content that matches current engagement level
      if (patterns.engagementScore > 2.5) {
        // High engagement - can handle more complex micro-learning
        if (a.difficulty >= 3) aScore += 1
        if (b.difficulty >= 3) bScore += 1
      } else {
        // Lower engagement - prefer simpler content
        if (a.difficulty <= 2) aScore += 1
        if (b.difficulty <= 2) bScore += 1
      }

      return bScore - aScore
    })
  }

  // =====================================================
  // NEXT ACTION DETERMINATION
  // =====================================================

  static determineNextBestAction(profile: UserLearningProfile, patterns: any, recommendations: any) {
    // Analyze current state and determine optimal next action
    
    // Check if user needs a break (fatigue detection)
    if (patterns.avgSessionTime > 45 && patterns.engagementScore < 2) {
      return {
        type: 'break' as const,
        content: {
          suggestion: 'Take a 15-minute break',
          reason: 'Prevent learning fatigue'
        },
        reason: 'Your recent sessions show signs of fatigue. A short break will help you return refreshed.',
        confidence: 0.8
      }
    }

    // Check if user should review previous content
    if (patterns.completionRate < 0.7) {
      return {
        type: 'review' as const,
        content: {
          suggestion: 'Review recent lessons',
          focus: 'Incomplete content'
        },
        reason: 'Consolidating previous learning before moving forward will improve your foundation.',
        confidence: 0.9
      }
    }

    // Determine if lesson, challenge, or micro-learning is best
    const timeOfDay = new Date().getHours()
    const isOptimalTime = patterns.optimalLearningTimes[0] === this.getTimeOfDay(timeOfDay)

    if (isOptimalTime && patterns.engagementScore >= 2.5) {
      // Prime time for focused learning
      return {
        type: 'lesson' as const,
        content: recommendations.modules[0],
        reason: 'Perfect time for focused learning based on your patterns.',
        confidence: 0.95
      }
    } else if (patterns.avgSessionTime < 15) {
      // User prefers shorter sessions
      return {
        type: 'micro_learning' as const,
        content: recommendations.microLearnings[0],
        reason: 'A quick learning boost that fits your preferred session length.',
        confidence: 0.85
      }
    } else {
      // Suggest challenge for engagement
      return {
        type: 'challenge' as const,
        content: recommendations.challenges[0],
        reason: 'A practical challenge to apply your knowledge and build momentum.',
        confidence: 0.8
      }
    }
  }

  // =====================================================
  // DIFFICULTY & PACE ADJUSTMENTS
  // =====================================================

  static calculateDifficultyPaceAdjustments(patterns: any) {
    let difficultyAdjustment = 1.0
    let paceAdjustment = 1.0

    // Adjust difficulty based on completion rate and engagement
    if (patterns.completionRate > 0.9 && patterns.engagementScore > 2.5) {
      difficultyAdjustment = 1.2 // Increase difficulty
    } else if (patterns.completionRate < 0.6) {
      difficultyAdjustment = 0.8 // Decrease difficulty
    }

    // Adjust pace based on learning velocity and consistency
    if (patterns.learningVelocity > 50 && patterns.consistencyScore > 0.8) {
      paceAdjustment = 1.3 // Faster pace
    } else if (patterns.consistencyScore < 0.4) {
      paceAdjustment = 0.7 // Slower pace
    }

    return {
      difficulty: Math.max(0.5, Math.min(2.0, difficultyAdjustment)),
      pace: Math.max(0.5, Math.min(2.0, paceAdjustment))
    }
  }

  static optimizeContentMix(patterns: any) {
    // Default mix
    let mix = { video: 40, text: 30, interactive: 30 }

    // Adjust based on engagement patterns
    if (patterns.engagementScore < 2) {
      // Low engagement - more interactive content
      mix = { video: 30, text: 20, interactive: 50 }
    } else if (patterns.avgSessionTime > 30) {
      // Long sessions - more video content
      mix = { video: 50, text: 25, interactive: 25 }
    }

    return mix
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  static getTimeOfDay(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 22) return 'evening'
    return 'night'
  }

  static getFallbackRecommendations(): RecommendationResult {
    return {
      nextBestAction: {
        type: 'micro_learning',
        content: {
          title: 'Quick Confidence Boost',
          content: 'Take a deep breath and remind yourself of one thing you accomplished today.'
        },
        reason: 'A gentle start to build momentum.',
        confidence: 0.7
      },
      personalizedModules: [],
      adaptiveChallenges: [],
      microLearningQueue: [],
      difficultyAdjustment: 1.0,
      paceAdjustment: 1.0,
      contentMixRecommendation: { video: 40, text: 30, interactive: 30 }
    }
  }

  // =====================================================
  // DATA FETCHING HELPERS
  // =====================================================

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

  static async getRecentProgress(userId: string, limit: number): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching progress:', error)
      return []
    }
    return data || []
  }

  static async getActivityHistory(userId: string, days: number): Promise<UserActivityLog[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', startDate.toISOString().split('T')[0])
      .order('activity_date', { ascending: false })

    if (error) {
      console.error('Error fetching activity:', error)
      return []
    }
    return data || []
  }

  static async getAILearningPath(userId: string): Promise<AILearningPath | null> {
    const { data, error } = await supabase
      .from('ai_learning_paths')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found is OK
      console.warn('AI learning path not found (this is normal for new users):', error.message)
    }
    return data
  }

  static async getAvailableModules(coachId: string): Promise<LearningModule[]> {
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

  static async getAvailableChallenges(coachId: string): Promise<DailyChallenge[]> {
    const { data, error } = await supabase
      .from('daily_challenges')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)

    if (error) {
      console.error('Error fetching challenges:', error)
      return []
    }
    return data || []
  }

  static async getAvailableMicroLearnings(coachId: string): Promise<MicroLearning[]> {
    const { data, error } = await supabase
      .from('micro_learnings')
      .select('*')
      .eq('coach_id', coachId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching micro learnings:', error)
      return []
    }
    return data || []
  }
}
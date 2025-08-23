import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Advanced AI types
interface UserBehaviorPattern {
  session_frequency: number // sessions per week
  avg_session_duration: number // minutes
  completion_rate: number // 0-100
  engagement_trends: 'increasing' | 'decreasing' | 'stable'
  content_preferences: string[] // preferred content types
  peak_performance_times: string[] // best hours
  learning_velocity: 'slow' | 'medium' | 'fast'
  challenge_tolerance: number // 0-100
  social_engagement: number // 0-100
  retention_score: number // 0-100
}

interface ContentEffectiveness {
  content_id: string
  content_type: 'module' | 'lesson' | 'micro_learning' | 'challenge'
  completion_rate: number
  avg_rating: number
  time_to_complete: number
  retention_impact: number
  confidence_boost: number
  user_feedback_sentiment: 'positive' | 'neutral' | 'negative'
}

interface PersonalizedRecommendation {
  id: string
  type: 'next_lesson' | 'skill_boost' | 'challenge' | 'review' | 'break' | 'social'
  priority: 'critical' | 'high' | 'medium' | 'low'
  confidence: number // AI confidence in recommendation (0-100)
  title: string
  description: string
  reasoning: string
  content_id?: string
  estimated_time: number
  expected_xp: number
  difficulty_adjustment?: 'easier' | 'harder' | 'same'
  optimal_time?: string // best time to do this
  expires_at?: string // recommendation expires
  personalization_factors: string[] // why this was recommended
}

interface AIInsight {
  type: 'performance' | 'motivation' | 'optimization' | 'warning' | 'celebration'
  title: string
  message: string
  action_suggestions?: string[]
  data_points?: { [key: string]: any }
  urgency: 'low' | 'medium' | 'high'
}

interface RealTimeContext {
  current_time: string
  day_of_week: string
  user_timezone: string
  recent_activity: any[]
  current_mood?: 'motivated' | 'tired' | 'frustrated' | 'confident'
  session_length_today: number
  last_login: string
  days_since_last_session: number
}

export class AdvancedAIEngine {
  
  /**
   * Analyze user behavior patterns from activity data
   */
  static async analyzeUserBehavior(userId: string): Promise<UserBehaviorPattern> {
    // Get last 30 days of activity
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activities } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', thirtyDaysAgo.toISOString().split('T')[0])

    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)

    if (!activities || !progress) {
      // Return default pattern for new users
      return {
        session_frequency: 3,
        avg_session_duration: 15,
        completion_rate: 70,
        engagement_trends: 'stable',
        content_preferences: ['video'],
        peak_performance_times: ['19:00', '20:00'],
        learning_velocity: 'medium',
        challenge_tolerance: 60,
        social_engagement: 50,
        retention_score: 75
      }
    }

    // Calculate patterns
    const sessionFreq = activities.length > 0 ? activities.length / 4 : 1 // per week
    const avgDuration = activities.reduce((sum, a) => sum + (a.time_spent_minutes || 0), 0) / (activities.length || 1)
    const completionRate = progress.length > 0 
      ? (progress.filter(p => p.status === 'completed').length / progress.length) * 100 
      : 70

    // Analyze trends (simplified)
    const recentWeek = activities.slice(-7)
    const previousWeek = activities.slice(-14, -7)
    const recentAvg = recentWeek.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / (recentWeek.length || 1)
    const previousAvg = previousWeek.reduce((sum, a) => sum + (a.xp_earned || 0), 0) / (previousWeek.length || 1)
    
    let trends: 'increasing' | 'decreasing' | 'stable' = 'stable'
    if (recentAvg > previousAvg * 1.1) trends = 'increasing'
    else if (recentAvg < previousAvg * 0.9) trends = 'decreasing'

    return {
      session_frequency: Math.round(sessionFreq * 10) / 10,
      avg_session_duration: Math.round(avgDuration),
      completion_rate: Math.round(completionRate),
      engagement_trends: trends,
      content_preferences: ['video', 'interactive'], // Would be calculated from actual data
      peak_performance_times: ['19:00', '20:00'], // Would analyze login/completion times
      learning_velocity: completionRate > 80 ? 'fast' : completionRate > 60 ? 'medium' : 'slow',
      challenge_tolerance: Math.min(100, completionRate + 10),
      social_engagement: 60, // Would calculate from social interactions
      retention_score: Math.round(completionRate * 0.8 + sessionFreq * 5)
    }
  }

  /**
   * Get real-time context about user's current state
   */
  static async getRealTimeContext(userId: string): Promise<RealTimeContext> {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    
    // Get today's activity
    const { data: todayActivity } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single()

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('activity_date', { ascending: false })
      .limit(7)

    const lastSession = recentActivity?.[0]
    const daysSinceLastSession = lastSession 
      ? Math.floor((now.getTime() - new Date(lastSession.activity_date).getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      current_time: now.toISOString(),
      day_of_week: now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase(),
      user_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      recent_activity: recentActivity || [],
      session_length_today: todayActivity?.time_spent_minutes || 0,
      last_login: lastSession?.activity_date || today,
      days_since_last_session: daysSinceLastSession
    }
  }

  /**
   * Generate personalized recommendations based on AI analysis
   */
  static async generateSmartRecommendations(
    userId: string, 
    limit: number = 5
  ): Promise<PersonalizedRecommendation[]> {
    
    // Get user profile and behavior
    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) throw new Error('User profile not found')

    // Get completed lesson IDs from XP transactions
    const { data: completedLessons } = await supabase
      .from('xp_transactions')
      .select('source_id')
      .eq('user_id', userId)
      .eq('transaction_type', 'lesson_complete')

    const completedLessonIds = new Set(
      completedLessons?.map(t => t.source_id).filter(Boolean) || []
    )

    console.log('🎯 Found completed lessons:', Array.from(completedLessonIds))

    const behavior = await this.analyzeUserBehavior(userId)
    const context = await this.getRealTimeContext(userId)
    
    const recommendations: PersonalizedRecommendation[] = []

    // 1. PERFORMANCE-BASED RECOMMENDATIONS
    if (behavior.completion_rate < 60) {
      recommendations.push({
        id: `perf_boost_${Date.now()}`,
        type: 'skill_boost',
        priority: 'high',
        confidence: 85,
        title: 'Confidence Boost Needed',
        description: 'Try some easier content to build momentum and confidence',
        reasoning: `Your completion rate is ${behavior.completion_rate}%. Let's build some quick wins!`,
        estimated_time: 10,
        expected_xp: 25,
        difficulty_adjustment: 'easier',
        personalization_factors: ['low_completion_rate', 'confidence_building'],
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // 2. TIME-BASED RECOMMENDATIONS  
    const currentHour = new Date().getHours()
    if (behavior.peak_performance_times.includes(`${currentHour}:00`)) {
      // Check if this time-based recommendation was already completed today
      const today = new Date().toISOString().split('T')[0]
      const timeBasedId = `time_optimal_${today}_${currentHour}`
      
      // Check if this specific time recommendation was already completed
      const { data: completedTimeRec } = await supabase
        .from('xp_transactions')
        .select('source_id')
        .eq('user_id', userId)
        .eq('source_id', timeBasedId)
        .gte('created_at', today)
        .single()

      if (!completedTimeRec) {
        // Get an actual lesson to recommend instead of generic advice
        const { data: availableLesson } = await supabase
          .from('micro_learnings')
          .select('*')
          .eq('coach_id', profile.coach_id)
          .eq('is_active', true)
          .not('id', 'in', completedLessonIds.size > 0 ? `(${Array.from(completedLessonIds).join(',')})` : '()')
          .limit(1)
          .single()

        if (availableLesson) {
          recommendations.push({
            id: timeBasedId,
            type: 'next_lesson',
            priority: 'high',
            confidence: 90,
            title: 'Perfect Time to Learn!',
            description: `Peak performance time! Try: ${availableLesson.title}`,
            reasoning: 'Your data shows you perform best at this hour',
            content_id: availableLesson.id,
            estimated_time: 20,
            expected_xp: availableLesson.xp_reward,
            difficulty_adjustment: 'harder',
            optimal_time: 'now',
            personalization_factors: ['peak_performance_time', 'optimal_timing']
          })
        }
      }
    }

    // 3. STREAK & MOTIVATION RECOMMENDATIONS
    if (context.days_since_last_session > 2) {
      recommendations.push({
        id: `comeback_${Date.now()}`,
        type: 'challenge',
        priority: 'critical',
        confidence: 95,
        title: 'Welcome Back! Quick Win Challenge',
        description: 'Get back on track with a 5-minute confidence boost',
        reasoning: `It's been ${context.days_since_last_session} days since your last session`,
        estimated_time: 5,
        expected_xp: 30,
        difficulty_adjustment: 'easier',
        personalization_factors: ['comeback_motivation', 'streak_recovery'],
        expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours
      })
    }

    // 4. CONTENT PREFERENCE RECOMMENDATIONS
    const preferredType = behavior.content_preferences[0]
    if (preferredType) {
      // Get content matching preferences (exclude completed ones)
      let query = supabase
        .from('micro_learnings')
        .select('*')
        .eq('coach_id', profile.coach_id)
        .eq('is_active', true)

      // Exclude completed lessons if any exist
      if (completedLessonIds.size > 0) {
        query = query.not('id', 'in', `(${Array.from(completedLessonIds).join(',')})`)
      }

      const { data: recommendedContent } = await query.limit(5)

      recommendedContent?.forEach((content, index) => {
        console.log('✅ Adding fresh lesson recommendation:', content.title)
        
        recommendations.push({
          id: `content_pref_${content.id}`,
          type: 'next_lesson',
          priority: index === 0 ? 'medium' : 'low',
          confidence: 80,
          title: content.title,
          description: content.content.slice(0, 100) + '...',
          reasoning: `Matches your preference for ${preferredType} content`,
          content_id: content.id,
          estimated_time: 3,
          expected_xp: content.xp_reward,
          personalization_factors: ['content_preference', 'coach_match']
        })
      })
    }

    // 5. SOCIAL/COMPETITIVE RECOMMENDATIONS
    if (behavior.social_engagement > 70) {
      recommendations.push({
        id: `social_${Date.now()}`,
        type: 'social',
        priority: 'medium',
        confidence: 75,
        title: 'Join the Leaderboard Competition',
        description: 'You are close to moving up! Complete one more lesson',
        reasoning: 'Your social engagement is high - you love competition!',
        estimated_time: 15,
        expected_xp: 40,
        personalization_factors: ['high_social_engagement', 'competitive_spirit']
      })
    }

    // 6. FATIGUE/BREAK RECOMMENDATIONS
    if (context.session_length_today > 60) {
      recommendations.push({
        id: `break_${Date.now()}`,
        type: 'break',
        priority: 'medium',
        confidence: 70,
        title: 'Time for a Break?',
        description: 'You have been learning for over an hour. Consider a short break.',
        reasoning: 'Preventing cognitive fatigue for better retention',
        estimated_time: 0,
        expected_xp: 0,
        personalization_factors: ['fatigue_prevention', 'optimal_learning']
      })
    }

    // Sort by priority and confidence, limit results
    return recommendations
      .sort((a, b) => {
        const priorityScore = { critical: 4, high: 3, medium: 2, low: 1 }
        const aScore = priorityScore[a.priority] * 10 + a.confidence
        const bScore = priorityScore[b.priority] * 10 + b.confidence
        return bScore - aScore
      })
      .slice(0, limit)
  }

  /**
   * Generate AI insights about user's learning journey
   */
  static async generateInsights(userId: string): Promise<AIInsight[]> {
    const behavior = await this.analyzeUserBehavior(userId)
    const context = await this.getRealTimeContext(userId)
    const insights: AIInsight[] = []

    // Performance insights
    if (behavior.engagement_trends === 'increasing') {
      insights.push({
        type: 'celebration',
        title: 'You are on Fire! 🔥',
        message: `Your performance has been increasing consistently. You are ${Math.round((behavior.completion_rate - 70) * 2)}% above average!`,
        urgency: 'low',
        data_points: {
          completion_rate: behavior.completion_rate,
          trend: behavior.engagement_trends
        }
      })
    }

    if (behavior.completion_rate < 50) {
      insights.push({
        type: 'warning',
        title: 'Let us Adjust Your Approach',
        message: 'Your completion rate suggests the content might be too challenging. Let us find the sweet spot!',
        action_suggestions: [
          'Try shorter sessions (5-10 minutes)',
          'Focus on easier content first',
          'Set smaller daily goals'
        ],
        urgency: 'high',
        data_points: {
          completion_rate: behavior.completion_rate,
          recommended_adjustment: 'easier'
        }
      })
    }

    // Timing optimization
    if (behavior.avg_session_duration < 10) {
      insights.push({
        type: 'optimization',
        title: 'Micro-Learning Master',
        message: 'Your short, focused sessions are perfect for retention! Consider adding one longer session per week for deeper concepts.',
        action_suggestions: ['Schedule one 20-minute session weekly'],
        urgency: 'low'
      })
    }

    // Streak insights
    if (context.days_since_last_session === 0 && behavior.session_frequency > 5) {
      insights.push({
        type: 'celebration',
        title: 'Consistency Champion! 🏆',
        message: `You are learning ${behavior.session_frequency} times per week. That is exceptional commitment!`,
        urgency: 'low'
      })
    }

    return insights
  }

  /**
   * Adaptive difficulty adjustment based on performance
   */
  static async calculateOptimalDifficulty(userId: string, contentType: string): Promise<{
    difficulty: number // 1-5 scale
    confidence: number // AI confidence in this recommendation
    reasoning: string
  }> {
    const behavior = await this.analyzeUserBehavior(userId)
    
    let baseDifficulty = 3 // Start with medium
    let reasoning = 'Standard difficulty'
    
    // Adjust based on completion rate
    if (behavior.completion_rate > 90) {
      baseDifficulty = Math.min(5, baseDifficulty + 1)
      reasoning = 'High completion rate - you can handle more challenge'
    } else if (behavior.completion_rate < 60) {
      baseDifficulty = Math.max(1, baseDifficulty - 1)
      reasoning = 'Lower completion rate - let us build confidence first'
    }

    // Adjust based on learning velocity
    if (behavior.learning_velocity === 'fast') {
      baseDifficulty = Math.min(5, baseDifficulty + 0.5)
    } else if (behavior.learning_velocity === 'slow') {
      baseDifficulty = Math.max(1, baseDifficulty - 0.5)
    }

    // Confidence based on data quality
    const dataPoints = behavior.session_frequency * 10 + (behavior.avg_session_duration > 0 ? 10 : 0)
    const confidence = Math.min(95, 50 + dataPoints)

    return {
      difficulty: Math.round(baseDifficulty),
      confidence,
      reasoning
    }
  }

  /**
   * Real-time content adaptation based on current session performance
   */
  static async adaptContentInRealTime(userId: string, sessionData: {
    current_content_id: string
    time_spent: number
    interactions: number
    completion_percentage: number
    user_sentiment?: 'positive' | 'neutral' | 'negative'
  }): Promise<{
    continue: boolean
    suggestion: string
    next_content_id?: string
    difficulty_adjustment?: 'easier' | 'harder' | 'same'
  }> {
    
    const { time_spent, completion_percentage, interactions, user_sentiment } = sessionData
    
    // Real-time decision making
    if (completion_percentage < 30 && time_spent > 15) {
      return {
        continue: false,
        suggestion: 'This seems challenging. Let us try something easier to build confidence.',
        difficulty_adjustment: 'easier'
      }
    }

    if (completion_percentage > 90 && time_spent < 5) {
      return {
        continue: true,
        suggestion: 'You are crushing this! Ready for a bigger challenge?',
        difficulty_adjustment: 'harder'
      }
    }

    if (interactions === 0 && time_spent > 10) {
      return {
        continue: false,
        suggestion: 'You seem distracted. Maybe try a different content type or take a break?',
        difficulty_adjustment: 'same'
      }
    }

    return {
      continue: true,
      suggestion: 'You are doing great! Keep going.',
      difficulty_adjustment: 'same'
    }
  }
}
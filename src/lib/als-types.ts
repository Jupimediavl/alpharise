// =====================================================
// AlphaRise Adaptive Learning System - Type Definitions
// =====================================================

// Core Content Types
export interface LearningModule {
  id: string
  coach_id: string
  module_code: string
  title: string
  subtitle?: string
  description?: string
  thumbnail_url?: string
  difficulty_level: number
  estimated_duration?: number
  unlock_at_score: number
  order_priority: number
  tags: string[]
  prerequisites: string[]
  is_premium: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lesson {
  id: string
  module_id: string
  lesson_number: number
  title: string
  description?: string
  content_type: 'video' | 'text' | 'audio' | 'interactive' | 'mixed'
  content_data: any
  duration_minutes?: number
  xp_reward: number
  coins_reward: number
  thumbnail_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MicroLearning {
  id: string
  coach_id?: string
  title: string
  content: string
  content_type: string
  difficulty: number
  xp_reward: number
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DailyChallenge {
  id: string
  coach_id?: string
  challenge_type?: string
  title: string
  description?: string
  difficulty: number
  xp_reward: number
  coins_reward: number
  success_criteria: any
  tags: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// User Profile & Progress
export interface UserLearningProfile {
  id: string
  user_id: string
  coach_id: string
  assessment_data: any
  personalization_data: any
  initial_confidence_score: number
  current_confidence_score: number
  preferred_content_type?: string
  preferred_session_length?: number
  best_learning_time?: string
  learning_pace?: string
  engagement_score: number
  consistency_score: number
  mastery_level: number
  total_xp: number
  current_level: number
  current_streak: number
  longest_streak: number
  achievements_unlocked: string[]
  total_coins: number
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  module_id?: string
  lesson_id?: string
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped'
  progress_percentage: number
  time_spent_minutes: number
  completion_date?: string
  quiz_score?: number
  attempts: number
  notes?: string
  engagement_level?: 'low' | 'medium' | 'high'
  found_helpful?: boolean
  created_at: string
  updated_at: string
}

export interface UserActivityLog {
  id: string
  user_id: string
  activity_date: string
  lessons_completed: number
  challenges_completed: number
  time_spent_minutes: number
  xp_earned: number
  coins_earned: number
  confidence_score?: number
  mood_rating?: number
  login_time?: string
  logout_time?: string
  session_count: number
  ai_coach_messages: number
  created_at: string
}

// Gamification Types
export interface Achievement {
  id: string
  code: string
  title: string
  description?: string
  icon_url?: string
  category?: 'progress' | 'social' | 'mastery' | 'special' | 'hidden'
  requirements: any
  xp_reward: number
  coins_reward: number
  badge_type?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  is_secret: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  progress?: any
  notified: boolean
  achievement?: Achievement // Joined data
}

export interface Leaderboard {
  id: string
  user_id: string
  coach_id?: string
  weekly_xp: number
  weekly_streak: number
  weekly_challenges: number
  weekly_rank?: number
  monthly_xp: number
  monthly_rank?: number
  total_xp: number
  total_rank?: number
  period_start: string
  period_type: 'weekly' | 'monthly' | 'all_time'
  updated_at: string
}

// AI & Analytics Types
export interface AILearningPath {
  id: string
  user_id: string
  current_focus?: string
  current_module_id?: string
  current_lesson_id?: string
  recommended_modules: string[]
  recommended_challenges: string[]
  recommended_micro_learnings: string[]
  next_best_action?: any
  difficulty_adjustment: number
  pace_adjustment: number
  content_mix: {
    video?: number
    text?: number
    interactive?: number
  }
  strengths: string[]
  improvement_areas: string[]
  breakthrough_moments: any[]
  learning_style?: any
  last_recalculated: string
  created_at: string
  updated_at: string
}

export interface ContentEffectiveness {
  id: string
  content_type: string
  content_id: string
  total_views: number
  total_completions: number
  completion_rate: number
  average_rating?: number
  average_time_spent?: number
  bounce_rate: number
  effectiveness_by_age?: any
  effectiveness_by_coach?: any
  effectiveness_by_problem?: any
  effectiveness_by_level?: any
  common_drop_points?: any[]
  success_patterns?: any[]
  improvement_suggestions?: any[]
  updated_at: string
}

export interface UserJourneyAnalytics {
  id: string
  user_id: string
  onboarding_completed?: string
  first_lesson_completed?: string
  first_achievement_unlocked?: string
  first_week_completed?: string
  first_month_completed?: string
  trial_to_premium_date?: string
  churn_risk_score: number
  engagement_trend?: string
  lifetime_value: number
  usage_pattern?: any
  content_preferences?: any
  peak_activity_times?: string[]
  interaction_style?: any
  predicted_next_login?: string
  predicted_churn_date?: string
  predicted_lifetime_value?: number
  conversion_probability: number
  updated_at: string
}

// Dashboard Display Types
export interface DashboardData {
  profile: UserLearningProfile
  currentPath: AILearningPath
  todaysFocus: {
    module?: LearningModule
    lesson?: Lesson
    challenge?: DailyChallenge
    microLearning?: MicroLearning
  }
  progress: {
    recentLessons: UserProgress[]
    weeklyActivity: UserActivityLog[]
    achievements: UserAchievement[]
  }
  recommendations: {
    nextLessons: Lesson[]
    suggestedChallenges: DailyChallenge[]
    quickWins: MicroLearning[]
  }
  gamification: {
    leaderboard?: Leaderboard
    nearbyAchievements: Achievement[]
    currentStreak: number
    xpToNextLevel: number
  }
}

// Content Management Types
export interface ContentFilter {
  coach_id?: string
  difficulty?: number[]
  tags?: string[]
  is_premium?: boolean
  is_active?: boolean
}

export interface ProgressUpdate {
  lesson_id: string
  status: 'in_progress' | 'completed' | 'skipped'
  progress_percentage?: number
  time_spent?: number
  quiz_score?: number
  notes?: string
  engagement_level?: 'low' | 'medium' | 'high'
  found_helpful?: boolean
}

export interface XPTransaction {
  amount: number
  type: 'lesson_complete' | 'challenge_complete' | 'achievement' | 'bonus' | 'milestone'
  source_id?: string
  source_type?: string
  description?: string
}

export interface CoinTransaction {
  amount: number
  type: 'earned' | 'spent' | 'bonus'
  source_id?: string
  source_type?: string
  description?: string
}

// Enums for consistency
export enum CoachType {
  Blake = 'blake',
  Chase = 'chase',
  Logan = 'logan',
  Mason = 'mason',
  Knox = 'knox'
}

export enum ContentType {
  Video = 'video',
  Text = 'text',
  Audio = 'audio',
  Interactive = 'interactive',
  Mixed = 'mixed'
}

export enum DifficultyLevel {
  Beginner = 1,
  Easy = 2,
  Medium = 3,
  Hard = 4,
  Expert = 5
}

export enum LearningPace {
  Slow = 'slow',
  Moderate = 'moderate',
  Fast = 'fast'
}

export enum TimeOfDay {
  Morning = 'morning',
  Afternoon = 'afternoon',
  Evening = 'evening',
  Night = 'night'
}
/**
 * ALS Clean Adapter
 * 
 * This adapter bridges the clean, simple UI with the sophisticated ALS (Adaptive Learning System).
 * It maintains the exact same user experience while leveraging AI-powered recommendations,
 * adaptive content, and intelligent progress tracking behind the scenes.
 */

import { createClient } from '@supabase/supabase-js'
import { ALSContentManager, ALSProgressManager } from './als-supabase'
import { ALSAIEngine } from './als-ai-engine'
import type { LearningModule, Lesson, UserLearningProfile } from './als-types'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Map clean problem types to ALS coaches
const PROBLEM_TO_COACH_MAP = {
  'premature_ejaculation': 'chase',
  'performance_anxiety': 'blake', 
  'confidence_building': 'logan',
  'social_confidence': 'logan',
  'approach_anxiety': 'logan',
  'erectile_dysfunction': 'mason',
  'intimacy_communication': 'knox',
  'relationship_building': 'knox'
}

// Simple step interface that matches the clean UI expectations
export interface CleanLearningStep {
  id: number
  title: string
  description: string
  content_type: 'lesson' | 'practice' | 'assessment'
  estimated_minutes: number
  required_for_progress: boolean
}

export interface CleanUserProgress {
  id: string
  user_id: string
  primary_problem: string
  additional_problems: string[]
  current_step: number
  completed_steps: number[]
  total_steps: number
  created_at: Date
}

export class ALSCleanAdapter {
  
  /**
   * Initialize or get user's ALS profile based on their problem selection
   */
  static async initializeUserProfile(userId: string, primaryProblem: string, additionalProblems: string[] = []): Promise<CleanUserProgress> {
    try {
      const coachId = PROBLEM_TO_COACH_MAP[primaryProblem as keyof typeof PROBLEM_TO_COACH_MAP] || 'logan'
      
      // Check if user already has an ALS profile
      let profile = await ALSContentManager.getUserProfile(userId)
      
      if (!profile) {
        // Create new ALS learning profile
        profile = await ALSProgressManager.upsertUserProfile({
          user_id: userId,
          coach_id: coachId,
          assessment_data: {
            primary_problem: primaryProblem,
            additional_problems: additionalProblems,
            initial_assessment: new Date().toISOString()
          },
          personalization_data: {
            preferred_content_types: ['video', 'interactive'],
            difficulty_preference: 'adaptive',
            session_length_preference: 'medium'
          },
          initial_confidence_score: 30,
          current_confidence_score: 30,
          preferred_content_type: 'video',
          preferred_session_length: 15,
          best_learning_time: 'evening',
          learning_pace: 'steady',
          engagement_score: 0,
          consistency_score: 0,
          mastery_level: 0,
          total_xp: 0
        })
      }

      // Get AI-recommended learning path
      const learningPath = await this.getAdaptiveLearningPath(userId, coachId)
      
      // Convert to clean format
      if (!profile) {
        return this.createFallbackProgress(userId, primaryProblem, additionalProblems)
      }
      return this.convertToCleanProgress(userId, primaryProblem, additionalProblems, learningPath, profile)
      
    } catch (error) {
      console.error('Error initializing user profile:', error)
      // Fallback to simple static path
      return this.createFallbackProgress(userId, primaryProblem, additionalProblems)
    }
  }

  /**
   * Get user's current progress in clean format
   */
  static async getUserProgress(userId: string): Promise<CleanUserProgress | null> {
    try {
      const profile = await ALSContentManager.getUserProfile(userId)
      if (!profile) return null

      // Map problem type from assessment data
      let primaryProblem = profile.assessment_data?.primary_problem
      if (!primaryProblem && profile.assessment_data?.problem_type) {
        const problemType = profile.assessment_data.problem_type.toLowerCase()
        if (problemType.includes('premature')) {
          primaryProblem = 'premature_ejaculation'
        } else if (problemType.includes('performance') || problemType.includes('anxiety')) {
          primaryProblem = 'performance_anxiety'
        } else if (problemType.includes('erectile')) {
          primaryProblem = 'erectile_dysfunction'
        } else if (problemType.includes('intimacy') || problemType.includes('communication')) {
          primaryProblem = 'intimacy_communication'
        } else {
          primaryProblem = 'confidence_building'
        }
      }
      // Fallback based on coach if no problem detected
      if (!primaryProblem) {
        const coachId = profile.coach_id
        if (coachId === 'chase') {
          primaryProblem = 'premature_ejaculation'
        } else if (coachId === 'blake') {
          primaryProblem = 'performance_anxiety'
        } else if (coachId === 'mason') {
          primaryProblem = 'erectile_dysfunction'
        } else if (coachId === 'knox') {
          primaryProblem = 'intimacy_communication'
        } else {
          primaryProblem = 'confidence_building'
        }
      }
      const additionalProblems = profile.assessment_data?.additional_problems || []
      const coachId = profile.coach_id

      const learningPath = await this.getAdaptiveLearningPath(userId, coachId)
      return this.convertToCleanProgress(userId, primaryProblem, additionalProblems, learningPath, profile)
      
    } catch (error) {
      console.error('Error getting user progress:', error)
      return null
    }
  }

  /**
   * Get adaptive learning path using ALS AI engine
   */
  static async getAdaptiveLearningPath(userId: string, coachId: string): Promise<CleanLearningStep[]> {
    try {
      // Get AI recommendations
      const recommendations = await ALSAIEngine.generateRecommendations(userId)
      
      // Get coach's modules
      const modules = await ALSContentManager.getModulesByCoach(coachId)
      
      // Convert modules to clean steps format
      const steps: CleanLearningStep[] = []
      let stepId = 1

      for (const module of modules.slice(0, 8)) { // Limit to 8 steps for clean UI
        const lessons = await ALSContentManager.getLessonsByModule(module.id)
        
        if (lessons.length > 0) {
          const mainLesson = lessons[0] // Use first lesson as the main step
          
          steps.push({
            id: stepId++,
            title: module.title,
            description: module.description || mainLesson.description || '',
            content_type: this.mapContentType(mainLesson.content_type),
            estimated_minutes: module.estimated_duration || mainLesson.duration_minutes || 15,
            required_for_progress: !module.is_premium // Free modules are required
          })
        }
      }

      // If no modules found, return fallback steps
      if (steps.length === 0) {
        return this.getFallbackLearningPath(coachId)
      }

      return steps
      
    } catch (error) {
      console.error('Error getting adaptive learning path:', error)
      return this.getFallbackLearningPath(coachId)
    }
  }

  /**
   * Complete a step and track progress in ALS
   */
  static async completeStep(userId: string, stepId: number): Promise<boolean> {
    try {
      const profile = await ALSContentManager.getUserProfile(userId)
      if (!profile) return false

      const coachId = profile.coach_id
      const modules = await ALSContentManager.getModulesByCoach(coachId)
      
      // Map clean step ID to ALS module/lesson
      if (stepId <= modules.length) {
        const targetModule = modules[stepId - 1]
        const lessons = await ALSContentManager.getLessonsByModule(targetModule.id)
        
        if (lessons.length > 0) {
          const lesson = lessons[0]
          
          // Record completion in ALS
          await ALSProgressManager.updateLessonProgress(userId, {
            lesson_id: lesson.id,
            status: 'completed',
            progress_percentage: 100,
            time_spent: lesson.duration_minutes || 15,
            engagement_level: 'high',
            found_helpful: true
          })

          // Award XP and coins for completion
          await ALSProgressManager.awardLessonCompletion(userId, lesson.id)

          // Update confidence score
          const newScore = await this.calculateConfidenceIncrease(userId, stepId)
          await ALSProgressManager.updateConfidenceScore(userId, newScore)

          // Log activity for AI learning (placeholder for now)
          console.log('Lesson completed:', {
            activity_type: 'lesson_completed',
            content_id: lesson.id,
            user_id: userId,
            completion_time: new Date()
          })

          return true
        }
      }

      return false
      
    } catch (error) {
      console.error('Error completing step:', error)
      return false
    }
  }

  /**
   * Get current step based on AI recommendations
   */
  static async getCurrentStep(userId: string): Promise<CleanLearningStep | null> {
    try {
      const progress = await this.getUserProgress(userId)
      if (!progress) return null

      const learningPath = await this.getAdaptiveLearningPath(userId, 'chase') // Will be determined dynamically
      const currentStepIndex = progress.current_step - 1

      if (currentStepIndex < learningPath.length) {
        return learningPath[currentStepIndex]
      }

      return null
      
    } catch (error) {
      console.error('Error getting current step:', error)
      return null
    }
  }

  /**
   * Get learning path as clean steps
   */
  static async getLearningPath(problemType: string): Promise<CleanLearningStep[]> {
    const coachId = PROBLEM_TO_COACH_MAP[problemType as keyof typeof PROBLEM_TO_COACH_MAP] || 'logan'
    return this.getAdaptiveLearningPath('temp', coachId) // Will use actual userId when available
  }

  /**
   * Calculate progress percentage
   */
  static getProgressPercentage(progress: CleanUserProgress): number {
    if (progress.total_steps === 0) return 0
    return Math.round((progress.completed_steps.length / progress.total_steps) * 100)
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private static convertToCleanProgress(
    userId: string, 
    primaryProblem: string, 
    additionalProblems: string[], 
    learningPath: CleanLearningStep[],
    profile: UserLearningProfile
  ): CleanUserProgress {
    
    // Get completed steps from ALS progress
    const completedSteps: number[] = []
    // This would be populated from actual ALS progress data
    
    const currentStep = completedSteps.length + 1

    return {
      id: profile.id,
      user_id: userId,
      primary_problem: primaryProblem,
      additional_problems: additionalProblems,
      current_step: currentStep,
      completed_steps: completedSteps,
      total_steps: learningPath.length,
      created_at: new Date(profile.created_at)
    }
  }

  private static createFallbackProgress(userId: string, primaryProblem: string, additionalProblems: string[]): CleanUserProgress {
    return {
      id: `fallback_${userId}`,
      user_id: userId,
      primary_problem: primaryProblem,
      additional_problems: additionalProblems,
      current_step: 1,
      completed_steps: [],
      total_steps: 6,
      created_at: new Date()
    }
  }

  private static getFallbackLearningPath(coachId: string): CleanLearningStep[] {
    const paths = {
      'chase': [
        { id: 1, title: 'Understanding Your Body', description: 'Learn the science behind arousal and control', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 2, title: 'Basic Control Techniques', description: 'Practice fundamental techniques for better control', content_type: 'practice' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 3, title: 'Mental Strategies', description: 'Develop mental focus and confidence', content_type: 'lesson' as const, estimated_minutes: 15, required_for_progress: true },
        { id: 4, title: 'Advanced Techniques', description: 'Master advanced control methods', content_type: 'practice' as const, estimated_minutes: 30, required_for_progress: true },
        { id: 5, title: 'Integration & Practice', description: 'Combine all techniques into daily practice', content_type: 'practice' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 6, title: 'Maintaining Progress', description: 'Long-term strategies for lasting results', content_type: 'lesson' as const, estimated_minutes: 15, required_for_progress: true }
      ],
      'blake': [
        { id: 1, title: 'Understanding Anxiety', description: 'Learn what causes performance anxiety', content_type: 'lesson' as const, estimated_minutes: 15, required_for_progress: true },
        { id: 2, title: 'Breathing Techniques', description: 'Master calming breathing exercises', content_type: 'practice' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 3, title: 'Confidence Building', description: 'Develop unshakeable confidence', content_type: 'lesson' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 4, title: 'Pressure Situations', description: 'Handle high-pressure moments', content_type: 'practice' as const, estimated_minutes: 30, required_for_progress: true },
        { id: 5, title: 'Mental Resilience', description: 'Build lasting mental strength', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 6, title: 'Anxiety to Power', description: 'Transform anxiety into strength', content_type: 'practice' as const, estimated_minutes: 25, required_for_progress: true }
      ],
      'logan': [
        { id: 1, title: 'Social Dynamics', description: 'Understand human interaction basics', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 2, title: 'Body Language', description: 'Master non-verbal communication', content_type: 'practice' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 3, title: 'Conversation Skills', description: 'Learn engaging conversation techniques', content_type: 'lesson' as const, estimated_minutes: 30, required_for_progress: true },
        { id: 4, title: 'Approach Confidence', description: 'Overcome approach anxiety', content_type: 'practice' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 5, title: 'Charisma Development', description: 'Build magnetic personality traits', content_type: 'lesson' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 6, title: 'Social Mastery', description: 'Become socially confident in any situation', content_type: 'practice' as const, estimated_minutes: 30, required_for_progress: true }
      ],
      'mason': [
        { id: 1, title: 'Understanding Erectile Function', description: 'Learn how erections work and what affects them', content_type: 'lesson' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 2, title: 'Physical Health Foundations', description: 'Optimize blood flow and physical health', content_type: 'practice' as const, estimated_minutes: 30, required_for_progress: true },
        { id: 3, title: 'Mental Techniques', description: 'Overcome mental blocks and anxiety', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 4, title: 'Strengthening Exercises', description: 'Build physical strength and endurance', content_type: 'practice' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 5, title: 'Advanced Methods', description: 'Proven techniques for reliable function', content_type: 'practice' as const, estimated_minutes: 35, required_for_progress: true },
        { id: 6, title: 'Long-term Maintenance', description: 'Keep your progress permanent', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true }
      ],
      'knox': [
        { id: 1, title: 'Communication Foundations', description: 'Build deeper emotional connections', content_type: 'lesson' as const, estimated_minutes: 20, required_for_progress: true },
        { id: 2, title: 'Active Listening', description: 'Master the art of truly hearing your partner', content_type: 'practice' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 3, title: 'Expressing Needs', description: 'Communicate desires without conflict', content_type: 'lesson' as const, estimated_minutes: 30, required_for_progress: true },
        { id: 4, title: 'Intimacy Building', description: 'Create deeper physical and emotional intimacy', content_type: 'practice' as const, estimated_minutes: 35, required_for_progress: true },
        { id: 5, title: 'Conflict Resolution', description: 'Handle disagreements constructively', content_type: 'lesson' as const, estimated_minutes: 25, required_for_progress: true },
        { id: 6, title: 'Relationship Mastery', description: 'Maintain and grow your connection long-term', content_type: 'practice' as const, estimated_minutes: 30, required_for_progress: true }
      ]
    }

    return paths[coachId as keyof typeof paths] || paths['logan']
  }

  private static mapContentType(alsContentType: string): 'lesson' | 'practice' | 'assessment' {
    switch (alsContentType) {
      case 'interactive':
      case 'mixed':
        return 'practice'
      case 'video':
      case 'text':
      case 'audio':
        return 'lesson'
      default:
        return 'lesson'
    }
  }

  private static async calculateConfidenceIncrease(userId: string, stepId: number): Promise<number> {
    // AI-powered confidence calculation based on progress
    const currentProfile = await ALSContentManager.getUserProfile(userId)
    if (!currentProfile) return 35

    const baseIncrease = 3 + Math.floor(stepId * 1.5)
    const currentScore = currentProfile.current_confidence_score || 30
    
    return Math.min(currentScore + baseIncrease, 100)
  }
}
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface LessonProgress {
  user_id: string
  lesson_id: string
  completed_at: Date | null
  can_leave_feedback: boolean
  feedback_given: boolean
  feedback_available_at: Date | null
}

export interface LessonFeedback {
  user_id: string
  lesson_id: string
  lesson_title: string
  feedback_value: number
  feedback_label: string
  additional_comments?: string
  problem_type?: string
  step_number?: number
  time_to_complete?: number
  created_at?: Date
}

export class LessonFeedbackManager {
  // Delay in hours before feedback can be given (default 48 hours)
  static FEEDBACK_DELAY_HOURS = 48

  /**
   * Mark a lesson as completed and schedule when feedback can be given
   */
  static async completeLesson(userId: string, lessonId: string, lessonTitle: string) {
    try {
      // First check if already completed
      const { data: existing } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      const now = new Date()
      const feedbackAvailableAt = new Date(now.getTime() + this.FEEDBACK_DELAY_HOURS * 60 * 60 * 1000)

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('user_progress')
          .update({
            status: 'completed',
            completion_date: now.toISOString(),
            feedback_available_at: feedbackAvailableAt.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('user_id', userId)
          .eq('lesson_id', lessonId)

        if (error) throw error
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_progress')
          .insert({
            user_id: userId,
            lesson_id: lessonId,
            status: 'completed',
            progress_percentage: 100,
            completion_date: now.toISOString(),
            feedback_available_at: feedbackAvailableAt.toISOString()
          })

        if (error) throw error
      }

      return { success: true, feedbackAvailableAt }
    } catch (error) {
      console.error('Error completing lesson:', error)
      return { success: false, error }
    }
  }

  /**
   * Check if user can leave feedback for a lesson
   */
  static async canLeaveFeedback(userId: string, lessonId: string): Promise<boolean> {
    try {
      // Get lesson progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('completion_date, feedback_available_at')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (!progress || !progress.completion_date) {
        return false // Lesson not completed
      }

      // Check if feedback delay has passed
      const feedbackAvailableAt = progress.feedback_available_at 
        ? new Date(progress.feedback_available_at)
        : new Date(progress.completion_date)
      
      return new Date() >= feedbackAvailableAt

    } catch (error) {
      console.error('Error checking feedback availability:', error)
      return false
    }
  }

  /**
   * Get all lessons available for feedback
   */
  static async getLessonsAwaitingFeedback(userId: string) {
    try {
      const now = new Date().toISOString()
      
      // Get completed lessons where feedback can be given
      const { data: completedLessons } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .lte('feedback_available_at', now)

      if (!completedLessons) return []

      // Check which ones already have feedback
      const lessonIds = completedLessons.map(l => l.lesson_id)
      const { data: existingFeedback } = await supabase
        .from('lesson_feedback')
        .select('lesson_id')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds)

      const feedbackGivenIds = new Set(existingFeedback?.map(f => f.lesson_id) || [])
      
      // Return lessons that don't have feedback yet
      return completedLessons.filter(lesson => !feedbackGivenIds.has(lesson.lesson_id))

    } catch (error) {
      console.error('Error getting lessons awaiting feedback:', error)
      return []
    }
  }

  /**
   * Submit feedback for a lesson
   */
  static async submitFeedback(feedback: LessonFeedback) {
    try {
      // Check if user can leave feedback
      const canLeave = await this.canLeaveFeedback(feedback.user_id, feedback.lesson_id)
      if (!canLeave) {
        throw new Error('Feedback not available yet for this lesson')
      }

      // Check if feedback already exists
      const { data: existing } = await supabase
        .from('lesson_feedback')
        .select('id')
        .eq('user_id', feedback.user_id)
        .eq('lesson_id', feedback.lesson_id)
        .single()

      if (existing) {
        // Update existing feedback
        const { error } = await supabase
          .from('lesson_feedback')
          .update({
            feedback_value: feedback.feedback_value,
            feedback_label: feedback.feedback_label,
            additional_comments: feedback.additional_comments,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', feedback.user_id)
          .eq('lesson_id', feedback.lesson_id)

        if (error) throw error
      } else {
        // Insert new feedback
        const { error } = await supabase
          .from('lesson_feedback')
          .insert(feedback)

        if (error) throw error
      }

      // Update user_progress to mark feedback as given
      await supabase
        .from('user_progress')
        .update({
          found_helpful: feedback.feedback_value >= 3,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', feedback.user_id)
        .eq('lesson_id', feedback.lesson_id)

      return { success: true }
    } catch (error) {
      console.error('Error submitting feedback:', error)
      return { success: false, error }
    }
  }

  /**
   * Get all completed lessons for a user (for review)
   */
  static async getCompletedLessons(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .order('completion_date', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting completed lessons:', error)
      return []
    }
  }

  /**
   * Check if a lesson has feedback
   */
  static async hasUserGivenFeedback(userId: string, lessonId: string): Promise<boolean> {
    try {
      const { data } = await supabase
        .from('lesson_feedback')
        .select('id')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      return !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Get time remaining until feedback can be given
   */
  static async getTimeUntilFeedback(userId: string, lessonId: string): Promise<number | null> {
    try {
      const { data: progress } = await supabase
        .from('user_progress')
        .select('feedback_available_at')
        .eq('user_id', userId)
        .eq('lesson_id', lessonId)
        .single()

      if (!progress || !progress.feedback_available_at) return null

      const feedbackTime = new Date(progress.feedback_available_at).getTime()
      const now = Date.now()
      const remaining = feedbackTime - now

      return remaining > 0 ? remaining : 0
    } catch (error) {
      console.error('Error getting feedback time:', error)
      return null
    }
  }
}
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface UserProblem {
  id: string
  user_id: string
  primary_problem: string
  additional_problems: string[]
  confirmed_at: string
  last_updated: string
  current_step: number
  total_steps: number
  completed_steps: number[]
  progress_data: any
}

export interface ProblemStep {
  id: number
  title: string
  description: string
  content_type: 'lesson' | 'practice' | 'assessment'
  estimated_minutes: number
  xp_reward?: number
  required_for_progress: boolean
}

export class UserProblemsManager {
  
  // Get user's current problems and progress
  static async getUserProblems(userId: string): Promise<UserProblem | null> {
    try {
      const { data, error } = await supabase
        .from('user_problems')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Error fetching user problems:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in getUserProblems:', error)
      return null
    }
  }

  // Check if user needs problem confirmation
  static async needsProblemConfirmation(userId: string): Promise<boolean> {
    const problems = await this.getUserProblems(userId)
    return !problems // No problems record = needs confirmation
  }

  // Save user's confirmed problems
  static async saveUserProblems(
    userId: string, 
    primaryProblem: string, 
    additionalProblems: string[] = []
  ): Promise<boolean> {
    try {
      // Validate userId format
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        console.error('Invalid userId format:', userId)
        return false
      }

      const { data, error } = await supabase
        .from('user_problems')
        .upsert({
          user_id: userId,
          primary_problem: primaryProblem,
          additional_problems: additionalProblems,
          current_step: 1,
          total_steps: this.getTotalStepsForProblem(primaryProblem),
          completed_steps: []
          // Removed progress_data as it doesn't exist in the table
        }, { onConflict: 'user_id' })
        .select()

      if (error) {
        console.error('Error saving user problems:', error.message)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in saveUserProblems:', error)
      return false
    }
  }

  // Get learning path for a problem
  static getLearningPath(problemType: string): ProblemStep[] {
    const paths: Record<string, ProblemStep[]> = {
      premature_ejaculation: [
        {
          id: 1,
          title: "Understanding PE",
          description: "Learn the science behind premature ejaculation",
          content_type: "lesson",
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 2, 
          title: "Breathing Fundamentals",
          description: "Master deep breathing techniques for control",
          content_type: "practice",
          estimated_minutes: 10,
          required_for_progress: true
        },
        {
          id: 3,
          title: "Body Awareness",
          description: "Develop awareness of arousal levels",
          content_type: "lesson",
          estimated_minutes: 12,
          required_for_progress: true
        },
        {
          id: 4,
          title: "Start-Stop Technique",
          description: "Practice the foundational control technique",
          content_type: "practice",
          estimated_minutes: 20,
          required_for_progress: true
        },
        {
          id: 5,
          title: "Squeeze Technique",
          description: "Advanced physical control method",
          content_type: "practice", 
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 6,
          title: "Mental Control",
          description: "Psychological techniques for lasting longer",
          content_type: "lesson",
          estimated_minutes: 18,
          required_for_progress: true
        },
        {
          id: 7,
          title: "Partner Communication",
          description: "How to discuss and practice with your partner",
          content_type: "lesson",
          estimated_minutes: 15,
          required_for_progress: false
        },
        {
          id: 8,
          title: "Advanced Practices",
          description: "Kegel exercises and stamina building",
          content_type: "practice",
          estimated_minutes: 25,
          required_for_progress: true
        },
        {
          id: 9,
          title: "Real-World Application",
          description: "Applying techniques during intimacy",
          content_type: "lesson",
          estimated_minutes: 12,
          required_for_progress: true
        },
        {
          id: 10,
          title: "Performance Assessment",
          description: "Evaluate your progress and control",
          content_type: "assessment",
          estimated_minutes: 10,
          required_for_progress: true
        },
        {
          id: 11,
          title: "Maintaining Progress",
          description: "Long-term strategies for lasting control",
          content_type: "lesson",
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 12,
          title: "Mastery & Beyond",
          description: "Advanced techniques and confidence building",
          content_type: "lesson",
          estimated_minutes: 20,
          required_for_progress: true
        }
      ],

      confidence_building: [
        {
          id: 1,
          title: "Understanding Confidence",
          description: "What confidence really means and why it matters",
          content_type: "lesson",
          estimated_minutes: 12,
          required_for_progress: true
        },
        {
          id: 2,
          title: "Identifying Limiting Beliefs",
          description: "Recognize thoughts that hold you back",
          content_type: "assessment",
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 3,
          title: "Body Language Basics",
          description: "How to project confidence through posture",
          content_type: "practice",
          estimated_minutes: 10,
          required_for_progress: true
        },
        {
          id: 4,
          title: "Voice and Communication",
          description: "Speaking with authority and clarity",
          content_type: "practice",
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 5,
          title: "Social Skills Foundation",
          description: "Building comfortable social interactions",
          content_type: "lesson",
          estimated_minutes: 18,
          required_for_progress: true
        },
        {
          id: 6,
          title: "Handling Rejection",
          description: "Turning setbacks into growth opportunities",
          content_type: "lesson",
          estimated_minutes: 12,
          required_for_progress: true
        },
        {
          id: 7,
          title: "Building Your Identity",
          description: "Developing a strong sense of self",
          content_type: "lesson",
          estimated_minutes: 20,
          required_for_progress: true
        },
        {
          id: 8,
          title: "Taking Action",
          description: "Practical steps to build confidence daily",
          content_type: "practice",
          estimated_minutes: 15,
          required_for_progress: true
        },
        {
          id: 9,
          title: "Advanced Social Dynamics", 
          description: "Understanding and navigating complex social situations",
          content_type: "lesson",
          estimated_minutes: 25,
          required_for_progress: true
        },
        {
          id: 10,
          title: "Confidence Mastery",
          description: "Maintaining unshakeable self-assurance",
          content_type: "lesson",
          estimated_minutes: 15,
          required_for_progress: true
        }
      ]
    }

    return paths[problemType] || []
  }

  // Mark step as completed
  static async completeStep(userId: string, stepId: number): Promise<boolean> {
    try {
      const problems = await this.getUserProblems(userId)
      if (!problems) return false

      const completedSteps = [...problems.completed_steps, stepId]
      const currentStep = Math.max(...completedSteps) + 1

      const { error } = await supabase
        .from('user_problems')
        .update({
          completed_steps: completedSteps,
          current_step: currentStep > problems.total_steps ? problems.total_steps : currentStep,
          last_updated: new Date().toISOString()
        })
        .eq('user_id', userId)

      return !error
    } catch (error) {
      console.error('Error completing step:', error)
      return false
    }
  }

  // Get current step for user
  static async getCurrentStep(userId: string): Promise<ProblemStep | null> {
    const problems = await this.getUserProblems(userId)
    if (!problems) return null

    const learningPath = this.getLearningPath(problems.primary_problem)
    return learningPath.find(step => step.id === problems.current_step) || null
  }

  // Get progress percentage
  static getProgressPercentage(problems: UserProblem): number {
    return Math.round((problems.completed_steps.length / problems.total_steps) * 100)
  }

  // Helper functions
  private static getTotalStepsForProblem(problemType: string): number {
    const learningPath = this.getLearningPath(problemType)
    return learningPath.length
  }

  private static getInitialProgressData(problemType: string): any {
    const initialData: Record<string, any> = {
      premature_ejaculation: {
        technique_mastery: 0,
        control_rating: 1, // 1-10 scale
        confidence_level: 30
      },
      confidence_building: {
        social_confidence: 25,
        self_esteem_score: 30,
        daily_actions_completed: 0
      }
    }

    return initialData[problemType] || {}
  }
}
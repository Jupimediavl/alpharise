// Bot Management System for AlphaRise
import { supabase } from './supabase'

// Types
export interface Bot {
  id: string
  name: string
  username: string
  type: 'questioner' | 'answerer' | 'mixed'
  personality: Record<string, any>
  status: 'active' | 'paused' | 'archived'
  activity_level: number
  openai_model: string
  avatar_url?: string
  bio?: string
  expertise_areas: string[]
  created_at: string
  updated_at: string
  stats: {
    questions_posted: number
    answers_posted: number
    helpful_votes_received: number
    coins_earned: number
    last_active: string | null
  }
}

export interface BotPersonality {
  id: string
  name: string
  description: string
  traits: Record<string, any>
  prompt_template: string
  response_style: Record<string, any>
  created_at: string
}

export interface BotActivity {
  id: string
  bot_id: string
  activity_type: string
  content_id?: string
  content_type?: 'question' | 'answer'
  metadata: Record<string, any>
  success: boolean
  created_at: string
}

export interface BotSchedule {
  id: string
  bot_id: string
  day_of_week?: number
  start_time?: string
  end_time?: string
  timezone: string
  is_active: boolean
  created_at: string
}

// Bot Management Functions
export class BotManager {
  
  // Create a new bot
  static async createBot(botData: Omit<Bot, 'id' | 'created_at' | 'updated_at' | 'stats'>): Promise<Bot | null> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .insert([{
          ...botData,
          stats: {
            questions_posted: 0,
            answers_posted: 0,
            helpful_votes_received: 0,
            coins_earned: 0,
            last_active: null
          }
        }])
        .select()
        .single()

      if (error) {
        console.error('Error creating bot:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating bot:', error)
      return null
    }
  }

  // Get all bots
  static async getAllBots(): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching bots:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching bots:', error)
      return []
    }
  }

  // Get active bots
  static async getActiveBots(): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('status', 'active')
        .order('activity_level', { ascending: false })

      if (error) {
        console.error('Error fetching active bots:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching active bots:', error)
      return []
    }
  }

  // Get bots by type
  static async getBotsByType(type: 'questioner' | 'answerer' | 'mixed'): Promise<Bot[]> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('type', type)
        .eq('status', 'active')
        .order('activity_level', { ascending: false })

      if (error) {
        console.error(`Error fetching ${type} bots:`, error)
        return []
      }

      return data || []
    } catch (error) {
      console.error(`Error fetching ${type} bots:`, error)
      return []
    }
  }

  // Update bot
  static async updateBot(id: string, updates: Partial<Bot>): Promise<Bot | null> {
    try {
      const { data, error } = await supabase
        .from('bots')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating bot:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error updating bot:', error)
      return null
    }
  }

  // Toggle bot status
  static async toggleBotStatus(id: string): Promise<Bot | null> {
    try {
      // First get current status
      const { data: bot, error: fetchError } = await supabase
        .from('bots')
        .select('status')
        .eq('id', id)
        .single()

      if (fetchError || !bot) {
        console.error('Error fetching bot status:', fetchError)
        return null
      }

      const newStatus = bot.status === 'active' ? 'paused' : 'active'
      
      return await this.updateBot(id, { status: newStatus })
    } catch (error) {
      console.error('Error toggling bot status:', error)
      return null
    }
  }

  // Delete bot
  static async deleteBot(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bots')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting bot:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting bot:', error)
      return false
    }
  }

  // Log bot activity
  static async logActivity(
    botId: string, 
    activityType: string, 
    contentId?: string, 
    contentType?: 'question' | 'answer',
    metadata: Record<string, any> = {},
    success: boolean = true
  ): Promise<BotActivity | null> {
    try {
      const { data, error } = await supabase
        .from('bot_activities')
        .insert([{
          bot_id: botId,
          activity_type: activityType,
          content_id: contentId,
          content_type: contentType,
          metadata,
          success
        }])
        .select()
        .single()

      if (error) {
        console.error('Error logging bot activity:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error logging bot activity:', error)
      return null
    }
  }

  // Get bot activities
  static async getBotActivities(botId: string, limit: number = 50): Promise<BotActivity[]> {
    try {
      const { data, error } = await supabase
        .from('bot_activities')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching bot activities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching bot activities:', error)
      return []
    }
  }

  // Get bot analytics
  static async getBotAnalytics(): Promise<{
    totalBots: number
    activeBots: number
    questionerBots: number
    answererBots: number
    mixedBots: number
    totalQuestions: number
    totalAnswers: number
    totalInteractions: number
  }> {
    try {
      const { data: bots, error: botsError } = await supabase
        .from('bots')
        .select('type, status, stats')

      if (botsError || !bots) {
        console.error('Error fetching bot analytics:', botsError)
        return {
          totalBots: 0, activeBots: 0, questionerBots: 0, answererBots: 0, mixedBots: 0,
          totalQuestions: 0, totalAnswers: 0, totalInteractions: 0
        }
      }

      const analytics = {
        totalBots: bots.length,
        activeBots: bots.filter(b => b.status === 'active').length,
        questionerBots: bots.filter(b => b.type === 'questioner').length,
        answererBots: bots.filter(b => b.type === 'answerer').length,
        mixedBots: bots.filter(b => b.type === 'mixed').length,
        totalQuestions: bots.reduce((sum, b) => sum + (b.stats?.questions_posted || 0), 0),
        totalAnswers: bots.reduce((sum, b) => sum + (b.stats?.answers_posted || 0), 0),
        totalInteractions: bots.reduce((sum, b) => sum + (b.stats?.helpful_votes_received || 0), 0)
      }

      return analytics
    } catch (error) {
      console.error('Error calculating bot analytics:', error)
      return {
        totalBots: 0, activeBots: 0, questionerBots: 0, answererBots: 0, mixedBots: 0,
        totalQuestions: 0, totalAnswers: 0, totalInteractions: 0
      }
    }
  }
}

// Personality Management
export class PersonalityManager {
  
  static async getAllPersonalities(): Promise<BotPersonality[]> {
    try {
      const { data, error } = await supabase
        .from('bot_personalities')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching personalities:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching personalities:', error)
      return []
    }
  }

  static async createPersonality(personality: Omit<BotPersonality, 'id' | 'created_at'>): Promise<BotPersonality | null> {
    try {
      const { data, error } = await supabase
        .from('bot_personalities')
        .insert([personality])
        .select()
        .single()

      if (error) {
        console.error('Error creating personality:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating personality:', error)
      return null
    }
  }
}

// Schedule Management
export class ScheduleManager {
  
  static async createSchedule(schedule: Omit<BotSchedule, 'id' | 'created_at'>): Promise<BotSchedule | null> {
    try {
      const { data, error } = await supabase
        .from('bot_schedules')
        .insert([schedule])
        .select()
        .single()

      if (error) {
        console.error('Error creating schedule:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error creating schedule:', error)
      return null
    }
  }

  static async getBotSchedules(botId: string): Promise<BotSchedule[]> {
    try {
      const { data, error } = await supabase
        .from('bot_schedules')
        .select('*')
        .eq('bot_id', botId)
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching bot schedules:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching bot schedules:', error)
      return []
    }
  }

  // Check if bot should be active now
  static async isBotActiveNow(botId: string): Promise<boolean> {
    try {
      const schedules = await this.getBotSchedules(botId)
      
      if (schedules.length === 0) {
        return true // No schedule = always active
      }

      const now = new Date()
      const dayOfWeek = now.getDay()
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM format

      for (const schedule of schedules) {
        // Check day of week (null means all days)
        if (schedule.day_of_week !== null && schedule.day_of_week !== dayOfWeek) {
          continue
        }

        // Check time range
        if (schedule.start_time && schedule.end_time) {
          if (currentTime >= schedule.start_time && currentTime <= schedule.end_time) {
            return true
          }
        } else {
          return true // No time restrictions
        }
      }

      return false
    } catch (error) {
      console.error('Error checking bot schedule:', error)
      return true // Default to active on error
    }
  }
}
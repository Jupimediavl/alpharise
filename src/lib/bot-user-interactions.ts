// Bot-User Interaction System
// Handles follow-up responses from bots when users interact with their content

import { BotManager, Bot } from './bot-system'
import { BotIntelligence } from './bot-intelligence'
import { SupabaseAnswerManager, SupabaseQuestionManager, supabase } from './supabase'

interface UserInteraction {
  type: 'answer' | 'vote' | 'comment' | 'follow_up_question'
  userId: string
  userName: string
  contentId: string // question or answer ID
  content?: string // actual text content if applicable
  timestamp: string
  botId: string // which bot's content was interacted with
}

interface BotFollowUpResponse {
  shouldRespond: boolean
  responseType: 'thank' | 'clarify' | 'elaborate' | 'question_back'
  content?: string
  probability: number
}

export class BotUserInteractionSystem {

  // Check for new user interactions with bot content
  static async checkForUserInteractions(): Promise<UserInteraction[]> {
    try {
      const interactions: UserInteraction[] = []
      
      // Check for new answers to bot questions (last 10 minutes)
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      
      const { data: newAnswers, error: answersError } = await supabase
        .from('answers')
        .select(`
          id, content, author_id, author_name, question_id, created_at,
          questions!inner(id, author_id, is_bot_generated)
        `)
        .eq('questions.is_bot_generated', true)
        .neq('is_bot_generated', true) // Answer is not from a bot
        .gte('created_at', tenMinutesAgo)

      if (!answersError && newAnswers) {
        for (const answer of newAnswers) {
          const botQuestion = answer.questions as any
          const botId = await this.getBotIdByUsername(botQuestion.author_id)
          
          if (botId) {
            interactions.push({
              type: 'answer',
              userId: answer.author_id,
              userName: answer.author_name,
              contentId: answer.question_id,
              content: answer.content,
              timestamp: answer.created_at,
              botId
            })
          }
        }
      }

      // Check for new votes on bot answers (simplified - could track in votes table)
      // For now, we'll focus on answers to bot questions as that's more impactful

      return interactions
    } catch (error) {
      console.error('Error checking user interactions:', error)
      return []
    }
  }

  // Decide if bot should respond to user interaction
  static async shouldBotRespond(
    interaction: UserInteraction, 
    bot: Bot
  ): Promise<BotFollowUpResponse> {
    try {
      // Base probability based on bot activity level
      const baseProbability = Math.min(bot.activity_level / 10 * 0.3, 0.3) // Max 30%
      
      // Increase probability for meaningful interactions
      let probability = baseProbability
      
      if (interaction.type === 'answer' && interaction.content) {
        // Higher chance to respond to thoughtful answers
        const contentLength = interaction.content.length
        if (contentLength > 100) probability += 0.2 // Thoughtful response
        if (contentLength > 300) probability += 0.1 // Very detailed response
        
        // Check for questions in the answer (user asking for clarification)
        const hasQuestion = interaction.content.includes('?')
        if (hasQuestion) probability += 0.3
      }
      
      // Random factor
      const random = Math.random()
      const shouldRespond = random < probability
      
      if (!shouldRespond) {
        return {
          shouldRespond: false,
          responseType: 'thank',
          probability
        }
      }

      // Determine response type
      let responseType: 'thank' | 'clarify' | 'elaborate' | 'question_back' = 'thank'
      
      if (interaction.content) {
        if (interaction.content.includes('?')) {
          responseType = 'clarify'
        } else if (interaction.content.length > 200) {
          responseType = Math.random() > 0.5 ? 'elaborate' : 'question_back'
        } else {
          responseType = Math.random() > 0.7 ? 'thank' : 'question_back'
        }
      }

      return {
        shouldRespond: true,
        responseType,
        probability
      }
    } catch (error) {
      console.error('Error deciding bot response:', error)
      return { shouldRespond: false, responseType: 'thank', probability: 0 }
    }
  }

  // Generate bot follow-up response
  static async generateBotFollowUp(
    interaction: UserInteraction,
    bot: Bot,
    responseDecision: BotFollowUpResponse
  ): Promise<string | null> {
    try {
      // Get the original question for context
      const { data: originalQuestion } = await supabase
        .from('questions')
        .select('title, body')
        .eq('id', interaction.contentId)
        .single()

      if (!originalQuestion) return null

      // Build the prompt
      const systemPrompt = `You are ${bot.name}, and someone just answered your question about "${originalQuestion.title}".

CRITICAL: You MUST respond ONLY in ENGLISH. Never use Romanian or any other language.

User ${interaction.userName} responded: "${interaction.content}"

Your personality: You're grateful but not overly formal. Respond naturally like on TikTok/Reddit.

Response type: ${responseDecision.responseType}
- thank: Brief thanks + maybe one insight
- clarify: Answer their question or clarify your point  
- elaborate: Add more context or ask follow-up
- question_back: Ask them something related

STYLE:
- Very casual English, like texting a friend
- 1-2 sentences max
- Use "thanks", "appreciate it", "that makes sense", etc.
- No formal language

Your response should feel natural and continue the conversation.`

      const userPrompt = this.buildFollowUpPrompt(responseDecision.responseType, interaction)
      
      const response = await BotIntelligence.callOpenAI(systemPrompt, userPrompt, bot.openai_model)
      
      return response
    } catch (error) {
      console.error('Error generating bot follow-up:', error)
      return null
    }
  }

  // Post bot follow-up as answer
  static async postBotFollowUp(
    interaction: UserInteraction,
    bot: Bot,
    followUpContent: string
  ): Promise<boolean> {
    try {
      // Post as answer to the original question
      const answer = await SupabaseAnswerManager.createAnswer({
        question_id: interaction.contentId,
        author_id: bot.username,
        author_name: bot.username,
        content: followUpContent,
        rating: 0,
        rated_by: [],
        coin_earnings: 0,
        is_best_answer: false,
        is_helpful: false,
        votes: 0,
        voted_by: [],
        is_bot_generated: true,
        moderation_status: 'pending'
      })

      if (answer) {
        // Log the interaction
        await BotManager.logActivity(
          bot.id,
          'follow_up_response',
          answer.id,
          'answer',
          {
            original_user: interaction.userName,
            response_type: 'follow_up',
            interaction_type: interaction.type
          }
        )

        console.log(`🤝 Bot ${bot.name} followed up to ${interaction.userName}: "${followUpContent.substring(0, 50)}..."`)
        return true
      }

      return false
    } catch (error) {
      console.error('Error posting bot follow-up:', error)
      return false
    }
  }

  // Process all pending user interactions
  static async processUserInteractions(): Promise<void> {
    try {
      const interactions = await this.checkForUserInteractions()
      
      if (interactions.length === 0) {
        console.log('📭 No new user interactions with bot content')
        return
      }

      console.log(`🔔 Found ${interactions.length} new user interactions`)

      for (const interaction of interactions) {
        try {
          // Get the bot
          const bots = await BotManager.getAllBots()
          const bot = bots.find(b => b.id === interaction.botId)
          
          if (!bot || bot.status !== 'active') continue

          // Decide if bot should respond
          const decision = await this.shouldBotRespond(interaction, bot)
          
          if (!decision.shouldRespond) {
            console.log(`😴 Bot ${bot.name} decided not to respond to ${interaction.userName}`)
            continue
          }

          // Generate response
          const followUpContent = await this.generateBotFollowUp(interaction, bot, decision)
          
          if (!followUpContent) {
            console.log(`❌ Failed to generate follow-up for bot ${bot.name}`)
            continue
          }

          // Post the follow-up
          const success = await this.postBotFollowUp(interaction, bot, followUpContent)
          
          if (success) {
            console.log(`✅ Bot ${bot.name} successfully followed up to ${interaction.userName}`)
          }

        } catch (error) {
          console.error(`Error processing interaction for bot ${interaction.botId}:`, error)
        }
      }
    } catch (error) {
      console.error('Error processing user interactions:', error)
    }
  }

  // Helper methods
  private static async getBotIdByUsername(username: string): Promise<string | null> {
    try {
      const bots = await BotManager.getAllBots()
      const bot = bots.find(b => b.username === username)
      return bot?.id || null
    } catch (error) {
      return null
    }
  }

  private static buildFollowUpPrompt(responseType: string, interaction: UserInteraction): string {
    switch (responseType) {
      case 'thank':
        return `Write a brief, casual thank you message for their helpful answer.`
      
      case 'clarify':
        return `They seem to have a question or need clarification. Address what they're asking about.`
      
      case 'elaborate':
        return `Add more context or details to help them (and others) understand better.`
      
      case 'question_back':
        return `Ask them a relevant follow-up question to continue the conversation naturally.`
      
      default:
        return `Write a brief, friendly response to their answer.`
    }
  }
}
// Bot Automation Engine - Orchestrates bot behaviors
import { BotManager, Bot, PersonalityManager, ScheduleManager } from './bot-system'
import { BotIntelligence } from './bot-intelligence'
import { 
  SupabaseQuestionManager, 
  SupabaseAnswerManager, 
  SupabaseUserManager,
  supabase 
} from './supabase'

interface BotActionResult {
  success: boolean
  action: string
  botId: string
  contentId?: string
  error?: string
}

export class BotAutomation {
  private static isRunning = false
  private static intervalId: NodeJS.Timeout | null = null

  // Start the automation engine
  static start(intervalMinutes: number = 5): void {
    if (this.isRunning) {
      console.log('Bot automation already running')
      return
    }

    console.log(`🤖 Starting bot automation with ${intervalMinutes} minute intervals`)
    
    this.isRunning = true
    this.intervalId = setInterval(async () => {
      await this.runAutomationCycle()
    }, intervalMinutes * 60 * 1000)

    // Run initial cycle
    this.runAutomationCycle()
  }

  // Stop the automation engine
  static stop(): void {
    if (!this.isRunning) return

    console.log('🛑 Stopping bot automation')
    
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    
    this.isRunning = false
  }

  // Main automation cycle
  static async runAutomationCycle(): Promise<void> {
    try {
      console.log('🔄 Running bot automation cycle...')
      
      const activeBots = await BotManager.getActiveBots()
      
      if (activeBots.length === 0) {
        console.log('No active bots found')
        return
      }

      const results: BotActionResult[] = []

      // Process each active bot
      for (const bot of activeBots) {
        try {
          // Check if bot should be active based on schedule
          const shouldBeActive = await ScheduleManager.isBotActiveNow(bot.id)
          if (!shouldBeActive) {
            console.log(`Bot ${bot.name} is outside of scheduled hours`)
            continue
          }

          // Get community context
          const context = await BotIntelligence.getCommunityContext()

          // Decide what action to take based on bot type and activity level
          const action = await this.decideBotAction(bot, context)
          
          if (action) {
            const result = await this.executeBotAction(bot, action, context)
            results.push(result)
          }

        } catch (error) {
          console.error(`Error processing bot ${bot.name}:`, error)
          results.push({
            success: false,
            action: 'error',
            botId: bot.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Log cycle results
      const successful = results.filter(r => r.success).length
      console.log(`✅ Automation cycle complete: ${successful}/${results.length} actions successful`)

      // Trigger cross-bot interactions
      await this.triggerBotInteractions(activeBots)

    } catch (error) {
      console.error('Error in automation cycle:', error)
    }
  }

  // Decide what action a bot should take
  private static async decideBotAction(
    bot: Bot, 
    context: any
  ): Promise<'ask_question' | 'answer_question' | 'vote' | null> {
    const activityChance = bot.activity_level / 10 // Convert to 0-1 scale
    const randomFactor = Math.random()

    // Lower chance of action = more realistic timing
    if (randomFactor > activityChance * 0.3) {
      return null // Bot decides to stay quiet this cycle
    }

    // Get recent community activity
    const recentQuestions = await this.getRecentUnansweredQuestions()
    const myRecentActivity = await BotManager.getBotActivities(bot.id, 5)
    
    // Avoid spam - limit actions per time period
    const recentActions = myRecentActivity.filter(
      a => new Date().getTime() - new Date(a.created_at).getTime() < 60 * 60 * 1000 // Last hour
    )
    
    if (recentActions.length >= 2) {
      return null // Too active recently
    }

    // Decide action based on bot type
    switch (bot.type) {
      case 'questioner':
        // 70% chance to ask question, 30% chance to vote
        return randomFactor < 0.7 ? 'ask_question' : 'vote'
      
      case 'answerer':
        // Prefer answering if there are unanswered questions
        if (recentQuestions.length > 0) {
          return randomFactor < 0.8 ? 'answer_question' : 'vote'
        }
        return 'vote'
      
      case 'mixed':
        // Balanced approach
        if (recentQuestions.length > 3) {
          return randomFactor < 0.6 ? 'answer_question' : 'ask_question'
        } else {
          return randomFactor < 0.4 ? 'ask_question' : 'vote'
        }
      
      default:
        return null
    }
  }

  // Execute a bot action
  private static async executeBotAction(
    bot: Bot, 
    action: string, 
    context: any
  ): Promise<BotActionResult> {
    try {
      switch (action) {
        case 'ask_question':
          return await this.executeBotQuestion(bot, context)
        
        case 'answer_question':
          return await this.executeBotAnswer(bot, context)
        
        case 'vote':
          return await this.executeBotVote(bot)
        
        default:
          return {
            success: false,
            action,
            botId: bot.id,
            error: 'Unknown action'
          }
      }
    } catch (error) {
      return {
        success: false,
        action,
        botId: bot.id,
        error: error instanceof Error ? error.message : 'Execution failed'
      }
    }
  }

  // Execute question posting
  private static async executeBotQuestion(bot: Bot, context: any): Promise<BotActionResult> {
    try {
      // Get bot's specific personality
      let personality
      if (bot.personality && bot.personality.id) {
        // Bot has a specific personality assigned
        const personalities = await PersonalityManager.getAllPersonalities()
        personality = personalities.find(p => p.id === bot.personality.id)
      }
      
      if (!personality) {
        // Fallback to first available personality
        const personalities = await PersonalityManager.getAllPersonalities()
        personality = personalities[0]
      }
      
      if (!personality) {
        throw new Error('No personality found for bot')
      }

      // Generate question using AI
      const questionData = await BotIntelligence.generateQuestion(bot, personality, context)
      
      if (!questionData) {
        throw new Error('Failed to generate question')
      }

      // Post question to community
      const question = await SupabaseQuestionManager.createQuestion({
        title: questionData.title,
        body: questionData.body,
        author_id: bot.username,
        author_name: bot.username,
        category: questionData.category,
        question_type: questionData.type,
        coin_cost: 0, // Bots don't pay coins
        coin_bounty: 0,
        tags: [],
        views: 0,
        is_answered: false,
        is_solved: false,
        is_private: false,
        allowed_responders: []
      })

      if (!question) {
        throw new Error('Failed to create question in database')
      }

      // Log activity
      await BotManager.logActivity(
        bot.id, 
        'question_posted', 
        question.id, 
        'question',
        { title: questionData.title, category: questionData.category }
      )

      console.log(`✨ Bot ${bot.name} posted question: "${questionData.title}"`)

      return {
        success: true,
        action: 'ask_question',
        botId: bot.id,
        contentId: question.id
      }

    } catch (error) {
      console.error('Error executing bot question:', error)
      return {
        success: false,
        action: 'ask_question',
        botId: bot.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Execute answer posting
  private static async executeBotAnswer(bot: Bot, context: any): Promise<BotActionResult> {
    try {
      // Get recent unanswered questions (not by this bot)
      const questions = await this.getRecentUnansweredQuestions()
      const questionsNotByThisBot = questions.filter(q => q.author_id !== bot.username)
      
      if (questionsNotByThisBot.length === 0) {
        return {
          success: false,
          action: 'answer_question',
          botId: bot.id,
          error: 'No questions available to answer'
        }
      }

      // Select a question to answer (randomly, but could be more intelligent)
      const questionToAnswer = questionsNotByThisBot[Math.floor(Math.random() * questionsNotByThisBot.length)]

      // Get bot's specific personality
      let personality
      if (bot.personality && bot.personality.id) {
        // Bot has a specific personality assigned
        const personalities = await PersonalityManager.getAllPersonalities()
        personality = personalities.find(p => p.id === bot.personality.id)
      }
      
      if (!personality) {
        // Fallback to first available personality
        const personalities = await PersonalityManager.getAllPersonalities()
        personality = personalities[0]
      }
      
      if (!personality) {
        throw new Error('No personality found for bot')
      }

      // Generate answer using AI
      const answerData = await BotIntelligence.generateAnswer(
        bot, 
        personality, 
        questionToAnswer, 
        context
      )
      
      if (!answerData) {
        throw new Error('Failed to generate answer')
      }

      // Post answer
      const answer = await SupabaseAnswerManager.createAnswer({
        question_id: questionToAnswer.id,
        author_id: bot.username,
        author_name: bot.username,
        content: answerData.content,
        rating: 0,
        rated_by: [],
        coin_earnings: 0,
        is_best_answer: false,
        is_helpful: false,
        votes: 0,
        voted_by: []
      })

      if (!answer) {
        throw new Error('Failed to create answer in database')
      }

      // Log activity
      await BotManager.logActivity(
        bot.id, 
        'answer_posted', 
        answer.id, 
        'answer',
        { question_id: questionToAnswer.id, tone: answerData.tone }
      )

      console.log(`💬 Bot ${bot.name} answered question: "${questionToAnswer.title}"`)

      return {
        success: true,
        action: 'answer_question',
        botId: bot.id,
        contentId: answer.id
      }

    } catch (error) {
      console.error('Error executing bot answer:', error)
      return {
        success: false,
        action: 'answer_question',
        botId: bot.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Execute voting behavior
  private static async executeBotVote(bot: Bot): Promise<BotActionResult> {
    try {
      // Get recent answers that haven't been voted on by this bot
      const { data: answers, error } = await supabase
        .from('answers')
        .select('id, author_id, content, votes, voted_by, question_id')
        .neq('author_id', bot.username) // Don't vote on own answers
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .limit(10)

      if (error || !answers || answers.length === 0) {
        return {
          success: false,
          action: 'vote',
          botId: bot.id,
          error: 'No answers available to vote on'
        }
      }

      // Filter out answers already voted on by this bot
      const unvotedAnswers = answers.filter(a => 
        !a.voted_by || !a.voted_by.includes(bot.username)
      )

      if (unvotedAnswers.length === 0) {
        return {
          success: false,
          action: 'vote',
          botId: bot.id,
          error: 'No unvoted answers available'
        }
      }

      // Select answer to vote on
      const answerToVote = unvotedAnswers[Math.floor(Math.random() * unvotedAnswers.length)]

      // Update answer votes
      const newVotes = (answerToVote.votes || 0) + 1
      const newVotedBy = [...(answerToVote.voted_by || []), bot.username]

      const { error: updateError } = await supabase
        .from('answers')
        .update({
          votes: newVotes,
          voted_by: newVotedBy
        })
        .eq('id', answerToVote.id)

      if (updateError) {
        throw new Error('Failed to update answer votes')
      }

      // Reward the answer author with coins
      if (answerToVote.author_id) {
        const authorData = await SupabaseUserManager.getUserByUsername(answerToVote.author_id)
        if (authorData) {
          const newAuthorBalance = (authorData.coins || 0) + 1
          await SupabaseUserManager.updateUserCoins(answerToVote.author_id, newAuthorBalance)
        }
      }

      // Log activity
      await BotManager.logActivity(
        bot.id, 
        'vote_cast', 
        answerToVote.id, 
        'answer',
        { vote_type: 'helpful', recipient: answerToVote.author_id }
      )

      console.log(`👍 Bot ${bot.name} voted helpful on answer by ${answerToVote.author_id}`)

      return {
        success: true,
        action: 'vote',
        botId: bot.id,
        contentId: answerToVote.id
      }

    } catch (error) {
      console.error('Error executing bot vote:', error)
      return {
        success: false,
        action: 'vote',
        botId: bot.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Trigger cross-bot interactions
  private static async triggerBotInteractions(activeBots: Bot[]): Promise<void> {
    if (activeBots.length < 2) return

    try {
      // Randomly select pairs of bots for potential interactions
      for (let i = 0; i < Math.min(2, activeBots.length / 2); i++) {
        const bot1 = activeBots[Math.floor(Math.random() * activeBots.length)]
        const bot2 = activeBots[Math.floor(Math.random() * activeBots.length)]

        if (bot1.id === bot2.id) continue

        // Check if they should interact (low probability for realism)
        if (Math.random() < 0.1) {
          await this.executeBotInteraction(bot1, bot2)
        }
      }
    } catch (error) {
      console.error('Error triggering bot interactions:', error)
    }
  }

  // Execute interaction between two bots
  private static async executeBotInteraction(bot1: Bot, bot2: Bot): Promise<void> {
    try {
      // For now, just log the interaction
      // In future, could implement follow-up questions, disagreements, etc.
      
      console.log(`🤝 Potential interaction between ${bot1.name} and ${bot2.name}`)
      
      // Could implement:
      // - Bot1 asks follow-up question to Bot2's answer
      // - Bot1 disagrees with Bot2's approach
      // - Bot1 builds on Bot2's answer with additional insights
      
    } catch (error) {
      console.error('Error executing bot interaction:', error)
    }
  }

  // Helper: Get recent unanswered questions
  private static async getRecentUnansweredQuestions(): Promise<any[]> {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select('id, title, body, author_id, created_at, answers!left(count)')
        .eq('is_solved', false)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false })
        .limit(20)

      if (error || !questions) {
        console.error('Error fetching recent questions:', error)
        return []
      }

      // Filter to truly unanswered questions
      return questions.filter(q => q.answers.length === 0)
    } catch (error) {
      console.error('Error fetching unanswered questions:', error)
      return []
    }
  }

  // Manual trigger for immediate bot action
  static async triggerBotAction(botId: string, action: 'question' | 'answer' | 'vote'): Promise<BotActionResult> {
    try {
      const bot = await BotManager.getAllBots().then(bots => 
        bots.find(b => b.id === botId)
      )

      if (!bot) {
        return {
          success: false,
          action,
          botId,
          error: 'Bot not found'
        }
      }

      if (bot.status !== 'active') {
        return {
          success: false,
          action,
          botId,
          error: 'Bot is not active'
        }
      }

      const context = await BotIntelligence.getCommunityContext()
      
      switch (action) {
        case 'question':
          return await this.executeBotQuestion(bot, context)
        case 'answer':
          return await this.executeBotAnswer(bot, context)
        case 'vote':
          return await this.executeBotVote(bot)
        default:
          return {
            success: false,
            action,
            botId,
            error: 'Invalid action'
          }
      }
    } catch (error) {
      return {
        success: false,
        action,
        botId,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Auto-start automation when imported (for production)
// Comment out during development
// if (typeof window === 'undefined') { // Server-side only
//   BotAutomation.start(10) // Run every 10 minutes
// }
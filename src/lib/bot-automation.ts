// Bot Automation Engine - Orchestrates bot behaviors
import { BotManager, Bot, PersonalityManager, ScheduleManager } from './bot-system'
import { BotIntelligence } from './bot-intelligence'
import { BotUserInteractionSystem } from './bot-user-interactions'
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
  private static allIntervalIds: NodeJS.Timeout[] = []

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
    
    // Track all intervals
    this.allIntervalIds.push(this.intervalId)

    // Run initial cycle
    this.runAutomationCycle()
  }

  // Stop the automation engine
  static stop(): void {
    console.log('🛑 Attempting to stop bot automation...')
    console.log(`Current isRunning: ${this.isRunning}`)
    console.log(`Active intervals: ${this.allIntervalIds.length}`)

    // Clear main interval
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('✅ Cleared main interval')
    }
    
    // Clear all tracked intervals
    this.allIntervalIds.forEach((intervalId, index) => {
      clearInterval(intervalId)
      console.log(`✅ Cleared interval ${index + 1}`)
    })
    this.allIntervalIds = []
    
    this.isRunning = false
    console.log('🛑 Bot automation stopped completely')
  }

  // Main automation cycle
  static async runAutomationCycle(): Promise<void> {
    try {
      // Safety check - exit immediately if automation is stopped
      if (!this.isRunning) {
        console.log('⏹️ Automation cycle aborted - automation is stopped')
        return
      }
      
      console.log('🔄 Running bot automation cycle at:', new Date().toISOString())
      
      const activeBots = await BotManager.getActiveBots()
      console.log(`🤖 Found ${activeBots.length} active bots:`, activeBots.map(b => `${b.name} (${b.type})`))
      
      if (activeBots.length === 0) {
        console.log('⚠️ No active bots found - check bot status in database')
        return
      }

      const results: BotActionResult[] = []

      // Process each active bot
      for (const bot of activeBots) {
        try {
          console.log(`🔍 Processing bot: ${bot.name} (${bot.type})`)
          
          // Check if bot should be active based on schedule
          const shouldBeActive = await ScheduleManager.isBotActiveNow(bot.id)
          if (!shouldBeActive) {
            console.log(`⏰ Bot ${bot.name} is outside of scheduled hours`)
            continue
          }

          // Get community context
          console.log(`📊 Getting community context for ${bot.name}`)
          const context = await BotIntelligence.getCommunityContext()

          // Decide what action to take based on bot type and activity level
          console.log(`🤔 Deciding action for ${bot.name}`)
          const action = await this.decideBotAction(bot, context)
          
          if (action) {
            console.log(`🚀 Executing action "${action}" for ${bot.name}`)
            const result = await this.executeBotAction(bot, action, context)
            console.log(`📝 Action result for ${bot.name}:`, result.success ? '✅ Success' : '❌ Failed', result.error || '')
            results.push(result)
          } else {
            console.log(`😴 Bot ${bot.name} decided to stay quiet this cycle`)
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

      // Process user interactions (bot follow-ups)
      console.log('🔄 Checking for user interactions with bot content...')
      await BotUserInteractionSystem.processUserInteractions()

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
    if (randomFactor > activityChance * 0.5) {
      return null // Bot decides to stay quiet this cycle
    }

    // Get recent community activity
    const recentQuestions = await this.getRecentAnswerableQuestions()
    const myRecentActivity = await BotManager.getBotActivities(bot.id, 5)
    
    // Avoid spam - limit actions per time period
    const recentActions = myRecentActivity.filter(
      a => new Date().getTime() - new Date(a.created_at).getTime() < 60 * 60 * 1000 // Last hour
    )
    
    if (recentActions.length >= 3) {
      return null // Too active recently
    }

    // Decide action based on bot type
    switch (bot.type) {
      case 'questioner':
        // QUESTIONER bots should primarily ask questions, never answer
        // 70% chance to ask question, 30% chance to vote
        return randomFactor < 0.7 ? 'ask_question' : 'vote'
      
      case 'answerer':
        // ANSWERER bots should ONLY answer questions, NEVER ask them
        if (recentQuestions.length > 0) {
          // Questions available - 85% chance to answer, 15% chance to vote
          return randomFactor < 0.85 ? 'answer_question' : 'vote'
        } else {
          // No questions to answer - just vote or stay quiet
          return randomFactor < 0.2 ? 'vote' : null
        }
      
      case 'mixed':
        // MIXED bots have balanced behavior - can both ask and answer
        if (recentQuestions.length > 2) {
          // Many questions exist, prefer answering (60% answer, 30% ask, 10% vote)
          if (randomFactor < 0.6) return 'answer_question'
          else if (randomFactor < 0.9) return 'ask_question'
          else return 'vote'
        } else if (recentQuestions.length > 0) {
          // Some questions exist (40% answer, 40% ask, 20% vote)
          if (randomFactor < 0.4) return 'answer_question'
          else if (randomFactor < 0.8) return 'ask_question'
          else return 'vote'
        } else {
          // No questions to answer - focus on asking (70% ask, 30% vote)
          return randomFactor < 0.7 ? 'ask_question' : 'vote'
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
      console.log(`🤖 Generating question for bot ${bot.name}...`)
      const questionData = await BotIntelligence.generateQuestion(bot, personality, context)
      
      if (!questionData) {
        console.error(`❌ Bot ${bot.name} - Failed to generate question`)
        throw new Error('Failed to generate question')
      }
      
      console.log(`✅ Bot ${bot.name} - Generated question: "${questionData.title}"`)

      // Post question to community (marked as bot-generated and pending moderation)
      console.log(`📝 Bot ${bot.name} - Creating question in database...`)
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
        allowed_responders: [],
        is_bot_generated: true,
        moderation_status: 'pending'
      })

      if (!question) {
        console.error(`❌ Bot ${bot.name} - Failed to create question in database`)
        throw new Error('Failed to create question in database')
      }
      
      console.log(`🎉 Bot ${bot.name} - Successfully created question in database with ID: ${question.id}`)

      // Log activity
      await BotManager.logActivity(
        bot.id, 
        'question_posted', 
        question.id, 
        'question',
        { title: questionData.title, category: questionData.category }
      )

      // Update bot stats manually (in case triggers don't work)
      await BotManager.updateBotStats(bot.id, { questions_posted: 1 })

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
      // Get recent answerable questions (not by this bot)
      const questions = await this.getRecentAnswerableQuestions()
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
        voted_by: [],
        is_bot_generated: true,
        moderation_status: 'pending'
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

      // Update bot stats manually 
      await BotManager.updateBotStats(bot.id, { answers_posted: 1 })

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

  // Helper: Get recent answerable questions (including those with existing answers)
  private static async getRecentAnswerableQuestions(): Promise<any[]> {
    try {
      const { data: questions, error } = await supabase
        .from('questions')
        .select(`
          id, 
          title, 
          body, 
          author_id, 
          created_at,
          answers(id)
        `)
        .eq('is_solved', false)
        .in('moderation_status', ['approved', 'pending']) // Include both approved and pending questions
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('created_at', { ascending: false })
        .limit(20)

      if (error || !questions) {
        console.error('Error fetching recent questions:', error)
        return []
      }

      // Filter to questions that can still receive more answers (max 4 answers per question)
      const answerableQuestions = questions.filter(q => !q.answers || q.answers.length < 4)
      console.log(`📋 Found ${answerableQuestions.length} answerable questions out of ${questions.length} total (allowing up to 4 answers per question)`)
      return answerableQuestions
    } catch (error) {
      console.error('Error fetching answerable questions:', error)
      return []
    }
  }

  // Manual bulk trigger - run all active bots without schedule restrictions
  static async runAllActiveBotsManually(): Promise<void> {
    try {
      console.log('🚀 Manual bulk trigger: Running all active bots...')
      
      const activeBots = await BotManager.getActiveBots()
      console.log(`🤖 Found ${activeBots.length} active bots for manual execution`)
      
      if (activeBots.length === 0) {
        console.log('⚠️ No active bots found')
        return
      }

      const results: BotActionResult[] = []

      // Process each active bot - skip schedule restrictions for manual trigger
      for (const bot of activeBots) {
        try {
          console.log(`🔍 Manual processing bot: ${bot.name} (${bot.type})`)

          // Get community context
          const context = await BotIntelligence.getCommunityContext()

          // Decide what action to take (same logic as automation)
          const action = await this.decideBotAction(bot, context)
          
          if (action) {
            console.log(`🚀 Manual executing action "${action}" for ${bot.name}`)
            const result = await this.executeBotAction(bot, action, context)
            console.log(`📝 Manual action result for ${bot.name}:`, result.success ? '✅ Success' : '❌ Failed', result.error || '')
            results.push(result)
          } else {
            console.log(`😴 Bot ${bot.name} decided to stay quiet this cycle`)
          }

        } catch (error) {
          console.error(`Error manually processing bot ${bot.name}:`, error)
          results.push({
            success: false,
            action: 'error',
            botId: bot.id,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Log results
      const successful = results.filter(r => r.success).length
      console.log(`✅ Manual bulk execution complete: ${successful}/${results.length} actions successful`)

    } catch (error) {
      console.error('Error in manual bulk execution:', error)
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

      // Manual triggers work for both active and paused bots
      console.log(`🎯 Manual trigger: ${action} for bot ${bot.name} (status: ${bot.status})`)
      console.log(`Bot details:`, { id: bot.id, type: bot.type, openai_model: bot.openai_model })

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
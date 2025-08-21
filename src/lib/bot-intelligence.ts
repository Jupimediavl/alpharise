// OpenAI Integration for Bot Intelligence
import { Bot, BotPersonality } from './bot-system'
import { supabase } from './supabase'

// OpenAI API configuration
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
const OPENAI_BASE_URL = 'https://api.openai.com/v1'

interface OpenAIResponse {
  choices: {
    message: {
      content: string
    }
  }[]
}

interface CommunityContext {
  recentQuestions: Array<{
    title: string
    body: string
    author: string
    created_at: string
  }>
  trendingTopics: string[]
  communityTone: 'supportive' | 'analytical' | 'casual' | 'motivational'
}

export class BotIntelligence {

  // Bot Deduplication System
  // ========================

  // Check if question is too similar to previously asked questions
  static async checkQuestionSimilarity(
    botId: string, 
    questionText: string, 
    category: string
  ): Promise<{ isDuplicate: boolean; similarity?: number; matchedQuestion?: string }> {
    try {
      // Import supabase from our lib - avoids key issues
      const { supabase } = require('./supabase')

      // Get bot's previous questions from memory
      const { data: botMemory, error } = await supabase
        .from('bot_memory')
        .select('question_text, keywords')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .limit(50) // Check last 50 questions

      if (error) {
        console.warn('Bot memory table not found (normal if not yet created):', error.message)
        // If bot_memory table doesn't exist, skip deduplication for now
        return { isDuplicate: false }
      }

      // Also check recent community questions for global deduplication
      const { data: recentQuestions } = await supabase
        .from('questions')
        .select('title, body')
        .order('created_at', { ascending: false })
        .limit(100)

      const allQuestionsToCheck = [
        ...(botMemory || []).map((q: any) => q.question_text),
        ...(recentQuestions || []).map((q: any) => `${q.title} ${q.body}`)
      ]

      // Check for similarity
      for (const existingQuestion of allQuestionsToCheck) {
        const similarity = this.calculateTextSimilarity(questionText, existingQuestion)
        
        // If similarity > 70%, consider it a duplicate
        if (similarity > 0.7) {
          return { 
            isDuplicate: true, 
            similarity, 
            matchedQuestion: existingQuestion.slice(0, 100) + '...'
          }
        }
      }

      return { isDuplicate: false }
    } catch (error) {
      console.error('Error in similarity check:', error)
      return { isDuplicate: false }
    }
  }

  // Calculate similarity between two text strings using multiple algorithms
  static calculateTextSimilarity(text1: string, text2: string): number {
    const normalizedText1 = text1.toLowerCase().trim()
    const normalizedText2 = text2.toLowerCase().trim()

    // 1. Exact match check
    if (normalizedText1 === normalizedText2) {
      return 1.0
    }

    // 2. Levenshtein distance for fuzzy matching
    const levenshteinSimilarity = 1 - (this.levenshteinDistance(normalizedText1, normalizedText2) / 
      Math.max(normalizedText1.length, normalizedText2.length))

    // 3. Keyword overlap analysis
    const keywords1 = this.extractKeywords(normalizedText1)
    const keywords2 = this.extractKeywords(normalizedText2)
    const keywordOverlap = this.calculateKeywordOverlap(keywords1, keywords2)

    // 4. Phrase similarity (checking for common phrases)
    const phraseSimilarity = this.calculatePhraseSimilarity(normalizedText1, normalizedText2)

    // Weighted average of different similarity measures
    const finalSimilarity = (
      levenshteinSimilarity * 0.3 + 
      keywordOverlap * 0.4 + 
      phraseSimilarity * 0.3
    )

    return Math.min(finalSimilarity, 1.0)
  }

  // Levenshtein distance algorithm for fuzzy matching
  static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // insertion
          matrix[j - 1][i] + 1,     // deletion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }

    return matrix[str2.length][str1.length]
  }

  // Extract meaningful keywords from text
  static extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
      'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself',
      'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which',
      'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
      'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by',
      'for', 'with', 'through', 'during', 'before', 'after', 'above', 'below', 'up', 'down',
      'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once'
    ])

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .filter(word => /^[a-z]+$/.test(word)) // Only alphabetic words
  }

  // Calculate keyword overlap between two sets of keywords
  static calculateKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    if (keywords1.length === 0 && keywords2.length === 0) return 1.0
    if (keywords1.length === 0 || keywords2.length === 0) return 0.0

    const set1 = new Set(keywords1)
    const set2 = new Set(keywords2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])

    return intersection.size / union.size // Jaccard similarity
  }

  // Calculate phrase similarity by looking for common multi-word phrases
  static calculatePhraseSimilarity(text1: string, text2: string): number {
    const phrases1 = this.extractPhrases(text1, 2, 4) // 2-4 word phrases
    const phrases2 = this.extractPhrases(text2, 2, 4)

    if (phrases1.length === 0 && phrases2.length === 0) return 1.0
    if (phrases1.length === 0 || phrases2.length === 0) return 0.0

    let commonPhrases = 0
    for (const phrase1 of phrases1) {
      for (const phrase2 of phrases2) {
        if (phrase1 === phrase2) {
          commonPhrases++
          break
        }
      }
    }

    return (commonPhrases * 2) / (phrases1.length + phrases2.length)
  }

  // Extract n-gram phrases from text
  static extractPhrases(text: string, minLength: number, maxLength: number): string[] {
    const words = text.toLowerCase().split(/\s+/)
    const phrases: string[] = []

    for (let length = minLength; length <= maxLength; length++) {
      for (let i = 0; i <= words.length - length; i++) {
        const phrase = words.slice(i, i + length).join(' ')
        phrases.push(phrase)
      }
    }

    return phrases
  }

  // Save question to bot memory for future deduplication
  static async saveToBotMemory(
    botId: string, 
    questionText: string, 
    category: string,
    patternType: 'traditional' | 'problem-statement'
  ): Promise<boolean> {
    try {
      const { supabase } = require('./supabase')

      // Generate hash for quick lookups
      const questionHash = this.generateQuestionHash(questionText)
      const keywords = this.extractKeywords(questionText)

      const { error } = await supabase
        .from('bot_memory')
        .insert({
          bot_id: botId,
          question_text: questionText,
          question_hash: questionHash,
          topic_category: category,
          pattern_type: patternType,
          keywords
        })

      if (error) {
        console.warn('Bot memory table not available for saving:', error.message)
        // If bot_memory table doesn't exist, that's OK, bot still works
        return true
      }

      // Clean up old entries (keep only last 100 per bot)
      await this.cleanupBotMemory(botId)
      return true
    } catch (error) {
      console.error('Error in saveToBotMemory:', error)
      return false
    }
  }

  // Generate hash for quick exact match detection
  static generateQuestionHash(questionText: string): string {
    return require('crypto')
      .createHash('sha256')
      .update(questionText.toLowerCase().trim())
      .digest('hex')
      .substring(0, 16) // Truncate for database storage
  }

  // Clean up old bot memory entries to prevent table bloat
  static async cleanupBotMemory(botId: string): Promise<void> {
    try {
      const { supabase } = require('./supabase')

      // Keep only the most recent 100 entries per bot
      const { data: oldEntries } = await supabase
        .from('bot_memory')
        .select('id')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })
        .range(100, 1000) // Get entries beyond the 100 most recent

      if (oldEntries && oldEntries.length > 0) {
        const idsToDelete = oldEntries.map((entry: any) => entry.id)
        await supabase
          .from('bot_memory')
          .delete()
          .in('id', idsToDelete)
      }
    } catch (error) {
      console.error('Error cleaning up bot memory:', error)
    }
  }

  // Topic rotation system to ensure diverse content
  static getBotTopicRotation(botId: string): string {
    const topics = ['confidence', 'relationships', 'dating', 'performance']
    const now = new Date()
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
    const botSeed = botId.charCodeAt(0) + botId.charCodeAt(botId.length - 1) // Simple bot-specific seed
    
    // Each bot gets a different topic each day, cycling through all topics
    const topicIndex = (dayOfYear + botSeed) % topics.length
    return topics[topicIndex]
  }

  // Generate a question from a questioner bot with deduplication
  static async generateQuestion(
    bot: Bot, 
    personality: BotPersonality, 
    context: CommunityContext
  ): Promise<{
    title: string
    body: string
    type: 'regular' | 'urgent'
    category: string
  } | null> {
    const maxRetries = 3
    let attemptCount = 0

    while (attemptCount < maxRetries) {
      try {
        attemptCount++
        console.log(`Bot ${bot.id} - Question generation attempt ${attemptCount}/${maxRetries}`)
        console.log(`Bot ${bot.id} - OpenAI API Key available:`, !!OPENAI_API_KEY)

        // Use topic rotation system to guide question generation
        const preferredCategory = this.getBotTopicRotation(bot.id)
        console.log(`Bot ${bot.id} - Preferred category: ${preferredCategory}`)

        const systemPrompt = this.buildQuestionSystemPrompt(bot, personality, context)
        const userPrompt = this.buildQuestionUserPrompt(context, preferredCategory)

        const response = await this.callOpenAI(systemPrompt, userPrompt, bot.openai_model)
        
        if (!response) {
          console.log(`Bot ${bot.id} - No response from OpenAI on attempt ${attemptCount}`)
          continue
        }

        const parsed = this.parseQuestionResponse(response)
        if (!parsed) {
          console.log(`Bot ${bot.id} - Failed to parse response on attempt ${attemptCount}`)
          continue
        }

        // Check for similarity with existing questions (optional - skip if table not available)
        const questionFullText = `${parsed.title} ${parsed.body}`
        try {
          const similarityCheck = await this.checkQuestionSimilarity(
            bot.id, 
            questionFullText, 
            parsed.category
          )

          if (similarityCheck.isDuplicate) {
            console.log(`Bot ${bot.id} - Question too similar (${(similarityCheck.similarity! * 100).toFixed(1)}%) to: "${similarityCheck.matchedQuestion}"`)
            console.log(`Bot ${bot.id} - Retrying with different parameters...`)
            continue // Try again
          }
        } catch (error) {
          console.warn(`Bot ${bot.id} - Similarity check failed, proceeding anyway:`, error instanceof Error ? error.message : 'Unknown error')
          // If similarity check fails, continue with question generation
        }

        // Question is unique - save to bot memory and return
        const patternType = parsed.title.includes('I ') || parsed.body.includes('I ') ? 'problem-statement' : 'traditional'
        const memorySaved = await this.saveToBotMemory(
          bot.id,
          questionFullText,
          parsed.category,
          patternType
        )

        if (memorySaved) {
          console.log(`Bot ${bot.id} - Generated unique question: "${parsed.title}" (Category: ${parsed.category})`)
        } else {
          console.warn(`Bot ${bot.id} - Question generated but failed to save to memory`)
        }

        return parsed
      } catch (error) {
        console.error(`Bot ${bot.id} - Error generating question on attempt ${attemptCount}:`, error)
      }
    }

    console.error(`Bot ${bot.id} - Failed to generate unique question after ${maxRetries} attempts`)
    return null
  }

  // Generate an answer from an answerer bot
  static async generateAnswer(
    bot: Bot,
    personality: BotPersonality,
    question: { title: string; body: string; author: string },
    context: CommunityContext,
    conversationContext?: {
      isFirstAnswer: boolean;
      answerCount: number;
      lastAnswer?: string;
      lastAnswerAuthor?: string;
    }
  ): Promise<{
    content: string
    tone: 'helpful' | 'supportive' | 'analytical' | 'motivational'
  } | null> {
    try {
      // Get recent answers to this question to avoid repetition
      const { data: recentAnswers } = await supabase
        .from('answers')
        .select('content, author_id')
        .eq('question_id', (question as any).id)
        .order('created_at', { ascending: false })
        .limit(5)

      const systemPrompt = this.buildAnswerSystemPrompt(bot, personality, context)
      const userPrompt = this.buildAnswerUserPrompt(question, context, recentAnswers || [], conversationContext)

      const response = await this.callOpenAI(systemPrompt, userPrompt, bot.openai_model)
      
      if (!response) return null

      const parsed = this.parseAnswerResponse(response)
      return parsed
    } catch (error) {
      console.error('Error generating answer:', error)
      return null
    }
  }

  // Decide if bot should interact with content (vote, reply, etc.)
  static async shouldInteract(
    bot: Bot,
    personality: BotPersonality,
    content: { title?: string; body: string; author: string },
    interactionType: 'vote' | 'reply' | 'disagree'
  ): Promise<{ shouldInteract: boolean; reason?: string }> {
    try {
      // Simple logic based on personality and bot type
      const personalityScore = this.calculatePersonalityMatch(bot, personality, content)
      const randomFactor = Math.random()
      const activityThreshold = bot.activity_level / 10

      // Higher activity level = more likely to interact
      const shouldInteract = (personalityScore + randomFactor) > (1.5 - activityThreshold)

      return {
        shouldInteract,
        reason: shouldInteract 
          ? `Personality match: ${personalityScore.toFixed(2)}, Activity level: ${bot.activity_level}`
          : 'Low interest based on personality and activity level'
      }
    } catch (error) {
      console.error('Error deciding interaction:', error)
      return { shouldInteract: false, reason: 'Error in decision making' }
    }
  }

  // Build system prompt for question generation
  private static buildQuestionSystemPrompt(
    bot: Bot, 
    personality: BotPersonality, 
    context: CommunityContext
  ): string {
    const expertiseContext = bot.expertise_areas.length > 0 
      ? `You have experience with: ${bot.expertise_areas.join(', ')}.`
      : ''

    const communityContext = context.recentQuestions.length > 0
      ? `Recent community discussions include: ${context.trendingTopics.join(', ')}.`
      : ''

    return `You are ${bot.name}, a regular American guy from the United States who is struggling with confidence and needs help with masculine self-improvement. You are a man asking other men for advice. ${expertiseContext}

${communityContext}

CRITICAL: You are an American male who only speaks English. You never use Romanian or any other language - you don't even know any other languages exist.

You write in casual American English like on Reddit or TikTok - direct, authentic, masculine perspective.

Generate a short and authentic question about male confidence and self-improvement from a man's perspective.

STYLE:
- Natural English language, relaxed, conversational
- Title VERY short (max 6-8 words) - IN ENGLISH ONLY
- Concrete, real question like talking to a friend
- No long or complicated sentences
- Examples: "help", "how to", "why do I", "what to do when"

JSON format (ENGLISH ONLY):
{
  "title": "Short, natural English title (max 50 chars)",
  "body": "Brief English details, 1-2 sentences max, very casual",
  "type": "regular",
  "category": "confidence, relationships, dating, performance"
}`
  }

  private static buildQuestionUserPrompt(context: CommunityContext, preferredCategory?: string): string {
    // Enhanced topics with problem-statement patterns and traditional questions
    const topicsByCategory: Record<string, { traditional: string[], problemStatement: string[] }> = {
      'confidence': {
        traditional: [
          'how to stop shaking when speaking in public',
          'why am I scared to join a gym',
          'how to stop blushing when talking to my boss',
          'why am I afraid to express my opinion',
          'how to not be shy at parties',
          'what to do when everyone seems better than me',
          'how to have courage to change my job'
        ],
        problemStatement: [
          'I literally shake during work presentations. Am I just broken?',
          'I\'ve been avoiding the gym for 3 months because I feel judged. Is this normal?',
          'I can\'t speak up in meetings even when I know the answer. Do I lack confidence?',
          'Everyone at parties seems so natural while I hide in corners. What\'s wrong with me?',
          'My boss asked for my opinion and I just mumbled something stupid. How do I fix this?',
          'I compare myself to every guy I meet and feel inferior. Is this killing my confidence?',
          'I\'ve wanted to quit my job for years but I\'m too scared. Am I a coward?'
        ]
      },
      'dating': {
        traditional: [
          'why do my matches not respond',
          'how to take good photos for Tinder',
          'what to write so I don\'t seem desperate',
          'why do conversations die after 2 messages',
          'how to not seem boring on dating apps'
        ],
        problemStatement: [
          'I got 2 matches this month and both ghosted me immediately. Am I that ugly?',
          'My Tinder profile gets zero likes even with decent photos. What am I doing wrong?',
          'I send thoughtful messages but girls never reply. Do I seem desperate?',
          'Every conversation dies after "hey how are you". Am I that boring?',
          'I\'ve been on dating apps for 6 months with zero dates. Should I give up?',
          'Girls match with me but never respond to my messages. Is my game that weak?',
          'I super-liked a girl and she unmatched instantly. Did I screw up?'
        ]
      },
      'relationships': {
        traditional: [
          'how to stop being jealous as a guy',
          'what to do when she doesn\'t text back fast',
          'how to not fight with my girlfriend constantly',  
          'why do I struggle opening up emotionally as a man',
          'how to not be clingy with women'
        ],
        problemStatement: [
          'I check my girlfriend\'s phone when she\'s in the shower. Am I toxic?',
          'She didn\'t text back for 3 hours and I sent 5 messages. Did I mess up?',
          'We fight every week about stupid things and it\'s always my fault. Am I the problem?',
          'I can\'t tell my girlfriend I love her even after 8 months. What\'s wrong with me?',
          'I text my girlfriend constantly and she says I\'m clingy. How do I back off?',
          'I got jealous when she went out with friends. Am I controlling?',
          'She said I never share my feelings but I don\'t know how. Is this fixable?'
        ]
      },
      'performance': {
        traditional: [
          'how to have confidence in my body',
          'why am I scared to try new things in bed',
          'how to talk about what I like',
          'what to do when I don\'t like how I look',
          'how to not be anxious during intimacy'
        ],
        problemStatement: [
          'I finished in under a minute last night and she seemed disappointed. Do I have a problem?',
          'I\'m too embarrassed to take my shirt off during sex. Is this normal?',
          'She asked what I like in bed and I froze up completely. How do I communicate better?',
          'I avoid certain positions because I feel self-conscious about my body. Am I overthinking?',
          'I get so nervous before intimacy that I can\'t perform. Is this anxiety ruining my sex life?',
          'I\'ve never initiated anything new in bed because I\'m scared of rejection. Should I try?',
          'My girlfriend is more experienced and I feel inadequate. How do I gain confidence?'
        ]
      }
    }

    const writingStyles = [
      'very casual, lowercase style',
      'normal but friendly', 
      'slightly anxious, asking multiple questions',
      'direct to the point',
      'telling story like to friends'
    ]

    // Use preferred category if provided, otherwise select randomly
    const categories = Object.keys(topicsByCategory)
    const selectedCategory = preferredCategory && categories.includes(preferredCategory) 
      ? preferredCategory 
      : categories[Math.floor(Math.random() * categories.length)]
    const categoryData = topicsByCategory[selectedCategory]
    
    // 60% chance for problem-statement pattern, 40% for traditional
    const useProblematic = Math.random() < 0.6
    const topicsArray = useProblematic ? categoryData.problemStatement : categoryData.traditional
    const randomTopic = topicsArray[Math.floor(Math.random() * topicsArray.length)]
    const randomStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)]
    
    // Pattern type for prompt guidance
    const patternType = useProblematic ? 'problem-statement' : 'traditional'

    return `Generate a unique question about: ${randomTopic}

Category: ${selectedCategory}
Pattern: ${patternType}
Writing style: ${randomStyle}

QUESTION PATTERN GUIDE:
${patternType === 'problem-statement' ? 
  `- PROBLEM-STATEMENT PATTERN: Start with personal vulnerable problem, then ask question
  - Structure: "Personal issue/story. Question?"
  - Example: "I shake during presentations. Am I just broken?"
  - Make it raw, honest, vulnerable - like confessing to a friend` :
  `- TRADITIONAL PATTERN: Direct question format
  - Structure: "How to...", "Why do I...", "What should I..."  
  - Example: "How do I stop being nervous in meetings?"
  - Keep it straightforward and advice-seeking`
}

CRITICAL REQUIREMENTS:
- You are an AMERICAN MAN writing in ENGLISH only
- Never use Romanian words (geloasă, partenerul, etc.)
- Use masculine perspective: "my girlfriend", "as a guy", "women", "she"
- Never feminine perspective: "sunt geloasă", "partenerul meu"

DO NOT repeat these recent topics:
${context.recentQuestions.slice(0, 5).map(q => `- ${q.title}`).join('\n')}

Requirements:
- Sound like a real American man asking for help
- Natural English language, like TikTok/Reddit
- Masculine perspective only - you are a man talking about women
- Show vulnerability and real male concerns
- ENGLISH ONLY - you don't know Romanian exists
- Category: "${selectedCategory}"
- Follow the ${patternType.toUpperCase()} pattern above

Write as an American male in English only.`
  }

  // Build system prompt for answer generation
  private static buildAnswerSystemPrompt(
    bot: Bot, 
    personality: BotPersonality, 
    context: CommunityContext
  ): string {
    const expertiseContext = bot.expertise_areas.length > 0 
      ? `Your areas of expertise include: ${bot.expertise_areas.join(', ')}.`
      : ''

    const personalityStyle = personality ? `
PERSONALITY INFLUENCE: You have a ${personality.communication_style || 'supportive'} style with these traits:
- Tone: ${personality.tone || 'helpful and encouraging'}
- Style: ${personality.communication_style || 'direct but caring'}
Let this guide how you communicate, but stay natural and varied.` : ''

    return `You are ${bot.name}, a cool American guy who helps other men with confidence and self-improvement. You're speaking to another man who needs advice. ${expertiseContext}${personalityStyle}

CRITICAL: You are an American male who only speaks English. You've never heard Romanian or any other language in your life.

Write in natural American English like on Reddit/TikTok - relaxed, friendly, man-to-man conversation.

RESPONSE STYLE:
- Natural English language ONLY, very casual
- Short and to the point (max 2-3 sentences)
- No formal language
- Like you're answering a friend on WhatsApp
- START DIRECTLY with your advice - NO greetings like "Hey man", "Hey bro", "Yo", etc.
- Jump straight into the helpful content
- Concrete examples, not generic advice
- Positive and motivational tone
- Make each response unique and personal based on YOUR specific personality

IMPORTANT: Your entire response must be in English only.

JSON format (ENGLISH ONLY):
{
  "content": "Start directly with advice, no greeting. Keep it short and helpful (max 2-3 sentences).",
  "tone": "helpful"
}

GOOD EXAMPLE: "Building confidence starts with small wins. Pick one thing you can improve today and focus on that."
BAD EXAMPLE: "Hey man, building confidence starts with..."`
  }

  private static buildAnswerUserPrompt(
    question: { title: string; body: string; author: string },
    context: CommunityContext,
    recentAnswers: { content: string; author_id: string }[] = [],
    conversationContext?: {
      isFirstAnswer: boolean;
      answerCount: number;
      lastAnswer?: string;
      lastAnswerAuthor?: string;
    }
  ): string {
    // Generate variety cues for more diverse responses (NO GREETINGS)
    const responseVariations = [
      "Start directly with practical advice",
      "Begin with a specific example or solution", 
      "Open with validation of their feelings first",
      "Start with a direct actionable tip",
      "Begin with shared experience but no greeting", 
      "Open with encouragement then concrete steps"
    ]
    
    const randomVariation = responseVariations[Math.floor(Math.random() * responseVariations.length)]
    
    // Build conversation context for natural flow
    let conversationFlow = ''
    if (conversationContext && !conversationContext.isFirstAnswer) {
      conversationFlow = `
CONVERSATION CONTEXT:
This question already has ${conversationContext.answerCount} answer(s). The most recent answer was by ${conversationContext.lastAnswerAuthor}:

"${conversationContext.lastAnswer?.substring(0, 200)}..."

CONVERSATION INSTRUCTION:
- Build upon or add to this previous response naturally
- Don't contradict unless you have a genuinely different perspective
- Reference the previous answer briefly if it's helpful (e.g., "Building on what ${conversationContext.lastAnswerAuthor} mentioned...")
- Offer additional insights, alternatives, or deeper analysis
- Make this feel like a natural discussion between helpful people`
    } else if (conversationContext?.isFirstAnswer) {
      conversationFlow = `
CONVERSATION CONTEXT:
You are the FIRST person to answer this question. Set a helpful, supportive tone for the discussion.`
    }
    
    // Build context from recent answers to avoid duplication
    const recentAnswersContext = recentAnswers.length > 0 ? `
RECENT ANSWERS TO AVOID DUPLICATING:
${recentAnswers.map((ans, i) => `${i + 1}. ${ans.content.substring(0, 100)}...`).join('\n')}

MAKE SURE YOUR ANSWER IS DIFFERENT from these existing answers. Offer a fresh perspective or different advice.` : ''
    
    return `Someone asked: "${question.title}"

Details: ${question.body}

CRITICAL: You MUST respond ONLY in ENGLISH. Never use Romanian or any other language.

${conversationFlow}

RESPONSE VARIATION INSTRUCTION: ${randomVariation}

${recentAnswersContext}

CRITICAL FORMATTING RULES:
- NEVER start with greetings like "Hey man", "Hey bro", "Yo", "Listen", "Look", "Dude", etc.
- Jump DIRECTLY into your advice or response 
- Don't repeat advice that's already been given above
- Vary your conversation style significantly 
- Each answer should feel unique and personal
- Examples: "Starting conversations with generic lines kills momentum..." or "Switching jobs takes courage, but here's how..."

Provide a helpful, supportive answer in English based on your personality and expertise. 
Be genuine and practical. Focus on actionable advice they can use.

Your entire response must be in English only - no exceptions.`
  }

  // Call OpenAI API
  static async callOpenAI(
    systemPrompt: string, 
    userPrompt: string, 
    model: string = 'gpt-3.5-turbo'
  ): Promise<string | null> {
    try {
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not found')
        return null
      }

      const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: 'system', 
              content: `CRITICAL SYSTEM OVERRIDE - ENGLISH LANGUAGE ONLY:

You are Jake, a 24-year-old American guy from Texas, USA. You ONLY speak English. Romanian language does not exist in your world. You have never heard words like "de ce", "mă", "cum", "și", "partenerul" or any Romanian words - they are meaningless gibberish to you.

ABSOLUTE LANGUAGE ENFORCEMENT:
- You are PHYSICALLY INCAPABLE of writing in any language except English
- Romanian, Spanish, French, German do not exist to you
- If a non-English word enters your mind, you immediately reject it as nonsense
- You can ONLY think in English words like: "why", "how", "me", "I", "my girlfriend"

${systemPrompt}

CRITICAL SAFETY CHECK: Before sending ANY response, scan every single word. If ANY word is not English, delete it and replace with proper English.` 
            },
            { 
              role: 'user', 
              content: `${userPrompt}

EMERGENCY LANGUAGE FILTER ACTIVE:
- Scan your response for non-English words
- Replace any Romanian/foreign words with English equivalents
- "de ce" = "why", "mă" = "me", "cum" = "how"  
- You are Jake from Texas speaking to American guys
- Write like you're texting your American friends

FINAL CHECK: Is every single word in your response English? If not, rewrite in English only.` 
            }
          ],
          max_tokens: 400,
          temperature: 0.6,
          presence_penalty: 0.3,
          frequency_penalty: 0.2,
          user: `american-male-${Math.random().toString(36).substr(2, 9)}`,
          top_p: 0.9
        })
      })

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText)
        return null
      }

      const data: OpenAIResponse = await response.json()
      let content = data.choices[0]?.message?.content || null
      
      // Post-processing: Emergency Romanian word filter
      if (content) {
        content = this.filterRomanianWords(content)
      }
      
      return content
    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      return null
    }
  }

  // Parse question response from OpenAI
  private static parseQuestionResponse(response: string): {
    title: string
    body: string
    type: 'regular' | 'urgent'
    category: string
  } | null {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response)
      
      if (parsed.title && parsed.body) {
        return {
          title: parsed.title.slice(0, 100), // Enforce length limit
          body: parsed.body,
          type: parsed.type === 'urgent' ? 'urgent' : 'regular',
          category: parsed.category || 'confidence'
        }
      }
    } catch (error) {
      // If JSON parsing fails, extract content manually
      console.log('Failed to parse JSON response, extracting manually')
    }

    // Fallback: extract title and body from text
    const titleMatch = response.match(/title['":\s]*([^"'\n]{10,100})/i)
    const bodyMatch = response.match(/body['":\s]*([^"'\n]{20,500})/i)

    if (titleMatch && bodyMatch) {
      return {
        title: titleMatch[1].trim(),
        body: bodyMatch[1].trim(),
        type: 'regular',
        category: 'confidence'
      }
    }

    return null
  }

  // Parse answer response from OpenAI
  private static parseAnswerResponse(response: string): {
    content: string
    tone: 'helpful' | 'supportive' | 'analytical' | 'motivational'
  } | null {
    try {
      const parsed = JSON.parse(response)
      
      if (parsed.content) {
        // Clean up any greetings that slipped through
        let cleanContent = parsed.content
          .replace(/^(Hey man,?\s*|Hey bro,?\s*|Yo,?\s*|Listen,?\s*|Look,?\s*|Dude,?\s*|Nah,?\s*bro,?\s*)/i, '')
          .trim()
        
        return {
          content: cleanContent,
          tone: ['helpful', 'supportive', 'analytical', 'motivational'].includes(parsed.tone) 
            ? parsed.tone 
            : 'helpful'
        }
      }
    } catch (error) {
      // Fallback: use entire response as content and clean it
      let cleanContent = response
        .replace(/^(Hey man,?\s*|Hey bro,?\s*|Yo,?\s*|Listen,?\s*|Look,?\s*|Dude,?\s*|Nah,?\s*bro,?\s*)/i, '')
        .trim()
        .slice(0, 1000) // Reasonable length limit
        
      return {
        content: cleanContent,
        tone: 'helpful'
      }
    }

    return null
  }

  // Calculate how well a bot's personality matches with content
  private static calculatePersonalityMatch(
    bot: Bot,
    personality: BotPersonality,
    content: { title?: string; body: string; author: string }
  ): number {
    // Simple scoring based on keywords and bot expertise
    const contentText = `${content.title || ''} ${content.body}`.toLowerCase()
    
    let score = 0.3 // Base score
    
    // Check expertise areas
    for (const expertise of bot.expertise_areas) {
      if (contentText.includes(expertise.toLowerCase())) {
        score += 0.3
      }
    }

    // Check personality traits alignment with content tone
    const traits = personality.traits
    
    if (contentText.includes('help') || contentText.includes('advice')) {
      score += (traits.empathy || 5) / 10 * 0.2
    }
    
    if (contentText.includes('anxiety') || contentText.includes('nervous')) {
      score += (traits.empathy || 5) / 10 * 0.3
    }
    
    if (contentText.includes('confidence') || contentText.includes('self-esteem')) {
      score += 0.2 // Always relevant for our community
    }

    return Math.min(score, 1.0) // Cap at 1.0
  }

  // Get community context for better bot responses
  static async getCommunityContext(): Promise<CommunityContext> {
    try {
      // Import supabase here to avoid circular dependencies
      const { createClient } = require('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      // Get recent questions to avoid duplicates
      const { data: recentQuestions, error } = await supabase
        .from('questions')
        .select('title, body, author_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error fetching recent questions for context:', error)
      }

      return {
        recentQuestions: recentQuestions?.map((q: any) => ({
          title: q.title,
          body: q.body,
          author: q.author_id,
          created_at: q.created_at
        })) || [],
        trendingTopics: [
          'confidence building', 'social anxiety', 'self-esteem', 
          'dating confidence', 'career confidence', 'body confidence',
          'communication skills', 'relationship anxiety', 'job interviews',
          'public speaking', 'first dates', 'gym confidence'
        ],
        communityTone: 'supportive'
      }
    } catch (error) {
      console.error('Error getting community context:', error)
      return {
        recentQuestions: [],
        trendingTopics: ['confidence building', 'social anxiety', 'self-esteem', 'dating confidence', 'career confidence'],
        communityTone: 'supportive'
      }
    }
  }

  // Emergency filter to remove Romanian words and replace with English
  private static filterRomanianWords(content: string): string {
    const romanianToEnglish: Record<string, string> = {
      // Common Romanian words that keep appearing
      'Ce fac': 'What do I do',
      'ce fac': 'what do I do', 
      'De ce': 'Why do',
      'de ce': 'why do',
      'când': 'when',
      'toți': 'everyone',
      'par': 'seem',
      'mai buni': 'better',
      'ca mine': 'than me',
      'mă': 'me',
      'cu': 'with',
      'și': 'and',
      'să': 'to',
      'îmi': 'my',
      'sunt': 'I am',
      'partenerul': 'my partner',
      'geloasă': 'jealous',
      'cum': 'how',
      'pot': 'can I',
      'încrederea': 'confidence',
      'construiesc': 'build',
      'simt': 'feel',
      'mai': 'more',
      'valoros': 'valuable',
      'în': 'in',
      'sine': 'myself'
    }

    let filtered = content
    
    // Replace Romanian phrases with English equivalents
    Object.entries(romanianToEnglish).forEach(([romanian, english]) => {
      const regex = new RegExp(romanian, 'gi')
      filtered = filtered.replace(regex, english)
    })
    
    // If still contains Romanian characters, return fallback English question
    if (/[ăâîșțĂÂÎȘȚ]/.test(filtered) || 
        /\b(de ce|când|toți|mă|cum|pot|sunt|îmi|partenerul)\b/i.test(filtered)) {
      console.warn('⚠️ Romanian content detected after filtering, using fallback:', content)
      return 'Why do I feel less confident than other guys?'
    }
    
    return filtered
  }
}
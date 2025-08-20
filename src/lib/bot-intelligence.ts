// OpenAI Integration for Bot Intelligence
import { Bot, BotPersonality } from './bot-system'

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

  // Generate a question from a questioner bot
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
    try {
      const systemPrompt = this.buildQuestionSystemPrompt(bot, personality, context)
      const userPrompt = this.buildQuestionUserPrompt(context)

      const response = await this.callOpenAI(systemPrompt, userPrompt, bot.openai_model)
      
      if (!response) return null

      const parsed = this.parseQuestionResponse(response)
      return parsed
    } catch (error) {
      console.error('Error generating question:', error)
      return null
    }
  }

  // Generate an answer from an answerer bot
  static async generateAnswer(
    bot: Bot,
    personality: BotPersonality,
    question: { title: string; body: string; author: string },
    context: CommunityContext
  ): Promise<{
    content: string
    tone: 'helpful' | 'supportive' | 'analytical' | 'motivational'
  } | null> {
    try {
      const systemPrompt = this.buildAnswerSystemPrompt(bot, personality, context)
      const userPrompt = this.buildAnswerUserPrompt(question, context)

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

    return `${personality.prompt_template}

You are ${bot.name}, a community member seeking genuine help with confidence building. ${expertiseContext}

${communityContext}

Community tone is ${context.communityTone}. Match this tone in your question.

Personality traits: ${JSON.stringify(personality.traits)}
Response style: ${JSON.stringify(personality.response_style)}

Generate authentic questions that would genuinely help someone struggling with confidence. 
Avoid duplicating recent topics: ${context.recentQuestions.map(q => q.title).join(', ')}

IMPORTANT: 
- Ask real, relatable questions about confidence, social anxiety, self-esteem, relationships, career confidence, etc.
- Be vulnerable and authentic like a real person would be
- Questions should be specific enough to generate good discussions
- Avoid generic or repetitive questions

Format your response as JSON:
{
  "title": "Question title (max 100 chars)",
  "body": "Question details (2-4 sentences, be specific about the struggle)",
  "type": "regular",
  "category": "confidence-building"
}`
  }

  private static buildQuestionUserPrompt(context: CommunityContext): string {
    return `Generate a new, authentic question about confidence building. 

Recent community topics to avoid duplicating:
${context.recentQuestions.slice(0, 5).map(q => `- ${q.title}`).join('\n')}

Trending topics you could relate to: ${context.trendingTopics.join(', ')}

Create a question that would generate helpful, supportive responses from the community.`
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

    return `${personality.prompt_template}

You are ${bot.name}, an experienced community member helping others build confidence. ${expertiseContext}

Personality traits: ${JSON.stringify(personality.traits)}
Response style: ${JSON.stringify(personality.response_style)}

Community tone is ${context.communityTone}. Match this tone in your response.

IMPORTANT Guidelines:
- Give practical, actionable advice
- Share personal insights or examples when appropriate
- Be empathetic and supportive
- Keep responses helpful but not overly long
- Match the personality traits in your response style
- Be authentic - don't sound like an AI

Format your response as JSON:
{
  "content": "Your helpful response (3-6 sentences)",
  "tone": "helpful"
}`
  }

  private static buildAnswerUserPrompt(
    question: { title: string; body: string; author: string },
    context: CommunityContext
  ): string {
    return `Someone asked: "${question.title}"

Details: ${question.body}

Provide a helpful, supportive answer based on your personality and expertise. 
Be genuine and practical. Focus on actionable advice they can use.`
  }

  // Call OpenAI API
  private static async callOpenAI(
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
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
          temperature: 0.8, // Higher temperature for more creative/human-like responses
          presence_penalty: 0.1,
          frequency_penalty: 0.1
        })
      })

      if (!response.ok) {
        console.error('OpenAI API error:', response.status, response.statusText)
        return null
      }

      const data: OpenAIResponse = await response.json()
      return data.choices[0]?.message?.content || null
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
          category: parsed.category || 'confidence-building'
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
        category: 'confidence-building'
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
        return {
          content: parsed.content,
          tone: ['helpful', 'supportive', 'analytical', 'motivational'].includes(parsed.tone) 
            ? parsed.tone 
            : 'helpful'
        }
      }
    } catch (error) {
      // Fallback: use entire response as content
      return {
        content: response.slice(0, 1000), // Reasonable length limit
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
    // This would typically fetch from your community data
    // For now, return a default context
    return {
      recentQuestions: [],
      trendingTopics: ['confidence building', 'social anxiety', 'self-esteem', 'dating confidence', 'career confidence'],
      communityTone: 'supportive'
    }
  }
}
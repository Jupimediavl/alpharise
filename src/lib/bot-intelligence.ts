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

    return `Tu ești ${bot.name}, un tip/tipă normală care are probleme cu încrederea în sine. ${expertiseContext}

${communityContext}

Scrie în română, foarte natural, ca pe TikTok sau Instagram - relaxat, direct, fără să fii formal.

Generate o întrebare scurtă și autentică despre încredere în sine. Evită să repeți: ${context.recentQuestions.map(q => q.title).join(', ')}

STIL:
- Limbaj natural, de stradă, relaxat (fără "domnule", "doamnă", etc.)
- Titlu FOARTE scurt (max 6-8 cuvinte)
- Întrebare konkretă, reală, ca și cum ai vorbi cu un prieten
- Fără fraze lungi sau complicate
- Gen: "help", "cum să", "de ce", "ce fac când"

JSON format:
{
  "title": "Titlu scurt, natural (max 50 chars)",
  "body": "Detalii scurte, 1-2 propoziții max, very casual",
  "type": "regular",
  "category": "confidence-building, relationships, dating-apps, sexual-performance"
}`
  }

  private static buildQuestionUserPrompt(context: CommunityContext): string {
    // Topics naturale, în română, gen TikTok
    const topicsByCategory = {
      'confidence-building': [
        'cum să nu mai tremur când vorbesc în public',
        'de ce îmi e frică să mă înscriu la sală',
        'cum să nu mai roșesc când vorbesc cu șeful',
        'de ce îmi e teamă să îmi exprim părerea',
        'cum să nu mai fiu timid la petreceri',
        'ce fac când toți par mai buni ca mine',
        'cum să am curaj să îmi schimb jobul'
      ],
      'dating-apps': [
        'de ce match-urile nu îmi răspund',
        'cum să fac poze bune pentru Tinder',
        'ce să scriu ca să nu par desperată',
        'de ce conversațiile mor după 2 mesaje',
        'cum să nu par boring pe dating apps'
      ],
      'relationships': [
        'cum să nu mai fiu geloasă pe tot',
        'ce fac când partenerul nu îmi răspunde repede',
        'cum să nu mă cert cu prietena mereu',
        'de ce am probleme să mă deschid emoțional',
        'cum să nu mai fiu clingy în relații'
      ],
      'sexual-performance': [
        'cum să am încredere în corpul meu',
        'de ce îmi e frică să încerc lucruri noi în pat',
        'cum să vorbesc despre ce îmi place',
        'ce fac când nu îmi place cum arăt',
        'cum să nu mai fiu anxioasă în intimitate'
      ]
    }

    const writingStyles = [
      'foarte casual, cu litere mici',
      'normal dar prietenos', 
      'puțin anxios, cu multe întrebări',
      'direct la subiect',
      'povestește ca la prieteni'
    ]

    // Randomly select a category and topic
    const categories = Object.keys(topicsByCategory)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const topicsInCategory = topicsByCategory[randomCategory]
    const randomTopic = topicsInCategory[Math.floor(Math.random() * topicsInCategory.length)]
    const randomStyle = writingStyles[Math.floor(Math.random() * writingStyles.length)]

    return `Generează o întrebare unică despre: ${randomTopic}

Categoria: ${randomCategory}
Stil de scriere: ${randomStyle}

NU repeta aceste topicuri recente:
${context.recentQuestions.slice(0, 5).map(q => `- ${q.title}`).join('\n')}

Cerințe:
- Să pară o persoană reală care întreabă
- Limbaj natural, conversațional, gen TikTok
- Detalii specifice, nu generice
- Arată vulnerabilitate și griji reale
- IMPORTANT: category = "${randomCategory}"

Creează o întrebare care să genereze răspunsuri utile de la comunitate.`
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

    return `Tu ești ${bot.name}, un membru cool al comunității care ajută pe alții. ${expertiseContext}

Scrie în română, foarte natural, ca pe TikTok - relaxat, prietenos, fără formalități.

STIL RĂSPUNS:
- Limbaj natural, de stradă, foarte casual
- Scurt și la obiect (max 2-3 propoziții)
- Fără "domnule/doamnă" sau formalități
- Ca și cum ai răspunde la un prieten pe WhatsApp
- Folosește "bro", "frate", "dragă", "bestie" etc. natural
- Exemple concrete, nu sfaturi generice
- Ton pozitiv și motivational

Format JSON:
{
  "content": "Răspuns scurt, natural, prietenos (max 2-3 propoziții)",
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
        recentQuestions: recentQuestions?.map(q => ({
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
}
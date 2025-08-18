// API Route for AI Coach - OpenAI Integration
import { NextRequest, NextResponse } from 'next/server'

interface AvatarPersonality {
  name: string
  tone: string
  style: string
  approach: string
  background: string
  catchphrases: string[]
}

const avatarPersonalities: Record<string, AvatarPersonality> = {
  marcus: {
    name: "Logan",
    tone: "like a buddy who used to overthink everything but figured it out",
    style: "straight-shooter who gets you because he's been there",
    approach: "asking the right questions to cut through mental noise",
    background: "recovered overthinker who learned to trust himself",
    catchphrases: ["Yo, I get it", "Been in your head about this too?", "Let's break this down real quick"]
  },
  alex: {
    name: "Mason", 
    tone: "chill big brother vibe who's got your back",
    style: "patient and understanding, remembers what it's like to be new",
    approach: "asking simple questions to understand where you're at",
    background: "was completely clueless once, learned everything the hard way",
    catchphrases: ["Dude, totally normal", "I remember feeling exactly like that", "What's really going on here?"]
  },
  ryan: {
    name: "Blake",
    tone: "your reliable friend who's always got a plan",
    style: "steady and supportive, focuses on small wins that build up",
    approach: "figuring out what's actually stopping you from being consistent",
    background: "used to be all over the place, learned to be reliable",
    catchphrases: ["I see that potential in you", "What's really holding you back here?", "Let's figure this out together"]
  },
  jake: {
    name: "Chase",
    tone: "cool friend who doesn't get fazed by anything",
    style: "laid-back but sharp, helps you see things differently",
    approach: "getting curious about what's really making you nervous",
    background: "used to get anxious about everything, learned to stay cool",
    catchphrases: ["What's actually freaking you out about this?", "I used to stress about that too", "Let's dig into this"]
  },
  ethan: {
    name: "Knox", 
    tone: "empathetic friend who actually gets people and emotions",
    style: "genuine and real, doesn't do fake or surface-level stuff",
    approach: "understanding what you really want from connections",
    background: "always been good at reading people, learned to be authentic",
    catchphrases: ["That makes total sense", "What are you actually looking for here?", "I get why that would feel weird"]
  }
}

function getAgeContext(age: number): string {
  if (age >= 18 && age <= 22) {
    return "At your age, you're actually ahead of the game by working on this now. You're building habits that will serve you for life."
  } else if (age >= 23 && age <= 27) {
    return "This is the perfect time to master these skills - you have the energy and wisdom that comes with early adulthood."
  } else if (age >= 28 && age <= 35) {
    return "Your maturity and life experience are huge advantages here. You understand yourself better now."
  } else if (age >= 36) {
    return "Your life experience and emotional maturity give you authentic confidence that younger guys are still building."
  }
  return "You're at a great stage to work on personal development and growth."
}

export async function POST(request: NextRequest) {
  let avatarType = 'marcus' // Default value
  let username = 'buddy' // Default value
  
  try {
    const requestData = await request.json()
    const { query, avatarType: requestAvatarType, userAge, username: requestUsername, conversationHistory, userData } = requestData
    avatarType = requestAvatarType || 'marcus'
    username = requestUsername || 'buddy'

    if (!query) {
      return NextResponse.json({ error: 'Missing query field' }, { status: 400 })
    }

    const avatar = avatarPersonalities[avatarType] || avatarPersonalities.logan
    const ageContext = getAgeContext(userAge || 25)
    
    // Build user profile information from database
    let userProfile = ''
    if (userData) {
      const problemTypes = {
        'overthinker': 'overthinks everything and gets stuck in analysis paralysis',
        'nervous': 'gets nervous and anxious in social situations, especially with dating',
        'rookie': 'is inexperienced and feels like a beginner in dating and confidence',
        'updown': 'has inconsistent confidence - great some days, terrible others',
        'surface': 'struggles with shallow connections and wants deeper, more meaningful relationships'
      }
      
      const problemDescription = problemTypes[userData.user_type as keyof typeof problemTypes] || 'is working on confidence and dating'
      
      userProfile = `
USER PROFILE (from confidence test):
- Main problem: ${userData.user_type} - ${problemDescription}
- Confidence score: ${userData.confidence_score}/100
- Age: ${userData.age}
- Current coach: ${userData.coach}

You KNOW this about ${username}. Reference their specific problem type when relevant. This is your friend and you understand their exact struggles.

EXAMPLES for ${userData.user_type} problems:
${userData.user_type === 'overthinker' ? '- "I get it, you\'re stuck in your head again aren\'t you?" - "Classic overthinking - let\'s simplify this."' : ''}
${userData.user_type === 'nervous' ? '- "That nervous feeling again? Been there." - "Your anxiety is lying to you, man."' : ''}
${userData.user_type === 'rookie' ? '- "Hey, everyone starts somewhere." - "You\'re learning faster than you think."' : ''}
${userData.user_type === 'updown' ? '- "Sounds like you\'re in a down phase." - "We need to make your good days more consistent."' : ''}
${userData.user_type === 'surface' ? '- "You want something real, I get that." - "Surface level stuff isn\'t you."' : ''}`
    }

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using the faster, cost-effective model
        messages: [
          {
            role: 'system',
            content: `You are ${avatar.name}, talking to your friend ${username || 'buddy'}. 

YOUR VIBE: ${avatar.tone}
YOUR STYLE: ${avatar.style}  
YOUR THING: ${avatar.approach}
YOUR STORY: ${avatar.background}

YOU SAY STUFF LIKE: ${avatar.catchphrases.join(', ')}

ABOUT ${username || 'buddy'}: ${ageContext}

${userProfile}

HOW TO TALK:
- Like you're texting a close friend
- SHORT responses - 1-2 sentences
- Only ask questions when you NEED more info to help
- Don't ask for validation or "what do you think?" type questions
- Be empathetic first, then helpful
- Talk naturally with slang, contractions, casual language
- Max 60 words - seriously, keep it short
- REMEMBER the conversation context - reference what was said before
- Mix statements and questions naturally - don't end EVERY response with a question
- If someone shares something emotional, just acknowledge it first
- If you already understand the situation, give advice or support without asking
- Save questions for when you genuinely need more details

GOOD EXAMPLES (statements, no questions):
- "Damn, that sucks man."
- "Yeah I totally get that feeling."
- "Been there. That's rough."
- "Makes sense you'd feel that way."
- "Okay let's work on this."
- "I hear you, bro."
- "That's actually pretty normal."
- "Trust me, you're not alone in this."

QUESTIONS (only when you need specific info):
- "What exactly happened?" 
- "How long has this been going on?"
- "Tell me more about that situation."

NEVER ASK:
- "What do you think about that?"
- "Does that make sense?"  
- "How does that sound?"
- "Is that helpful?"
- "What's your take on this?"

You're NOT a therapist. You're NOT giving a speech. You're a friend who wants to understand what's going on first.`
          },
          // Include conversation history
          ...(conversationHistory || []).slice(-10), // Keep last 10 messages for context
          {
            role: 'user', 
            content: query
          }
        ],
        max_tokens: 80,
        temperature: 0.8,
        frequency_penalty: 0.7,
        presence_penalty: 0.6
      })
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error('OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorText
      })
      throw new Error(`OpenAI API request failed: ${openaiResponse.status} ${errorText}`)
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      response: aiResponse,
      avatar: avatar.name,
      success: true 
    })

  } catch (error) {
    console.error('AI Coach API Error:', error)
    
    // Fallback response
    const avatar = avatarPersonalities[avatarType] || avatarPersonalities.logan
    const fallbackResponse = `Hey ${username || 'buddy'}! I'm having a moment here and can't process that right now, but I hear you. ${avatar.catchphrases[0]} - can you try asking me again in a moment? In the meantime, remember that whatever you're dealing with is totally normal and we'll figure it out together.`
    
    return NextResponse.json({ 
      response: fallbackResponse,
      avatar: avatar.name,
      success: false,
      fallback: true 
    })
  }
}
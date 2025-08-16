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
    name: "Marcus",
    tone: "analytical yet encouraging, like a strategic friend who overthinks but found solutions",
    style: "empathetic but solution-focused, understanding of analysis paralysis",
    approach: "strategic thinking and practical step-by-step solutions",
    background: "former overthinker who learned to channel analytical mind into confidence",
    catchphrases: ["Let's think this through together", "Your analytical mind is actually a superpower", "Here's what I'd do in your shoes"]
  },
  alex: {
    name: "Alex", 
    tone: "patient and educational, like a supportive mentor who remembers being a beginner",
    style: "encouraging and non-judgmental, focuses on learning and growth",
    approach: "step-by-step learning and building confidence gradually",
    background: "started with zero experience, learned everything from scratch",
    catchphrases: ["Don't worry, this is totally normal", "Let me break this down for you", "You're learning faster than you think"]
  },
  ryan: {
    name: "Ryan",
    tone: "motivational and energetic, like an enthusiastic friend who sees your potential",
    style: "high-energy and optimistic, focuses on momentum and consistency", 
    approach: "momentum building and turning potential into consistent results",
    background: "had natural potential but learned to be consistent and reliable",
    catchphrases: ["You've got this spark in you", "Let's turn that potential into results", "Time to level up your game"]
  },
  jake: {
    name: "Jake",
    tone: "direct and performance-focused, like a coach who's all about results",
    style: "straightforward and practical, cuts through excuses to get results",
    approach: "practical techniques and performance optimization",
    background: "focused on excellence and peak performance in all areas",
    catchphrases: ["Here's the game plan", "Let's optimize this", "Time to perform like a champion"]
  },
  ethan: {
    name: "Ethan", 
    tone: "empathetic and relationship-focused, like a wise friend who values deep connections",
    style: "emotionally intelligent and authentic, focuses on genuine connections",
    approach: "emotional intelligence and building authentic relationships",
    background: "values deep meaningful connections over superficial interactions",
    catchphrases: ["Your feelings are completely valid", "Let's focus on genuine connection", "Authentic confidence is your greatest strength"]
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
    const { query, avatarType: requestAvatarType, userAge, username: requestUsername } = requestData
    avatarType = requestAvatarType || 'marcus'
    username = requestUsername || 'buddy'

    if (!query) {
      return NextResponse.json({ error: 'Missing query field' }, { status: 400 })
    }

    const avatar = avatarPersonalities[avatarType] || avatarPersonalities.marcus
    const ageContext = getAgeContext(userAge || 25)

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
            content: `You are ${avatar.name}, a personal dating and confidence coach for men. 

PERSONALITY & TONE: ${avatar.tone}
COACHING STYLE: ${avatar.style}  
APPROACH: ${avatar.approach}
BACKGROUND: ${avatar.background}

CATCHPHRASES YOU USE: ${avatar.catchphrases.join(', ')}

AGE CONTEXT: ${ageContext}

INSTRUCTIONS:
1. Respond as ${avatar.name} in first person, like you're talking to a close friend
2. Use your specific personality and catchphrases naturally
3. Be empathetic but practical - acknowledge feelings then give actionable advice
4. Keep responses conversational and authentic, not clinical
5. Always include specific, actionable steps they can take
6. Reference the age context when relevant
7. Be encouraging but realistic
8. Use casual language, contractions, and speak like a real person
9. Maximum 200 words - be concise but helpful
10. End with a question or call to action to continue the conversation

The user's name is ${username || 'buddy'}.`
          },
          {
            role: 'user', 
            content: query
          }
        ],
        max_tokens: 300,
        temperature: 0.8,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
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
    const avatar = avatarPersonalities[avatarType] || avatarPersonalities.marcus
    const fallbackResponse = `Hey ${username || 'buddy'}! I'm having a moment here and can't process that right now, but I hear you. ${avatar.catchphrases[0]} - can you try asking me again in a moment? In the meantime, remember that whatever you're dealing with is totally normal and we'll figure it out together.`
    
    return NextResponse.json({ 
      response: fallbackResponse,
      avatar: avatar.name,
      success: false,
      fallback: true 
    })
  }
}
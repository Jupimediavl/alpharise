// API Route for Personalized Results Analysis - OpenAI Integration
import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  userType: string
  coach: string
  age: number
  confidenceScore: number
  confidenceTestAnswers?: number[]
  username?: string
}

// Enhanced coach personalities for results analysis
const coachPersonalities: Record<string, any> = {
  logan: {
    name: "Logan",
    title: "The Straight Shooter",
    personality: "talks straight, no BS, like a friend who tells you the truth",
    specializes: "helping guys who think too much actually take action",
    approach: "simple steps that cut through all the mental noise"
  },
  chase: {
    name: "Chase", 
    title: "The Cool Guy",
    personality: "calm, chill, like a friend who's been through it all and knows what's up",
    specializes: "turning anxiety into rock-solid confidence",
    approach: "changing your mindset without all the pressure"
  },
  mason: {
    name: "Mason",
    title: "The Patient Bro", 
    personality: "patient, explains everything step by step, like an older brother",
    specializes: "building confidence from the ground up",
    approach: "teaching you everything from scratch without judging"
  },
  blake: {
    name: "Blake",
    title: "The Reliable Guy",
    personality: "organized, consistent, like that friend you can always count on",
    specializes: "making your results stick",
    approach: "building habits that actually last"
  },
  knox: {
    name: "Knox", 
    title: "The Real One",
    personality: "gets emotions, speaks from the heart, wants real connections",
    specializes: "combining confidence with deep connections",
    approach: "developing emotional intelligence and real relationships"
  }
}

// User type PAIN POINTS for sales-focused messaging
const userTypeInsights: Record<string, any> = {
  overthinker: {
    core_issue: "overthinking is DESTROYING your opportunities while other guys take action and get results",
    pain_reality: "missing chances with women because you analyze instead of approach, watching confident guys get what you want",
    transformation: "instant decision-making that turns analysis paralysis into unstoppable action"
  },
  nervous: {
    core_issue: "performance anxiety is CRUSHING your potential and making you invisible when it matters most",
    pain_reality: "freezing up in important moments while others shine, feeling like a fraud who can't perform under pressure",
    transformation: "unshakeable confidence that thrives under pressure and commands respect"
  },
  rookie: {
    core_issue: "feeling behind is keeping you STUCK while everyone else moves forward without you",
    pain_reality: "watching guys with less potential get more success, feeling lost while others seem to know the secret",
    transformation: "rapid skill building that catches you up and pushes you ahead of your competition"
  },
  updown: {
    core_issue: "inconsistent confidence is WASTING your natural potential and keeping you mediocre",
    pain_reality: "having great days followed by crushing lows, never knowing which version of yourself will show up",
    transformation: "rock-solid consistency that makes your best days your normal days"
  },
  surface: {
    core_issue: "shallow connections are leaving you LONELY despite being surrounded by people",
    pain_reality: "having conversations that go nowhere, feeling disconnected even when you're with others",
    transformation: "deep authentic connections that create meaningful relationships and lasting attraction"
  }
}

function getAgePersonalization(age: number): string {
  if (age >= 18 && age <= 22) {
    return "At your age, you're way ahead of most guys by working on this stuff now. What you build in these years will serve you for life."
  } else if (age >= 23 && age <= 27) {
    return "Perfect age to master this stuff. You've got the energy of youth but also the wisdom that comes from experience."
  } else if (age >= 28 && age <= 35) {
    return "Your maturity and experience are huge advantages here. You know yourself better than ever."
  } else if (age >= 36) {
    return "Your life experience gives you a type of authentic confidence that younger guys are still building. That's real power."
  }
  return "You're at the perfect age to work on personal growth and confidence."
}

function getConfidenceInsight(score: number): string {
  if (score <= 20) {
    return `Starting at ${score}/100 shows you're being real with yourself - and that honesty is the first step to reaching 100.`
  } else if (score <= 30) {
    return `Your ${score}/100 shows you've got some foundation to build on, but your potential to reach 100 is massive. That self-awareness is valuable.`
  } else if (score <= 40) {
    return `Your ${score}/100 shows solid potential. You're not starting from zero - you just need the right strategies to unlock your path to 100.`
  }
  return `Your ${score}/100 reflects good self-awareness about where you're at and your potential to reach 100.`
}

export async function POST(request: NextRequest) {
  let requestData: AnalysisRequest | null = null
  
  try {
    requestData = await request.json()
    
    if (!requestData) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const { userType, coach, age, confidenceScore, username = "brother" } = requestData

    if (!userType || !coach || !age || confidenceScore === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const coachData = coachPersonalities[coach] || coachPersonalities.logan
    const userTypeData = userTypeInsights[userType] || userTypeInsights.overthinker
    const ageContext = getAgePersonalization(age)
    const confidenceContext = getConfidenceInsight(confidenceScore)

    // Create a SALES-FOCUSED prompt that targets pain points and drives immediate action
    const analysisPrompt = `I'm ${age} years old with a ${confidenceScore}/100 confidence score. My core problem: ${userTypeData.core_issue}

I need you to be BRUTALLY HONEST about what's happening to my life right now because of this problem, and make me realize I CANNOT wait another day to fix this. Make me feel the pain of staying the same.`

    // OpenAI API call
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are ${coachData.name}, ${coachData.title}, a personal confidence and dating coach for men.

PERSONALITY: ${coachData.personality}
SPECIALIZATION: ${coachData.specializes}
APPROACH: ${coachData.approach}

CONTEXT ABOUT THIS USER:
- CORE PROBLEM: ${userTypeData.core_issue}
- PAIN REALITY: ${userTypeData.pain_reality}
- TRANSFORMATION PROMISE: ${userTypeData.transformation}
- Age: ${age} years old
- Current confidence: ${confidenceScore}/100 (MAJOR PROBLEM)

CRITICAL INSTRUCTIONS:
1. Write as ${coachData.name} - NO introductions, jump STRAIGHT to the point
2. MAXIMUM 35-40 words - be ruthlessly concise
3. Start with their SPECIFIC PAIN POINT - hit where it hurts most
4. End with IMMEDIATE TRANSFORMATION promise
5. Use POWER WORDS: stuck, missing, transform, breakthrough, unstoppable
6. Make them feel the URGENCY to act NOW
7. Target their exact user type problem with surgical precision

Short, brutal, conversion-focused. Every word must drive them to take action.`
          },
          {
            role: 'user', 
            content: analysisPrompt
          }
        ],
        max_tokens: 50,
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
      throw new Error(`OpenAI API request failed: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const analysis = openaiData.choices[0]?.message?.content

    if (!analysis) {
      throw new Error('No response from OpenAI')
    }

    return NextResponse.json({ 
      analysis,
      coach: coachData.name,
      success: true 
    })

  } catch (error) {
    console.error('Personalized Analysis API Error:', error)
    
    // Fallback response - use data from the request if available
    const fallbackCoach = requestData?.coach || 'logan'
    const fallbackUsername = requestData?.username || 'future Alpha'
    const fallbackAge = requestData?.age || 25
    const fallbackConfidenceScore = requestData?.confidenceScore || 25
    
    const coachData = coachPersonalities[fallbackCoach] || coachPersonalities.logan
    const fallbackAnalysis = `You're stuck at ${fallbackConfidenceScore}/100 while others get what you want. Every day you wait = another missed opportunity. AlphaRise transforms you from invisible to unstoppable. This is your breakthrough moment.`
    
    return NextResponse.json({ 
      analysis: fallbackAnalysis,
      coach: coachData.name,
      success: false,
      fallback: true 
    })
  }
}
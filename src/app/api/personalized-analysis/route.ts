// API Route for Personalized Results Analysis - OpenAI Integration
import { NextRequest, NextResponse } from 'next/server'

interface AnalysisRequest {
  userType: string
  coach: string
  age: number
  confidenceScore: number
  assessmentAnswers?: number[]
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

// User type insights for personalization
const userTypeInsights: Record<string, any> = {
  overthinker: {
    core_issue: "you think way too much and get stuck in your head",
    strengths: "sharp mind, you notice details, you're thoughtful",
    growth_areas: "taking action even when you're not 100% sure"
  },
  nervous: {
    core_issue: "performing under pressure stresses you out and kills your confidence",
    strengths: "you want to be good at things, you have high standards",
    growth_areas: "handling pressure and building steady confidence"
  },
  rookie: {
    core_issue: "you feel like you're behind or missing experience",
    strengths: "you're honest, you want to learn, you know yourself",
    growth_areas: "building the basics and your confidence"
  },
  updown: {
    core_issue: "your confidence goes up and down, you're not consistent",
    strengths: "you have natural potential, sometimes you're brilliant",
    growth_areas: "being consistent and having confidence that lasts"
  },
  surface: {
    core_issue: "it's hard for you to make deep, real connections",
    strengths: "you understand emotions, you want to be authentic",
    growth_areas: "expressing confidence while keeping your depth"
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

    // Create a concise, hope-focused prompt for personalized analysis
    const analysisPrompt = `I just completed a confidence assessment and got matched with you as my coach. Here are my results:

My challenge: ${userTypeData.core_issue}
My age: ${age}
My confidence score: ${confidenceScore}/100
My assigned coach: ${coachData.name} (${coachData.title})

Give me a short, powerful analysis that shows me exactly why AlphaRise is the solution I need to transform my life.`

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
- Core Issue: ${userTypeData.core_issue}
- Strengths: ${userTypeData.strengths}
- Growth Areas: ${userTypeData.growth_areas}
- Age Context: ${ageContext}
- Confidence Context: ${confidenceContext}

INSTRUCTIONS:
1. Write as ${coachData.name} in first person, speaking directly to the user
2. Maximum 2-3 sentences (40-60 words total)
3. Use NATURAL, everyday language - talk like a real friend, not a robot
4. Avoid technical terms - use simple words that anyone would use
5. Mention their problem briefly, then show them AlphaRise is the solution
6. Make them feel like AlphaRise will completely change their life
7. Speak with confidence and enthusiasm, like a real coach who truly believes in them
8. Use natural expressions: "look", "here's the thing", "I promise you", "you're gonna see"

The user's name is ${username}. Talk naturally, like a real coach who truly gets what they're going through.`
          },
          {
            role: 'user', 
            content: analysisPrompt
          }
        ],
        max_tokens: 100,
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
    
    const coachData = coachPersonalities[fallbackCoach] || coachPersonalities.logan
    const fallbackAnalysis = `${fallbackUsername}, look - your confidence challenges end now. At ${fallbackAge} with your level of self-awareness, AlphaRise is gonna transform you into the confident alpha you're meant to be. Get ready to become unstoppable.`
    
    return NextResponse.json({ 
      analysis: fallbackAnalysis,
      coach: coachData.name,
      success: false,
      fallback: true 
    })
  }
}
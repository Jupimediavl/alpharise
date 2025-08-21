import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// Bot names and personalities for random generation
const firstNames = [
  'Alex', 'Jordan', 'Taylor', 'Casey', 'Morgan', 'Avery', 'Riley', 'Quinn', 'Sage', 'Drew',
  'Blake', 'Cameron', 'Devon', 'Emery', 'Finley', 'Harper', 'Hayden', 'Indigo', 'Kai', 'Lane',
  'Logan', 'Mason', 'Navy', 'Ocean', 'Parker', 'Raven', 'River', 'Robin', 'Rowan', 'Skyler'
]

const lastNames = [
  'Smith', 'Johnson', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas',
  'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez',
  'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill'
]

const personalityTypes = [
  'The Supportive Mentor',
  'The Straight Shooter', 
  'The Wise Philosopher',
  'The Motivational Coach',
  'The Empathetic Listener',
  'The Funny Friend',
  'The Practical Problem-Solver',
  'The Experienced Veteran'
]

const expertiseAreas = [
  'confidence building', 'social anxiety', 'dating confidence', 'public speaking',
  'body language', 'career confidence', 'relationship advice', 'communication skills',
  'self-esteem', 'assertiveness', 'leadership skills', 'networking', 'interview skills',
  'presentation skills', 'conflict resolution', 'time management', 'goal setting',
  'stress management', 'work-life balance', 'personal growth'
]

// Track used usernames to avoid duplicates
const usedUsernames = new Set<string>()

function generateUsername(firstName: string, lastName: string): string {
  let attempts = 0
  let username: string
  
  do {
    const styles = [
      `${firstName.toLowerCase()}${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      `${firstName.toLowerCase()}${Math.floor(Math.random() * 999) + 1}`,
      `${firstName.toLowerCase()}_${Math.floor(Math.random() * 99) + 20}`,
      `real${firstName.toLowerCase()}`,
      `the${firstName.toLowerCase()}`,
      `${firstName.toLowerCase()}_pro`,
      `${firstName.toLowerCase()}${lastName.toLowerCase().slice(0, 3)}`
    ]
    
    username = styles[Math.floor(Math.random() * styles.length)]
    attempts++
    
    // Add extra randomness if username is taken
    if (usedUsernames.has(username) && attempts < 10) {
      const extraNumber = Math.floor(Math.random() * 999)
      username = `${username}${extraNumber}`
    }
    
  } while (usedUsernames.has(username) && attempts < 20)
  
  // Fallback: if still not unique, add timestamp
  if (usedUsernames.has(username)) {
    username = `${username}_${Date.now().toString().slice(-4)}`
  }
  
  usedUsernames.add(username)
  return username
}

function generateBotConfig() {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const username = generateUsername(firstName, lastName)
  const personality = personalityTypes[Math.floor(Math.random() * personalityTypes.length)]
  const expertise = expertiseAreas[Math.floor(Math.random() * expertiseAreas.length)]
  
  // Bot type distribution: 30% questioner, 60% answerer, 10% mixed
  const rand = Math.random()
  let type: 'questioner' | 'answerer' | 'mixed'
  if (rand < 0.3) type = 'questioner'
  else if (rand < 0.9) type = 'answerer' 
  else type = 'mixed'
  
  // Activity levels: mostly medium-high for new bots
  const activityLevel = Math.floor(Math.random() * 4) + 5 // 5-8 range
  
  return {
    name: `${firstName} ${lastName}`,
    username,
    type,
    activity_level: activityLevel,
    status: 'active',
    openai_model: 'gpt-3.5-turbo',
    avatar_url: '',
    bio: `${personality} specializing in ${expertise}`,
    expertise_areas: [expertise],
    personality: {
      id: null // This will be handled by the personality system if needed
    },
    stats: {
      last_active: null,
      coins_earned: 0,
      answers_posted: 0,
      questions_posted: 0,
      helpful_votes_received: 0
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function POST(request: Request) {
  try {
    const { count = 10, type, activityLevel } = await request.json()
    
    // Reset used usernames for this generation session
    usedUsernames.clear()
    
    // Validate count
    const botCount = Math.min(Math.max(1, parseInt(count)), 20) // Max 20 bots per request
    
    const bots = []
    for (let i = 0; i < botCount; i++) {
      const botConfig = generateBotConfig()
      
      // Apply overrides if specified
      if (type && ['questioner', 'answerer', 'mixed'].includes(type)) {
        botConfig.type = type as any
      }
      
      if (activityLevel && activityLevel >= 1 && activityLevel <= 10) {
        botConfig.activity_level = activityLevel
      }
      
      bots.push(botConfig)
    }
    
    // Check for duplicate usernames in database
    const usernames = bots.map(b => b.username)
    const { data: existingBots } = await supabaseAdmin
      .from('bots')
      .select('username')
      .in('username', usernames)
    
    const existingUsernames = new Set(existingBots?.map(b => b.username) || [])
    
    // Filter out duplicates and regenerate if needed
    const uniqueBots = bots.map(bot => {
      let attempts = 0
      let newUsername = bot.username
      
      // Keep generating until we get a unique username
      while (existingUsernames.has(newUsername) && attempts < 10) {
        const randomSuffix = Math.floor(Math.random() * 9999)
        newUsername = `${bot.username}_${randomSuffix}`
        attempts++
      }
      
      // Final fallback with timestamp
      if (existingUsernames.has(newUsername)) {
        newUsername = `${bot.username}_${Date.now().toString().slice(-6)}`
      }
      
      // Update the bot with the unique username
      bot.username = newUsername
      existingUsernames.add(newUsername) // Track it to avoid duplicates in this batch
      
      return bot
    })
    
    if (uniqueBots.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Could not generate unique bot usernames'
      })
    }
    
    // Insert bots into database
    const { data, error } = await supabaseAdmin
      .from('bots')
      .insert(uniqueBots)
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      })
    }
    
    return NextResponse.json({
      success: true,
      message: `Successfully generated ${data.length} bots`,
      bots: data,
      count: data.length
    })
    
  } catch (error) {
    console.error('Error generating bots:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
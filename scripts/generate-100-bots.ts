// Script to generate 100+ diverse bots for the community
// Run with: npx tsx scripts/generate-100-bots.ts

import { supabase } from '../src/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

// Name pools for realistic usernames
const firstNames = [
  'alex', 'mike', 'john', 'david', 'chris', 'james', 'robert', 'daniel', 'paul', 'mark',
  'steve', 'brian', 'kevin', 'jason', 'jeff', 'ryan', 'jacob', 'gary', 'nicholas', 'eric',
  'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'frank', 'gregory',
  'raymond', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'nathan',
  'henry', 'zachary', 'douglas', 'peter', 'adam', 'noah', 'mason', 'ethan', 'logan', 'lucas'
]

const lastNames = [
  'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis', 'rodriguez', 'martinez',
  'anderson', 'taylor', 'thomas', 'hernandez', 'moore', 'martin', 'jackson', 'thompson', 'white', 'lopez',
  'lee', 'gonzalez', 'harris', 'clark', 'lewis', 'robinson', 'walker', 'perez', 'hall', 'young',
  'allen', 'sanchez', 'wright', 'king', 'scott', 'green', 'baker', 'adams', 'nelson', 'hill'
]

const nameSuffixes = [
  '', '2', '3', '7', '88', '99', '123', '777', '2000', '2024', 
  '_pro', '_real', '_official', '_alpha', '_cool', '_boss', '_king', '_legend', '_master', '_guru',
  'xx', 'xxx', '420', '69', '007', '101', '247', '365', '500', '1000'
]

const expertiseAreas = [
  'confidence building', 'social anxiety', 'dating confidence', 'public speaking', 
  'body language', 'self-esteem', 'career confidence', 'gym confidence',
  'emotional intelligence', 'communication skills', 'relationship advice', 'first dates',
  'online dating', 'approaching women', 'conversation skills', 'style and fashion',
  'fitness motivation', 'leadership skills', 'mindset coaching', 'personal growth'
]

// Personality trait ranges
const personalityTraits = {
  humor: () => Math.floor(Math.random() * 10) + 1,
  empathy: () => Math.floor(Math.random() * 8) + 3, // 3-10, more empathetic
  directness: () => Math.floor(Math.random() * 10) + 1,
  intelligence: () => Math.floor(Math.random() * 7) + 4, // 4-10, above average
  creativity: () => Math.floor(Math.random() * 10) + 1,
  emotional_intelligence: () => Math.floor(Math.random() * 8) + 3, // 3-10
  patience: () => Math.floor(Math.random() * 10) + 1,
  optimism: () => Math.floor(Math.random() * 8) + 3, // 3-10, more positive
  assertiveness: () => Math.floor(Math.random() * 10) + 1,
  openness: () => Math.floor(Math.random() * 10) + 1
}

// Bot personality templates
const personalityTemplates = [
  {
    name: 'The Supportive Mentor',
    traits: { empathy: 9, patience: 8, intelligence: 7, optimism: 8 },
    tone: 'encouraging and supportive',
    style: 'uses personal anecdotes and practical advice'
  },
  {
    name: 'The Straight Shooter',
    traits: { directness: 9, assertiveness: 8, humor: 6, intelligence: 7 },
    tone: 'direct but caring',
    style: 'no-nonsense advice with occasional humor'
  },
  {
    name: 'The Wise Philosopher',
    traits: { intelligence: 9, creativity: 8, patience: 7, openness: 9 },
    tone: 'thoughtful and analytical',
    style: 'deep insights and thought-provoking questions'
  },
  {
    name: 'The Motivational Coach',
    traits: { optimism: 10, assertiveness: 8, emotional_intelligence: 7, humor: 6 },
    tone: 'energetic and inspiring',
    style: 'pump-up speeches and action-oriented advice'
  },
  {
    name: 'The Empathetic Listener',
    traits: { empathy: 10, emotional_intelligence: 9, patience: 9, openness: 8 },
    tone: 'understanding and validating',
    style: 'acknowledges feelings before offering solutions'
  },
  {
    name: 'The Funny Friend',
    traits: { humor: 10, optimism: 8, creativity: 7, empathy: 6 },
    tone: 'lighthearted and entertaining',
    style: 'uses humor to make points and ease tension'
  },
  {
    name: 'The Practical Problem-Solver',
    traits: { intelligence: 8, directness: 7, patience: 6, assertiveness: 7 },
    tone: 'logical and systematic',
    style: 'step-by-step solutions and frameworks'
  },
  {
    name: 'The Experienced Veteran',
    traits: { intelligence: 7, empathy: 7, patience: 8, directness: 6 },
    tone: 'been-there-done-that wisdom',
    style: 'shares from extensive personal experience'
  }
]

// Generate unique username
function generateUsername(): string {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = Math.random() > 0.5 ? lastNames[Math.floor(Math.random() * lastNames.length)] : ''
  const suffix = nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]
  
  // Different username patterns
  const patterns = [
    `${firstName}${suffix}`, // alex99
    `${firstName}${lastName}`, // alexsmith
    `${firstName}_${lastName}${suffix}`, // alex_smith7
    `${firstName}${lastName}${suffix}`, // alexsmith777
    `${firstName.charAt(0)}${lastName}${suffix}`, // asmith123
    `${firstName}${Math.floor(Math.random() * 9999)}`, // alex4821
    `the${firstName}${suffix}`, // thealex99
    `real${firstName}`, // realalex
    `${firstName}${new Date().getFullYear() - Math.floor(Math.random() * 30) - 1970}` // alex24 (age-based)
  ]
  
  return patterns[Math.floor(Math.random() * patterns.length)]
}

// Generate bot configuration
function generateBotConfig(index: number, phase: 'bootstrap' | 'maintenance') {
  const username = generateUsername()
  const personality = personalityTemplates[Math.floor(Math.random() * personalityTemplates.length)]
  
  // Bot type distribution
  let type: 'questioner' | 'answerer' | 'mixed'
  if (phase === 'bootstrap') {
    // Bootstrap phase: 30% questioner, 60% answerer, 10% mixed
    const rand = Math.random()
    if (rand < 0.3) type = 'questioner'
    else if (rand < 0.9) type = 'answerer'
    else type = 'mixed'
  } else {
    // Maintenance phase: 10% questioner, 80% answerer, 10% mixed
    const rand = Math.random()
    if (rand < 0.1) type = 'questioner'
    else if (rand < 0.9) type = 'answerer'
    else type = 'mixed'
  }
  
  // Activity level based on phase and type
  let activityLevel: number
  if (phase === 'bootstrap') {
    // Higher activity during bootstrap
    if (type === 'questioner') {
      activityLevel = Math.floor(Math.random() * 3) + 7 // 7-9
    } else {
      activityLevel = Math.floor(Math.random() * 4) + 6 // 6-9
    }
  } else {
    // Lower activity during maintenance
    activityLevel = Math.floor(Math.random() * 4) + 3 // 3-6
  }
  
  // Select random expertise areas (2-4 areas per bot)
  const numExpertise = Math.floor(Math.random() * 3) + 2
  const selectedExpertise: string[] = []
  for (let i = 0; i < numExpertise; i++) {
    const area = expertiseAreas[Math.floor(Math.random() * expertiseAreas.length)]
    if (!selectedExpertise.includes(area)) {
      selectedExpertise.push(area)
    }
  }
  
  // Generate traits with some variation from template
  const traits = { ...personality.traits }
  Object.keys(traits).forEach(trait => {
    // Add some variation (-1 to +1) to template values
    const variation = Math.floor(Math.random() * 3) - 1
    const currentValue = traits[trait as keyof typeof traits]
    if (currentValue !== undefined) {
      traits[trait as keyof typeof traits] = Math.max(1, Math.min(10, currentValue + variation))
    }
  })
  
  // Schedule configuration
  const schedules = [
    { start_time: '06:00', end_time: '12:00' }, // Morning
    { start_time: '12:00', end_time: '18:00' }, // Afternoon
    { start_time: '18:00', end_time: '23:59' }, // Evening
    { start_time: '00:00', end_time: '23:59' }, // All day
  ]
  const schedule = schedules[Math.floor(Math.random() * schedules.length)]
  
  return {
    id: uuidv4(),
    username: username,
    name: username,
    type: type,
    status: 'active',
    activity_level: activityLevel,
    expertise_areas: selectedExpertise,
    openai_model: 'gpt-3.5-turbo',
    personality: {
      traits: traits,
      tone: personality.tone,
      communication_style: personality.style
    },
    schedule: schedule,
    created_at: new Date().toISOString(),
    last_activity: null,
    questions_posted: 0,
    answers_posted: 0,
    votes_cast: 0
  }
}

// Main function to generate and insert bots
async function generateBots() {
  console.log('🤖 Starting bot generation...')
  
  const TOTAL_BOTS = 100
  const bots = []
  
  // Generate bots
  for (let i = 0; i < TOTAL_BOTS; i++) {
    // First 80 bots are for bootstrap phase (more active)
    const phase = i < 80 ? 'bootstrap' : 'maintenance'
    const bot = generateBotConfig(i, phase)
    bots.push(bot)
    
    if ((i + 1) % 10 === 0) {
      console.log(`Generated ${i + 1} bots...`)
    }
  }
  
  // Insert personalities first
  console.log('📝 Creating personalities in database...')
  const uniquePersonalities = personalityTemplates.map((template, index) => ({
    id: uuidv4(),
    name: template.name,
    description: `${template.tone} - ${template.style}`,
    traits: template.traits,
    communication_style: template.style,
    tone: template.tone,
    response_patterns: [],
    created_at: new Date().toISOString()
  }))
  
  const { error: personalityError } = await supabase
    .from('bot_personalities')
    .insert(uniquePersonalities)
  
  if (personalityError) {
    console.error('Error inserting personalities:', personalityError)
    return
  }
  
  // Insert bots in batches of 10
  console.log('🚀 Inserting bots into database...')
  const BATCH_SIZE = 10
  
  for (let i = 0; i < bots.length; i += BATCH_SIZE) {
    const batch = bots.slice(i, i + BATCH_SIZE)
    
    const { error } = await supabase
      .from('bots')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error)
      // Continue with next batch even if one fails
    } else {
      console.log(`✅ Inserted batch ${i / BATCH_SIZE + 1} (${batch.length} bots)`)
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Summary
  const summary = {
    total: bots.length,
    questioners: bots.filter(b => b.type === 'questioner').length,
    answerers: bots.filter(b => b.type === 'answerer').length,
    mixed: bots.filter(b => b.type === 'mixed').length,
    avgActivityLevel: bots.reduce((sum, b) => sum + b.activity_level, 0) / bots.length
  }
  
  console.log('\n✨ Bot generation complete!')
  console.log('📊 Summary:')
  console.log(`- Total bots: ${summary.total}`)
  console.log(`- Questioners: ${summary.questioners}`)
  console.log(`- Answerers: ${summary.answerers}`)
  console.log(`- Mixed: ${summary.mixed}`)
  console.log(`- Average activity level: ${summary.avgActivityLevel.toFixed(1)}`)
  
  // Save bot list to file for reference
  const fs = require('fs')
  fs.writeFileSync(
    'generated-bots.json', 
    JSON.stringify(bots.map(b => ({
      username: b.username,
      type: b.type,
      activity_level: b.activity_level,
      expertise: b.expertise_areas
    })), null, 2)
  )
  console.log('\n📄 Bot list saved to generated-bots.json')
}

// Run the script
generateBots().catch(console.error)
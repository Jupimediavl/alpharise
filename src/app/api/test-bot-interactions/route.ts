import { NextResponse } from 'next/server'
import { BotUserInteractionSystem } from '@/lib/bot-user-interactions'

export async function GET() {
  try {
    console.log('🔍 Testing bot-user interaction system...')
    
    // Check for user interactions
    const interactions = await BotUserInteractionSystem.checkForUserInteractions()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bot-user interaction check completed',
      interactionsFound: interactions.length,
      interactions: interactions.map(i => ({
        type: i.type,
        userName: i.userName,
        botId: i.botId,
        contentPreview: i.content?.substring(0, 100) + '...',
        timestamp: i.timestamp
      }))
    })
    
  } catch (error) {
    console.error('Error testing bot-user interactions:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing bot-user interactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST() {
  try {
    console.log('🚀 Processing user interactions with bot content...')
    
    await BotUserInteractionSystem.processUserInteractions()
    
    return NextResponse.json({ 
      success: true, 
      message: 'User interactions processed successfully'
    })
    
  } catch (error) {
    console.error('Error processing bot-user interactions:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error processing bot-user interactions',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
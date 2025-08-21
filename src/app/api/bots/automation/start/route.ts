import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'

export async function POST(request: Request) {
  try {
    const { intervalMinutes = 5 } = await request.json()
    
    // Start the automation engine
    BotAutomation.start(intervalMinutes)
    
    return NextResponse.json({ 
      success: true,
      message: `Bot automation started with ${intervalMinutes} minute intervals`
    })
  } catch (error) {
    console.error('Error starting bot automation:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
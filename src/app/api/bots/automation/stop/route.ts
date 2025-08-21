import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'

export async function POST(request: Request) {
  try {
    // Stop the automation engine
    BotAutomation.stop()
    
    return NextResponse.json({ 
      success: true,
      message: 'Bot automation stopped successfully'
    })
  } catch (error) {
    console.error('Error stopping bot automation:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
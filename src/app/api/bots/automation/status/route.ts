import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'

export async function GET() {
  try {
    // Get automation status (we need to add this method to BotAutomation class)
    const isRunning = (BotAutomation as any).isRunning || false
    
    return NextResponse.json({ 
      success: true,
      isRunning,
      message: isRunning ? 'Bot automation is running' : 'Bot automation is stopped'
    })
  } catch (error) {
    console.error('Error getting bot automation status:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
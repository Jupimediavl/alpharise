import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'

export async function GET() {
  try {
    return NextResponse.json({ 
      automationRunning: (BotAutomation as any).isRunning || false,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      automationRunning: false
    })
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json()
    
    if (action === 'start') {
      BotAutomation.start(5) // 5 minute intervals
      return NextResponse.json({ 
        success: true, 
        message: 'Bot automation started',
        automationRunning: true
      })
    } else if (action === 'stop') {
      BotAutomation.stop()
      return NextResponse.json({ 
        success: true, 
        message: 'Bot automation stopped',
        automationRunning: false
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid action. Use "start" or "stop"' 
      })
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
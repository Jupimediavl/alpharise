import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'
import { BotManager } from '@/lib/bot-system'

export async function GET() {
  try {
    console.log('🔍 Testing bot automation system...')
    
    // Test bot fetching
    const bots = await BotManager.getActiveBots()
    console.log(`Found ${bots.length} active bots:`, bots.map(b => `${b.name} (${b.type})`))
    
    if (bots.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active bots found! Check bot status in database.',
        bots: []
      })
    }
    
    // Test automation cycle
    console.log('Running automation cycle...')
    await BotAutomation.runAutomationCycle()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bot automation test completed',
      botsFound: bots.length,
      bots: bots.map(b => ({ name: b.name, type: b.type, status: b.status }))
    })
    
  } catch (error) {
    console.error('Error testing bot automation:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing bot automation',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

export async function POST(request: Request) {
  try {
    const { action, botId } = await request.json()
    
    if (!botId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing botId or action' 
      })
    }
    
    console.log(`🚀 Triggering ${action} action for bot ${botId}`)
    const result = await BotAutomation.triggerBotAction(botId, action)
    
    return NextResponse.json(result)
    
  } catch (error) {
    console.error('Error triggering bot action:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error triggering bot action',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
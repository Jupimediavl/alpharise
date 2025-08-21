import { NextResponse } from 'next/server'
import { BotManager } from '@/lib/bot-system'

// Force refresh bot cache
export async function GET() {
  try {
    // Clear any cached data by calling getAllBots with force refresh
    const bots = await BotManager.getAllBots()
    
    const botsByType = {
      questioner: bots.filter(b => b.type === 'questioner' && b.status === 'active'),
      answerer: bots.filter(b => b.type === 'answerer' && b.status === 'active'),
      mixed: bots.filter(b => b.type === 'mixed' && b.status === 'active')
    }
    
    console.log('Bot cache refreshed:')
    console.log('Questioners:', botsByType.questioner.map(b => b.name))
    console.log('Answerers:', botsByType.answerer.map(b => b.name))
    console.log('Mixed:', botsByType.mixed.map(b => b.name))
    
    return NextResponse.json({ 
      success: true,
      message: 'Bot cache refreshed',
      counts: {
        questioner: botsByType.questioner.length,
        answerer: botsByType.answerer.length,
        mixed: botsByType.mixed.length
      },
      bots: {
        questioners: botsByType.questioner.map(b => b.name),
        answerers: botsByType.answerer.map(b => b.name),
        mixed: botsByType.mixed.map(b => b.name)
      }
    })
    
  } catch (error) {
    console.error('Error refreshing bot cache:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
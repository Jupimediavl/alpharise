import { NextResponse } from 'next/server'
import { BotManager } from '@/lib/bot-system'

export async function GET() {
  try {
    const allBots = await BotManager.getAllBots()
    
    const botsByType = {
      questioner: allBots.filter(b => b.type === 'questioner' && b.status === 'active'),
      answerer: allBots.filter(b => b.type === 'answerer' && b.status === 'active'),
      mixed: allBots.filter(b => b.type === 'mixed' && b.status === 'active')
    }
    
    return NextResponse.json({ 
      success: true,
      totalBots: allBots.length,
      activeByType: {
        questioner: botsByType.questioner.length,
        answerer: botsByType.answerer.length,
        mixed: botsByType.mixed.length
      },
      questioners: botsByType.questioner.map(b => ({ id: b.id, name: b.name, username: b.username })),
      answerers: botsByType.answerer.slice(0, 5).map(b => ({ id: b.id, name: b.name, username: b.username })),
      mixed: botsByType.mixed.map(b => ({ id: b.id, name: b.name, username: b.username }))
    })
    
  } catch (error) {
    console.error('Error checking bots:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
import { NextResponse } from 'next/server'
import { BotAutomation } from '@/lib/bot-automation'

export async function POST() {
  try {
    console.log('🔄 API: Manual automation cycle triggered via API')
    console.log('🔄 API: Starting BotAutomation.runAutomationCycle()')
    
    // Force automation cycle regardless of internal state
    await BotAutomation.runAllActiveBotsManually()
    
    console.log('✅ API: Automation cycle completed successfully')
    return NextResponse.json({
      success: true,
      message: 'Automation cycle completed'
    })
  } catch (error) {
    console.error('❌ API: Error in automation cycle:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
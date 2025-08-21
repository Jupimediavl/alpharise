import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // First, let's see what bots exist
    const { data: allBots, error: fetchError } = await supabase
      .from('bots')
      .select('id, name, username, type, status')
      .limit(20)

    if (fetchError) {
      console.error('Error fetching bots:', fetchError)
      return NextResponse.json({ success: false, error: fetchError.message })
    }

    // Update the first 3 active bots to be questioners
    const activeBots = allBots?.filter(b => b.status === 'active') || []
    const botsToUpdate = activeBots.slice(0, 3)

    if (botsToUpdate.length === 0) {
      return NextResponse.json({ success: false, message: 'No active bots found' })
    }

    const updateResults = []
    for (const bot of botsToUpdate) {
      const { data, error } = await supabase
        .from('bots')
        .update({ type: 'questioner' })
        .eq('id', bot.id)
        .select()

      if (!error && data) {
        updateResults.push({ id: bot.id, name: bot.name, oldType: bot.type, newType: 'questioner' })
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Updated ${updateResults.length} bots to questioner type`,
      allBots: allBots?.map(b => ({ name: b.name, type: b.type, status: b.status })),
      updates: updateResults
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
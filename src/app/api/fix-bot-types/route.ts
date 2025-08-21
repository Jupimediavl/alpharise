import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Force update specific bots to be questioners
    const questioners = ['eurolover', 'alexcarter', 'primasex']
    const mixed = ['tomwalks3']
    
    // Update questioners
    const { data: q1, error: e1 } = await supabase
      .from('bots')
      .update({ type: 'questioner' })
      .in('username', questioners)
      .select()
    
    // Update mixed
    const { data: q2, error: e2 } = await supabase
      .from('bots')
      .update({ type: 'mixed' })
      .in('username', mixed)
      .select()
    
    // Verify the updates
    const { data: allBots, error: fetchError } = await supabase
      .from('bots')
      .select('username, type, status')
      .eq('status', 'active')
      .order('username')
    
    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message })
    }
    
    const counts = {
      questioner: allBots?.filter(b => b.type === 'questioner').length || 0,
      answerer: allBots?.filter(b => b.type === 'answerer').length || 0,
      mixed: allBots?.filter(b => b.type === 'mixed').length || 0
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Bot types updated',
      updates: {
        questioners: q1?.map(b => b.username) || [],
        mixed: q2?.map(b => b.username) || []
      },
      counts,
      activeBots: allBots
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
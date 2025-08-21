import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST() {
  try {
    // Update some bots to be questioners for testing
    const { data: updatedBots, error } = await supabase
      .from('bots')
      .update({ type: 'questioner' })
      .in('username', ['nord888', 'christianradoo', 'SexMachine8'])
      .select('id, name, username, type')

    if (error) {
      console.error('Error updating bots:', error)
      return NextResponse.json({ success: false, error: error.message })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Updated bot types',
      updatedBots
    })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
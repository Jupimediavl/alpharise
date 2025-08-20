import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const resolvedParams = await params
    const { username } = resolvedParams

    // Get all coin transactions for user
    const { data: allTransactions, error: allError } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', username)
      .order('created_at', { ascending: false })

    if (allError && allError.code !== 'PGRST116') {
      console.error('Error fetching transactions:', allError)
    }

    // Get weekly transactions (coins earned this week)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const { data: weeklyTransactions, error: weeklyError } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', username)
      .gte('created_at', weekAgoISO)
      .order('created_at', { ascending: false })

    // Calculate weekly coins earned (positive transactions)
    const weeklyCoinsEarned = weeklyTransactions ? 
      weeklyTransactions
        .filter(t => t.type === 'earned' && t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0) : 0

    return NextResponse.json({
      success: true,
      debug: {
        username,
        totalTransactions: allTransactions?.length || 0,
        allTransactions: allTransactions || [],
        weeklyTransactions: weeklyTransactions || [],
        weeklyCoinsEarned,
        weekAgoISO
      }
    })
  } catch (error) {
    console.error('Debug coin transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
}
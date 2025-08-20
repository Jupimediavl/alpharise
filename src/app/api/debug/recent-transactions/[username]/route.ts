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

    // Get most recent coin transactions (last 24 hours)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    const oneDayAgoISO = oneDayAgo.toISOString()

    const { data: recentTransactions, error: transactionError } = await supabase
      .from('coin_transactions')
      .select('*')
      .eq('user_id', username)
      .gte('created_at', oneDayAgoISO)
      .order('created_at', { ascending: false })

    // Get current user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('username, coins, updated_at')
      .eq('username', username)
      .single()

    return NextResponse.json({
      success: true,
      debug: {
        username,
        currentCoins: user?.coins || 0,
        userLastUpdated: user?.updated_at,
        recentTransactions: recentTransactions || [],
        recentTransactionsCount: recentTransactions?.length || 0,
        oneDayAgoISO
      }
    })
  } catch (error) {
    console.error('Debug recent transactions error:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
}
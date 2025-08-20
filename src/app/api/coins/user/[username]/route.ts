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

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single()

    if (userError) {
      throw userError
    }

    // Calculate weekly coins from coin_transactions (real coins, not points)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    // Get coin transactions from last week
    const { data: weeklyTransactions, error: transactionError } = await supabase
      .from('coin_transactions')
      .select('amount, type, created_at')
      .eq('user_id', username)
      .gte('created_at', weekAgoISO)

    if (transactionError && transactionError.code !== 'PGRST116') {
      console.error('Error fetching weekly coin transactions:', transactionError)
    }

    // Calculate net coins from transactions table
    const transactionCoins = weeklyTransactions ? 
      weeklyTransactions.reduce((sum, transaction) => {
        if (transaction.type === 'earn') {
          return sum + transaction.amount
        } else if (transaction.type === 'spend') {
          return sum - transaction.amount
        }
        return sum
      }, 0) : 0

    // For now, show transaction-based coins (incomplete)
    // TODO: Fix community system to save all transactions
    const weeklyCoins = transactionCoins

    // Get total coins from the coins column (not confidence_score)
    const totalCoins = user.coins || 0

    // Calculate other stats
    const thisWeekCoins = weeklyCoins
    const streakDays = calculateStreakDays(weeklyTransactions || [])

    // Get coin settings
    const settingsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/coins/settings`)
    const settingsData = await settingsResponse.json()
    const coinSettings = settingsData.settings

    const dollarValue = (totalCoins / coinSettings.coins_per_dollar).toFixed(2)

    return NextResponse.json({
      success: true,
      coinData: {
        totalCoins,
        weeklyCoins: thisWeekCoins,
        dollarValue,
        streakDays,
        coinSettings,
        lastUpdated: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching user coin data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch coin data' },
      { status: 500 }
    )
  }
}

function calculateStreakDays(transactions: any[]): number {
  if (!transactions || transactions.length === 0) return 0
  
  // Only count earn transactions for activity streak
  const earnTransactions = transactions.filter(t => t.type === 'earn')
  if (earnTransactions.length === 0) return 0
  
  // Sort transactions by creation date (most recent first)
  const sortedTransactions = earnTransactions.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Group by days and count consecutive days
  const uniqueDays = new Set()
  sortedTransactions.forEach(t => {
    const date = new Date(t.created_at).toISOString().split('T')[0]
    uniqueDays.add(date)
  })

  const daysArray = Array.from(uniqueDays).sort().reverse()
  let streakDays = 0
  const today = new Date().toISOString().split('T')[0]
  
  // Check if today or yesterday has activity (streak can continue)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  
  if (!daysArray.includes(today) && !daysArray.includes(yesterdayStr)) {
    return 0 // No recent activity, streak is broken
  }

  // Count consecutive days
  let currentDate = new Date()
  for (let i = 0; i < daysArray.length; i++) {
    const dayStr = currentDate.toISOString().split('T')[0]
    if (daysArray.includes(dayStr)) {
      streakDays++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return streakDays
}
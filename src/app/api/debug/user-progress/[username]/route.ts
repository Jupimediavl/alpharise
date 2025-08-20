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
      .select('username, coins, confidence_score, created_at')
      .eq('username', username)
      .single()

    if (userError) {
      throw userError
    }

    // Check ALL user exercise progress data
    const { data: allProgress, error: progressError } = await supabase
      .from('user_exercise_progress')
      .select('*')
      .eq('username', username)
      .order('completed_at', { ascending: false })

    if (progressError && progressError.code !== 'PGRST116') {
      console.error('Error fetching progress:', progressError)
    }

    // Weekly progress specifically
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const weekAgoISO = weekAgo.toISOString()

    const { data: weeklyProgress, error: weeklyError } = await supabase
      .from('user_exercise_progress')
      .select('points_earned, completed_at, status')
      .eq('username', username)
      .eq('status', 'completed')
      .gte('completed_at', weekAgoISO)

    return NextResponse.json({
      success: true,
      debug: {
        user: user,
        totalProgressRecords: allProgress?.length || 0,
        allProgressData: allProgress || [],
        weeklyProgressRecords: weeklyProgress?.length || 0,
        weeklyProgressData: weeklyProgress || [],
        weekAgoISO,
        calculatedWeeklyCoins: weeklyProgress ? 
          weeklyProgress.reduce((sum, progress) => sum + (progress.points_earned || 0), 0) : 0
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    )
  }
}
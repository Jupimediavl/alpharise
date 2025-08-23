import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ALSAIEngine } from '@/lib/als-ai-engine'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate AI recommendations for the user
    const recommendations = await ALSAIEngine.generateRecommendations(session.user.id)

    return NextResponse.json({
      success: true,
      recommendations
    })

  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get current user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { action, feedback } = await request.json()

    // Handle recommendation feedback
    if (action === 'feedback') {
      // Store feedback for improving recommendations
      const { data, error } = await supabase
        .from('recommendation_feedback')
        .insert({
          user_id: session.user.id,
          feedback_data: feedback,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error storing feedback:', error)
        return NextResponse.json(
          { error: 'Failed to store feedback' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Feedback received'
      })
    }

    // Handle action completion (lesson completed, challenge accepted, etc.)
    if (action === 'complete') {
      const { contentType, contentId, performance } = feedback

      // Update user progress and trigger recommendation recalculation
      // This would update the relevant progress tables
      
      return NextResponse.json({
        success: true,
        message: 'Progress updated'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error handling recommendation action:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
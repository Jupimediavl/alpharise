import { NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase'
import { BotManager } from '@/lib/bot-system'

export async function POST(request: Request) {
  try {
    const { action, botIds, value, updateData } = await request.json()
    
    if (!action || !botIds || !Array.isArray(botIds)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields: action, botIds' 
      })
    }
    
    let result
    
    switch (action) {
      case 'activate':
        result = await supabase
          .from('bots')
          .update({ status: 'active' })
          .in('id', botIds)
        break
        
      case 'pause':
        result = await supabase
          .from('bots')
          .update({ status: 'paused' })
          .in('id', botIds)
        break
        
      case 'set_activity':
        if (!value || value < 1 || value > 10) {
          return NextResponse.json({ 
            success: false, 
            error: 'Activity level must be between 1 and 10' 
          })
        }
        result = await supabase
          .from('bots')
          .update({ activity_level: value })
          .in('id', botIds)
        break
        
      case 'change_type':
        if (!value || !['questioner', 'answerer', 'mixed'].includes(value)) {
          return NextResponse.json({ 
            success: false, 
            error: 'Invalid bot type' 
          })
        }
        result = await supabase
          .from('bots')
          .update({ type: value })
          .in('id', botIds)
        break
        
      case 'delete':
        result = await supabase
          .from('bots')
          .delete()
          .in('id', botIds)
        break
        
      case 'update_individual':
        if (!updateData) {
          return NextResponse.json({ 
            success: false, 
            error: 'updateData is required for individual updates' 
          })
        }
        
        console.log('Updating bot:', botIds[0], 'with data:', updateData)
        
        // Update single bot with all provided data
        result = await supabase
          .from('bots')
          .update(updateData)
          .eq('id', botIds[0])
          .select()
        
        console.log('Update result:', result)
        break
        
      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        })
    }
    
    if (result.error) {
      console.error('Database error:', result.error)
      return NextResponse.json({ 
        success: false, 
        error: result.error.message 
      })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Bulk action "${action}" applied to ${botIds.length} bots`,
      affected: botIds.length
    })
    
  } catch (error) {
    console.error('Error in bulk bot action:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Get bot statistics for dashboard
export async function GET() {
  try {
    const { data: bots, error } = await supabase
      .from('bots')
      .select('type, status, activity_level, created_at, stats')
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message })
    }
    
    const stats = {
      total: bots?.length || 0,
      active: bots?.filter(b => b.status === 'active').length || 0,
      paused: bots?.filter(b => b.status === 'paused').length || 0,
      byType: {
        questioner: {
          total: bots?.filter(b => b.type === 'questioner').length || 0,
          active: bots?.filter(b => b.type === 'questioner' && b.status === 'active').length || 0
        },
        answerer: {
          total: bots?.filter(b => b.type === 'answerer').length || 0,
          active: bots?.filter(b => b.type === 'answerer' && b.status === 'active').length || 0
        },
        mixed: {
          total: bots?.filter(b => b.type === 'mixed').length || 0,
          active: bots?.filter(b => b.type === 'mixed' && b.status === 'active').length || 0
        }
      },
      activityDistribution: {
        low: bots?.filter(b => b.activity_level <= 3).length || 0,
        medium: bots?.filter(b => b.activity_level >= 4 && b.activity_level <= 7).length || 0,
        high: bots?.filter(b => b.activity_level >= 8).length || 0
      },
      performance: {
        totalQuestions: bots?.reduce((sum, b) => sum + ((b.stats as any)?.questions_posted || 0), 0) || 0,
        totalAnswers: bots?.reduce((sum, b) => sum + ((b.stats as any)?.answers_posted || 0), 0) || 0,
        avgActivity: bots?.length ? bots.reduce((sum, b) => sum + b.activity_level, 0) / bots.length : 0
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      stats,
      bots: bots?.map(b => ({
        type: b.type,
        status: b.status,
        activity_level: b.activity_level,
        questions_posted: (b.stats as any)?.questions_posted || 0,
        answers_posted: (b.stats as any)?.answers_posted || 0
      }))
    })
    
  } catch (error) {
    console.error('Error getting bot stats:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
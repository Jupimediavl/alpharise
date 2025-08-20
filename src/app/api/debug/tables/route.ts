import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    // Check for coin-related tables
    const queries = [
      'coin_transactions',
      'coin_earnings', 
      'user_coins',
      'coins_history'
    ]
    
    const results: any = {}
    
    for (const tableName of queries) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
        
        if (error) {
          results[tableName] = { exists: false, error: error.code }
        } else {
          results[tableName] = { exists: true, sampleCount: data?.length || 0 }
        }
      } catch (e) {
        results[tableName] = { exists: false, error: 'unknown' }
      }
    }

    return NextResponse.json({
      success: true,
      tables: results
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to check tables' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('API: Creating problem with data:', body)
    
    const { data, error } = await supabaseAdmin
      .from('problems')
      .insert({
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    console.log('API: Create result:', { data, error })
    
    if (error) {
      console.error('API: Error creating problem:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API: Exception in POST /api/admin/problems:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
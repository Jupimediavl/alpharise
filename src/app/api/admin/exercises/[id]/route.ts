import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const resolvedParams = await params
    const exerciseId = resolvedParams.id

    console.log('API: Updating exercise:', exerciseId, 'with data:', body)

    // Remove fields that shouldn't be updated, including the 'problems' relation
    const { id, created_at, updated_at, problems, ...cleanUpdates } = body

    console.log('Clean updates being sent to DB:', cleanUpdates)

    const { data, error } = await supabaseAdmin
      .from('exercises')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', exerciseId)
      .select()
      .single()

    if (error) {
      console.error('API Error updating exercise:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
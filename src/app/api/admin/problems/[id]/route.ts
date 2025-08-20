import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json()
    const resolvedParams = await params
    
    console.log('API: Updating problem:', resolvedParams.id, 'with data:', body)
    
    // Clean the data - remove fields that shouldn't be updated
    const { id, created_at, updated_at, ...cleanUpdates } = body
    
    console.log('API: Clean updates being sent to DB:', cleanUpdates)
    
    const { data, error } = await supabaseAdmin
      .from('problems')
      .update({
        ...cleanUpdates,
        updated_at: new Date().toISOString()
      })
      .eq('id', resolvedParams.id)
      .select()
      .single()
    
    console.log('API: Update result:', { data, error })
    
    if (error) {
      console.error('API: Error updating problem:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('API: Exception in PUT /api/admin/problems/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params
    
    console.log('API: Deleting problem:', resolvedParams.id)
    
    const { data, error } = await supabaseAdmin
      .from('problems')
      .delete()
      .eq('id', resolvedParams.id)
      .select()
    
    console.log('API: Delete result:', { data, error })
    
    if (error) {
      console.error('API: Error deleting problem:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, deleted: data[0] })
  } catch (error) {
    console.error('API: Exception in DELETE /api/admin/problems/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
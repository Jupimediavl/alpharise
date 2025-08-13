import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // For now, just return success
    // Later we'll add Supabase auth logic here
    return NextResponse.json({ 
      success: true, 
      message: 'Auth API endpoint ready' 
    })
  } catch (error) {
    console.error('Auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Auth API is running' 
  })
}
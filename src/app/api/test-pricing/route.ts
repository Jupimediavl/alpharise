import { NextRequest, NextResponse } from 'next/server'
import { SupabasePricingManager } from '@/lib/supabase'

export async function GET() {
  try {
    const [trialPricing, mainPricing] = await Promise.all([
      SupabasePricingManager.getTrialPricing(),
      SupabasePricingManager.getMainPricing()
    ])

    return NextResponse.json({
      success: true,
      trialPricing,
      mainPricing,
      message: 'Pricing data loaded successfully from database'
    })
  } catch (error) {
    console.error('Error testing pricing:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Failed to load pricing from database'
    }, { status: 500 })
  }
}
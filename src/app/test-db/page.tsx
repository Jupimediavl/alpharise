'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDbPage() {
  const [results, setResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setResults(prev => [...prev, message])
    console.log(message)
  }

  const testConnection = async () => {
    setResults([])
    addResult('🔍 Testing Supabase connection...')

    try {
      // Test 1: Basic connection
      const { data, error } = await supabase.from('users').select('count').limit(1)
      
      if (error) {
        addResult(`❌ Connection failed: ${error.message}`)
        addResult(`❌ Error code: ${error.code}`)
        addResult(`❌ Error details: ${error.details}`)
        addResult(`❌ Error hint: ${error.hint}`)
        return
      }

      addResult('✅ Basic connection successful')

      // Test 2: Check table structure
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)

      if (tableError) {
        addResult(`❌ Table query failed: ${tableError.message}`)
        return
      }

      addResult('✅ Table structure accessible')

      // Test 3: Try to insert a test user
      const testUser = {
        username: 'test_user_' + Date.now(),
        email: 'test@example.com',
        avatar_type: 'logan' as const,
        coins: 200,
        streak: 1,
        level: 1,
        total_earned: 0,
        monthly_earnings: 0,
        discount_earned: 0,
        subscription_type: 'trial' as const,
        trial_days_left: 7,
        confidence_score: 34,
        experience: 150,
        badges: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_active: new Date().toISOString()
      }

      addResult('🚀 Attempting test user creation...')
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert(testUser)
        .select()
        .single()

      if (insertError) {
        addResult(`❌ Insert failed: ${insertError.message}`)
        addResult(`❌ Insert error code: ${insertError.code}`)
        addResult(`❌ Insert error details: ${insertError.details}`)
        addResult(`❌ Insert error hint: ${insertError.hint}`)
        return
      }

      addResult('✅ Test user created successfully')
      addResult(`✅ Created user: ${JSON.stringify(insertData, null, 2)}`)

      // Clean up - delete test user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id)

      if (deleteError) {
        addResult(`⚠️ Cleanup failed: ${deleteError.message}`)
      } else {
        addResult('🧹 Test user cleaned up')
      }

    } catch (error: any) {
      addResult(`❌ Unexpected error: ${error.message}`)
      addResult(`❌ Error stack: ${error.stack}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Supabase Database Test</h1>
        
        <button 
          onClick={testConnection}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold mb-6"
        >
          Test Database Connection
        </button>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm">
            {results.map((result, index) => (
              <div key={index} className="border-l-2 border-gray-600 pl-4">
                {result}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          <p>This page tests:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Basic Supabase connection</li>
            <li>Users table accessibility</li>
            <li>Insert operation with full user data</li>
            <li>Error details and diagnostics</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
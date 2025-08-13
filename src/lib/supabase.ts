import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Basic types for now
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_type?: string
  created_at: string
  updated_at: string
}

export interface AvatarType {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  created_at: string
}

// Simple helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getAvatarTypes(): Promise<AvatarType[]> {
  const { data, error } = await supabase
    .from('avatar_types')
    .select('*')
  
  if (error) {
    console.error('Error fetching avatar types:', error)
    return []
  }
  
  return data || []
}
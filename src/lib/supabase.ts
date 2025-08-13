import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_type?: string
  created_at: string
  updated_at: string
}

export interface AssessmentResponse {
  id: string
  user_id: string
  question_id: number
  answer_index: number
  scores: Record<string, number>
  created_at: string
}

export interface AvatarType {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  created_at: string
}

export interface Content {
  id: string
  title: string
  content: string
  category: string
  avatar_type?: string
  content_type: 'lesson' | 'exercise' | 'challenge'
  level: 'beginner' | 'intermediate' | 'advanced'
  order_index: number
  is_premium: boolean
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  content_id: string
  completed: boolean
  progress_percentage: number
  completed_at?: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  avatar_persona: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: string
  price_id: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

// Helper functions
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  
  return data
}

export async function createProfile(profile: Partial<Profile>): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .insert(profile)
    .select()
    .single()
  
  if (error) {
    console.error('Error creating profile:', error)
    return null
  }
  
  return data
}

export async function saveAssessmentResponse(response: Omit<AssessmentResponse, 'id' | 'created_at'>): Promise<boolean> {
  const { error } = await supabase
    .from('assessment_responses')
    .insert(response)
  
  if (error) {
    console.error('Error saving assessment response:', error)
    return false
  }
  
  return true
}

export async function getAssessmentResponses(userId: string): Promise<AssessmentResponse[]> {
  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('user_id', userId)
    .order('question_id')
  
  if (error) {
    console.error('Error fetching assessment responses:', error)
    return []
  }
  
  return data || []
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

export async function getContentForAvatar(avatarType: string, isPremium: boolean = false): Promise<Content[]> {
  let query = supabase
    .from('content')
    .select('*')
    .or(`avatar_type.eq.${avatarType},avatar_type.is.null`)
    .order('order_index')
  
  if (!isPremium) {
    query = query.eq('is_premium', false)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching content:', error)
    return []
  }
  
  return data || []
}

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user progress:', error)
    return []
  }
  
  return data || []
}

export async function updateUserProgress(
  userId: string, 
  contentId: string, 
  progress: Partial<UserProgress>
): Promise<boolean> {
  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      content_id: contentId,
      ...progress,
      updated_at: new Date().toISOString()
    })
  
  if (error) {
    console.error('Error updating user progress:', error)
    return false
  }
  
  return true
}

export async function getOrCreateConversation(userId: string, avatarPersona: string): Promise<Conversation | null> {
  // First try to get existing conversation
  const { data: existing, error: fetchError } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', userId)
    .eq('avatar_persona', avatarPersona)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  
  if (existing && !fetchError) {
    return existing
  }
  
  // Create new conversation
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      avatar_persona: avatarPersona,
      messages: []
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }
  
  return data
}

export async function addMessageToConversation(
  conversationId: string, 
  message: { role: 'user' | 'assistant', content: string }
): Promise<boolean> {
  // Get current conversation
  const { data: conversation, error: fetchError } = await supabase
    .from('conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()
  
  if (fetchError) {
    console.error('Error fetching conversation:', fetchError)
    return false
  }
  
  const messages = conversation.messages || []
  messages.push({
    ...message,
    timestamp: new Date().toISOString()
  })
  
  const { error } = await supabase
    .from('conversations')
    .update({
      messages,
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
  
  if (error) {
    console.error('Error updating conversation:', error)
    return false
  }
  
  return true
}
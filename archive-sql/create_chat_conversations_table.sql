-- Chat Conversations Table for AlphaRise
-- This table stores all chat messages between users and their assigned coaches

CREATE TABLE IF NOT EXISTS chat_conversations (
    -- Primary key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User identification
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    
    -- Coach information
    coach_type TEXT NOT NULL CHECK (coach_type IN ('logan', 'chase', 'mason', 'blake', 'knox')),
    
    -- Message details
    message_type TEXT NOT NULL CHECK (message_type IN ('user', 'coach')),
    content TEXT NOT NULL,
    
    -- Session grouping (for conversation threads)
    session_id UUID NOT NULL DEFAULT gen_random_uuid(),
    
    -- Metadata
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional context
    user_age INTEGER,
    user_type TEXT, -- overthinker, nervous, rookie, updown, surface
    
    -- Message status and features
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    
    -- AI/API metadata
    ai_model TEXT DEFAULT 'gpt-4',
    response_time_ms INTEGER,
    token_count INTEGER
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session_id ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_timestamp ON chat_conversations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_coach ON chat_conversations(user_id, coach_type);

-- Row Level Security (RLS) for user privacy
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own conversations
CREATE POLICY "Users can view own conversations" ON chat_conversations
    FOR SELECT USING (user_id = current_user_id());

CREATE POLICY "Users can insert own conversations" ON chat_conversations
    FOR INSERT WITH CHECK (user_id = current_user_id());

-- Function to get current user ID (you'll need to implement this based on your auth system)
-- This is a placeholder - replace with your actual user identification logic
CREATE OR REPLACE FUNCTION current_user_id() RETURNS TEXT AS $$
BEGIN
    -- Replace this with your actual user identification logic
    -- For example: return auth.uid() if using Supabase Auth
    RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data structure (for reference, don't run in production)
/*
INSERT INTO chat_conversations (
    user_id, username, coach_type, message_type, content, session_id, user_age, user_type
) VALUES 
(
    'jupi', 
    'jupi', 
    'logan', 
    'user', 
    'How do I stop overthinking everything?', 
    gen_random_uuid(), 
    25, 
    'overthinker'
),
(
    'jupi', 
    'jupi', 
    'logan', 
    'coach', 
    'Logan here! Great question. Overthinking is actually your analytical mind working overtime. Here are 3 techniques to break the loop...', 
    (SELECT session_id FROM chat_conversations WHERE user_id = 'jupi' ORDER BY timestamp DESC LIMIT 1), 
    25, 
    'overthinker'
);
*/
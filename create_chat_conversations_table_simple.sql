-- Chat Conversations Table for AlphaRise (Simplified Version)
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

-- Success message
SELECT 'Chat conversations table created successfully!' as message;
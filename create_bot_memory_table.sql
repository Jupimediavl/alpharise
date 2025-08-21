-- Bot Memory Table for Question Deduplication
-- This table tracks questions asked by each bot to prevent duplicates

CREATE TABLE IF NOT EXISTS bot_memory (
  id SERIAL PRIMARY KEY,
  bot_id VARCHAR(255) NOT NULL,
  question_text TEXT NOT NULL,
  question_hash VARCHAR(64) NOT NULL, -- For quick exact match lookups
  topic_category VARCHAR(100),
  pattern_type VARCHAR(50), -- 'traditional' or 'problem-statement'
  keywords TEXT[], -- Array of key words for fuzzy matching
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  CONSTRAINT unique_bot_question UNIQUE (bot_id, question_hash)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_bot_memory_bot_id ON bot_memory(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_memory_hash ON bot_memory(question_hash);
CREATE INDEX IF NOT EXISTS idx_bot_memory_category ON bot_memory(topic_category);
CREATE INDEX IF NOT EXISTS idx_bot_memory_created_at ON bot_memory(created_at);

-- Enable RLS for security
ALTER TABLE bot_memory ENABLE ROW LEVEL SECURITY;

-- Policy to allow service role access (for bot automation)
CREATE POLICY "Allow service role access" ON bot_memory
  FOR ALL USING (auth.role() = 'service_role');
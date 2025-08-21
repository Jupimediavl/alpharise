# Bot Deduplication Database Migration

## Instructions
Run this SQL in your Supabase SQL editor to create the bot memory table:

```sql
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
```

## What this creates:
- `bot_memory` table to track bot questions
- Unique constraint to prevent exact duplicates 
- Performance indexes for fast lookups
- RLS policy for secure bot access

## How it works:
1. When a bot generates a question, it first checks this table for similar questions
2. Uses multiple similarity algorithms (Levenshtein distance, keyword overlap, phrase matching)
3. If similarity > 70%, the question is rejected and bot tries again
4. Unique questions are saved to memory for future deduplication
5. Topic rotation ensures bots focus on different categories each day

## Test Results:
✅ Similarity calculation: Working  
✅ Keyword extraction: Working  
✅ Topic rotation: Working  
✅ Hash generation: Working  
✅ Duplicate detection at 70% threshold: Working

The system is ready for production use!
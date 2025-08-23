-- Lesson Feedback Tracking System
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS lesson_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    lesson_id VARCHAR(100) NOT NULL,
    lesson_title VARCHAR(255),
    
    -- Feedback data
    feedback_value INTEGER NOT NULL CHECK (feedback_value BETWEEN 1 AND 4),
    feedback_label VARCHAR(100) NOT NULL,
    additional_comments TEXT,
    
    -- Metadata
    problem_type VARCHAR(100), -- PE, confidence, etc
    step_number INTEGER,
    time_to_complete INTEGER, -- minutes
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- One feedback per user per lesson
    UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE lesson_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own feedback" ON lesson_feedback
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own feedback" ON lesson_feedback
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own feedback" ON lesson_feedback
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Index for analytics
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_value ON lesson_feedback(feedback_value);
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_user ON lesson_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_feedback_lesson ON lesson_feedback(lesson_id);

-- Analytics View (optional - pentru admin dashboard)
CREATE OR REPLACE VIEW lesson_feedback_analytics AS
SELECT 
    lesson_id,
    lesson_title,
    COUNT(*) as total_feedback,
    AVG(feedback_value) as avg_rating,
    COUNT(CASE WHEN feedback_value = 1 THEN 1 END) as not_helpful_count,
    COUNT(CASE WHEN feedback_value = 2 THEN 1 END) as partial_count,
    COUNT(CASE WHEN feedback_value = 3 THEN 1 END) as good_count,
    COUNT(CASE WHEN feedback_value = 4 THEN 1 END) as excellent_count
FROM lesson_feedback
GROUP BY lesson_id, lesson_title;

SELECT 'Lesson feedback system created successfully!' as status;
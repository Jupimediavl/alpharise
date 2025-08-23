-- =====================================================
-- Update Database for Delayed Feedback System
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add feedback tracking columns to user_progress table
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS feedback_available_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS feedback_reminder_sent BOOLEAN DEFAULT FALSE;

-- Add updated_at column to lesson_feedback if not exists
ALTER TABLE lesson_feedback 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create index for feedback queries
CREATE INDEX IF NOT EXISTS idx_user_progress_feedback_available 
ON user_progress(user_id, feedback_available_at) 
WHERE status = 'completed';

-- Function to get lessons pending feedback
CREATE OR REPLACE FUNCTION get_pending_feedback_lessons(p_user_id UUID)
RETURNS TABLE (
    lesson_id UUID,
    lesson_title TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    feedback_available_at TIMESTAMP WITH TIME ZONE,
    time_until_feedback_hours INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.lesson_id,
        up.notes as lesson_title,
        up.completion_date as completed_at,
        up.feedback_available_at,
        CASE 
            WHEN up.feedback_available_at > NOW() THEN 
                EXTRACT(EPOCH FROM (up.feedback_available_at - NOW())) / 3600
            ELSE 0
        END::INTEGER as time_until_feedback_hours
    FROM user_progress up
    LEFT JOIN lesson_feedback lf ON up.user_id = lf.user_id AND up.lesson_id = lf.lesson_id
    WHERE up.user_id = p_user_id
        AND up.status = 'completed'
        AND lf.id IS NULL -- No feedback given yet
    ORDER BY up.feedback_available_at ASC;
END;
$$ LANGUAGE plpgsql;

-- View for admin to see feedback statistics
CREATE OR REPLACE VIEW feedback_statistics AS
SELECT 
    DATE(completion_date) as completion_date,
    COUNT(DISTINCT up.user_id) as completed_lessons,
    COUNT(DISTINCT lf.user_id) as feedback_given,
    ROUND(COUNT(DISTINCT lf.user_id)::NUMERIC / NULLIF(COUNT(DISTINCT up.user_id), 0) * 100, 2) as feedback_rate,
    AVG(lf.feedback_value) as avg_rating
FROM user_progress up
LEFT JOIN lesson_feedback lf ON up.user_id = lf.user_id AND up.lesson_id = lf.lesson_id
WHERE up.status = 'completed'
GROUP BY DATE(completion_date)
ORDER BY completion_date DESC;

-- Function to check if user can review a lesson
CREATE OR REPLACE FUNCTION can_review_lesson(p_user_id UUID, p_lesson_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_status VARCHAR(50);
BEGIN
    SELECT status INTO v_status
    FROM user_progress
    WHERE user_id = p_user_id AND lesson_id = p_lesson_id;
    
    -- User can review if lesson is completed or in progress
    RETURN v_status IN ('completed', 'in_progress');
END;
$$ LANGUAGE plpgsql;

SELECT 'Database updated for delayed feedback system!' as status;
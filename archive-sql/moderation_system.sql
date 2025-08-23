-- Moderation System for Bot Content
-- Add moderation status to questions and answers tables

-- Add moderation columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE questions ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(100);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_bot_generated BOOLEAN DEFAULT false;

-- Add moderation columns to answers table  
ALTER TABLE answers ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE answers ADD COLUMN IF NOT EXISTS moderated_by VARCHAR(100);
ALTER TABLE answers ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS moderation_notes TEXT;
ALTER TABLE answers ADD COLUMN IF NOT EXISTS is_bot_generated BOOLEAN DEFAULT false;

-- Create moderation_log table for tracking all moderation actions
CREATE TABLE IF NOT EXISTS moderation_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('question', 'answer')),
    content_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'edited')),
    moderator VARCHAR(100) NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    notes TEXT,
    content_backup JSONB, -- Store original content before edits
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_moderation_status ON questions(moderation_status);
CREATE INDEX IF NOT EXISTS idx_questions_bot_generated ON questions(is_bot_generated);
CREATE INDEX IF NOT EXISTS idx_answers_moderation_status ON answers(moderation_status);
CREATE INDEX IF NOT EXISTS idx_answers_bot_generated ON answers(is_bot_generated);
CREATE INDEX IF NOT EXISTS idx_moderation_log_content ON moderation_log(content_type, content_id);

-- Function to automatically approve content from human users
CREATE OR REPLACE FUNCTION auto_approve_human_content()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-approve content that's not bot-generated
    IF NEW.is_bot_generated = false THEN
        NEW.moderation_status = 'approved';
        NEW.moderated_by = 'system';
        NEW.moderated_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for auto-approval
DROP TRIGGER IF EXISTS auto_approve_human_questions ON questions;
CREATE TRIGGER auto_approve_human_questions
    BEFORE INSERT ON questions
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_human_content();

DROP TRIGGER IF EXISTS auto_approve_human_answers ON answers;
CREATE TRIGGER auto_approve_human_answers
    BEFORE INSERT ON answers
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_human_content();

-- Update existing human content to be approved
UPDATE questions SET 
    moderation_status = 'approved',
    moderated_by = 'system',
    moderated_at = now(),
    is_bot_generated = false
WHERE is_bot_generated IS NULL OR is_bot_generated = false;

UPDATE answers SET 
    moderation_status = 'approved', 
    moderated_by = 'system',
    moderated_at = now(),
    is_bot_generated = false
WHERE is_bot_generated IS NULL OR is_bot_generated = false;
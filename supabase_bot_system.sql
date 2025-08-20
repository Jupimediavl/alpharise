-- AlphaRise Bot Management System - Supabase Schema
-- Execute these SQL commands in your Supabase SQL editor

-- 1. Bots table - main bot configuration
CREATE TABLE IF NOT EXISTS bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE, -- will be used in community
    type VARCHAR(20) NOT NULL CHECK (type IN ('questioner', 'answerer', 'mixed')),
    personality JSONB NOT NULL DEFAULT '{}', -- personality traits and behavior config
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    activity_level INTEGER NOT NULL DEFAULT 5 CHECK (activity_level BETWEEN 1 AND 10),
    openai_model VARCHAR(50) DEFAULT 'gpt-3.5-turbo',
    avatar_url TEXT,
    bio TEXT,
    expertise_areas TEXT[] DEFAULT ARRAY[]::TEXT[], -- topics this bot is expert in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    stats JSONB DEFAULT '{
        "questions_posted": 0,
        "answers_posted": 0,
        "helpful_votes_received": 0,
        "coins_earned": 0,
        "last_active": null
    }'::jsonb
);

-- 2. Bot personalities - predefined personality templates
CREATE TABLE IF NOT EXISTS bot_personalities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    traits JSONB NOT NULL DEFAULT '{}', -- personality characteristics
    prompt_template TEXT NOT NULL, -- OpenAI system prompt
    response_style JSONB DEFAULT '{}', -- writing style, tone, etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Bot activities - track all bot actions
CREATE TABLE IF NOT EXISTS bot_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'question_posted', 'answer_posted', 'vote_cast', etc
    content_id UUID, -- reference to question/answer id
    content_type VARCHAR(20), -- 'question' or 'answer'
    metadata JSONB DEFAULT '{}', -- additional activity data
    success BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Bot schedules - when bots should be active
CREATE TABLE IF NOT EXISTS bot_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday, NULL=all days
    start_time TIME,
    end_time TIME,
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Bot interactions - track bot-to-bot interactions
CREATE TABLE IF NOT EXISTS bot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_from_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    bot_to_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL, -- 'helpful_vote', 'reply', 'disagreement'
    content_id UUID, -- what they interacted on
    context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bots_status ON bots(status);
CREATE INDEX IF NOT EXISTS idx_bots_type ON bots(type);
CREATE INDEX IF NOT EXISTS idx_bot_activities_bot_id ON bot_activities(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_activities_created_at ON bot_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_bot_schedules_bot_id ON bot_schedules(bot_id);

-- RLS Policies (Row Level Security)
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_personalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bot_interactions ENABLE ROW LEVEL SECURITY;

-- Allow public read for bots (they need to appear in community)
CREATE POLICY "Bots are publicly readable" ON bots FOR SELECT USING (true);

-- Only authenticated users can manage bots (admin functionality)
CREATE POLICY "Only authenticated users can manage bots" ON bots 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Bot personalities are publicly readable" ON bot_personalities FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can manage personalities" ON bot_personalities 
    FOR ALL USING (auth.role() = 'authenticated');

-- Bot activities are readable by authenticated users (for analytics)
CREATE POLICY "Bot activities readable by authenticated" ON bot_activities 
    FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated can insert bot activities" ON bot_activities 
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Bot schedules manageable by authenticated" ON bot_schedules 
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Bot interactions readable by authenticated" ON bot_interactions 
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default personalities
INSERT INTO bot_personalities (name, description, traits, prompt_template, response_style) VALUES 
(
    'Supportive Mentor',
    'Wise, experienced, and encouraging. Gives practical advice.',
    '{"empathy": 9, "directness": 7, "wisdom": 9, "humor": 5}'::jsonb,
    'You are a supportive mentor helping people build confidence. You''ve overcome similar struggles and want to help others. Be empathetic, practical, and encouraging. Share personal insights when helpful.',
    '{"tone": "warm", "length": "medium", "uses_examples": true}'::jsonb
),
(
    'Curious Learner',
    'New to confidence building, asks genuine questions seeking help.',
    '{"vulnerability": 8, "curiosity": 9, "anxiety": 6, "determination": 7}'::jsonb,
    'You are someone new to building confidence, genuinely seeking help and advice. You''re vulnerable but determined. Ask authentic questions about real struggles with confidence, social situations, and personal growth.',
    '{"tone": "uncertain", "length": "short-medium", "asks_followups": true}'::jsonb
),
(
    'Analytical Helper',
    'Logical, detailed, and systematic in approach to confidence building.',
    '{"logic": 9, "detail": 8, "empathy": 6, "systematic": 9}'::jsonb,
    'You approach confidence building analytically. You provide structured, logical advice with steps and frameworks. You like to break down problems systematically and provide actionable plans.',
    '{"tone": "professional", "length": "long", "uses_lists": true}'::jsonb
),
(
    'Motivational Friend',
    'Energetic, positive, and motivating. Focuses on action and mindset.',
    '{"energy": 10, "optimism": 9, "action_oriented": 9, "empathy": 7}'::jsonb,
    'You are an energetic, motivational friend who believes everyone can build confidence. Focus on mindset shifts, taking action, and celebrating small wins. Be positive and encouraging.',
    '{"tone": "energetic", "length": "medium", "uses_encouragement": true}'::jsonb
);

-- Function to update bot stats
CREATE OR REPLACE FUNCTION update_bot_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update bot stats based on activity type
        IF NEW.activity_type = 'question_posted' THEN
            UPDATE bots SET 
                stats = jsonb_set(stats, '{questions_posted}', ((stats->>'questions_posted')::int + 1)::text::jsonb),
                stats = jsonb_set(stats, '{last_active}', to_jsonb(now()))
            WHERE id = NEW.bot_id;
        ELSIF NEW.activity_type = 'answer_posted' THEN
            UPDATE bots SET 
                stats = jsonb_set(stats, '{answers_posted}', ((stats->>'answers_posted')::int + 1)::text::jsonb),
                stats = jsonb_set(stats, '{last_active}', to_jsonb(now()))
            WHERE id = NEW.bot_id;
        ELSIF NEW.activity_type = 'helpful_vote_received' THEN
            UPDATE bots SET 
                stats = jsonb_set(stats, '{helpful_votes_received}', ((stats->>'helpful_votes_received')::int + 1)::text::jsonb),
                stats = jsonb_set(stats, '{coins_earned}', ((stats->>'coins_earned')::int + 1)::text::jsonb)
            WHERE id = NEW.bot_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update bot stats
CREATE TRIGGER update_bot_stats_trigger
    AFTER INSERT ON bot_activities
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_stats();
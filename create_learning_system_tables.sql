-- Learning System Tables for AlphaRise
-- Creates problems, solutions, milestones and user progress tracking

-- Problems table (5 per user_type)
CREATE TABLE IF NOT EXISTS problems (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('overthinker', 'nervous', 'rookie', 'updown', 'surface')),
    order_index INTEGER NOT NULL,
    total_solutions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solutions table (4+ per problem)
CREATE TABLE IF NOT EXISTS solutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points_reward INTEGER NOT NULL,
    estimated_minutes INTEGER DEFAULT 10,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Milestones table (configurable progress milestones)
CREATE TABLE IF NOT EXISTS milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    badge_icon TEXT DEFAULT '🏆',
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User solution progress tracking
CREATE TABLE IF NOT EXISTS user_solution_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    solution_id UUID NOT NULL REFERENCES solutions(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    points_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate progress entries
    UNIQUE(user_id, solution_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_problems_user_type ON problems(user_type, order_index);
CREATE INDEX IF NOT EXISTS idx_solutions_problem_id ON solutions(problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_solutions_difficulty ON solutions(difficulty);
CREATE INDEX IF NOT EXISTS idx_milestones_points ON milestones(points_required, order_index);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_solution_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_solution_progress(user_id, status);

-- Success message
SELECT 'Learning system tables created successfully!' as message;
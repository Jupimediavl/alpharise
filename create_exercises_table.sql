-- Create exercises table if it doesn't exist (renamed from solutions)
-- This handles the naming inconsistency between schema and code

CREATE TABLE IF NOT EXISTS exercises (
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

-- Migrate data from solutions to exercises if solutions table exists
INSERT INTO exercises (id, problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index, created_at, updated_at)
SELECT id, problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index, created_at, updated_at
FROM solutions
WHERE NOT EXISTS (SELECT 1 FROM exercises WHERE exercises.id = solutions.id);

-- Create indexes for exercises table
CREATE INDEX IF NOT EXISTS idx_exercises_problem_id ON exercises(problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);

-- User exercise progress tracking (updated from user_solution_progress)
CREATE TABLE IF NOT EXISTS user_exercise_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    points_earned INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate progress entries
    UNIQUE(user_id, exercise_id)
);

-- Migrate from user_solution_progress if it exists
INSERT INTO user_exercise_progress (user_id, username, exercise_id, problem_id, status, points_earned, completed_at, started_at, created_at, updated_at)
SELECT user_id, username, solution_id, problem_id, status, points_earned, completed_at, started_at, created_at, updated_at
FROM user_solution_progress usp
WHERE EXISTS (SELECT 1 FROM exercises e WHERE e.id = usp.solution_id)
  AND NOT EXISTS (SELECT 1 FROM user_exercise_progress uep WHERE uep.user_id = usp.user_id AND uep.exercise_id = usp.solution_id);

-- Create indexes for user progress
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_status ON user_exercise_progress(user_id, status);

SELECT 'Exercises table and progress tracking created successfully!' as message;
-- Rename Solutions to Exercises in AlphaRise Learning System
-- This script renames tables and columns from "solutions" to "exercises"

-- Step 1: Rename the solutions table to exercises
ALTER TABLE solutions RENAME TO exercises;

-- Step 2: Rename columns in problems table
ALTER TABLE problems RENAME COLUMN total_solutions TO total_exercises;

-- Step 3: Rename columns in user_solution_progress table to user_exercise_progress
ALTER TABLE user_solution_progress RENAME TO user_exercise_progress;
ALTER TABLE user_exercise_progress RENAME COLUMN solution_id TO exercise_id;

-- Step 4: Update indexes
DROP INDEX IF EXISTS idx_solutions_problem_id;
DROP INDEX IF EXISTS idx_solutions_difficulty;
DROP INDEX IF EXISTS idx_user_progress_user_id;
DROP INDEX IF EXISTS idx_user_progress_status;

CREATE INDEX IF NOT EXISTS idx_exercises_problem_id ON exercises(problem_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_progress_status ON user_exercise_progress(user_id, status);

-- Step 5: Update the dummy data to reflect the new naming
UPDATE exercises SET 
  title = REPLACE(title, 'Solution', 'Exercise'),
  description = REPLACE(description, 'solution', 'exercise');

-- Success message
SELECT 'Successfully renamed Solutions to Exercises!' as message;
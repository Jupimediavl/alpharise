-- Seed dummy data for learning system
-- Creates 5 problems per user type with 4 solutions each

-- Insert Milestones first
INSERT INTO milestones (title, description, points_required, badge_icon, order_index) VALUES
('Getting Started', 'Complete your first solution', 5, '🌱', 1),
('Building Momentum', 'Reach 25 confidence points', 25, '⚡', 2), 
('Making Progress', 'Reach 50 confidence points', 50, '🚀', 3),
('Getting Confident', 'Reach 100 confidence points', 100, '💪', 4),
('Experienced', 'Reach 150 confidence points', 150, '🏆', 5),
('Master Level', 'Reach 200 confidence points', 200, '👑', 6);

-- Function to create problems and solutions for each user type
DO $$
DECLARE
    user_types TEXT[] := ARRAY['overthinker', 'nervous', 'rookie', 'updown', 'surface'];
    user_type TEXT;
    problem_id UUID;
    problem_num INTEGER;
    solution_num INTEGER;
    difficulties TEXT[] := ARRAY['easy', 'easy', 'medium', 'hard']; -- 2 easy, 1 medium, 1 hard
    points INTEGER[] := ARRAY[5, 5, 10, 15]; -- Corresponding points
BEGIN
    -- Loop through each user type
    FOREACH user_type IN ARRAY user_types
    LOOP
        -- Create 5 problems for each user type
        FOR problem_num IN 1..5 
        LOOP
            -- Insert problem
            INSERT INTO problems (title, description, user_type, order_index, total_solutions)
            VALUES (
                'Problem ' || problem_num,
                'Description for problem ' || problem_num || ' targeting ' || user_type || ' users',
                user_type,
                problem_num,
                4
            ) RETURNING id INTO problem_id;

            -- Create 4 solutions for each problem
            FOR solution_num IN 1..4
            LOOP
                INSERT INTO solutions (
                    problem_id, 
                    title, 
                    description, 
                    content,
                    difficulty, 
                    points_reward, 
                    estimated_minutes,
                    order_index
                ) VALUES (
                    problem_id,
                    'Solution ' || solution_num,
                    'Description for solution ' || solution_num || ' of problem ' || problem_num,
                    'Content for solution ' || solution_num || '. This will contain the actual learning material.',
                    difficulties[solution_num],
                    points[solution_num],
                    CASE 
                        WHEN difficulties[solution_num] = 'easy' THEN 10
                        WHEN difficulties[solution_num] = 'medium' THEN 15
                        ELSE 20
                    END,
                    solution_num
                );
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Show summary
SELECT 
    'Data seeded successfully!' as message,
    (SELECT COUNT(*) FROM problems) as total_problems,
    (SELECT COUNT(*) FROM solutions) as total_solutions,
    (SELECT COUNT(*) FROM milestones) as total_milestones;
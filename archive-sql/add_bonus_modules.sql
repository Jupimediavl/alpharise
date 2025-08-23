-- Add bonus modules to existing learning system
-- Extends user_type enum to include intimacy_boost and body_confidence

-- Update the check constraint on problems table to include new user types
ALTER TABLE problems DROP CONSTRAINT IF EXISTS problems_user_type_check;
ALTER TABLE problems ADD CONSTRAINT problems_user_type_check 
    CHECK (user_type IN ('overthinker', 'nervous', 'rookie', 'updown', 'surface', 'intimacy_boost', 'body_confidence'));

-- Insert dummy problems for Intimacy Boost module
INSERT INTO problems (title, description, user_type, order_index) VALUES
('Intimacy Problem 1', 'Description for intimacy problem 1 targeting deep connection skills', 'intimacy_boost', 1),
('Intimacy Problem 2', 'Description for intimacy problem 2 targeting emotional vulnerability', 'intimacy_boost', 2),
('Intimacy Problem 3', 'Description for intimacy problem 3 targeting authentic expression', 'intimacy_boost', 3),
('Intimacy Problem 4', 'Description for intimacy problem 4 targeting meaningful conversations', 'intimacy_boost', 4),
('Intimacy Problem 5', 'Description for intimacy problem 5 targeting long-term relationship building', 'intimacy_boost', 5);

-- Insert dummy problems for Body Confidence module  
INSERT INTO problems (title, description, user_type, order_index) VALUES
('Body Confidence Problem 1', 'Description for body confidence problem 1 targeting physical presence', 'body_confidence', 1),
('Body Confidence Problem 2', 'Description for body confidence problem 2 targeting posture and movement', 'body_confidence', 2),
('Body Confidence Problem 3', 'Description for body confidence problem 3 targeting body language mastery', 'body_confidence', 3),
('Body Confidence Problem 4', 'Description for body confidence problem 4 targeting physical energy', 'body_confidence', 4),
('Body Confidence Problem 5', 'Description for body confidence problem 5 targeting total body confidence', 'body_confidence', 5);

-- Insert dummy exercises for Intimacy Boost problems
-- Problem 1 exercises
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Intimacy Exercise 1', 'Description for intimacy exercise 1', 'Content for intimacy exercise 1 with step-by-step instructions', 'easy', 5, 10, 1
FROM problems p WHERE p.title = 'Intimacy Problem 1' AND p.user_type = 'intimacy_boost';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Intimacy Exercise 2', 'Description for intimacy exercise 2', 'Content for intimacy exercise 2 with step-by-step instructions', 'medium', 10, 15, 2
FROM problems p WHERE p.title = 'Intimacy Problem 1' AND p.user_type = 'intimacy_boost';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Intimacy Exercise 3', 'Description for intimacy exercise 3', 'Content for intimacy exercise 3 with step-by-step instructions', 'hard', 15, 20, 3
FROM problems p WHERE p.title = 'Intimacy Problem 1' AND p.user_type = 'intimacy_boost';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Intimacy Exercise 4', 'Description for intimacy exercise 4', 'Content for intimacy exercise 4 with step-by-step instructions', 'medium', 10, 12, 4
FROM problems p WHERE p.title = 'Intimacy Problem 1' AND p.user_type = 'intimacy_boost';

-- Repeat for other intimacy problems (2-5)
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Intimacy Exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4),
       'Description for intimacy exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4),
       'Content for intimacy exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4) || ' with step-by-step instructions',
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'easy'
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'medium'
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'hard'
            ELSE 'medium' END,
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 5
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 10
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 15
            ELSE 10 END,
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 10
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 15
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 20
            ELSE 12 END,
       ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)
FROM problems p 
CROSS JOIN generate_series(1,4) 
WHERE p.user_type = 'intimacy_boost' AND p.order_index > 1;

-- Insert dummy exercises for Body Confidence problems
-- Problem 1 exercises  
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Body Exercise 1', 'Description for body exercise 1', 'Content for body exercise 1 with step-by-step instructions', 'easy', 5, 10, 1
FROM problems p WHERE p.title = 'Body Confidence Problem 1' AND p.user_type = 'body_confidence';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Body Exercise 2', 'Description for body exercise 2', 'Content for body exercise 2 with step-by-step instructions', 'medium', 10, 15, 2
FROM problems p WHERE p.title = 'Body Confidence Problem 1' AND p.user_type = 'body_confidence';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Body Exercise 3', 'Description for body exercise 3', 'Content for body exercise 3 with step-by-step instructions', 'hard', 15, 20, 3
FROM problems p WHERE p.title = 'Body Confidence Problem 1' AND p.user_type = 'body_confidence';

INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Body Exercise 4', 'Description for body exercise 4', 'Content for body exercise 4 with step-by-step instructions', 'medium', 10, 12, 4
FROM problems p WHERE p.title = 'Body Confidence Problem 1' AND p.user_type = 'body_confidence';

-- Repeat for other body confidence problems (2-5)
INSERT INTO exercises (problem_id, title, description, content, difficulty, points_reward, estimated_minutes, order_index)
SELECT p.id, 'Body Exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4),
       'Description for body exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4),
       'Content for body exercise ' || ((ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)) + (p.order_index - 1) * 4) || ' with step-by-step instructions',
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 'easy'
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 'medium'
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 'hard'
            ELSE 'medium' END,
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 5
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 10
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 15
            ELSE 10 END,
       CASE WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 1 THEN 10
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 2 THEN 15
            WHEN ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id) = 3 THEN 20
            ELSE 12 END,
       ROW_NUMBER() OVER (PARTITION BY p.id ORDER BY p.id)
FROM problems p 
CROSS JOIN generate_series(1,4) 
WHERE p.user_type = 'body_confidence' AND p.order_index > 1;

-- Success message
SELECT 'Bonus modules (Intimacy Boost & Body Confidence) added successfully!' as message,
       COUNT(CASE WHEN user_type = 'intimacy_boost' THEN 1 END) as intimacy_problems,
       COUNT(CASE WHEN user_type = 'body_confidence' THEN 1 END) as body_confidence_problems
FROM problems 
WHERE user_type IN ('intimacy_boost', 'body_confidence');
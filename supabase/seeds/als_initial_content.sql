-- =====================================================
-- AlphaRise ALS - Initial Content Seed Data
-- =====================================================

-- Insert Learning Modules for each coach
INSERT INTO learning_modules (coach_id, module_code, title, subtitle, description, difficulty_level, estimated_duration, unlock_at_score, order_priority, tags, is_premium) VALUES
-- Blake (Performance Anxiety)
('blake', 'BLAKE_ANXIETY_101', 'Understanding Your Anxiety', 'The science behind performance anxiety', 'Learn what causes performance anxiety and how your mind and body respond to pressure. This foundational module will help you understand the root causes and begin your journey to confidence.', 1, 45, 0, 1, '["anxiety", "fundamentals", "psychology"]', false),
('blake', 'BLAKE_BREATHING_201', 'Mastering Calm Through Breathing', 'Powerful techniques to control your nervous system', 'Discover scientifically-proven breathing techniques that instantly calm your nerves and boost your confidence in high-pressure situations.', 2, 60, 20, 2, '["breathing", "techniques", "relaxation"]', false),
('blake', 'BLAKE_CONFIDENCE_301', 'Building Unshakeable Confidence', 'Transform anxiety into power', 'Advanced strategies to build lasting confidence and turn your anxiety into a source of strength and motivation.', 3, 90, 40, 3, '["confidence", "advanced", "transformation"]', true),

-- Chase (Stamina & Control)
('chase', 'CHASE_PHYSIOLOGY_101', 'The Science of Control', 'Understanding your body''s responses', 'Master the physiological aspects of arousal and control. Learn how your body works and how to optimize your performance.', 1, 45, 0, 1, '["physiology", "fundamentals", "control"]', false),
('chase', 'CHASE_TECHNIQUES_201', 'Proven Control Techniques', 'Methods that actually work', 'Learn and practice time-tested techniques including the start-stop method, squeeze technique, and mental strategies for lasting control.', 2, 75, 25, 2, '["techniques", "practice", "control"]', false),
('chase', 'CHASE_MASTERY_301', 'Complete Mastery System', 'Achieve permanent results', 'Combine physical and mental techniques to achieve complete mastery and permanent improvements in your performance.', 3, 120, 50, 3, '["mastery", "advanced", "permanent"]', true),

-- Logan (Social Confidence)
('logan', 'LOGAN_SOCIAL_101', 'Social Dynamics Decoded', 'Understanding human interaction', 'Learn the fundamental principles of social dynamics, body language, and how to create instant connections with anyone.', 1, 60, 0, 1, '["social", "communication", "basics"]', false),
('logan', 'LOGAN_CONVERSATION_201', 'Conversation Mastery', 'Never run out of things to say', 'Master the art of engaging conversation, storytelling, and creating emotional connections that leave lasting impressions.', 2, 90, 30, 2, '["conversation", "charisma", "connection"]', false),
('logan', 'LOGAN_APPROACH_301', 'Fearless Approach System', 'Confidence in any situation', 'Overcome approach anxiety and learn to confidently start conversations with anyone, anywhere, anytime.', 3, 120, 45, 3, '["approach", "confidence", "advanced"]', true);

-- Insert Sample Lessons
INSERT INTO lessons (module_id, lesson_number, title, description, content_type, content_data, duration_minutes, xp_reward, coins_reward) VALUES
-- Blake Module 1 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_ANXIETY_101'), 1, 'What is Performance Anxiety?', 'Understanding the root causes', 'video', '{"video_url": "https://example.com/video1", "transcript": "...", "quiz": []}', 15, 20, 10),
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_ANXIETY_101'), 2, 'The Mind-Body Connection', 'How thoughts affect performance', 'interactive', '{"content": "...", "exercises": []}', 20, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_ANXIETY_101'), 3, 'Breaking the Anxiety Cycle', 'Practical first steps', 'mixed', '{"video": "...", "text": "...", "exercises": []}', 25, 30, 15),

-- Chase Module 1 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_PHYSIOLOGY_101'), 1, 'Understanding Your Body', 'The arousal response explained', 'video', '{"video_url": "...", "diagrams": []}', 20, 20, 10),
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_PHYSIOLOGY_101'), 2, 'Physical vs Mental Factors', 'What really affects control', 'text', '{"content": "...", "images": []}', 15, 20, 10),
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_PHYSIOLOGY_101'), 3, 'Setting Realistic Goals', 'Creating your improvement plan', 'interactive', '{"planner": "...", "calculator": "..."}', 20, 25, 12),

-- Logan Module 1 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 1, 'Reading Social Cues', 'Understanding non-verbal communication', 'video', '{"video_url": "...", "examples": []}', 25, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 2, 'Body Language Basics', 'Project confidence instantly', 'interactive', '{"simulator": "...", "exercises": []}', 20, 20, 10),
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 3, 'First Impressions Matter', 'Make them count', 'mixed', '{"video": "...", "checklist": "..."}', 25, 30, 15);

-- Insert Micro-Learnings
INSERT INTO micro_learnings (coach_id, title, content, content_type, difficulty, xp_reward, tags) VALUES
('blake', '2-Minute Calm', 'Take 2 minutes right now: Breathe in for 4, hold for 4, out for 4. Repeat 8 times. Notice how you feel.', 'tip', 1, 5, '["breathing", "quick"]'),
('blake', 'Confidence Mantra', 'Repeat: "I am calm, capable, and in control. Anxiety is just excitement without breath."', 'quote', 1, 5, '["mindset", "affirmation"]'),
('blake', 'The 5-4-3-2-1 Technique', 'Ground yourself: Name 5 things you see, 4 you hear, 3 you touch, 2 you smell, 1 you taste.', 'tip', 2, 8, '["anxiety", "technique"]'),

('chase', 'Kegel Quick Practice', 'Contract pelvic floor muscles for 3 seconds, release for 3. Repeat 10 times. Do this 3x daily.', 'tip', 1, 5, '["exercise", "physical"]'),
('chase', 'Mental Distraction', 'During intimacy, try counting backwards from 100 by 7s. Keeps you present but not overfocused.', 'tip', 2, 8, '["mental", "technique"]'),
('chase', 'Progress Tracking', 'Keep a private journal. Note duration, comfort level, and what worked. Patterns will emerge.', 'tip', 1, 5, '["tracking", "improvement"]'),

('logan', 'The 3-Second Rule', 'See someone interesting? You have 3 seconds to approach before your brain talks you out of it.', 'tip', 2, 8, '["approach", "confidence"]'),
('logan', 'Conversation Starter', 'Best opener: "Hi, I noticed [specific observation]. I''m [name]." Simple, genuine, effective.', 'tip', 1, 5, '["conversation", "opener"]'),
('logan', 'Eye Contact Practice', 'Today''s challenge: Hold eye contact 1 second longer than comfortable with everyone you meet.', 'challenge', 2, 10, '["practice", "confidence"]');

-- Insert Daily Challenges
INSERT INTO daily_challenges (coach_id, challenge_type, title, description, difficulty, xp_reward, coins_reward, success_criteria) VALUES
('blake', 'mental', 'Morning Confidence Ritual', 'Start your day with 5 minutes of breathing exercises and positive affirmations', 1, 30, 15, '{"duration": 5, "completed": true}'),
('blake', 'physical', 'Progressive Muscle Relaxation', 'Practice PMR technique before bed tonight', 2, 40, 20, '{"duration": 10, "completed": true}'),
('blake', 'social', 'Share Your Success', 'Tell someone about a recent win or achievement', 3, 50, 25, '{"shared": true}'),

('chase', 'physical', 'Stamina Training', 'Complete your daily exercise routine', 2, 40, 20, '{"exercises_done": true}'),
('chase', 'tracking', 'Progress Journal', 'Log today''s practice and note improvements', 1, 30, 15, '{"journal_entry": true}'),
('chase', 'mental', 'Mindfulness Session', '10-minute meditation focusing on body awareness', 2, 35, 18, '{"duration": 10}'),

('logan', 'social', 'Start 3 Conversations', 'Initiate conversations with 3 new people today', 2, 50, 25, '{"conversations": 3}'),
('logan', 'physical', 'Power Pose Practice', 'Hold a power pose for 2 minutes before leaving home', 1, 25, 12, '{"duration": 2}'),
('logan', 'social', 'Give 5 Compliments', 'Give genuine compliments to 5 different people', 2, 45, 22, '{"compliments": 5}');

-- Insert Achievements
INSERT INTO achievements (code, title, description, category, requirements, xp_reward, coins_reward, badge_type) VALUES
('FIRST_LESSON', 'First Steps', 'Complete your first lesson', 'progress', '{"lessons_completed": 1}', 50, 25, 'bronze'),
('WEEK_WARRIOR', 'Week Warrior', 'Maintain a 7-day streak', 'progress', '{"streak_days": 7}', 100, 50, 'silver'),
('MONTH_MASTER', 'Month Master', 'Maintain a 30-day streak', 'progress', '{"streak_days": 30}', 500, 250, 'gold'),
('CONFIDENCE_BOOST', 'Confidence Boost', 'Increase confidence score by 10 points', 'progress', '{"confidence_increase": 10}', 200, 100, 'silver'),
('SOCIAL_BUTTERFLY', 'Social Butterfly', 'Complete 10 social challenges', 'social', '{"social_challenges": 10}', 300, 150, 'gold'),
('BREAKTHROUGH', 'Breakthrough Moment', 'Achieve a major breakthrough', 'special', '{"breakthrough": true}', 1000, 500, 'platinum'),
('COMPLETIONIST', 'Completionist', 'Complete an entire module', 'mastery', '{"modules_completed": 1}', 400, 200, 'gold'),
('SPEED_LEARNER', 'Speed Learner', 'Complete 5 lessons in one day', 'progress', '{"daily_lessons": 5}', 150, 75, 'silver'),
('NIGHT_OWL', 'Night Owl', 'Complete lessons after 10 PM for 7 days', 'special', '{"night_sessions": 7}', 200, 100, 'silver'),
('EARLY_BIRD', 'Early Bird', 'Complete lessons before 7 AM for 7 days', 'special', '{"morning_sessions": 7}', 200, 100, 'silver');

-- Insert Milestones
INSERT INTO milestones (name, description, milestone_type, threshold_value, xp_reward, coins_reward) VALUES
('Level 5', 'Reach Level 5', 'level', 5, 500, 250),
('Level 10', 'Reach Level 10', 'level', 10, 1000, 500),
('1000 XP', 'Earn 1000 total XP', 'xp', 1000, 200, 100),
('5000 XP', 'Earn 5000 total XP', 'xp', 5000, 500, 250),
('10 Lessons', 'Complete 10 lessons', 'lessons', 10, 300, 150),
('25 Lessons', 'Complete 25 lessons', 'lessons', 25, 750, 375),
('Confidence 60', 'Reach 60 confidence score', 'confidence', 60, 600, 300),
('Confidence 80', 'Reach 80 confidence score', 'confidence', 80, 1200, 600);
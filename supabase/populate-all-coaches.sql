-- =====================================================
-- AlphaRise ALS - Complete Content Population for All 5 Coaches
-- Run this after creating the tables
-- =====================================================

-- Insert learning modules for all 5 coaches
INSERT INTO learning_modules (coach_id, module_code, title, subtitle, description, difficulty_level, estimated_duration, unlock_at_score, order_priority, tags, is_premium) VALUES

-- BLAKE (Confidence & Self-Esteem)
('blake', 'BLAKE_CONFIDENCE_101', 'Building Unshakeable Confidence', 'Transform anxiety into power', 'Learn to turn your nervous energy into confident action with proven techniques and exercises.', 1, 60, 0, 1, '["confidence", "anxiety", "fundamentals"]', false),
('blake', 'BLAKE_CONFIDENCE_201', 'Advanced Confidence Mastery', 'Own every room you enter', 'Master advanced confidence techniques for high-stakes situations and leadership roles.', 3, 90, 70, 2, '["confidence", "leadership", "advanced"]', true),
('blake', 'BLAKE_MINDSET_101', 'Mindset Revolution', 'Rewire your inner voice', 'Transform limiting beliefs into empowering thoughts that drive success.', 2, 75, 50, 3, '["mindset", "beliefs", "psychology"]', false),

-- CHASE (Sexual Confidence & Control)
('chase', 'CHASE_CONTROL_101', 'Mastering Self Control', 'Develop lasting control and stamina', 'Advanced techniques for building control and stamina in high-pressure situations.', 1, 90, 0, 1, '["control", "stamina", "techniques"]', false),
('chase', 'CHASE_CONFIDENCE_201', 'Sexual Confidence Mastery', 'Become irresistibly confident', 'Build magnetic sexual confidence that attracts and captivates naturally.', 3, 120, 70, 2, '["sexual_confidence", "attraction", "advanced"]', true),
('chase', 'CHASE_PERFORMANCE_101', 'Peak Performance Protocols', 'Optimize your physical and mental game', 'Comprehensive system for maximizing performance in all areas of life.', 2, 85, 45, 3, '["performance", "optimization", "health"]', false),

-- LOGAN (Social Confidence & Communication)
('logan', 'LOGAN_SOCIAL_101', 'Social Confidence Mastery', 'Navigate any social situation with ease', 'Master the art of social interactions and build genuine connections.', 1, 75, 0, 1, '["social", "communication", "confidence"]', false),
('logan', 'LOGAN_CHARISMA_201', 'Magnetic Charisma', 'Become the most interesting person in the room', 'Develop irresistible charisma that draws people to you naturally.', 3, 95, 75, 2, '["charisma", "influence", "advanced"]', true),
('logan', 'LOGAN_CONVERSATIONS_101', 'Conversation Mastery', 'Never run out of things to say', 'Master the art of engaging conversations that create lasting connections.', 2, 70, 50, 3, '["conversations", "storytelling", "social_skills"]', false),

-- MASON (Entrepreneurship & Success Mindset)
('mason', 'MASON_ENTREPRENEUR_101', 'Entrepreneur Foundations', 'Build your success mindset', 'Develop the mental frameworks and habits of successful entrepreneurs.', 1, 100, 0, 1, '["entrepreneurship", "mindset", "success"]', false),
('mason', 'MASON_WEALTH_201', 'Wealth Creation Mastery', 'Build sustainable wealth systems', 'Advanced strategies for creating multiple income streams and building wealth.', 3, 150, 80, 2, '["wealth", "business", "advanced"]', true),
('mason', 'MASON_LEADERSHIP_101', 'Leadership Excellence', 'Lead with confidence and vision', 'Master the skills needed to lead teams and inspire others to achieve greatness.', 2, 90, 55, 3, '["leadership", "management", "influence"]', false),

-- KNOX (Masculine Energy & Purpose)
('knox', 'KNOX_MASCULINE_101', 'Masculine Energy Foundations', 'Reclaim your authentic masculine power', 'Discover and embody your true masculine essence with confidence and purpose.', 1, 85, 0, 1, '["masculinity", "energy", "purpose"]', false),
('knox', 'KNOX_PURPOSE_201', 'Purpose-Driven Life', 'Find and live your true calling', 'Discover your unique purpose and create a life aligned with your deepest values.', 3, 110, 75, 2, '["purpose", "meaning", "advanced"]', true),
('knox', 'KNOX_STRENGTH_101', 'Inner Strength Mastery', 'Build unbreakable mental resilience', 'Develop the inner strength to overcome any obstacle and achieve your goals.', 2, 80, 45, 3, '["strength", "resilience", "mental_health"]', false)

ON CONFLICT (module_code) DO NOTHING;

-- Insert lessons for each module
INSERT INTO lessons (module_id, lesson_number, title, description, content_type, duration_minutes, xp_reward, coins_reward) VALUES

-- Blake's Confidence 101 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_CONFIDENCE_101'), 1, 'Understanding True Confidence', 'Learn what real confidence looks like and how it differs from arrogance', 'video', 20, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_CONFIDENCE_101'), 2, 'Overcoming Self-Doubt', 'Practical techniques to silence your inner critic and build self-trust', 'interactive', 25, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'BLAKE_CONFIDENCE_101'), 3, 'Body Language of Confidence', 'Master the physical presence that commands respect and attention', 'video', 30, 35, 18),

-- Chase's Control 101 Lessons  
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_CONTROL_101'), 1, 'The Science of Self-Control', 'Understanding how your body and mind work together for peak performance', 'video', 30, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_CONTROL_101'), 2, 'Breathing and Focus Techniques', 'Master advanced breathing patterns for control and confidence', 'interactive', 35, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'CHASE_CONTROL_101'), 3, 'Mental Conditioning Protocols', 'Build lasting mental strength through proven conditioning methods', 'mixed', 40, 35, 18),

-- Logan's Social 101 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 1, 'Reading Social Cues', 'Master the subtle art of understanding social dynamics and body language', 'video', 25, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 2, 'Starting Conversations Naturally', 'Learn to initiate conversations that flow naturally and build connection', 'interactive', 30, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'LOGAN_SOCIAL_101'), 3, 'Building Authentic Connections', 'Create genuine relationships that last beyond first impressions', 'mixed', 35, 35, 18),

-- Mason's Entrepreneur 101 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'MASON_ENTREPRENEUR_101'), 1, 'Success Mindset Foundation', 'Develop the mental frameworks that separate winners from everyone else', 'video', 35, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'MASON_ENTREPRENEUR_101'), 2, 'Goal Setting Like a CEO', 'Master advanced goal-setting strategies used by top entrepreneurs', 'interactive', 40, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'MASON_ENTREPRENEUR_101'), 3, 'Building Your Success Habits', 'Create daily habits that compound into extraordinary results', 'mixed', 45, 35, 18),

-- Knox's Masculine 101 Lessons
((SELECT id FROM learning_modules WHERE module_code = 'KNOX_MASCULINE_101'), 1, 'Authentic Masculine Energy', 'Understand and embody healthy masculine energy in the modern world', 'video', 30, 25, 12),
((SELECT id FROM learning_modules WHERE module_code = 'KNOX_MASCULINE_101'), 2, 'Purpose and Direction', 'Discover your unique mission and create a life of meaning', 'interactive', 35, 30, 15),
((SELECT id FROM learning_modules WHERE module_code = 'KNOX_MASCULINE_101'), 3, 'Inner Strength Development', 'Build the mental and emotional strength to face any challenge', 'mixed', 40, 35, 18)

ON CONFLICT DO NOTHING;

-- Insert micro-learnings for all coaches
INSERT INTO micro_learnings (coach_id, title, content, content_type, difficulty, xp_reward, tags) VALUES

-- Blake's Micro-learnings
('blake', '2-Minute Confidence Boost', 'Stand tall, take 5 deep breaths, and remind yourself of one thing you accomplished today. Your body language affects your mind more than you think.', 'tip', 1, 5, '["confidence", "quick", "breathing"]'),
('blake', 'The Power Pose Secret', 'Before any important moment, spend 2 minutes in a power pose - hands on hips, chest out, chin up. This literally changes your hormone levels.', 'tip', 1, 5, '["confidence", "body_language", "hormones"]'),
('blake', 'Reframe Your Inner Voice', 'Instead of "I have to," say "I get to." This simple shift changes your entire relationship with challenges and opportunities.', 'tip', 2, 8, '["mindset", "reframing", "psychology"]'),

-- Chase's Micro-learnings
('chase', 'Focus Reset Technique', 'When you feel overwhelmed, count backwards from 100 by 7s. This redirects your mental energy and builds immediate control.', 'tip', 2, 8, '["focus", "mental", "control"]'),
('chase', '4-7-8 Breathing Protocol', 'Inhale for 4, hold for 7, exhale for 8. This activates your parasympathetic nervous system for instant calm and control.', 'exercise', 1, 5, '["breathing", "control", "calm"]'),
('chase', 'Cold Shower Challenge', 'End every shower with 30 seconds of cold water. This builds mental toughness and stress resilience daily.', 'exercise', 3, 10, '["discipline", "resilience", "challenge"]'),

-- Logan's Micro-learnings
('logan', 'Universal Conversation Starter', 'Best opener: "Hi, I noticed [specific observation]. I am [name]." Simple, genuine, and works in any situation.', 'tip', 1, 5, '["social", "conversation", "opener"]'),
('logan', 'The 3-Second Rule', 'When you see someone you want to talk to, you have 3 seconds to approach before your brain talks you out of it. Trust the instinct.', 'tip', 2, 8, '["social", "action", "confidence"]'),
('logan', 'Active Listening Hack', 'Repeat the last 2-3 words someone said as a question. It shows you are listening and keeps conversations flowing naturally.', 'tip', 2, 8, '["listening", "conversation", "connection"]'),

-- Mason's Micro-learnings
('mason', 'The CEO Morning Question', 'Every morning ask: "What is the ONE thing I can do today that will have the biggest impact on my goals?" Then do that first.', 'tip', 2, 8, '["productivity", "priorities", "success"]'),
('mason', '10-10-10 Decision Framework', 'For any decision, ask: How will I feel about this in 10 minutes, 10 months, and 10 years? This clarifies what really matters.', 'tip', 2, 8, '["decisions", "framework", "clarity"]'),
('mason', 'Investment Mindset Shift', 'Instead of asking "How much does this cost?" ask "What is the ROI?" This changes your relationship with money and opportunities.', 'tip', 3, 10, '["money", "investment", "mindset"]'),

-- Knox's Micro-learnings
('knox', 'Daily Purpose Check', 'Every evening, ask yourself: "Did I act in alignment with my values today?" This builds authentic masculine integrity.', 'tip', 2, 8, '["purpose", "values", "integrity"]'),
('knox', 'Strength Through Service', 'True masculine strength is shown through how you serve and protect others, not through dominance or aggression.', 'quote', 1, 5, '["strength", "service", "masculinity"]'),
('knox', 'The Warrior Mindset', 'A warrior is not someone who always wins, but someone who never gives up. Your resilience defines your masculinity.', 'quote', 2, 8, '["resilience", "warrior", "mindset"]')

ON CONFLICT DO NOTHING;

-- Insert daily challenges for all coaches
INSERT INTO daily_challenges (coach_id, challenge_type, title, description, difficulty, xp_reward, coins_reward, success_criteria, tags) VALUES

-- Blake's Challenges
('blake', 'mental', 'Morning Confidence Ritual', 'Start your day with 5 minutes of positive self-talk and power poses in front of the mirror', 1, 30, 15, '{"duration": 5, "completed": true}', '["confidence", "morning", "routine"]'),
('blake', 'social', 'Compliment Three Strangers', 'Give genuine compliments to three different people today and notice how it affects both them and you', 2, 40, 20, '{"compliments_given": 3, "genuine": true}', '["confidence", "social", "kindness"]'),
('blake', 'physical', 'Power Walk Challenge', 'Take a 15-minute walk with perfect posture and confident body language', 1, 25, 12, '{"duration": 15, "posture_focus": true}', '["confidence", "body_language", "exercise"]'),

-- Chase's Challenges
('chase', 'physical', 'Control Practice Session', 'Practice your breathing and focus techniques for 10 minutes without distractions', 2, 40, 20, '{"duration": 10, "technique_practiced": true}', '["control", "practice", "technique"]'),
('chase', 'mental', 'Discipline Stack Challenge', 'Complete 5 small tasks you have been avoiding, building momentum and discipline', 3, 50, 25, '{"tasks_completed": 5, "avoided_tasks": true}', '["discipline", "productivity", "momentum"]'),
('chase', 'physical', 'Cold Exposure Protocol', 'Take a cold shower or do ice bath for 2 minutes, building mental toughness', 3, 45, 22, '{"duration": 2, "cold_exposure": true}', '["discipline", "resilience", "toughness"]'),

-- Logan's Challenges
('logan', 'social', 'Start 3 Conversations', 'Initiate meaningful conversations with 3 different people today', 2, 50, 25, '{"conversations": 3, "meaningful": true}', '["social", "conversation", "practice"]'),
('logan', 'social', 'Active Listening Challenge', 'Practice active listening in every conversation today, asking follow-up questions', 1, 35, 17, '{"active_listening": true, "followup_questions": true}', '["listening", "conversation", "connection"]'),
('logan', 'social', 'Network Expansion', 'Meet one new person and exchange contact information or social media', 2, 45, 22, '{"new_contact": 1, "info_exchanged": true}', '["networking", "relationships", "growth"]'),

-- Mason's Challenges
('mason', 'productivity', 'CEO Hour Challenge', 'Dedicate the first hour of your day to your most important goal, no distractions', 2, 45, 22, '{"duration": 60, "focused_work": true, "no_distractions": true}', '["productivity", "focus", "priorities"]'),
('mason', 'learning', 'Skill Investment', 'Spend 30 minutes learning something that will advance your career or business', 1, 35, 17, '{"duration": 30, "career_relevant": true}', '["learning", "skills", "growth"]'),
('mason', 'mindset', 'Success Visualization', 'Spend 10 minutes visualizing your goals as already achieved, feel the emotions', 1, 30, 15, '{"duration": 10, "emotional_connection": true}', '["visualization", "goals", "mindset"]'),

-- Knox's Challenges
('knox', 'mental', 'Purpose Reflection', 'Spend 15 minutes journaling about your core values and life purpose', 1, 35, 17, '{"duration": 15, "values_reflection": true}', '["purpose", "values", "reflection"]'),
('knox', 'physical', 'Strength Building Ritual', 'Do 20 push-ups or bodyweight exercises, connecting to your physical strength', 2, 40, 20, '{"exercises_completed": 20, "bodyweight": true}', '["strength", "fitness", "discipline"]'),
('knox', 'service', 'Act of Service', 'Perform one meaningful act of service for someone else without expecting anything back', 2, 50, 25, '{"service_act": 1, "meaningful": true, "no_expectation": true}', '["service", "masculinity", "giving"]')

ON CONFLICT DO NOTHING;

-- Insert achievements (universal for all coaches but some coach-specific ones)
INSERT INTO achievements (code, title, description, category, requirements, xp_reward, coins_reward, badge_type) VALUES

-- Universal Progress Achievements
('FIRST_LESSON', 'First Steps', 'Complete your first lesson in any module', 'progress', '{"lessons_completed": 1}', 50, 25, 'bronze'),
('LESSON_STREAK_7', 'Week Warrior', 'Complete lessons for 7 days in a row', 'progress', '{"streak_days": 7}', 100, 50, 'silver'),
('LESSON_STREAK_30', 'Monthly Master', 'Maintain a 30-day learning streak', 'progress', '{"streak_days": 30}', 300, 150, 'gold'),
('CONFIDENCE_BOOST', 'Confidence Boost', 'Increase your confidence score by 10 points', 'progress', '{"confidence_increase": 10}', 200, 100, 'gold'),
('PERFECT_WEEK', 'Perfect Week', 'Complete all daily challenges for 7 consecutive days', 'progress', '{"perfect_days": 7}', 250, 125, 'gold'),

-- Mastery Achievements
('MODULE_MASTER', 'Module Master', 'Complete any full learning module with 90%+ average quiz score', 'mastery', '{"module_completed": 1, "avg_score": 90}', 400, 200, 'platinum'),
('QUIZ_PERFECTIONIST', 'Quiz Perfectionist', 'Score 100% on 5 different quizzes', 'mastery', '{"perfect_quizzes": 5}', 300, 150, 'gold'),
('SPEED_LEARNER', 'Speed Learner', 'Complete 10 lessons in a single day', 'mastery', '{"lessons_per_day": 10}', 200, 100, 'silver'),

-- Social Achievements  
('SOCIAL_BUTTERFLY', 'Social Butterfly', 'Complete 20 social challenges across any coach', 'social', '{"social_challenges": 20}', 250, 125, 'gold'),
('CONVERSATION_MASTER', 'Conversation Master', 'Complete Logan Social Confidence module', 'social', '{"logan_social_completed": true}', 350, 175, 'gold'),

-- Special Coach-Specific Achievements
('BLAKE_CONFIDENCE_KING', 'Confidence King', 'Complete all Blake confidence modules', 'special', '{"blake_modules_completed": 3}', 500, 250, 'diamond'),
('CHASE_CONTROL_MASTER', 'Control Master', 'Complete all Chase control modules', 'special', '{"chase_modules_completed": 3}', 500, 250, 'diamond'),
('LOGAN_SOCIAL_EXPERT', 'Social Expert', 'Complete all Logan social modules', 'special', '{"logan_modules_completed": 3}', 500, 250, 'diamond'),
('MASON_SUCCESS_MOGUL', 'Success Mogul', 'Complete all Mason business modules', 'special', '{"mason_modules_completed": 3}', 500, 250, 'diamond'),
('KNOX_WARRIOR_KING', 'Warrior King', 'Complete all Knox masculine energy modules', 'special', '{"knox_modules_completed": 3}', 500, 250, 'diamond'),

-- Hidden Achievements
('NIGHT_OWL', 'Night Owl', 'Complete lessons after 10 PM for 5 consecutive days', 'hidden', '{"late_night_sessions": 5}', 150, 75, 'silver'),
('EARLY_BIRD', 'Early Bird', 'Complete lessons before 7 AM for 5 consecutive days', 'hidden', '{"early_morning_sessions": 5}', 150, 75, 'silver'),
('MARATHON_LEARNER', 'Marathon Learner', 'Spend 3+ hours learning in a single day', 'hidden', '{"single_day_minutes": 180}', 200, 100, 'gold'),
('COMEBACK_KING', 'Comeback King', 'Return to daily learning after a 30+ day break', 'hidden', '{"comeback_after_days": 30}', 300, 150, 'platinum')

ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_learning_modules_coach ON learning_modules(coach_id);
CREATE INDEX IF NOT EXISTS idx_learning_modules_active ON learning_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_lessons_active ON lessons(is_active);
CREATE INDEX IF NOT EXISTS idx_micro_learnings_coach ON micro_learnings(coach_id);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_coach ON daily_challenges(coach_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_date ON user_activity_log(activity_date);

-- Success message
SELECT 'Complete ALS content populated for all 5 coaches! 🎉' AS result;
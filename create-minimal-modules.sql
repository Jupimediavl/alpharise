-- Create minimal sample learning modules for testing ALS system
-- Run this in Supabase SQL Editor

-- Insert Chase's modules (minimal columns only)
INSERT INTO public.learning_modules (title, description, coach_id) VALUES
('Understanding PE Fundamentals', 'Learn the science and psychology behind premature ejaculation', 'chase'),
('Breathing and Relaxation Techniques', 'Master deep breathing and relaxation methods for better control', 'chase'),
('Start-Stop Technique Mastery', 'Learn and practice the foundational start-stop technique', 'chase'),
('Mental Focus and Confidence', 'Develop mental strategies and build sexual confidence', 'chase'),
('Advanced Control Methods', 'Master advanced techniques for lasting longer', 'chase'),
('Real-World Application', 'Apply your skills in real intimate situations', 'chase');

-- Insert Logan's modules
INSERT INTO public.learning_modules (title, description, coach_id) VALUES
('Social Confidence Foundations', 'Build the foundation of unshakeable social confidence', 'logan'),
('Body Language Mastery', 'Master non-verbal communication and confident body language', 'logan'),
('Conversation and Charisma', 'Develop engaging conversation skills and natural charisma', 'logan'),
('Approach and Social Anxiety', 'Overcome approach anxiety and social fears', 'logan'),
('Advanced Social Dynamics', 'Master complex social situations and leadership', 'logan'),
('Confidence in Dating', 'Apply your confidence specifically to dating and relationships', 'logan');

-- Insert Blake's modules
INSERT INTO public.learning_modules (title, description, coach_id) VALUES
('Understanding Performance Anxiety', 'Learn what causes performance anxiety and how to overcome it', 'blake'),
('Calm Mind Techniques', 'Master breathing and meditation techniques for performance', 'blake'),
('Building Performance Confidence', 'Develop unshakeable confidence in intimate situations', 'blake'),
('Pressure Situation Mastery', 'Learn to thrive under pressure and in challenging moments', 'blake'),
('Mental Resilience Training', 'Build lasting mental strength and emotional resilience', 'blake'),
('Transforming Anxiety to Power', 'Turn performance anxiety into confident energy', 'blake');

-- Create basic lessons for each module
INSERT INTO public.lessons (module_id, title, description, duration_minutes)
SELECT 
  id,
  'Introduction to ' || title,
  'An introduction to the concepts covered in this module',
  15
FROM public.learning_modules;

-- Success message
SELECT 
  'Minimal modules created successfully!' as message,
  COUNT(*) as total_modules,
  STRING_AGG(DISTINCT coach_id, ', ') as coaches
FROM public.learning_modules;
-- Create sample learning modules for testing ALS system (FIXED)
-- Run this in Supabase SQL Editor

-- First, ensure learning_modules table exists and has the right structure
CREATE TABLE IF NOT EXISTS public.learning_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  coach_id TEXT NOT NULL,
  difficulty_level INTEGER DEFAULT 1,
  estimated_duration INTEGER DEFAULT 15,
  content_type TEXT DEFAULT 'video',
  order_priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  is_premium BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Chase's modules (Premature Ejaculation)
INSERT INTO public.learning_modules (title, description, coach_id, difficulty_level, estimated_duration, content_type, order_priority, is_active, is_premium, tags) VALUES
('Understanding PE Fundamentals', 'Learn the science and psychology behind premature ejaculation', 'chase', 1, 20, 'video', 1, true, false, '{"fundamentals", "science", "psychology"}'),
('Breathing and Relaxation Techniques', 'Master deep breathing and relaxation methods for better control', 'chase', 1, 15, 'interactive', 2, true, false, '{"breathing", "relaxation", "control"}'),
('Start-Stop Technique Mastery', 'Learn and practice the foundational start-stop technique', 'chase', 2, 25, 'interactive', 3, true, false, '{"technique", "practice", "control"}'),
('Mental Focus and Confidence', 'Develop mental strategies and build sexual confidence', 'chase', 2, 18, 'mixed', 4, true, false, '{"mindset", "confidence", "mental"}'),
('Advanced Control Methods', 'Master advanced techniques for lasting longer', 'chase', 3, 30, 'interactive', 5, true, false, '{"advanced", "techniques", "mastery"}'),
('Real-World Application', 'Apply your skills in real intimate situations', 'chase', 3, 20, 'video', 6, true, false, '{"application", "real-world", "intimacy"}');

-- Insert Logan's modules (Confidence Building)
INSERT INTO public.learning_modules (title, description, coach_id, difficulty_level, estimated_duration, content_type, order_priority, is_active, is_premium, tags) VALUES
('Social Confidence Foundations', 'Build the foundation of unshakeable social confidence', 'logan', 1, 22, 'video', 1, true, false, '{"confidence", "social", "foundations"}'),
('Body Language Mastery', 'Master non-verbal communication and confident body language', 'logan', 1, 18, 'interactive', 2, true, false, '{"body language", "non-verbal", "presence"}'),
('Conversation and Charisma', 'Develop engaging conversation skills and natural charisma', 'logan', 2, 25, 'mixed', 3, true, false, '{"conversation", "charisma", "communication"}'),
('Approach and Social Anxiety', 'Overcome approach anxiety and social fears', 'logan', 2, 20, 'interactive', 4, true, false, '{"anxiety", "approach", "fears"}'),
('Advanced Social Dynamics', 'Master complex social situations and leadership', 'logan', 3, 28, 'video', 5, true, false, '{"social dynamics", "leadership", "advanced"}'),
('Confidence in Dating', 'Apply your confidence specifically to dating and relationships', 'logan', 3, 24, 'mixed', 6, true, false, '{"dating", "relationships", "confidence"}');

-- Insert Blake's modules (Performance Anxiety)
INSERT INTO public.learning_modules (title, description, coach_id, difficulty_level, estimated_duration, content_type, order_priority, is_active, is_premium, tags) VALUES
('Understanding Performance Anxiety', 'Learn what causes performance anxiety and how to overcome it', 'blake', 1, 19, 'video', 1, true, false, '{"anxiety", "understanding", "psychology"}'),
('Calm Mind Techniques', 'Master breathing and meditation techniques for performance', 'blake', 1, 16, 'interactive', 2, true, false, '{"breathing", "meditation", "calm"}'),
('Building Performance Confidence', 'Develop unshakeable confidence in intimate situations', 'blake', 2, 23, 'mixed', 3, true, false, '{"confidence", "performance", "intimate"}'),
('Pressure Situation Mastery', 'Learn to thrive under pressure and in challenging moments', 'blake', 2, 21, 'interactive', 4, true, false, '{"pressure", "thriving", "challenges"}'),
('Mental Resilience Training', 'Build lasting mental strength and emotional resilience', 'blake', 3, 26, 'video', 5, true, false, '{"resilience", "mental strength", "emotional"}'),
('Transforming Anxiety to Power', 'Turn performance anxiety into confident energy', 'blake', 3, 22, 'mixed', 6, true, false, '{"transformation", "power", "energy"}');

-- Also create lessons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT DEFAULT 'video',
  duration_minutes INTEGER DEFAULT 15,
  video_url TEXT,
  transcript TEXT,
  key_takeaways TEXT[],
  practice_exercises JSONB DEFAULT '[]',
  resources JSONB DEFAULT '[]',
  order_in_module INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample lessons for each module (just the first lesson for each)
WITH module_lessons AS (
  SELECT 
    id as module_id,
    title as module_title,
    coach_id
  FROM public.learning_modules
)
INSERT INTO public.lessons (module_id, title, description, content_type, duration_minutes, order_in_module)
SELECT 
  module_id,
  'Introduction to ' || module_title,
  'An introduction to the concepts and techniques covered in this module',
  'video',
  15,
  1
FROM module_lessons;

-- Grant permissions
GRANT ALL ON public.learning_modules TO authenticated;
GRANT ALL ON public.lessons TO authenticated;

-- Temporarily disable RLS
ALTER TABLE public.learning_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 
  'Sample modules created successfully!' as message,
  COUNT(*) as total_modules,
  STRING_AGG(DISTINCT coach_id, ', ') as coaches
FROM public.learning_modules;
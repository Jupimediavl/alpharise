# Solutions → Exercises Migration

## Manual Database Migration Required

The code has been updated to use "Exercises" instead of "Solutions", but you need to run a database migration to update your Supabase tables.

### Steps to Complete the Migration:

1. **Go to your Supabase Dashboard**
   - Visit your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Migration Script**
   - Copy and paste the contents of `rename_solutions_to_exercises.sql` into the SQL Editor
   - Execute the script

3. **Test the Learning System**
   - Visit `/learning?username=your_username` to test the updated system
   - All "Solutions" should now be called "Exercises"

### What the Migration Does:

✅ Renames `solutions` table → `exercises`  
✅ Renames `user_solution_progress` → `user_exercise_progress`  
✅ Updates column names (`solution_id` → `exercise_id`, `total_solutions` → `total_exercises`)  
✅ Updates indexes for better performance  
✅ Updates dummy data text to use "Exercise" terminology  

### Files Updated:

- `src/app/learning/page.tsx` - Main learning dashboard
- `src/app/learning/problem/[id]/page.tsx` - Individual problem page  
- `src/lib/supabase.ts` - Database interfaces and methods

All code now uses the new "Exercises" terminology and will work correctly once the database migration is complete.
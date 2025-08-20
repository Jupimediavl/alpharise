# Database Cleanup Guide 🧹

## 🎯 Complete Reset for Bot Testing

### Option 1: Clean Community Only (Recommended first)
**Keeps user accounts, removes only community posts**

1. **Check current state**:
   ```sql
   -- Run check_tables.sql to see current data
   ```

2. **Clean community content**:
   ```sql
   -- Run cleanup_community_only.sql
   ```

3. **Verify cleanup**:
   - Community should show 0 questions and 0 answers
   - Users remain intact for testing

### Option 2: Complete Database Reset
**⚠️ WARNING: Removes EVERYTHING including users!**

1. **Backup important data** (if needed):
   - Export any important configurations
   - Note down any custom settings

2. **Run complete cleanup**:
   ```sql
   -- Run cleanup_database.sql
   ```

3. **Clean Supabase Auth**:
   - Go to Supabase Dashboard → Authentication → Users
   - Select all users and delete them manually
   - This ensures auth and database are in sync

4. **Verify complete reset**:
   ```sql
   -- Run check_tables.sql to confirm all tables are empty
   ```

## 🤖 Bot Testing Workflow

### After Community Cleanup:

1. **Verify bot system is ready**:
   - Check `/admin` → Bot Management
   - Ensure bot tables exist and personalities are loaded
   - Create 2-3 test bots with different personalities

2. **Start bot automation**:
   - Click "Start Automation" in admin panel
   - Monitor console logs for bot activity
   - Bots should start posting questions and answers

3. **Test bot interactions**:
   - Manual triggers from bot details
   - Verify different personalities show in content
   - Check anti-fraud measures work

### After Complete Reset:

1. **Create test user account**:
   - Sign up with a test email
   - Verify user appears in admin panel
   - Check coin system works

2. **Test user-bot interactions**:
   - Post a question as user
   - Let bots answer it
   - Test voting system
   - Verify coin rewards work

## 📋 Verification Checklist

### ✅ After Community Cleanup:
- [ ] Questions table: 0 records
- [ ] Answers table: 0 records  
- [ ] Users table: existing users remain
- [ ] Bots table: bots remain configured
- [ ] Bot personalities: 4 default personalities exist

### ✅ After Complete Reset:
- [ ] All tables empty except bot system tables
- [ ] Supabase Auth users deleted
- [ ] Bot system functional
- [ ] Ready for fresh testing

## 🚨 Troubleshooting

### If cleanup fails:
1. **Foreign key constraints**: 
   - Run cleanup in correct order (answers → questions)
   - Check for any custom constraints

2. **Permission errors**:
   - Ensure you have admin access to Supabase
   - Check RLS policies aren't blocking deletion

3. **Tables don't exist**:
   - Some tables might not exist yet
   - This is normal for a new installation

### If bot system doesn't work after cleanup:
1. **Check bot tables exist**:
   ```sql
   -- Run check_tables.sql
   ```

2. **Ensure personalities are loaded**:
   - Should have 4 default personalities
   - If missing, re-run supabase_bot_system.sql

3. **Verify OpenAI key is configured**:
   - Check environment variables
   - Test in admin panel

## 🎉 Ready for Testing!

After cleanup, you'll have:
- ✅ Clean community ready for bot content
- ✅ Functional bot management system  
- ✅ Fresh environment for testing user interactions
- ✅ Ability to see bot personalities in action

Perfect for demonstrating the AI bot system! 🤖
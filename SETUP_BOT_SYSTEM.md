# Quick Bot System Setup

## 🚀 3-Step Setup

### Step 1: Deploy Database Schema
1. Open your **Supabase Dashboard** → **SQL Editor**
2. Copy the entire content from `supabase_bot_system.sql`
3. Paste and **Run** the SQL commands
4. ✅ Verify 5 new tables created: `bots`, `bot_personalities`, `bot_activities`, `bot_schedules`, `bot_interactions`

### Step 2: Add OpenAI API Key
Add to your `.env.local` file:
```
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
```

### Step 3: Test the System
1. Go to `/admin` in your app
2. Click **"Bot Management"** in sidebar
3. The error should be gone and you'll see:
   - Setup complete message
   - Analytics cards showing 0 (expected for new system)
   - 4 default personality templates
4. Try creating your first bot!

## ✅ That's it!

Once these steps are complete:
- The error in the admin panel will disappear
- You can create and manage bots through the UI
- Bots will start posting to your community automatically
- Full documentation available in `BOT_SYSTEM_DEPLOYMENT_GUIDE.md`

## 🆘 Need Help?

- **Error persists?** Check Supabase connection and RLS policies
- **OpenAI not working?** Verify API key and billing status
- **Bots not posting?** Start the automation engine in admin panel
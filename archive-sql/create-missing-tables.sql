-- Script pentru crearea tabelelor lipsă în Supabase
-- Rulează în Supabase SQL Editor

-- 1. Creează tabela xp_transactions
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    source_type VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Creează tabela coins_transactions  
CREATE TABLE IF NOT EXISTS public.coins_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(255),
    source_type VARCHAR(50),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coins_transactions ENABLE ROW LEVEL SECURITY;

-- 4. Creează policies pentru RLS
CREATE POLICY "Users can view own XP transactions" ON public.xp_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own XP transactions" ON public.xp_transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can view own coin transactions" ON public.coins_transactions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own coin transactions" ON public.coins_transactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- 5. Creează indexuri pentru performanță
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coins_transactions_user_id ON public.coins_transactions(user_id);

-- 6. Test inserare pentru verificare
SELECT 'Tables created successfully! You can now test lesson completion.' as status;
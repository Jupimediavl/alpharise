-- CHECK COIN_TRANSACTIONS TABLE STRUCTURE
-- Run this first to see what columns actually exist

-- Check if coin_transactions table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'coin_transactions' 
ORDER BY ordinal_position;

-- Check current data in coin_transactions
SELECT * FROM coin_transactions LIMIT 5;

-- Count records
SELECT count(*) as total_coin_transactions FROM coin_transactions;
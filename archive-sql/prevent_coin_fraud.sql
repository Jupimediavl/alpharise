-- Prevent coin fraud by adding database-level constraints
-- Run this in Supabase SQL Editor

-- 1. Function to prevent self-voting on answers
CREATE OR REPLACE FUNCTION prevent_self_voting()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if author is trying to vote on their own answer
  IF NEW.author_id = ANY(NEW.voted_by) THEN
    RAISE EXCEPTION 'Cannot vote on your own answer';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for self-voting prevention
DROP TRIGGER IF EXISTS check_self_voting ON answers;
CREATE TRIGGER check_self_voting
  BEFORE INSERT OR UPDATE OF voted_by ON answers
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_voting();

-- 2. Function to track coin changes for audit
CREATE TABLE IF NOT EXISTS coin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text NOT NULL,
  action text NOT NULL, -- 'answer_deleted', 'question_posted', 'vote_received', etc.
  amount integer NOT NULL, -- positive for gains, negative for losses
  balance_before integer,
  balance_after integer,
  related_content_id text,
  created_at timestamptz DEFAULT now()
);

-- Function to log coin changes
CREATE OR REPLACE FUNCTION log_coin_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.coins != NEW.coins THEN
    INSERT INTO coin_audit_log (
      username,
      action,
      amount,
      balance_before,
      balance_after
    ) VALUES (
      NEW.username,
      'manual_update',
      NEW.coins - OLD.coins,
      OLD.coins,
      NEW.coins
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for coin audit
DROP TRIGGER IF EXISTS audit_coin_changes ON users;
CREATE TRIGGER audit_coin_changes
  AFTER UPDATE OF coins ON users
  FOR EACH ROW
  EXECUTE FUNCTION log_coin_change();

-- 3. Function to handle answer deletion with proper coin deduction
CREATE OR REPLACE FUNCTION handle_answer_deletion()
RETURNS TRIGGER AS $$
DECLARE
  v_coin_penalty integer := 0;
  v_user_balance integer;
BEGIN
  -- Calculate coin penalty (coins earned from this answer)
  v_coin_penalty := COALESCE(OLD.votes, 0) + COALESCE(OLD.coin_earnings, 0);
  
  IF v_coin_penalty > 0 THEN
    -- Get current user balance
    SELECT coins INTO v_user_balance
    FROM users
    WHERE username = OLD.author_id;
    
    -- Check if user has enough coins
    IF v_user_balance < v_coin_penalty THEN
      RAISE EXCEPTION 'Insufficient coins to delete answer. Need % coins', v_coin_penalty;
    END IF;
    
    -- Deduct coins
    UPDATE users
    SET coins = coins - v_coin_penalty
    WHERE username = OLD.author_id;
    
    -- Log the penalty
    INSERT INTO coin_audit_log (
      username,
      action,
      amount,
      balance_before,
      balance_after,
      related_content_id
    ) VALUES (
      OLD.author_id,
      'answer_deleted_penalty',
      -v_coin_penalty,
      v_user_balance,
      v_user_balance - v_coin_penalty,
      OLD.id::text
    );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for answer deletion
DROP TRIGGER IF EXISTS process_answer_deletion ON answers;
CREATE TRIGGER process_answer_deletion
  BEFORE DELETE ON answers
  FOR EACH ROW
  EXECUTE FUNCTION handle_answer_deletion();

-- 4. Add RLS policies to prevent manipulation
-- Ensure answers can only be deleted by their authors
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only delete their own answers"
  ON answers
  FOR DELETE
  TO authenticated
  USING (author_id = auth.jwt() ->> 'username');

-- 5. Index for better performance
CREATE INDEX IF NOT EXISTS idx_coin_audit_username ON coin_audit_log(username);
CREATE INDEX IF NOT EXISTS idx_coin_audit_created ON coin_audit_log(created_at);

-- 6. View to check user coin history
CREATE OR REPLACE VIEW user_coin_history AS
SELECT 
  username,
  action,
  amount,
  balance_after,
  created_at
FROM coin_audit_log
ORDER BY created_at DESC;

-- Grant permissions
GRANT SELECT ON user_coin_history TO authenticated;
GRANT SELECT, INSERT ON coin_audit_log TO authenticated;
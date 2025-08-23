-- Add expertise column to coaches table
ALTER TABLE coaches ADD COLUMN IF NOT EXISTS expertise VARCHAR(100);

-- Update coaches with their expertise
UPDATE coaches SET expertise = 'Premature Ejaculation' WHERE id = 'chase';
UPDATE coaches SET expertise = 'Performance Anxiety' WHERE id = 'blake';  
UPDATE coaches SET expertise = 'Intimacy & Communication' WHERE id = 'knox';
UPDATE coaches SET expertise = 'Approach Anxiety' WHERE id = 'logan';
UPDATE coaches SET expertise = 'Erectile Dysfunction' WHERE id = 'mason';

-- Verify the updates
SELECT id, name, expertise FROM coaches ORDER BY id;
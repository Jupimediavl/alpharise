-- Update existing milestones with English welcome messages
UPDATE milestones SET welcome_message = 'You''ve started building confidence! Keep going with your first exercise completed.' WHERE points_required = 5;
UPDATE milestones SET welcome_message = 'Momentum is building! Your progress is starting to show.' WHERE points_required = 25;
UPDATE milestones SET welcome_message = 'You''re making solid progress! Your confidence grows with each exercise.' WHERE points_required = 50;
UPDATE milestones SET welcome_message = 'You''re becoming more confident! Your consistent work is paying off.' WHERE points_required = 100;
UPDATE milestones SET welcome_message = 'You''re an experienced user! Your confidence has transformed considerably.' WHERE points_required = 150;
UPDATE milestones SET welcome_message = 'You''ve reached master level! Your transformation is remarkable.' WHERE points_required = 200;

-- Success message
SELECT 'Welcome messages updated to English successfully!' as message;
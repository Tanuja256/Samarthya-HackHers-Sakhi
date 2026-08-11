-- Clean up future-dated logs for the specific user account
-- Run this in the Supabase SQL Editor

DELETE FROM cycle_logs 
WHERE user_id = '378e016f-0078-43c7-bbb2-3fb89517bbd5' 
  AND cycle_start > '2026-08-12';

DELETE FROM symptom_logs 
WHERE user_id = '378e016f-0078-43c7-bbb2-3fb89517bbd5' 
  AND logged_at >= '2026-08-13';

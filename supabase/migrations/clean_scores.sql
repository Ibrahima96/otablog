-- ============================================
-- CLEANUP QUIZ SCORES
-- Remove dummy/test data related to OtakuKing99 or similar
-- ============================================

-- Delete specific dummy users if known
DELETE FROM quiz_scores WHERE username LIKE 'OtakuKing%' OR username LIKE 'TestUser%';

-- OPTIONAL: Clear ALL scores if you want a fresh start (Uncomment to use)
-- TRUNCATE TABLE quiz_scores;

-- Verify the table is clean(er)
SELECT * FROM quiz_scores ORDER BY score DESC;

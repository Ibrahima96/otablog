-- ============================================
-- FIX PERMISSIONS & LINK FEATURES TO REAL USERS
-- ============================================

-- A. DUEL CHALLENGES (Fixing previous errors)
-- ============================================

-- 1. Ensure RLS is enabled
ALTER TABLE duel_challenges ENABLE ROW LEVEL SECURITY;

-- 2. Reset Policies
DROP POLICY IF EXISTS "Public can view active challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Creators can update own challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Creators can delete own challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON duel_challenges;

-- 3. Policy: Public Read Access
CREATE POLICY "Public can view active challenges"
ON duel_challenges FOR SELECT
USING (is_active = true);

-- 4. Policy: Authenticated Create Access
CREATE POLICY "Authenticated users can create challenges"
ON duel_challenges FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Policy: Creator Update Access
CREATE POLICY "Creators can update own challenges"
ON duel_challenges FOR UPDATE
USING (auth.uid() = creator_id);

-- 6. Trigger to Enforce Creator ID (Security)
CREATE OR REPLACE FUNCTION set_duel_creator_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.creator_id := auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_duel_creator_id ON duel_challenges;
CREATE TRIGGER enforce_duel_creator_id
BEFORE INSERT ON duel_challenges
FOR EACH ROW
EXECUTE FUNCTION set_duel_creator_id();

-- 7. Grant Permissions
GRANT ALL ON TABLE duel_challenges TO authenticated;
GRANT SELECT ON TABLE duel_challenges TO anon;
-- NOTE: Removed sequence grant as UUIDs do not use sequences.


-- B. QUIZ SCORES (Leaderboard & Hall of Fame)
-- ============================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS quiz_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_scores_score ON quiz_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id);
-- Unique constraint to ensure one score per user (optional, but good for simple leaderboard)
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_scores_user_unique ON quiz_scores(user_id);

-- 3. Enable RLS
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- 4. Reset Policies
DROP POLICY IF EXISTS "Public can view quiz scores" ON quiz_scores;
DROP POLICY IF EXISTS "Authenticated users can insert scores" ON quiz_scores;
DROP POLICY IF EXISTS "Users can update own score" ON quiz_scores;

-- 5. Policy: Public Read (Leaderboard)
CREATE POLICY "Public can view quiz scores"
ON quiz_scores FOR SELECT
USING (true);

-- 6. Policy: Authenticated Insert
CREATE POLICY "Authenticated users can insert scores"
ON quiz_scores FOR INSERT
TO authenticated
WITH CHECK (true);

-- 7. Policy: Owner Update
CREATE POLICY "Users can update own score"
ON quiz_scores FOR UPDATE
USING (auth.uid() = user_id);

-- 8. Trigger to Enforce User ID for Scores (Security)
CREATE OR REPLACE FUNCTION set_quiz_user_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Force the user_id to be the authenticated user
  NEW.user_id := auth.uid();
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_quiz_user_id ON quiz_scores;
CREATE TRIGGER enforce_quiz_user_id
BEFORE INSERT OR UPDATE ON quiz_scores
FOR EACH ROW
EXECUTE FUNCTION set_quiz_user_id();

-- 9. Grant Permissions
GRANT ALL ON TABLE quiz_scores TO authenticated;
GRANT SELECT ON TABLE quiz_scores TO anon;

-- Verification
SELECT 'Fixes applied successfully' as status;

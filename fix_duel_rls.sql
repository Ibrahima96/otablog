-- ============================================
-- FIX DUEL CHALLENGES RLS & PERMISSIONS
-- ============================================

-- 1. Reset Policies
DROP POLICY IF EXISTS "Public can view active challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Creators can update own challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Creators can delete own challenges" ON duel_challenges;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON duel_challenges;

-- 2. Ensure RLS is enabled
ALTER TABLE duel_challenges ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Public Read Access (for active challenges)
CREATE POLICY "Public can view active challenges"
ON duel_challenges FOR SELECT
USING (is_active = true);

-- 4. Policy: Authenticated Insert Access
-- Allow any authenticated user to insert. We use a trigger to enforce data integrity.
CREATE POLICY "Authenticated users can create challenges"
ON duel_challenges FOR INSERT
TO authenticated
WITH CHECK (true);

-- 5. Policy: Creator Update Access
CREATE POLICY "Creators can update own challenges"
ON duel_challenges FOR UPDATE
USING (auth.uid() = creator_id);

-- 6. Trigger to Enforce Creator ID
-- This ensures that even if the client sends a wrong ID, we override it with the actual user ID.
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

-- 7. Grant Permissions (Fix "permission denied" errors)
GRANT ALL ON TABLE duel_challenges TO authenticated;
GRANT SELECT ON TABLE duel_challenges TO anon;

-- 8. Verify
SELECT 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check 
FROM pg_policies 
WHERE tablename = 'duel_challenges';

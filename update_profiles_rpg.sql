-- ============================================
-- USER PROFILES & RPG GAMIFICATION (SAFE UPDATE)
-- ============================================

-- 1. Create PROFILES table ONLY IF IT DOES NOT EXIST
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add Columns SAFELY (will not fail if columns exist)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Novice',
ADD COLUMN IF NOT EXISTS duel_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS duel_total INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS favorite_manga TEXT;

-- 3. RLS for Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- 4. Improve QUIZ_SCORES table (Add avatar/level cache)
ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE quiz_scores ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1;

-- 5. Helper function to sync user data AND update XP
CREATE OR REPLACE FUNCTION update_user_progression()
RETURNS TRIGGER AS $$
DECLARE
    user_avatar TEXT;
    user_name TEXT;
    current_xp INTEGER;
    new_level INTEGER;
BEGIN
    -- 1. Sync User Details from Profile
    -- We select with a LEFT JOIN logic (conceptually) by looking up the profile
    BEGIN
        SELECT avatar_url, username, xp, level INTO user_avatar, user_name, current_xp, new_level
        FROM profiles
        WHERE id = NEW.user_id;

        IF user_avatar IS NOT NULL THEN NEW.avatar_url := user_avatar; END IF;
        IF user_name IS NOT NULL THEN NEW.username := user_name; END IF;
        IF new_level IS NOT NULL THEN NEW.level := new_level; END IF;
    EXCEPTION 
        WHEN OTHERS THEN
            -- If profile doesn't exist or error, just ignore sync
            NULL;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_score_details ON quiz_scores;
CREATE TRIGGER sync_score_details
    BEFORE INSERT OR UPDATE ON quiz_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_user_progression();

-- 6. Function to Add XP (Called via RPC)
CREATE OR REPLACE FUNCTION add_xp(user_id UUID, amount INTEGER)
RETURNS void AS $$
DECLARE
    current_xp INTEGER;
    current_level INTEGER;
    new_xp INTEGER;
    new_level INTEGER;
    new_title TEXT;
BEGIN
    -- Ensure profile exists
    INSERT INTO profiles (id) VALUES (user_id) ON CONFLICT (id) DO NOTHING;

    SELECT xp, level INTO current_xp, current_level FROM profiles WHERE id = user_id;
    
    -- Default values if null
    IF current_xp IS NULL THEN current_xp := 0; END IF;
    IF current_level IS NULL THEN current_level := 1; END IF;
    
    new_xp := current_xp + amount;
    
    -- Level Formula: 100 XP per level (simple)
    new_level := FLOOR(new_xp / 100) + 1;
    
    -- Titles based on level
    IF new_level >= 50 THEN new_title := 'Hokage';
    ELSIF new_level >= 20 THEN new_title := 'Pilier';
    ELSIF new_level >= 10 THEN new_title := 'Jonin';
    ELSIF new_level >= 5 THEN new_title := 'Chunin';
    ELSE new_title := 'Genin';
    END IF;

    UPDATE profiles 
    SET xp = new_xp, 
        level = new_level, 
        title = new_title,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Permissions
GRANT ALL ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;
GRANT EXECUTE ON FUNCTION add_xp TO authenticated;
GRANT EXECUTE ON FUNCTION add_xp TO anon;

SELECT 'Profile RPG columns added successfully' as status;

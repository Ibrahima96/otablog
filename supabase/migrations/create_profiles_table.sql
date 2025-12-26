-- ============================================
-- USER PROFILES & RPG GAMIFICATION
-- ============================================

-- 1. Create PROFILES table with RPG Stats
-- This extends auth.users with public profile and game data
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
    
    -- RPG Stats
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    title TEXT DEFAULT 'Novice',
    duel_wins INTEGER DEFAULT 0,
    duel_total INTEGER DEFAULT 0,
    favorite_manga TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS for Profiles
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

-- 3. Trigger to Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
    xp_gain INTEGER := 10; -- Default XP for just playing/updating score
BEGIN
    -- 1. Sync User Details from Profile
    SELECT avatar_url, username, xp, level INTO user_avatar, user_name, current_xp, new_level
    FROM profiles
    WHERE id = NEW.user_id;

    IF user_avatar IS NOT NULL THEN NEW.avatar_url := user_avatar; END IF;
    IF user_name IS NOT NULL THEN NEW.username := user_name; END IF;
    IF new_level IS NOT NULL THEN NEW.level := new_level; END IF;

    -- 2. Gamification Logic (Only on INSERT or meaningful score improvement)
    -- This part logic relies on application side calling an RPCl ideally, 
    -- but here we just ensure the score table reflects the user's current level.
    
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
    SELECT xp, level INTO current_xp, current_level FROM profiles WHERE id = user_id;
    
    new_xp := current_xp + amount;
    
    -- Level Formula: 100 * (level ^ 1.5) approx
    -- Simple linear for now: 100 XP per level
    new_level := FLOOR(new_xp / 100) + 1;
    
    -- Titles
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

SELECT count(*) as result FROM profiles;

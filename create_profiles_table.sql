-- ============================================
-- USER PROFILES & SCORES IMPROVEMENT
-- ============================================

-- 1. Create PROFILES table
-- This table extends auth.users with public profile data
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    avatar_url TEXT,
    bio TEXT,
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
-- This ensures every new user gets a profile entry automatically
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

-- Drop trigger if exists to avoid duplication errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Improve QUIZ_SCORES table
-- Add avatar_url to cache it for the leaderboard (faster than joining)
ALTER TABLE quiz_scores
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 5. Helper function to sync user data to scores
-- When a user gets a new high score, we also update their latest avatar/username
CREATE OR REPLACE FUNCTION update_score_user_details()
RETURNS TRIGGER AS $$
DECLARE
    user_avatar TEXT;
    user_name TEXT;
BEGIN
    -- Try to get details from profiles table first
    SELECT avatar_url, username INTO user_avatar, user_name
    FROM profiles
    WHERE id = NEW.user_id;

    -- If found, ensure the score record reflects the latest profile info
    IF user_avatar IS NOT NULL THEN
        NEW.avatar_url := user_avatar;
    END IF;
    
    -- Sync username if profile has one (and it's not null)
    IF user_name IS NOT NULL THEN
        NEW.username := user_name;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_score_details ON quiz_scores;
CREATE TRIGGER sync_score_details
    BEFORE INSERT OR UPDATE ON quiz_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_score_user_details();

-- 6. Permissions
GRANT ALL ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO anon;

-- Verification
SELECT COUNT(*) as profiles_count FROM profiles;

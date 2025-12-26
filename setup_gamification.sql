-- ============================================
-- GAMIFICATION UPDATE: AURA & BADGES
-- ============================================

-- 1. ADD 'AURA' COLUMN TO PROFILES
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS aura INTEGER DEFAULT 0;

-- 2. CREATE BADGES TABLE
CREATE TABLE IF NOT EXISTS badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL, -- ex: 'pioneer', 'streak_7'
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL, -- Emoji or Lucide icon name or Image URL
    rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
    xp_reward INTEGER DEFAULT 0,
    aura_reward INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CREATE USER_BADGES TABLE (Many-to-Many)
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
    obtained_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, badge_id)
);

-- 4. RLS POLICIES
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

-- Badges are readable by everyone
DROP POLICY IF EXISTS "Badges are viewable by everyone" ON badges;
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- User Badges are readable by everyone
DROP POLICY IF EXISTS "User Badges are viewable by everyone" ON user_badges;
CREATE POLICY "User Badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- Only system/service role should normally insert/update badges, 
-- but for simplicity in this app, we'll allow authenticated users to view them.
-- Insertion strictly controlled via functions usually, but relying on server-side logic or Supabase dashboard for seed data.

-- 5. SEED DEFAULT BADGES
INSERT INTO badges (slug, name, description, icon, rarity, xp_reward, aura_reward) VALUES 
('pioneer', 'Pionnier OtaGrid', 'Membre fondateur présent lors du lancement.', '🚀', 'legendary', 500, 100),
('first_win', 'Première Victoire', 'A remporté son premier duel.', '⚔️', 'common', 100, 20),
('social_butterfly', 'Voix du Réseau', 'A posté 5 commentaires constructifs.', '💬', 'common', 50, 10),
('quiz_master', 'Maître du Savoir', 'A obtenu 100% à un Quiz difficile.', '🧠', 'rare', 200, 50),
('streak_7', 'Connexion Neurale', 'S''est connecté 7 jours d''affilée.', '🔥', 'epic', 300, 75)
ON CONFLICT (slug) DO NOTHING;

-- 6. FUNCTION TO AWARD BADGE
CREATE OR REPLACE FUNCTION award_badge(target_user_id UUID, badge_slug TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    target_badge_id UUID;
    xp_bonus INTEGER;
    aura_bonus INTEGER;
BEGIN
    -- Get Badge ID and rewards
    SELECT id, xp_reward, aura_reward INTO target_badge_id, xp_bonus, aura_bonus
    FROM badges WHERE slug = badge_slug;

    IF target_badge_id IS NULL THEN
        RETURN FALSE; -- Badge not found
    END IF;

    -- Check if user already has it
    PERFORM 1 FROM user_badges WHERE user_id = target_user_id AND badge_id = target_badge_id;
    IF FOUND THEN
        RETURN FALSE; -- Already has badge
    END IF;

    -- Insert User Badge
    INSERT INTO user_badges (user_id, badge_id) VALUES (target_user_id, target_badge_id);

    -- Award Rewards
    UPDATE profiles 
    SET xp = xp + xp_bonus,
        aura = aura + aura_bonus
    WHERE id = target_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant permissions
GRANT SELECT ON badges TO authenticated, anon;
GRANT SELECT ON user_badges TO authenticated, anon;
GRANT EXECUTE ON FUNCTION award_badge TO authenticated;

SELECT 'Gamification setup complete' as status;

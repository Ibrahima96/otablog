-- ============================================
-- FOLLOWERS SYSTEM
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Table des followers
CREATE TABLE IF NOT EXISTS followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_follow UNIQUE(follower_id, following_id),
  CONSTRAINT no_self_follow CHECK (follower_id != following_id)
);

-- 2. Ajouter colonnes compteurs au profil (si pas déjà présent)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'followers_count') THEN
    ALTER TABLE profiles ADD COLUMN followers_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'following_count') THEN
    ALTER TABLE profiles ADD COLUMN following_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. RLS Policies
ALTER TABLE followers ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut voir les follows
DROP POLICY IF EXISTS "Followers are viewable by everyone" ON followers;
CREATE POLICY "Followers are viewable by everyone"
ON followers FOR SELECT
USING (true);

-- Seul l'utilisateur peut s'abonner
DROP POLICY IF EXISTS "Users can follow" ON followers;
CREATE POLICY "Users can follow"
ON followers FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Seul l'utilisateur peut se désabonner
DROP POLICY IF EXISTS "Users can unfollow" ON followers;
CREATE POLICY "Users can unfollow"
ON followers FOR DELETE
USING (auth.uid() = follower_id);

-- 4. Trigger pour mettre à jour les compteurs
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrémenter followers_count du suivi
    UPDATE profiles SET followers_count = COALESCE(followers_count, 0) + 1 
    WHERE id = NEW.following_id;
    -- Incrémenter following_count du suiveur
    UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 
    WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Décrémenter followers_count du suivi
    UPDATE profiles SET followers_count = GREATEST(COALESCE(followers_count, 0) - 1, 0) 
    WHERE id = OLD.following_id;
    -- Décrémenter following_count du suiveur
    UPDATE profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) 
    WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger
DROP TRIGGER IF EXISTS on_follow_change ON followers;
CREATE TRIGGER on_follow_change
AFTER INSERT OR DELETE ON followers
FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- 5. Fonction pour vérifier si suit
CREATE OR REPLACE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM followers 
    WHERE follower_id = p_follower_id 
    AND following_id = p_following_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour obtenir les followers
CREATE OR REPLACE FUNCTION get_followers(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  level INTEGER,
  followed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.level,
    f.created_at as followed_at
  FROM followers f
  JOIN profiles p ON p.id = f.follower_id
  WHERE f.following_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Fonction pour obtenir les following
CREATE OR REPLACE FUNCTION get_following(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  username TEXT,
  avatar_url TEXT,
  level INTEGER,
  followed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.level,
    f.created_at as followed_at
  FROM followers f
  JOIN profiles p ON p.id = f.following_id
  WHERE f.follower_id = p_user_id
  ORDER BY f.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner accès aux fonctions
GRANT EXECUTE ON FUNCTION is_following TO authenticated;
GRANT EXECUTE ON FUNCTION get_followers TO authenticated;
GRANT EXECUTE ON FUNCTION get_following TO authenticated;

-- Vérification
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';

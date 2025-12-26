-- ============================================
-- DAILY CHALLENGES SYSTEM
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. Table des défis disponibles
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT DEFAULT 'quiz', -- quiz, post, social, streak
  reward_xp INTEGER DEFAULT 50,
  reward_badge TEXT,
  difficulty INTEGER DEFAULT 1, -- 1=facile, 2=moyen, 3=difficile
  icon TEXT DEFAULT 'star', -- star, trophy, target, zap
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table de progression utilisateur par jour
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES daily_challenges(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1,
  date DATE DEFAULT CURRENT_DATE,
  UNIQUE(user_id, challenge_id, date)
);

-- 3. RLS Policies
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;

-- Daily challenges visibles par tous
CREATE POLICY "Daily challenges are viewable by everyone"
ON daily_challenges FOR SELECT
USING (is_active = true);

-- User challenges: lecture propre
CREATE POLICY "Users can view own challenges"
ON user_challenges FOR SELECT
USING (auth.uid() = user_id);

-- User challenges: insert propre
CREATE POLICY "Users can insert own challenges"
ON user_challenges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User challenges: update propre
CREATE POLICY "Users can update own challenges"
ON user_challenges FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Insérer des défis par défaut
INSERT INTO daily_challenges (title, description, type, reward_xp, difficulty, icon) VALUES
  ('Première Victoire', 'Gagnez une partie de Quiz Battle', 'quiz', 50, 1, 'trophy'),
  ('Expert Shonen', 'Répondez correctement à 5 questions d''affilée', 'quiz', 75, 2, 'zap'),
  ('Créateur', 'Publiez un post dans la communauté', 'post', 30, 1, 'star'),
  ('Social Butterfly', 'Likez 3 posts de la communauté', 'social', 25, 1, 'heart'),
  ('Challenger', 'Créez un défi et partagez-le', 'quiz', 100, 2, 'target'),
  ('Marathonien', 'Jouez 3 quiz complets dans la journée', 'quiz', 150, 3, 'trophy')
ON CONFLICT DO NOTHING;

-- 5. Fonction pour obtenir les défis du jour avec progression
CREATE OR REPLACE FUNCTION get_daily_challenges_with_progress(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  type TEXT,
  reward_xp INTEGER,
  difficulty INTEGER,
  icon TEXT,
  completed BOOLEAN,
  progress INTEGER,
  target INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.title,
    dc.description,
    dc.type,
    dc.reward_xp,
    dc.difficulty,
    dc.icon,
    COALESCE(uc.completed, false) as completed,
    COALESCE(uc.progress, 0) as progress,
    COALESCE(uc.target, 1) as target
  FROM daily_challenges dc
  LEFT JOIN user_challenges uc 
    ON uc.challenge_id = dc.id 
    AND uc.user_id = p_user_id 
    AND uc.date = CURRENT_DATE
  WHERE dc.is_active = true
  ORDER BY dc.difficulty ASC
  LIMIT 3; -- 3 défis par jour
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fonction pour compléter un défi
CREATE OR REPLACE FUNCTION complete_challenge(p_user_id UUID, p_challenge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_reward_xp INTEGER;
BEGIN
  -- Récupérer la récompense
  SELECT reward_xp INTO v_reward_xp 
  FROM daily_challenges 
  WHERE id = p_challenge_id;

  -- Créer ou mettre à jour la progression
  INSERT INTO user_challenges (user_id, challenge_id, completed, completed_at, progress, target)
  VALUES (p_user_id, p_challenge_id, true, NOW(), 1, 1)
  ON CONFLICT (user_id, challenge_id, date)
  DO UPDATE SET completed = true, completed_at = NOW(), progress = user_challenges.target;

  -- Ajouter XP au profil
  UPDATE profiles 
  SET xp = COALESCE(xp, 0) + v_reward_xp
  WHERE id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner accès aux fonctions
GRANT EXECUTE ON FUNCTION get_daily_challenges_with_progress TO authenticated;
GRANT EXECUTE ON FUNCTION complete_challenge TO authenticated;

-- Vérification
SELECT * FROM daily_challenges;

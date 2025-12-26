-- ============================================
-- TABLE DUEL CHALLENGES
-- Persister les défis de quiz dans Supabase
-- ============================================

-- 1. Créer la table duel_challenges
CREATE TABLE IF NOT EXISTS duel_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    topic TEXT NOT NULL,
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    creator_username TEXT NOT NULL,
    questions JSONB NOT NULL,
    target_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
    is_active BOOLEAN DEFAULT true
);

-- 2. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_duel_challenges_code ON duel_challenges(code);
CREATE INDEX IF NOT EXISTS idx_duel_challenges_creator ON duel_challenges(creator_id);
CREATE INDEX IF NOT EXISTS idx_duel_challenges_active ON duel_challenges(is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duel_challenges_expires ON duel_challenges(expires_at);

-- 3. Fonction pour nettoyer les défis expirés
CREATE OR REPLACE FUNCTION cleanup_expired_challenges()
RETURNS void AS $$
BEGIN
    UPDATE duel_challenges
    SET is_active = false
    WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 4. Activer RLS
ALTER TABLE duel_challenges ENABLE ROW LEVEL SECURITY;

-- 5. Policy: Tout le monde peut lire les défis actifs
DROP POLICY IF EXISTS "Public can view active challenges" ON duel_challenges;
CREATE POLICY "Public can view active challenges"
ON duel_challenges FOR SELECT
USING (is_active = true);

-- 6. Policy: Les utilisateurs authentifiés peuvent créer des défis
DROP POLICY IF EXISTS "Authenticated users can create challenges" ON duel_challenges;
CREATE POLICY "Authenticated users can create challenges"
ON duel_challenges FOR INSERT
WITH CHECK (auth.uid() = creator_id);

-- 7. Policy: Les créateurs peuvent mettre à jour leurs défis
DROP POLICY IF EXISTS "Creators can update own challenges" ON duel_challenges;
CREATE POLICY "Creators can update own challenges"
ON duel_challenges FOR UPDATE
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- 8. Policy: Les créateurs peuvent supprimer leurs défis
DROP POLICY IF EXISTS "Creators can delete own challenges" ON duel_challenges;
CREATE POLICY "Creators can delete own challenges"
ON duel_challenges FOR DELETE
USING (auth.uid() = creator_id);

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher la structure de la table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'duel_challenges'
ORDER BY ordinal_position;

-- Compter les défis actifs
SELECT COUNT(*) as total_active_challenges 
FROM duel_challenges 
WHERE is_active = true;

-- ✅ Table créée avec succès !
-- Les défis seront maintenant persistés dans Supabase

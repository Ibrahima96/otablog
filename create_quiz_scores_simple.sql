-- ============================================
-- VERSION SIMPLIFIÉE - TABLE QUIZ SCORES
-- Sans données de démonstration
-- ============================================

-- 1. Créer la table quiz_scores
CREATE TABLE IF NOT EXISTS quiz_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_quiz_scores_score ON quiz_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_user ON quiz_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_scores_created ON quiz_scores(created_at DESC);

-- 3. Créer une contrainte unique pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_scores_user_unique ON quiz_scores(user_id);

-- 4. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_quiz_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger pour updated_at
DROP TRIGGER IF EXISTS update_quiz_scores_timestamp ON quiz_scores;
CREATE TRIGGER update_quiz_scores_timestamp
    BEFORE UPDATE ON quiz_scores
    FOR EACH ROW
    EXECUTE FUNCTION update_quiz_scores_updated_at();

-- 6. Activer RLS
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- 7. Policy: Lecture publique
DROP POLICY IF EXISTS "Public can view quiz scores" ON quiz_scores;
CREATE POLICY "Public can view quiz scores"
ON quiz_scores FOR SELECT
USING (true);

-- 8. Policy: Insertion authentifiée
DROP POLICY IF EXISTS "Authenticated users can insert scores" ON quiz_scores;
CREATE POLICY "Authenticated users can insert scores"
ON quiz_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 9. Policy: Mise à jour propriétaire
DROP POLICY IF EXISTS "Users can update own score" ON quiz_scores;
CREATE POLICY "Users can update own score"
ON quiz_scores FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. Policy: Suppression propriétaire
DROP POLICY IF EXISTS "Users can delete own score" ON quiz_scores;
CREATE POLICY "Users can delete own score"
ON quiz_scores FOR DELETE
USING (auth.uid() = user_id);

-- ✅ Table créée avec succès !
-- Les scores seront ajoutés automatiquement quand les joueurs joueront

-- ============================================
-- FIX COMPLET: LIKES ET COMMENTAIRES
-- ============================================

-- 1. S'assurer que les colonnes existent
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'likes_count') THEN
        ALTER TABLE posts ADD COLUMN likes_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Colonne likes_count ajoutée';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Colonne comments_count ajoutée';
    END IF;
END $$;

-- 2. Nettoyer les doublons de likes (au cas où)
DELETE FROM post_likes
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER (PARTITION BY user_id, post_id ORDER BY created_at) as rnum
        FROM post_likes
    ) t
    WHERE t.rnum > 1
);

-- 3. Ajouter contrainte unique pour éviter les futurs doublons
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_post_like'
    ) THEN
        ALTER TABLE post_likes
        ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id);
    END IF;
END $$;

-- 4. Fonctions de Trigger pour les compteurs

-- Pour les Likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Pour les Commentaires
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. Récréer les Triggers (pour être sûr)

DROP TRIGGER IF EXISTS increment_likes_on_insert ON post_likes;
CREATE TRIGGER increment_likes_on_insert
    AFTER INSERT ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS decrement_likes_on_delete ON post_likes;
CREATE TRIGGER decrement_likes_on_delete
    AFTER DELETE ON post_likes
    FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

DROP TRIGGER IF EXISTS increment_comments_on_insert ON post_comments;
CREATE TRIGGER increment_comments_on_insert
    AFTER INSERT ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

DROP TRIGGER IF EXISTS decrement_comments_on_delete ON post_comments;
CREATE TRIGGER decrement_comments_on_delete
    AFTER DELETE ON post_comments
    FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- 6. Resynchroniser tous les compteurs maintenant
UPDATE posts SET 
    likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id),
    comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id);

-- Vérification finale
SELECT id, likes_count, comments_count FROM posts LIMIT 5;

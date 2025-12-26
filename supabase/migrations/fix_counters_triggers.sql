-- ============================================
-- TRIGGERS AUTOMATIQUES POUR COMPTEURS
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- 1. FONCTION: Mettre à jour le compteur de likes
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrémenter le compteur
        UPDATE posts 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Décrémenter le compteur
        UPDATE posts 
        SET likes_count = GREATEST(likes_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. TRIGGER: Incrémenter likes à l'insertion
DROP TRIGGER IF EXISTS increment_likes_on_insert ON post_likes;
CREATE TRIGGER increment_likes_on_insert
    AFTER INSERT ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- 3. TRIGGER: Décrémenter likes à la suppression
DROP TRIGGER IF EXISTS decrement_likes_on_delete ON post_likes;
CREATE TRIGGER decrement_likes_on_delete
    AFTER DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_post_likes_count();

-- ============================================

-- 4. FONCTION: Mettre à jour le compteur de commentaires
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Incrémenter le compteur
        UPDATE posts 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Décrémenter le compteur
        UPDATE posts 
        SET comments_count = GREATEST(comments_count - 1, 0)
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 5. TRIGGER: Incrémenter comments à l'insertion
DROP TRIGGER IF EXISTS increment_comments_on_insert ON post_comments;
CREATE TRIGGER increment_comments_on_insert
    AFTER INSERT ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- 6. TRIGGER: Décrémenter comments à la suppression
DROP TRIGGER IF EXISTS decrement_comments_on_delete ON post_comments;
CREATE TRIGGER decrement_comments_on_delete
    AFTER DELETE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_post_comments_count();

-- ============================================
-- RÉINITIALISER LES COMPTEURS EXISTANTS
-- ============================================

-- Mettre à jour tous les compteurs avec les valeurs réelles
UPDATE posts SET 
    likes_count = (
        SELECT COUNT(*) 
        FROM post_likes 
        WHERE post_id = posts.id
    ),
    comments_count = (
        SELECT COUNT(*) 
        FROM post_comments 
        WHERE post_id = posts.id
    );

-- ============================================
-- VÉRIFICATION
-- ============================================

-- Afficher les posts avec leurs compteurs
SELECT 
    id,
    caption,
    likes_count,
    comments_count,
    (SELECT COUNT(*) FROM post_likes WHERE post_id = posts.id) as actual_likes,
    (SELECT COUNT(*) FROM post_comments WHERE post_id = posts.id) as actual_comments
FROM posts
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Les colonnes likes_count et actual_likes doivent être identiques
-- ✅ Les colonnes comments_count et actual_comments doivent être identiques

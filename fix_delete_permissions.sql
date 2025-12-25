-- ============================================
-- FIX DELETE PERMISSIONS - ALTERNATIVE
-- ============================================

-- 1. Supprimer anciennes politiques sur posts
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON posts;

-- 2. Créer politique DELETE permissive
CREATE POLICY "Users can delete own posts"
ON posts FOR DELETE
USING (auth.uid() = user_id);

-- 3. Supprimer anciennes politiques sur post_likes
DROP POLICY IF EXISTS "Users can delete own likes" ON post_likes;

CREATE POLICY "Users can delete own likes"
ON post_likes FOR DELETE
USING (auth.uid() = user_id);

-- 4. Supprimer anciennes politiques sur post_comments
DROP POLICY IF EXISTS "Users can delete own comments" ON post_comments;

CREATE POLICY "Users can delete own comments"
ON post_comments FOR DELETE
USING (auth.uid() = user_id);

-- 5. Politique CASCADE - Supprimer likes/comments du post avant delete
-- (Alternative: Créer une fonction pour supprimer en cascade)
CREATE OR REPLACE FUNCTION delete_post_cascade(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Vérifier propriété
    IF NOT EXISTS (
        SELECT 1 FROM posts WHERE id = p_post_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Non autorisé';
    END IF;

    -- Supprimer likes associés
    DELETE FROM post_likes WHERE post_id = p_post_id;
    
    -- Supprimer comments associés
    DELETE FROM post_comments WHERE post_id = p_post_id;
    
    -- Supprimer marketplace items
    DELETE FROM marketplace_items WHERE post_id = p_post_id;
    
    -- Supprimer le post
    DELETE FROM posts WHERE id = p_post_id AND user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Donner accès à la fonction
GRANT EXECUTE ON FUNCTION delete_post_cascade TO authenticated;

-- 7. Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('posts', 'post_likes', 'post_comments');

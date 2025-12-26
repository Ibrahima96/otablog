-- ============================================
-- FIX COMMUNITY POSTS - SCRIPT COMPLET
-- Exécutez ce script dans Supabase SQL Editor
-- ============================================

-- ========== ÉTAPE 1: SUPPRIMER LES LIKES DUPLIQUÉS ==========
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

-- ========== ÉTAPE 2: AJOUTER CONTRAINTE UNIQUE ==========
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'unique_user_post_like'
    ) THEN
        ALTER TABLE post_likes
        ADD CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id);
        RAISE NOTICE '✅ Contrainte unique ajoutée sur post_likes';
    ELSE
        RAISE NOTICE '⚠️ Contrainte unique déjà existante';
    END IF;
END $$;

-- ========== ÉTAPE 3: RESYNCHRONISER LES COMPTEURS ==========
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

-- ========== ÉTAPE 4: VÉRIFIER BUCKET STORAGE ==========
-- S'assurer que le bucket community-media est public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'community-media';

-- ========== ÉTAPE 5: VÉRIFIER LES POLITIQUES DELETE ==========
-- Créer la politique de suppression si elle n'existe pas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND policyname = 'Users can delete own files'
    ) THEN
        CREATE POLICY "Users can delete own files"
        ON storage.objects FOR DELETE
        USING ( bucket_id = 'community-media' AND auth.uid() = owner );
        RAISE NOTICE '✅ Politique DELETE ajoutée';
    ELSE
        RAISE NOTICE '⚠️ Politique DELETE déjà existante';
    END IF;
END $$;

-- ========== VÉRIFICATION FINALE ==========
SELECT 
    '📊 RÉSUMÉ DES POSTS' as info,
    COUNT(*) as total_posts,
    SUM(likes_count) as total_likes,
    SUM(comments_count) as total_comments
FROM posts;

-- Afficher les 5 derniers posts avec leurs compteurs
SELECT 
    id,
    type,
    caption,
    likes_count,
    comments_count,
    created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

-- ✅ TERMINÉ ! Rafraîchissez votre application.

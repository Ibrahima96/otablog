-- ============================================
-- SCRIPT DE VÉRIFICATION SUPABASE
-- Vérifier que toutes les tables et colonnes existent
-- ============================================

-- 1. Vérifier la table marketplace_items et la colonne whatsapp_number
DO $$
BEGIN
    -- Vérifier si la colonne whatsapp_number existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'marketplace_items' 
        AND column_name = 'whatsapp_number'
    ) THEN
        -- Ajouter la colonne si elle n'existe pas
        ALTER TABLE marketplace_items 
        ADD COLUMN whatsapp_number TEXT;
        
        RAISE NOTICE '✅ Colonne whatsapp_number ajoutée à marketplace_items';
    ELSE
        RAISE NOTICE '✅ Colonne whatsapp_number existe déjà';
    END IF;
END $$;

-- 2. Vérifier toutes les tables nécessaires
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') 
        THEN '✅ Table posts existe'
        ELSE '❌ Table posts MANQUANTE'
    END as posts_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'marketplace_items') 
        THEN '✅ Table marketplace_items existe'
        ELSE '❌ Table marketplace_items MANQUANTE'
    END as marketplace_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_likes') 
        THEN '✅ Table post_likes existe'
        ELSE '❌ Table post_likes MANQUANTE'
    END as likes_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments') 
        THEN '✅ Table post_comments existe'
        ELSE '❌ Table post_comments MANQUANTE'
    END as comments_status,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') 
        THEN '✅ Table profiles existe'
        ELSE '❌ Table profiles MANQUANTE'
    END as profiles_status;

-- 3. Vérifier les colonnes de marketplace_items
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace_items'
ORDER BY ordinal_position;

-- 4. Vérifier le bucket storage
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'community-media') 
        THEN '✅ Bucket community-media existe'
        ELSE '❌ Bucket community-media MANQUANT'
    END as storage_status;

-- 5. Vérifier les RLS policies pour marketplace_items
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'marketplace_items';

-- 6. Compter les posts marketplace existants
SELECT 
    COUNT(*) as total_marketplace_posts,
    COUNT(CASE WHEN marketplace_item.whatsapp_number IS NOT NULL THEN 1 END) as posts_with_whatsapp
FROM posts
LEFT JOIN marketplace_items marketplace_item ON marketplace_item.post_id = posts.id
WHERE posts.type = 'marketplace';

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Toutes les vérifications doivent afficher ✅
-- Si vous voyez ❌, exécutez la migration complète

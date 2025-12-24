-- ============================================
-- MIGRATION COMPLÈTE - MARKETPLACE + WHATSAPP
-- Exécutez ce script si des éléments sont manquants
-- ============================================

-- 1. Ajouter la colonne whatsapp_number si elle n'existe pas
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 2. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_marketplace_whatsapp 
ON marketplace_items(whatsapp_number) 
WHERE whatsapp_number IS NOT NULL;

-- 3. Ajouter un commentaire pour la documentation
COMMENT ON COLUMN marketplace_items.whatsapp_number IS 
'Numéro WhatsApp du vendeur pour contact direct (format international recommandé)';

-- 4. Vérifier les RLS policies pour marketplace_items
-- Si la table existe mais n'a pas de policies, les créer

-- Policy: Tout le monde peut lire les items marketplace
DROP POLICY IF EXISTS "Public can view marketplace items" ON marketplace_items;
CREATE POLICY "Public can view marketplace items"
ON marketplace_items FOR SELECT
USING (true);

-- Policy: Les utilisateurs authentifiés peuvent créer des items
DROP POLICY IF EXISTS "Authenticated users can create marketplace items" ON marketplace_items;
CREATE POLICY "Authenticated users can create marketplace items"
ON marketplace_items FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = marketplace_items.post_id 
        AND posts.user_id = auth.uid()
    )
);

-- Policy: Les utilisateurs peuvent modifier leurs propres items
DROP POLICY IF EXISTS "Users can update own marketplace items" ON marketplace_items;
CREATE POLICY "Users can update own marketplace items"
ON marketplace_items FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = marketplace_items.post_id 
        AND posts.user_id = auth.uid()
    )
);

-- Policy: Les utilisateurs peuvent supprimer leurs propres items
DROP POLICY IF EXISTS "Users can delete own marketplace items" ON marketplace_items;
CREATE POLICY "Users can delete own marketplace items"
ON marketplace_items FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = marketplace_items.post_id 
        AND posts.user_id = auth.uid()
    )
);

-- 5. Activer RLS sur la table si ce n'est pas déjà fait
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- 6. Recharger le schéma
NOTIFY pgrst, 'reload schema';

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
    '✅ Migration WhatsApp terminée' as status,
    COUNT(*) as total_items,
    COUNT(whatsapp_number) as items_with_whatsapp
FROM marketplace_items;

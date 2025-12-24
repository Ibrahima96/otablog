-- ============================================
-- MIGRATION URGENTE : Ajouter la colonne WhatsApp
-- Exécutez ce script MAINTENANT dans Supabase SQL Editor
-- ============================================

-- 1. Ajouter la colonne whatsapp_number à marketplace_items
ALTER TABLE marketplace_items 
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- 2. Recharger le schéma pour que Supabase reconnaisse la nouvelle colonne
NOTIFY pgrst, 'reload schema';

-- 3. Vérification : Afficher toutes les colonnes de marketplace_items
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'marketplace_items'
ORDER BY ordinal_position;

-- ============================================
-- RÉSULTAT ATTENDU
-- ============================================
-- Vous devriez voir la colonne 'whatsapp_number' de type 'text'
-- dans la liste des colonnes

-- 1. Mise à jour de la table channel_messages
ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text'; -- 'text' | 'audio' | 'image'
ALTER TABLE channel_messages ADD COLUMN IF NOT EXISTS media_url TEXT;

-- 2. Création du Bucket Storage pour les médias
-- Note: La création de bucket via SQL n'est pas toujours standardisée sur toutes les instances Supabase,
-- mais on peut insérer dans storage.buckets si on a les droits.
-- Sinon, l'utilisateur devra le créer manuellement, mais on tente l'insertion.

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politiques de Sécurité pour le Storage

-- Permettre l'accès public en lecture aux fichiers
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-media' );

-- Permettre l'upload aux utilisateurs authentifiés
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-media' AND
  auth.role() = 'authenticated'
);

-- 4. Recharger le schéma
NOTIFY pgrst, 'reload schema';

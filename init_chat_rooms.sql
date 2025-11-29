-- 1. Table des Canaux (Salons)
CREATE TABLE IF NOT EXISTS channels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Messages de Salon
CREATE TABLE IF NOT EXISTS channel_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Sécurité (RLS)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_messages ENABLE ROW LEVEL SECURITY;

-- Politiques Channels (Lecture publique, pas d'écriture publique)
DROP POLICY IF EXISTS "Channels are viewable by everyone" ON channels;
CREATE POLICY "Channels are viewable by everyone" 
ON channels FOR SELECT 
USING (true);

-- Politiques Messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON channel_messages;
CREATE POLICY "Messages are viewable by everyone" 
ON channel_messages FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON channel_messages;
CREATE POLICY "Authenticated users can insert messages" 
ON channel_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Insertion des Salons par défaut
INSERT INTO channels (slug, name, description)
VALUES 
  ('all-for-one', 'All For One', 'Discussion générale pour tous les membres.'),
  ('ota', 'Salon Ota', 'Discussions sur la culture Otaku, Anime et Manga.'),
  ('commerce', 'Salon Commerce', 'Espace dédié aux échanges et au marketplace.')
ON CONFLICT (slug) DO NOTHING;

-- 5. Relation pour récupérer les infos utilisateur
ALTER TABLE channel_messages DROP CONSTRAINT IF EXISTS channel_messages_user_id_fkey;
ALTER TABLE channel_messages 
  ADD CONSTRAINT channel_messages_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 6. Activer le Realtime pour la table channel_messages
-- Note: Cela doit souvent être fait via le dashboard Supabase, mais on peut essayer via SQL
ALTER PUBLICATION supabase_realtime ADD TABLE channel_messages;

-- 7. Recharger le schéma
NOTIFY pgrst, 'reload schema';

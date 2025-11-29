-- 1. Mise à jour de la table channels
ALTER TABLE channels ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'public';
ALTER TABLE channels ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. Création de la table channel_members
CREATE TABLE IF NOT EXISTS channel_members (
  channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (channel_id, user_id)
);

-- 3. Sécurité (RLS) pour channel_members
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members are viewable by everyone" ON channel_members;
CREATE POLICY "Members are viewable by everyone" 
ON channel_members FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can join public channels" ON channel_members;
CREATE POLICY "Users can join public channels" 
ON channel_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Mise à jour des politiques de channels
DROP POLICY IF EXISTS "Channels are viewable by everyone" ON channels;
CREATE POLICY "Public channels are viewable by everyone" 
ON channels FOR SELECT 
USING (type = 'public');

CREATE POLICY "Private channels are viewable by members" 
ON channels FOR SELECT 
USING (
  type = 'private' AND (
    auth.uid() = created_by OR 
    EXISTS (SELECT 1 FROM channel_members WHERE channel_id = id AND user_id = auth.uid())
  )
);

CREATE POLICY "Authenticated users can create private channels" 
ON channels FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- 5. Mise à jour des politiques de messages
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON channel_messages;

CREATE POLICY "Public messages are viewable by everyone" 
ON channel_messages FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND type = 'public')
);

CREATE POLICY "Private messages are viewable by members" 
ON channel_messages FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND type = 'private') AND
  EXISTS (SELECT 1 FROM channel_members WHERE channel_id = channel_messages.channel_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Authenticated users can insert messages" ON channel_messages;
CREATE POLICY "Authenticated users can insert messages" 
ON channel_messages FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM channels WHERE id = channel_id AND type = 'public') OR
    EXISTS (SELECT 1 FROM channel_members WHERE channel_id = channel_messages.channel_id AND user_id = auth.uid())
  )
);

-- 6. Fonction pour créer un chat privé (helper)
CREATE OR REPLACE FUNCTION create_private_chat_if_not_exists(other_user_id UUID)
RETURNS UUID AS $$
DECLARE
  new_channel_id UUID;
  existing_channel_id UUID;
BEGIN
  -- Vérifier si un chat privé existe déjà entre ces 2 utilisateurs
  SELECT c.id INTO existing_channel_id
  FROM channels c
  JOIN channel_members cm1 ON c.id = cm1.channel_id
  JOIN channel_members cm2 ON c.id = cm2.channel_id
  WHERE c.type = 'private'
  AND cm1.user_id = auth.uid()
  AND cm2.user_id = other_user_id;

  IF existing_channel_id IS NOT NULL THEN
    RETURN existing_channel_id;
  END IF;

  -- Créer un nouveau channel
  INSERT INTO channels (slug, name, type, created_by)
  VALUES (uuid_generate_v4()::text, 'Private Chat', 'private', auth.uid())
  RETURNING id INTO new_channel_id;

  -- Ajouter les membres
  INSERT INTO channel_members (channel_id, user_id) VALUES (new_channel_id, auth.uid());
  INSERT INTO channel_members (channel_id, user_id) VALUES (new_channel_id, other_user_id);

  RETURN new_channel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Recharger le schéma
NOTIFY pgrst, 'reload schema';

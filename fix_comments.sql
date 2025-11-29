-- 1. S'assurer que la table post_comments existe
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CORRECTION : Standardiser le nom de la colonne 'text'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'comment_text') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'post_comments' AND column_name = 'text') THEN
            ALTER TABLE post_comments RENAME COLUMN comment_text TO text;
        ELSE
            UPDATE post_comments SET text = comment_text WHERE text IS NULL;
            ALTER TABLE post_comments DROP COLUMN comment_text;
        END IF;
    END IF;
    ALTER TABLE post_comments ALTER COLUMN text SET NOT NULL;
END $$;

-- 3. Activer RLS pour post_comments
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- 4. Politiques post_comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON post_comments;
CREATE POLICY "Comments are viewable by everyone" 
ON post_comments FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON post_comments;
CREATE POLICY "Authenticated users can insert comments" 
ON post_comments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;
CREATE POLICY "Users can delete their own comments" 
ON post_comments FOR DELETE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
CREATE POLICY "Users can update their own comments" 
ON post_comments FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Gestion du compteur de commentaires
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'posts' AND column_name = 'comments_count') THEN
        ALTER TABLE posts ADD COLUMN comments_count INTEGER DEFAULT 0;
    END IF;
END $$;

CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_post_comments_count_trigger ON post_comments;
CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ==========================================
-- CORRECTION CRITIQUE : Recalculer les compteurs
-- ==========================================
UPDATE posts
SET comments_count = (
    SELECT COUNT(*)
    FROM post_comments
    WHERE post_comments.post_id = posts.id
);

-- 6. Correction des relations (FK vers profiles pour post_comments)
ALTER TABLE post_comments DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey;
ALTER TABLE post_comments 
  ADD CONSTRAINT post_comments_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- 7. Table marketplace_items
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Marketplace items are viewable by everyone" ON marketplace_items;
CREATE POLICY "Marketplace items are viewable by everyone" 
ON marketplace_items FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Users can insert marketplace items via posts" ON marketplace_items;
CREATE POLICY "Users can insert marketplace items via posts" 
ON marketplace_items FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM posts 
    WHERE posts.id = marketplace_items.post_id 
    AND posts.user_id = auth.uid()
  )
);

-- 8. Recharger le cache du schéma API
NOTIFY pgrst, 'reload schema';

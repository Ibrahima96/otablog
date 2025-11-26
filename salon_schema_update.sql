-- Add user reference columns to duels table
ALTER TABLE duels 
ADD COLUMN candidate_a_user_id UUID REFERENCES auth.users(id),
ADD COLUMN candidate_b_user_id UUID REFERENCES auth.users(id);

-- Note: You also need to create a Storage bucket in Supabase Dashboard:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a new bucket named: duel-images
-- 3. Make it PUBLIC
-- 4. Set the following policy for INSERT:
-- 
-- CREATE POLICY "Authenticated users can upload duel images"
-- ON storage.objects FOR INSERT
-- WITH CHECK (bucket_id = 'duel-images' AND auth.role() = 'authenticated');
--
-- 5. Set the following policy for SELECT:
--
-- CREATE POLICY "Anyone can view duel images"
-- ON storage.objects FOR SELECT
-- USING (bucket_id = 'duel-images');

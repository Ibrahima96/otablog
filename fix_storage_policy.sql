-- FIX STORAGE PERMISSIONS FOR AVATARS

-- 1. Create bucket if not exists (community-media)
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Remove restrictive policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- 3. Create Permissive Policies for 'community-media'
-- Allow public read
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'community-media' );

-- Allow authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'community-media' 
    AND auth.role() = 'authenticated'
);

-- Allow users to update/delete their own files
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'community-media' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'community-media' AND auth.uid() = owner );

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
USING ( bucket_id = 'community-media' AND auth.uid() = owner );

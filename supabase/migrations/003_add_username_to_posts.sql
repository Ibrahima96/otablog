-- ============================================
-- ADD USERNAME COLUMN TO POSTS TABLE
-- Execute this in Supabase SQL Editor
-- ============================================

-- Add username column to posts table
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS username TEXT;

-- Update existing posts with a default username
UPDATE public.posts 
SET username = 'Utilisateur' 
WHERE username IS NULL;

-- You can also update with email-based usernames if you want:
-- UPDATE public.posts p
-- SET username = SPLIT_PART((SELECT email FROM auth.users WHERE id = p.user_id), '@', 1)
-- WHERE username IS NULL OR username = 'Utilisateur';

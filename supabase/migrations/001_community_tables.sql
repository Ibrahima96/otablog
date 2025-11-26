-- ============================================
-- OtaBlog Community Tables Migration
-- Version: 001
-- Description: Creates tables for community posts, marketplace, and related features
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('image', 'video', 'marketplace')),
    caption TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS posts_user_id_idx ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS posts_created_at_idx ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS posts_type_idx ON public.posts(type);

-- ============================================
-- MARKETPLACE ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    category TEXT NOT NULL CHECK (category IN ('article', 'vetement', 'accessoire', 'autre')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for marketplace items
CREATE INDEX IF NOT EXISTS marketplace_items_post_id_idx ON public.marketplace_items(post_id);
CREATE INDEX IF NOT EXISTS marketplace_items_category_idx ON public.marketplace_items(category);

-- ============================================
-- POST LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Index for likes
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes(user_id);

-- ============================================
-- POST COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for comments
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_created_at_idx ON public.post_comments(created_at DESC);

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Create storage bucket for community media
INSERT INTO storage.buckets (id, name, public)
VALUES ('community-media', 'community-media', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "Posts are viewable by everyone"
    ON public.posts FOR SELECT
    USING (true);

CREATE POLICY "Users can create their own posts"
    ON public.posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
    ON public.posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
    ON public.posts FOR DELETE
    USING (auth.uid() = user_id);

-- Marketplace items policies
CREATE POLICY "Marketplace items are viewable by everyone"
    ON public.marketplace_items FOR SELECT
    USING (true);

CREATE POLICY "Users can create marketplace items for their posts"
    ON public.marketplace_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = marketplace_items.post_id
            AND posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own marketplace items"
    ON public.marketplace_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = marketplace_items.post_id
            AND posts.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own marketplace items"
    ON public.marketplace_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.posts
            WHERE posts.id = marketplace_items.post_id
            AND posts.user_id = auth.uid()
        )
    );

-- Post likes policies
CREATE POLICY "Likes are viewable by everyone"
    ON public.post_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like posts"
    ON public.post_likes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
    ON public.post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- Post comments policies
CREATE POLICY "Comments are viewable by everyone"
    ON public.post_comments FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can create comments"
    ON public.post_comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
    ON public.post_comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
    ON public.post_comments FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload media"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'community-media' AND
        auth.role() = 'authenticated'
    );

-- Allow public read access to media
CREATE POLICY "Media files are publicly accessible"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'community-media');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own media"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'community-media' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update likes count
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET likes_count = likes_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET likes_count = likes_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for likes count
CREATE TRIGGER trigger_update_likes_count
AFTER INSERT OR DELETE ON public.post_likes
FOR EACH ROW
EXECUTE FUNCTION update_post_likes_count();

-- Function to update comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts
        SET comments_count = comments_count + 1
        WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts
        SET comments_count = comments_count - 1
        WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comments count
CREATE TRIGGER trigger_update_comments_count
AFTER INSERT OR DELETE ON public.post_comments
FOR EACH ROW
EXECUTE FUNCTION update_post_comments_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER trigger_update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- GRANTS
-- ============================================

-- Grant access to authenticated users
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.marketplace_items TO authenticated;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.post_comments TO authenticated;

-- Grant select to anon users for viewing
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.marketplace_items TO anon;
GRANT SELECT ON public.post_likes TO anon;
GRANT SELECT ON public.post_comments TO anon;

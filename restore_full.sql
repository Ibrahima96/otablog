-- ==============================================================================
-- SCRIPT DE RESTAURATION DE LA BASE DE DONNÉES (GRAVITY / OTABLOG)
-- ==============================================================================
-- Ce script recrée les tables essentielles. Exécutez-le dans l'éditeur SQL de Supabase.

-- 1. TABLE PROFILES (Hérite de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  aura INTEGER DEFAULT 0,
  title TEXT DEFAULT 'Novice',
  duel_wins INTEGER DEFAULT 0,
  duel_total INTEGER DEFAULT 0,
  whatsapp_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger pour créer automatiquement un profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. TABLE DUEL_CHALLENGES (Pour les duels /duel)
CREATE TABLE IF NOT EXISTS public.duel_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    topic TEXT NOT NULL,
    creator_id UUID REFERENCES public.profiles(id),
    creator_username TEXT,
    questions JSONB,
    target_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.duel_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active challenges" ON public.duel_challenges;
CREATE POLICY "Public can view active challenges" ON public.duel_challenges FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create challenges" ON public.duel_challenges;
CREATE POLICY "Authenticated users can create challenges" ON public.duel_challenges FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Creators can update challenges" ON public.duel_challenges;
CREATE POLICY "Creators can update challenges" ON public.duel_challenges FOR UPDATE USING (auth.uid() = creator_id);

-- 3. TABLE QUIZ_SCORES (Pour le leaderboard)
CREATE TABLE IF NOT EXISTS public.quiz_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    username TEXT,
    score INTEGER NOT NULL,
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view scores" ON public.quiz_scores;
CREATE POLICY "Public can view scores" ON public.quiz_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert scores" ON public.quiz_scores;
CREATE POLICY "Users can insert scores" ON public.quiz_scores FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. TABLE MARKETPLACE_ITEMS (Optionnel, pour le shop)
CREATE TABLE IF NOT EXISTS public.marketplace_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    image_url TEXT,
    category TEXT,
    whatsapp_number TEXT,
    user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure user_id exists (in case table already existed without it)
ALTER TABLE public.marketplace_items ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);

ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view marketplace" ON public.marketplace_items;
CREATE POLICY "Public view marketplace" ON public.marketplace_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users manage own items" ON public.marketplace_items;
CREATE POLICY "Users manage own items" ON public.marketplace_items FOR ALL USING (auth.uid() = user_id);

-- 5. FUNCTION D'INITIALISATION
-- Permet de restaurer les profils pour les utilisateurs existants qui n'en ont plus
INSERT INTO public.profiles (id, username, email, created_at)
SELECT id, raw_user_meta_data->>'username', email, created_at
FROM auth.users
ON CONFLICT (id) DO NOTHING;

SELECT 'Base de données restaurée avec succès !' as status;

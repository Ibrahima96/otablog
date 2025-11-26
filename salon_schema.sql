-- Duels Table
CREATE TABLE IF NOT EXISTS duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    candidate_a_name TEXT NOT NULL,
    candidate_a_image TEXT NOT NULL,
    candidate_a_desc TEXT NOT NULL,
    candidate_b_name TEXT NOT NULL,
    candidate_b_image TEXT NOT NULL,
    candidate_b_desc TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Duel Votes Table
CREATE TABLE IF NOT EXISTS duel_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id UUID REFERENCES duels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    candidate TEXT NOT NULL CHECK (candidate IN ('A', 'B')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(duel_id, user_id)
);

-- Duel Comments Table
CREATE TABLE IF NOT EXISTS duel_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    duel_id UUID REFERENCES duels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    author_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE duel_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for duels (anyone can read, authenticated users can create)
CREATE POLICY "Duels are viewable by everyone" ON duels FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create duels" ON duels FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS Policies for duel_votes (anyone can read, authenticated users can vote)
CREATE POLICY "Votes are viewable by everyone" ON duel_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON duel_votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for duel_comments (anyone can read, authenticated users can comment)
CREATE POLICY "Comments are viewable by everyone" ON duel_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON duel_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert a default duel
INSERT INTO duels (
    title, 
    candidate_a_name, 
    candidate_a_image, 
    candidate_a_desc, 
    candidate_b_name, 
    candidate_b_image, 
    candidate_b_desc,
    is_active
) VALUES (
    'Meilleur Antagoniste Cyberpunk',
    'Vicious',
    'https://images.unsplash.com/photo-1535295972055-1c762f4483e5?q=80&w=1000&auto=format&fit=crop',
    'Le syndicat du crime impitoyable.',
    'David Martinez',
    'https://images.unsplash.com/photo-1605631097488-269c1186c03f?q=80&w=1000&auto=format&fit=crop',
    'Le rêveur de Night City.',
    true
);

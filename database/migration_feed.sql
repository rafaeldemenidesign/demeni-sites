-- ===========================
-- DEMENI SITES - FEED TABLES
-- Run this in Supabase SQL Editor
-- ===========================

-- ========== FEED POSTS ==========
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    text TEXT NOT NULL,
    image_url TEXT,
    author_name TEXT DEFAULT 'Demeni Sites',
    author_avatar TEXT DEFAULT 'https://ui-avatars.com/api/?name=Demeni&background=7c3aed&color=fff',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== FEED INTERACTIONS ==========
CREATE TABLE IF NOT EXISTS feed_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    liked BOOLEAN DEFAULT FALSE,
    favorited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_feed_posts_status ON feed_posts(status);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created ON feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_user ON feed_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_interactions_post ON feed_interactions(post_id);

-- ========== RLS ==========
ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_interactions ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON feed_posts
    FOR SELECT USING (status = 'published');

-- Admin can manage all posts
CREATE POLICY "Admin can manage feed posts" ON feed_posts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Users can manage their own interactions
CREATE POLICY "Users can view own interactions" ON feed_interactions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions" ON feed_interactions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions" ON feed_interactions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id);

-- ========== FUNCTION: Update likes count ==========
CREATE OR REPLACE FUNCTION update_feed_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE feed_posts
    SET likes_count = (
        SELECT COUNT(*) FROM feed_interactions
        WHERE post_id = COALESCE(NEW.post_id, OLD.post_id) AND liked = TRUE
    )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_feed_interaction_change
    AFTER INSERT OR UPDATE OR DELETE ON feed_interactions
    FOR EACH ROW EXECUTE FUNCTION update_feed_likes_count();

-- ========== VERIFICATION ==========
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('feed_posts', 'feed_interactions');

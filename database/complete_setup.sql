-- ===========================
-- DEMENI SITES - COMPLETE SETUP SQL
-- Run this in Supabase SQL Editor
-- ===========================

-- =====================
-- 1. SUPPORT TICKETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    user_name TEXT,
    category TEXT NOT NULL CHECK (category IN ('tecnico', 'creditos', 'publicacao', 'conta', 'sugestao', 'outro')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
    admin_response TEXT,
    admin_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create their own tickets
CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);

-- =====================
-- 2. PUBLISHED SITES TABLE (for subdomain tracking)
-- =====================
CREATE TABLE IF NOT EXISTS published_sites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id TEXT NOT NULL UNIQUE,
    subdomain TEXT NOT NULL UNIQUE,
    site_name TEXT,
    site_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE published_sites ENABLE ROW LEVEL SECURITY;

-- Users can view their own sites
CREATE POLICY "Users can view own sites" ON published_sites
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own sites
CREATE POLICY "Users can create sites" ON published_sites
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sites
CREATE POLICY "Users can update own sites" ON published_sites
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = user_id);

-- Public can view active sites (for loading via subdomain)
CREATE POLICY "Public can view active sites" ON published_sites
    FOR SELECT 
    TO anon
    USING (is_active = TRUE);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_published_sites_user_id ON published_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_published_sites_subdomain ON published_sites(subdomain);

-- =====================
-- 3. ADD MISSING COLUMNS TO PROFILES
-- =====================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS used_starter_promo BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- =====================
-- 4. RESERVED SUBDOMAINS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS reserved_subdomains (
    subdomain TEXT PRIMARY KEY,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert reserved words
INSERT INTO reserved_subdomains (subdomain, reason) VALUES
    ('www', 'System reserved'),
    ('app', 'System reserved'),
    ('api', 'System reserved'),
    ('admin', 'System reserved'),
    ('mail', 'System reserved'),
    ('ftp', 'System reserved'),
    ('blog', 'System reserved'),
    ('loja', 'System reserved'),
    ('store', 'System reserved'),
    ('shop', 'System reserved'),
    ('demeni', 'Brand reserved'),
    ('rafael', 'Brand reserved'),
    ('suporte', 'System reserved'),
    ('support', 'System reserved'),
    ('help', 'System reserved'),
    ('dashboard', 'System reserved'),
    ('login', 'System reserved'),
    ('signup', 'System reserved'),
    ('register', 'System reserved'),
    ('test', 'System reserved'),
    ('staging', 'System reserved'),
    ('dev', 'System reserved'),
    ('prod', 'System reserved')
ON CONFLICT (subdomain) DO NOTHING;

-- =====================
-- 5. FUNCTION TO CHECK SUBDOMAIN AVAILABILITY
-- =====================
CREATE OR REPLACE FUNCTION is_subdomain_available(p_subdomain TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if reserved
    IF EXISTS (SELECT 1 FROM reserved_subdomains WHERE subdomain = p_subdomain) THEN
        RETURN FALSE;
    END IF;
    
    -- Check if already taken
    IF EXISTS (SELECT 1 FROM published_sites WHERE subdomain = p_subdomain) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- 6. ADMIN VIEW FOR ALL DATA (service role only)
-- =====================
-- Create view for admin dashboard statistics
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
    (SELECT COUNT(*) FROM profiles) as total_users,
    (SELECT COALESCE(SUM(credits), 0) FROM profiles) as total_credits,
    (SELECT COUNT(*) FROM published_sites WHERE is_active = TRUE) as total_sites,
    (SELECT COUNT(*) FROM support_tickets WHERE status = 'pending') as pending_tickets,
    (SELECT COUNT(*) FROM transactions WHERE payment_status = 'approved') as completed_purchases;

-- =====================
-- 7. MARK ADMIN USER
-- =====================
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'rafaeldemenidesign@gmail.com';

-- =====================
-- VERIFICATION QUERIES
-- =====================
-- Run these to verify setup is complete:

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'transactions', 'credit_packages', 'support_tickets', 'published_sites', 'reserved_subdomains');

-- Check profiles columns
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('credits', 'xp', 'level', 'used_starter_promo', 'is_admin');

-- Check admin user
SELECT id, email, name, credits, is_admin, used_starter_promo 
FROM profiles 
WHERE email = 'rafaeldemenidesign@gmail.com';

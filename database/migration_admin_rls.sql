-- ===========================
-- DEMENI SITES - ADMIN RLS POLICIES
-- Run this in Supabase SQL Editor
-- Allows admin users to read/write all data
-- ===========================

-- Helper function: Check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND is_admin = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========== PROFILES ==========
CREATE POLICY "Admin can read all profiles" ON profiles
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update all profiles" ON profiles
    FOR UPDATE USING (is_admin());

-- ========== TRANSACTIONS ==========
CREATE POLICY "Admin can read all transactions" ON transactions
    FOR SELECT USING (is_admin());

-- ========== PROJECTS ==========
CREATE POLICY "Admin can read all projects" ON projects
    FOR SELECT USING (is_admin());

-- ========== PUBLISHED SITES ==========
CREATE POLICY "Admin can read all published_sites" ON published_sites
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update all published_sites" ON published_sites
    FOR UPDATE USING (is_admin());

-- ========== SUPPORT TICKETS ==========
CREATE POLICY "Admin can read all tickets" ON support_tickets
    FOR SELECT USING (is_admin());

CREATE POLICY "Admin can update all tickets" ON support_tickets
    FOR UPDATE USING (is_admin());

-- ========== CREDIT PACKAGES ==========
CREATE POLICY "Admin can manage packages" ON credit_packages
    FOR ALL USING (is_admin());

-- ========== VERIFICATION ==========
-- Run this to verify policies were created:
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE policyname LIKE 'Admin%'
ORDER BY tablename;

-- ===========================
-- DEMENI SITES - MIGRATION: Starter Pack Support
-- Run this in Supabase SQL Editor
-- ===========================

-- 1. Add used_starter_promo field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS used_starter_promo BOOLEAN DEFAULT FALSE;

-- 2. Add 400 credits to the main admin account
UPDATE profiles 
SET 
    credits = 400, 
    xp = 100, 
    level = 2,
    updated_at = NOW()
WHERE email = 'rafaeldemenidesign@gmail.com';

-- Verify the changes
SELECT id, email, name, credits, xp, level, used_starter_promo 
FROM profiles 
WHERE email = 'rafaeldemenidesign@gmail.com';

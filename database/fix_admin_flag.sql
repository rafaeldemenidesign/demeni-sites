-- ===========================
-- FIX: Add is_admin column to profiles
-- and set admin flag for your account
-- Run this in Supabase SQL Editor
-- ===========================

-- Step 1: Add is_admin column (defaults to FALSE)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Set your account as admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'rafaeldemenidesign@gmail.com';

-- Step 3: Verify
SELECT id, name, email, is_admin FROM profiles WHERE is_admin = TRUE;

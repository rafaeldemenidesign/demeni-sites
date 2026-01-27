-- ===========================
-- DEMENI SITES - MIGRATION: Add html_content column
-- Run this in Supabase SQL Editor
-- ===========================

-- Add html_content column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS html_content TEXT;

-- Add index for faster slug lookups on published sites
CREATE INDEX IF NOT EXISTS idx_projects_published_slug ON projects(slug) WHERE published = true;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND column_name = 'html_content';

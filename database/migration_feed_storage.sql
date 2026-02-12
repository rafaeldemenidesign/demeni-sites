-- ===========================
-- DEMENI SITES - FEED IMAGE STORAGE
-- Run this in Supabase SQL Editor
-- Creates a public bucket for feed post images
-- ===========================

-- Create storage bucket for feed images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'feed-images',
    'feed-images',
    TRUE,
    5242880, -- 5MB limit
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read feed images (public bucket)
CREATE POLICY "Public read feed images" ON storage.objects
    FOR SELECT USING (bucket_id = 'feed-images');

-- Allow admin to upload/delete feed images
CREATE POLICY "Admin can upload feed images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'feed-images'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admin can update feed images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'feed-images'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

CREATE POLICY "Admin can delete feed images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'feed-images'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
    );

-- Verification
SELECT id, name, public FROM storage.buckets WHERE id = 'feed-images';

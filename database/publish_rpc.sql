-- ===========================
-- DEMENI SITES - Publish via RPC
-- CRITICAL: Run this in Supabase SQL Editor
-- This function bypasses RLS to ensure publish always works
-- ===========================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS publish_site(uuid, text, text, jsonb, text, text);

CREATE OR REPLACE FUNCTION publish_site(
    p_user_id UUID,
    p_name TEXT,
    p_slug TEXT,
    p_data JSONB,
    p_html_content TEXT,
    p_published_url TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER  -- Bypasses RLS - runs as the function owner (postgres)
SET search_path = public
AS $$
DECLARE
    result_row projects%ROWTYPE;
    existing_id UUID;
BEGIN
    -- Check if slug is used by ANOTHER user
    SELECT id INTO existing_id
    FROM projects
    WHERE slug = p_slug
      AND published = true
      AND user_id != p_user_id;
    
    IF existing_id IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', format('Slug "%s" is already in use by another user', p_slug)
        );
    END IF;

    -- Try to find existing project with this slug for this user
    SELECT id INTO existing_id
    FROM projects
    WHERE slug = p_slug
      AND user_id = p_user_id;

    IF existing_id IS NOT NULL THEN
        -- UPDATE existing
        UPDATE projects SET
            name = p_name,
            data = p_data,
            html_content = p_html_content,
            published = true,
            published_url = p_published_url,
            published_at = NOW(),
            updated_at = NOW()
        WHERE id = existing_id;

        RETURN jsonb_build_object(
            'success', true,
            'id', existing_id,
            'action', 'updated'
        );
    ELSE
        -- INSERT new
        INSERT INTO projects (user_id, name, slug, data, html_content, published, published_url, published_at, updated_at)
        VALUES (p_user_id, p_name, p_slug, p_data, p_html_content, true, p_published_url, NOW(), NOW())
        RETURNING * INTO result_row;

        RETURN jsonb_build_object(
            'success', true,
            'id', result_row.id,
            'action', 'created'
        );
    END IF;

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$;

-- Grant execute to authenticated users only
GRANT EXECUTE ON FUNCTION publish_site TO authenticated;
REVOKE EXECUTE ON FUNCTION publish_site FROM anon;

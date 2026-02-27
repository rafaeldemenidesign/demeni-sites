-- ===========================
-- FIX: Restaurar acesso público a sites publicados
-- Rodar no Supabase SQL Editor
-- ===========================

-- 1. Recriar policy de acesso público (DROP IF EXISTS + CREATE)
DROP POLICY IF EXISTS "Anyone can view published projects" ON projects;
CREATE POLICY "Anyone can view published projects"
    ON projects FOR SELECT
    USING (published = true);

-- 2. Verificar se existem projetos publicados
SELECT id, slug, name, published, published_at
FROM projects
WHERE published = true
ORDER BY published_at DESC;

-- 3. Verificar todas as policies ativas na tabela projects
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'projects'
ORDER BY policyname;

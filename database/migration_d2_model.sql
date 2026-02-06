-- ===========================
-- DEMENI SITES - D2 MODEL SCHEMA
-- Migration para suporte ao Modelo D-2
-- Sprint 02 - 29/01/2026
-- ===========================

-- ========== ADICIONAR CAMPOS PARA D-2 ==========

-- Campo de tipo de modelo (d1, d2, prime)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS model_type TEXT DEFAULT 'd1' 
CHECK (model_type IN ('d1', 'd2', 'prime'));

-- Campo de seções (estrutura flexível para D-2)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb;

-- Campo de páginas internas (máximo 2 para D-2)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS pages JSONB DEFAULT '[]'::jsonb;

-- Campo de navegação (header do D-2)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS navigation JSONB DEFAULT '{}'::jsonb;

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_projects_model_type ON projects(model_type);

-- ========== ATUALIZAR PROJETOS EXISTENTES ==========
-- Marcar todos os projetos existentes como D-1
UPDATE projects SET model_type = 'd1' WHERE model_type IS NULL;

-- ========== COMENTÁRIOS ==========
COMMENT ON COLUMN projects.model_type IS 'Tipo do modelo: d1 (Bio Link), d2 (Landing Page), prime (Site Completo)';
COMMENT ON COLUMN projects.sections IS 'Array de seções do D-2: [{id, type, order, data}]';
COMMENT ON COLUMN projects.pages IS 'Array de páginas internas do D-2: [{id, name, type, content}]';
COMMENT ON COLUMN projects.navigation IS 'Configuração de navegação: {items: [{label, target, type}]}';

-- ========== DONE ==========
-- Execute este script no Supabase SQL Editor
-- Após executar, todos os projetos existentes serão marcados como D-1

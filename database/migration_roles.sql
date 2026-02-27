-- ===========================
-- DEMENI CORE - MIGRATION: ROLES
-- Adiciona sistema de papéis para agência
-- Run this in Supabase SQL Editor
-- ===========================

-- 1. Adicionar coluna role à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'criadora' 
CHECK (role IN ('admin', 'vendedor', 'social_media', 'criadora', 'suporte', 'gestora'));

-- 2. Adicionar coluna is_admin (se não existir)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3. Setar Rafael como admin (pela coluna is_admin existente OU pelo email)
UPDATE profiles SET role = 'admin', is_admin = true 
WHERE is_admin = true OR email = 'rafael@rafaeldemeni.com';

-- 4. Criar tabela de pedidos (orders) — coração do pipeline
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quem vendeu
    vendedor_id UUID REFERENCES profiles(id),
    
    -- Quem dá suporte
    suporte_id UUID REFERENCES profiles(id),
    
    -- Quem cria
    criadora_id UUID REFERENCES profiles(id),
    
    -- Dados do cliente
    client_name TEXT NOT NULL,
    client_phone TEXT,
    client_email TEXT,
    client_instagram TEXT,
    
    -- Produto
    product_type TEXT NOT NULL CHECK (product_type IN ('d1', 'd2', 'd3', 'prime', 'ecommerce', 'saas')),
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Status do pipeline
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN (
        'lead',           -- Vendedor prospectou
        'contacted',      -- Vendedor contatou
        'meeting',        -- Reunião marcada
        'proposal',       -- Proposta enviada
        'converted',      -- Venda fechada
        'briefing',       -- Suporte colhendo info
        'production',     -- Criadora produzindo
        'approval',       -- Aguardando aprovação do cliente
        'adjustments',    -- Cliente pediu ajustes
        'delivered',      -- Site entregue e aprovado
        'completed',      -- Gestora finalizou
        'lost'            -- Lead perdido
    )),
    
    -- Briefing
    briefing JSONB DEFAULT '{}',
    
    -- Projeto vinculado (quando criado)
    project_id UUID REFERENCES projects(id),
    
    -- Tracking token (para página do cliente)
    tracking_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
    
    -- Notas internas
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_vendedor ON orders(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_orders_criadora ON orders(criadora_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking ON orders(tracking_token);

-- 6. RLS para orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Admin e Gestora veem tudo
CREATE POLICY "Admin and Gestora can view all orders"
    ON orders FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'gestora')
        )
    );

-- Admin e Gestora podem editar tudo
CREATE POLICY "Admin and Gestora can update all orders"
    ON orders FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'gestora')
        )
    );

-- Admin pode inserir
CREATE POLICY "Admin can insert orders"
    ON orders FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'vendedor')
        )
    );

-- Vendedor vê seus próprios leads/pedidos
CREATE POLICY "Vendedor can view own orders"
    ON orders FOR SELECT
    USING (vendedor_id = auth.uid());

-- Criadora vê pedidos atribuídos a ela
CREATE POLICY "Criadora can view assigned orders"
    ON orders FOR SELECT
    USING (criadora_id = auth.uid());

-- Suporte vê pedidos atribuídos a ele
CREATE POLICY "Suporte can view assigned orders"
    ON orders FOR SELECT
    USING (suporte_id = auth.uid());

-- Vendedor pode atualizar seus pedidos (status)
CREATE POLICY "Vendedor can update own orders"
    ON orders FOR UPDATE
    USING (vendedor_id = auth.uid());

-- Criadora pode atualizar pedidos atribuídos
CREATE POLICY "Criadora can update assigned orders"
    ON orders FOR UPDATE
    USING (criadora_id = auth.uid());

-- Suporte pode atualizar pedidos atribuídos
CREATE POLICY "Suporte can update assigned orders"
    ON orders FOR UPDATE
    USING (suporte_id = auth.uid());

-- 7. Policy para Admin/Gestora ver todos os profiles
CREATE POLICY "Admin and Gestora can view all profiles"
    ON profiles FOR SELECT
    USING (
        auth.uid() = id 
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.id = auth.uid() 
            AND p.role IN ('admin', 'gestora')
        )
    );

-- ========== FASE 6: EXTENSÕES ==========
-- Novas colunas na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'outro';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_link TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS deadline TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS production_time_ms INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendedor_name TEXT;

-- 8. Tabela de pagamentos
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method TEXT NOT NULL DEFAULT 'pix',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view payments"
    ON payments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin/Vendedor can insert payments"
    ON payments FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'vendedor', 'suporte'))
    );

-- 9. Tabela de log de atividades
CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    action TEXT NOT NULL DEFAULT 'status_change',
    from_status TEXT,
    to_status TEXT,
    performed_by TEXT,
    performed_by_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_order ON activity_log(order_id);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view activity"
    ON activity_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System can insert activity"
    ON activity_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 10. Tabela de performance mensal
CREATE TABLE IF NOT EXISTS performance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    month_key TEXT NOT NULL, -- '2026-02'
    sales INTEGER DEFAULT 0,
    target INTEGER DEFAULT 50,
    pct INTEGER DEFAULT 0,
    revenue DECIMAL(10,2) DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month_key)
);

ALTER TABLE performance_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view performance"
    ON performance_history FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "System can upsert performance"
    ON performance_history FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "System can update performance"
    ON performance_history FOR UPDATE USING (auth.uid() IS NOT NULL);

-- 11. Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) UNIQUE,
    salary_vendedor DECIMAL(10,2) DEFAULT 1500,
    salary_suporte DECIMAL(10,2) DEFAULT 1500,
    salary_criadora DECIMAL(10,2) DEFAULT 1400,
    commission_rate DECIMAL(5,2) DEFAULT 5,
    bonus_site DECIMAL(10,2) DEFAULT 5,
    sales_target INTEGER DEFAULT 50,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can manage settings"
    ON user_settings FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ========== DONE ==========
-- Rodar no Supabase SQL Editor
-- Depois: UPDATE profiles SET role = 'admin' WHERE email = 'SEU_EMAIL';

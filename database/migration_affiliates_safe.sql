-- ===========================
-- DEMENI SITES - AFFILIATES SCHEMA (SAFE VERSION)
-- Sistema de Afiliados (Sprint 02)
-- Esta versão remove policies existentes antes de recriar
-- ===========================

-- ========== DROP EXISTING POLICIES (se existirem) ==========
DROP POLICY IF EXISTS "Users can view own affiliate" ON affiliates;
DROP POLICY IF EXISTS "Users can update own affiliate" ON affiliates;
DROP POLICY IF EXISTS "Users can view their franchisee affiliates" ON affiliates;
DROP POLICY IF EXISTS "Users can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Users can update own referrals" ON referrals;
DROP POLICY IF EXISTS "Users can view own config" ON affiliate_configs;
DROP POLICY IF EXISTS "Users can insert own config" ON affiliate_configs;
DROP POLICY IF EXISTS "Users can update own config" ON affiliate_configs;

-- ========== AFFILIATES TABLE ==========
CREATE TABLE IF NOT EXISTS affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'demeni' CHECK (type IN ('demeni', 'franchisee')),
    parent_user_id UUID REFERENCES profiles(id),
    commission_type TEXT DEFAULT 'fixed' CHECK (commission_type IN ('fixed', 'percentage')),
    commission_value DECIMAL(10,2) DEFAULT 0,
    total_earned DECIMAL(10,2) DEFAULT 0,
    total_referrals INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== REFERRALS TABLE ==========
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
    referred_user_id UUID REFERENCES profiles(id),
    referred_email TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'paid', 'cancelled')),
    sale_value DECIMAL(10,2),
    commission_earned DECIMAL(10,2),
    commission_type TEXT DEFAULT 'credits' CHECK (commission_type IN ('credits', 'pix')),
    converted_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== AFFILIATE CONFIGS TABLE ==========
CREATE TABLE IF NOT EXISTS affiliate_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT FALSE,
    default_commission_type TEXT DEFAULT 'fixed' CHECK (default_commission_type IN ('fixed', 'percentage')),
    d1_commission DECIMAL(10,2) DEFAULT 20.00,
    d2_commission DECIMAL(10,2) DEFAULT 40.00,
    prime_commission DECIMAL(10,2) DEFAULT 80.00,
    nfc_commission DECIMAL(10,2) DEFAULT 10.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========== ADD REFERRAL CODE TO PROFILES ==========
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES affiliates(id),
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- ========== INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_parent_user_id ON affiliates(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user_id ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- ========== ROW LEVEL SECURITY ==========
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_configs ENABLE ROW LEVEL SECURITY;

-- Affiliates: Users can view/update their own affiliate record
CREATE POLICY "Users can view own affiliate"
    ON affiliates FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own affiliate"
    ON affiliates FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can view affiliates they own (franchisee affiliates)
CREATE POLICY "Users can view their franchisee affiliates"
    ON affiliates FOR SELECT
    USING (auth.uid() = parent_user_id);

-- Referrals: Users can view referrals for their affiliate
CREATE POLICY "Users can view own referrals"
    ON referrals FOR SELECT
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid() OR parent_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert referrals"
    ON referrals FOR INSERT
    WITH CHECK (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid() OR parent_user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own referrals"
    ON referrals FOR UPDATE
    USING (
        affiliate_id IN (
            SELECT id FROM affiliates WHERE user_id = auth.uid() OR parent_user_id = auth.uid()
        )
    );

-- Affiliate Configs: Users can CRUD their own config
CREATE POLICY "Users can view own config"
    ON affiliate_configs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own config"
    ON affiliate_configs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own config"
    ON affiliate_configs FOR UPDATE
    USING (auth.uid() = user_id);

-- ========== FUNCTION: Generate Referral Code ==========
CREATE OR REPLACE FUNCTION generate_referral_code(user_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_code TEXT;
    final_code TEXT;
    counter INTEGER := 0;
BEGIN
    base_code := UPPER(REGEXP_REPLACE(SPLIT_PART(user_name, ' ', 1), '[^A-Za-z]', '', 'g'));
    base_code := SUBSTRING(base_code FROM 1 FOR 6);
    final_code := base_code || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    
    WHILE EXISTS (SELECT 1 FROM affiliates WHERE referral_code = final_code) LOOP
        counter := counter + 1;
        final_code := base_code || LPAD((FLOOR(RANDOM() * 1000) + counter)::TEXT, 3, '0');
    END LOOP;
    
    RETURN final_code;
END;
$$ LANGUAGE plpgsql;

-- ========== FUNCTION: Create Affiliate on User Signup ==========
CREATE OR REPLACE FUNCTION create_affiliate_for_new_user()
RETURNS TRIGGER AS $$
DECLARE
    ref_code TEXT;
BEGIN
    ref_code := generate_referral_code(COALESCE(NEW.name, 'USER'));
    
    INSERT INTO affiliates (user_id, referral_code, type)
    VALUES (NEW.id, ref_code, 'demeni');
    
    UPDATE profiles SET referral_code = ref_code WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create affiliate
DROP TRIGGER IF EXISTS on_profile_created_create_affiliate ON profiles;
CREATE TRIGGER on_profile_created_create_affiliate
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_affiliate_for_new_user();

-- ========== FUNCTION: Process Referral on First Purchase ==========
CREATE OR REPLACE FUNCTION process_referral_commission()
RETURNS TRIGGER AS $$
DECLARE
    referrer_affiliate affiliates%ROWTYPE;
    commission_amount DECIMAL(10,2);
BEGIN
    IF NEW.type = 'credit' AND NEW.amount > 0 THEN
        SELECT a.* INTO referrer_affiliate
        FROM affiliates a
        JOIN profiles p ON p.referred_by = a.id
        WHERE p.id = NEW.user_id;
        
        IF FOUND THEN
            IF NOT EXISTS (
                SELECT 1 FROM transactions 
                WHERE user_id = NEW.user_id 
                AND type = 'credit' 
                AND id != NEW.id
            ) THEN
                commission_amount := 100.00;
                
                UPDATE referrals 
                SET status = 'converted',
                    commission_earned = commission_amount,
                    converted_at = NOW()
                WHERE affiliate_id = referrer_affiliate.id 
                AND referred_user_id = NEW.user_id
                AND status = 'pending';
                
                UPDATE profiles 
                SET credits = credits + commission_amount::INTEGER
                WHERE id = referrer_affiliate.user_id;
                
                UPDATE affiliates
                SET total_earned = total_earned + commission_amount,
                    total_referrals = total_referrals + 1
                WHERE id = referrer_affiliate.id;
                
                INSERT INTO transactions (user_id, type, amount, description)
                VALUES (
                    referrer_affiliate.user_id, 
                    'credit', 
                    commission_amount::INTEGER, 
                    'Comissão de indicação - Novo franqueado'
                );
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for processing referral commissions
DROP TRIGGER IF EXISTS on_transaction_process_referral ON transactions;
CREATE TRIGGER on_transaction_process_referral
    AFTER INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION process_referral_commission();

-- ========== DONE ==========
-- Pronto! Execute este script no Supabase SQL Editor

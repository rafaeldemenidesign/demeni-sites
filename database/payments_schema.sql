-- Demeni Sites - Payment Schema
-- Run this in Supabase SQL Editor

-- Transactions table for payment history
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'bonus', 'refund')),
    amount INTEGER NOT NULL, -- credits amount (positive for purchase, negative for spend)
    description TEXT,
    payment_id TEXT, -- Mercado Pago payment ID
    payment_status TEXT, -- pending, approved, rejected
    payment_method TEXT, -- pix, credit_card, boleto
    price_paid DECIMAL(10,2), -- actual money paid in BRL
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit packages table
CREATE TABLE IF NOT EXISTS credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- price in BRL
    bonus_credits INTEGER DEFAULT 0, -- extra credits as bonus
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default credit packages
INSERT INTO credit_packages (name, credits, price, bonus_credits, sort_order) VALUES
    ('Starter', 50, 9.90, 0, 1),
    ('Popular', 150, 24.90, 15, 2),
    ('Pro', 500, 69.90, 75, 3),
    ('Business', 1500, 179.90, 300, 4)
ON CONFLICT DO NOTHING;

-- Level discounts table
CREATE TABLE IF NOT EXISTS level_discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_level INTEGER NOT NULL UNIQUE,
    discount_percent INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert level discounts
INSERT INTO level_discounts (min_level, discount_percent) VALUES
    (1, 0),    -- Levels 1-4: 0%
    (5, 5),    -- Levels 5-9: 5%
    (10, 10),  -- Levels 10-19: 10%
    (20, 15),  -- Levels 20-49: 15%
    (50, 20)   -- Levels 50+: 20%
ON CONFLICT DO NOTHING;

-- Function to get user discount based on level
CREATE OR REPLACE FUNCTION get_user_discount(user_level INTEGER)
RETURNS INTEGER AS $$
DECLARE
    discount INTEGER;
BEGIN
    SELECT discount_percent INTO discount
    FROM level_discounts
    WHERE min_level <= user_level
    ORDER BY min_level DESC
    LIMIT 1;
    
    RETURN COALESCE(discount, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to add credits (only callable by service role)
CREATE OR REPLACE FUNCTION add_credits(
    p_user_id UUID,
    p_amount INTEGER,
    p_type TEXT DEFAULT 'purchase',
    p_description TEXT DEFAULT NULL,
    p_payment_id TEXT DEFAULT NULL,
    p_payment_status TEXT DEFAULT NULL,
    p_payment_method TEXT DEFAULT NULL,
    p_price_paid DECIMAL DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    new_balance INTEGER;
BEGIN
    -- Update user credits
    UPDATE profiles 
    SET credits = credits + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id
    RETURNING credits INTO new_balance;
    
    -- Log transaction
    INSERT INTO transactions (
        user_id, type, amount, description, 
        payment_id, payment_status, payment_method, price_paid
    ) VALUES (
        p_user_id, p_type, p_amount, p_description,
        p_payment_id, p_payment_status, p_payment_method, p_price_paid
    );
    
    RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_discounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Anyone can view active packages
CREATE POLICY "Anyone can view packages" ON credit_packages
    FOR SELECT USING (is_active = true);

-- Anyone can view discounts
CREATE POLICY "Anyone can view discounts" ON level_discounts
    FOR SELECT TO authenticated USING (true);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON transactions(payment_id);

-- Execute no Supabase SQL Editor para resetar o Starter Pack
UPDATE profiles
SET used_starter_promo = false
WHERE email = 'rafaeldemenidesign@gmail.com';

-- Verificar
SELECT id, email, used_starter_promo FROM profiles WHERE email = 'rafaeldemenidesign@gmail.com';

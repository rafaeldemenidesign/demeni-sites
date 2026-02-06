-- ===========================
-- DEMENI SITES - Restaurar Créditos do Usuário Rafael
-- Execute no Supabase SQL Editor
-- ===========================

-- 1. Atualizar créditos para 400
UPDATE profiles 
SET credits = 400 
WHERE email = 'rafaeldemenidesign@gmail.com';

-- 2. Resetar starter promo para que apareça novamente (se quiser testar)
-- UPDATE profiles 
-- SET used_starter_promo = FALSE 
-- WHERE email = 'rafaeldemenidesign@gmail.com';

-- 3. Verificar resultado
SELECT id, email, name, credits, used_starter_promo, is_admin 
FROM profiles 
WHERE email = 'rafaeldemenidesign@gmail.com';

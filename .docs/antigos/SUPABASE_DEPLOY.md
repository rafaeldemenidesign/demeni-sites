# Demeni Sites - Guia de Deploy Supabase

Este guia contém todos os passos para configurar o Supabase para o Demeni Sites.

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase
3. [Supabase CLI](https://supabase.com/docs/guides/cli) instalado (opcional, para Edge Functions)
4. Conta no [Mercado Pago](https://www.mercadopago.com.br/developers)

---

## 1️⃣ Configurar Banco de Dados

### Passo 1: Executar SQL Principal

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **New Query**
4. Copie e cole o conteúdo de `database/schema.sql`
5. Execute (F5 ou botão Run)
6. Repita para `database/payments_schema.sql`
7. Repita para `database/complete_setup.sql`

### Verificar Tabelas

Após executar, verifique se as tabelas existem:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Deve listar:
- `profiles`
- `transactions`
- `credit_packages`
- `level_discounts`
- `support_tickets`
- `published_sites`
- `reserved_subdomains`

---

## 2️⃣ Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Habilite **Email**
3. Desabilite "Confirm email" (para testes)
4. Vá em **URL Configuration**
5. Configure:
   - Site URL: `https://demeni-sites.vercel.app`
   - Redirect URLs: 
     - `https://demeni-sites.vercel.app/app.html`
     - `http://localhost:5500/app.html`

---

## 3️⃣ Configurar Variáveis de Ambiente

Para o frontend, já configuradas em `js/config.js`:

```javascript
const SUPABASE_URL = 'sua-url.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon';
```

Para obter essas chaves:
1. Vá em **Settings** > **API**
2. Copie **Project URL** e **anon public key**

---

## 4️⃣ Deploy das Edge Functions

### Opção A: Via Supabase Dashboard

1. Vá em **Edge Functions**
2. Clique **Create a new function**
3. Nome: `create-payment`
4. Cole o código de `supabase/functions/create-payment/index.ts`
5. Clique **Deploy**
6. Repita para `mp-webhook`

### Opção B: Via CLI (Recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Deploy
supabase functions deploy create-payment
supabase functions deploy mp-webhook
```

### Configurar Secrets

Após deploy, configure os secrets:

```bash
supabase secrets set MP_ACCESS_TOKEN=SEU_TOKEN_MERCADO_PAGO
```

Ou via Dashboard:
1. Vá em **Edge Functions**
2. Selecione a função
3. Vá em **Secrets**
4. Adicione:
   - `MP_ACCESS_TOKEN`: Token do Mercado Pago

---

## 5️⃣ Configurar Mercado Pago

### Obter Credenciais

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Suas integrações** > **Criar aplicação**
3. Nome: "Demeni Sites"
4. Produto: "Checkout Pro"
5. Copie o **Access Token** (produção ou teste)

### Configurar Webhook

1. Em **Suas integrações**, selecione sua app
2. Vá em **Webhooks** > **IPN**
3. URL de produção:
   ```
   https://SEU_PROJECT_REF.supabase.co/functions/v1/mp-webhook
   ```
4. Eventos: Selecione **Payments**

### Para Testes

Use credenciais de teste:
- Access Token de teste (sandbox)
- [Cartões de teste](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards)

---

## 6️⃣ Testar a Integração

### Criar Usuário Admin

```sql
-- Inserir admin (se não existir)
INSERT INTO auth.users (email, encrypted_password) 
VALUES ('rafaeldemenidesign@gmail.com', crypt('sua_senha', gen_salt('bf')));

-- Marcar como admin
UPDATE profiles 
SET is_admin = TRUE, credits = 400
WHERE email = 'rafaeldemenidesign@gmail.com';
```

### Testar Fluxo

1. Acesse `app.html` e faça login
2. Vá em **Minha Carteira**
3. Clique em um pacote
4. Complete o pagamento de teste
5. Verifique se os créditos foram adicionados

---

## 7️⃣ Checklist Final

- [ ] Tabelas criadas no banco
- [ ] Auth funcionando
- [ ] Edge Functions deployed
- [ ] Mercado Pago configurado
- [ ] Webhook IPN ativo
- [ ] Admin com créditos
- [ ] Teste de pagamento OK

---

## 🔧 Troubleshooting

### Edge Function não recebe webhook

1. Verifique se a URL está correta no MP
2. Verifique logs: **Edge Functions** > **Logs**
3. Teste manualmente:
   ```bash
   curl -X POST https://SEU_PROJECT_REF.supabase.co/functions/v1/mp-webhook \
     -H "Content-Type: application/json" \
     -d '{"type":"payment","data":{"id":"12345"}}'
   ```

### Créditos não adicionados

1. Verifique o `external_reference` no MP
2. Verifique logs do webhook
3. Confirme que `user_id` existe em `profiles`

### CORS errors

Verifique os headers na Edge Function:
```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

# 💳 Mercado Pago - Guia de Configuração

## Passo 1: Criar Conta de Desenvolvedor

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login com sua conta Mercado Pago
3. Clique em "Criar aplicação"
4. Nome: "Demeni Sites"
5. Selecione: "Checkout Pro"

## Passo 2: Obter Credenciais

### Credenciais de TESTE (Sandbox):
1. Na aplicação criada, vá em "Credenciais de teste"
2. Copie:
   - **Public Key**: `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - **Access Token**: `TEST-xxxxxxxxxxxxxxxxxxxxxxxxxx`

### Credenciais de PRODUÇÃO (Depois de testar):
1. Vá em "Credenciais de produção"
2. Copie as mesmas chaves (sem prefixo TEST)

## Passo 3: Configurar no Supabase

### Adicionar variáveis de ambiente:
1. Acesse: https://supabase.com/dashboard/project/aeyxdqggngapczohqvbo/settings/vault
2. Clique em "New secret"
3. Adicione:
   - **Nome**: `MP_ACCESS_TOKEN`
   - **Valor**: Seu Access Token do Mercado Pago

### Deploy das Edge Functions:
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref aeyxdqggngapczohqvbo

# Deploy das funções
supabase functions deploy create-payment
supabase functions deploy mp-webhook
```

## Passo 4: Configurar Webhook no MP

1. No painel do Mercado Pago, vá em "Webhooks"
2. URL de notificação:
   ```
   https://aeyxdqggngapczohqvbo.supabase.co/functions/v1/mp-webhook
   ```
3. Eventos: "Pagamentos"

## Passo 5: Configurar no Frontend

Edite `js/payments.js`:
```javascript
const MP_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
```

## Testando

### Cartões de Teste:
| Tipo | Número | CVV | Vencimento |
|------|--------|-----|------------|
| Mastercard (Aprovado) | 5031 4332 1540 6351 | 123 | 11/25 |
| Visa (Aprovado) | 4235 6477 2802 5682 | 123 | 11/25 |
| Mastercard (Rejeitado) | 5031 4332 1540 6360 | 123 | 11/25 |

### Usuário de Teste:
- Email: `test_user_XXXXXXXXX@testuser.com`
- Senha: `qatest1234`

## Fluxo de Teste

1. Acesse `/app.html`
2. Vá em "Minha Carteira"
3. Clique em um pacote
4. Use um cartão de teste
5. Verifique se os créditos foram adicionados

## Segurança

- ✅ Créditos só são adicionados via webhook (backend)
- ✅ Webhook valida assinatura do Mercado Pago
- ✅ Frontend não consegue manipular créditos
- ✅ Todas as transações são logadas no banco

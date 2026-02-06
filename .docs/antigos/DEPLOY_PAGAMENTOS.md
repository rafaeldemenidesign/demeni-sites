# 🚀 Deploy e Ativação de Pagamentos - Demeni Sites

## ⚠️ PROBLEMA ATUAL
O erro "Uma das partes... é de teste" significa que o `MP_ACCESS_TOKEN` no Supabase é de **SANDBOX** (teste).

---

## 📋 PASSO 1: Obter Credenciais de PRODUÇÃO do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação (ou crie uma nova)
3. Vá em **Credenciais de produção**
4. Copie o **Access Token** de produção (começa com `APP_USR-` seguido de números)

> ⚠️ **IMPORTANTE**: NÃO use o token de teste (que tem "TEST" no nome)

---

## 📋 PASSO 2: Atualizar Token no Supabase

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione o projeto `demeni-sites`
3. Vá em **Project Settings** → **Edge Functions**
4. Clique em **Secrets**
5. Edite a secret `MP_ACCESS_TOKEN`
6. Cole o token de **PRODUÇÃO** do Mercado Pago
7. Salve

---

## 📋 PASSO 3: Deploy da Edge Function Atualizada

Execute no terminal (na pasta do projeto):

```bash
cd demeni-sites
supabase functions deploy create-payment --no-verify-jwt
```

Se não tiver o Supabase CLI instalado:
```bash
npm install -g supabase
supabase login
supabase link --project-ref SEU_PROJECT_REF
supabase functions deploy create-payment --no-verify-jwt
```

---

## 📋 PASSO 4: Deploy do Frontend no Vercel

```bash
cd demeni-sites
vercel --prod
```

---

## ✅ O QUE FOI ATUALIZADO

1. **PIX habilitado** como método de pagamento preferencial
2. **Parcelamento até 12x** disponível
3. **URLs de retorno** corrigidas para `/demeni-sites/app.html`
4. **Todos os métodos** de pagamento liberados (PIX, Cartão, Boleto)

---

## 🧪 TESTE APÓS DEPLOY

1. Acesse https://rafaeldemeni.com/demeni-sites/app.html
2. Vá em "Minha Carteira"
3. Clique em "Comprar" em qualquer pacote
4. Verifique se aparece a opção **PIX** no checkout do Mercado Pago

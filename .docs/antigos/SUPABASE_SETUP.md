# Configuração do Supabase

## Passo 1: Criar Conta
1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub

## Passo 2: Criar Projeto
1. Clique em "New Project"
2. Preencha:
   - **Name**: demeni-sites
   - **Database Password**: (anote em lugar seguro!)
   - **Region**: South America (São Paulo)
3. Clique "Create new project"
4. Aguarde ~2 minutos

## Passo 3: Executar Schema
1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Cole todo o conteúdo do arquivo `schema.sql`
4. Clique **Run**

## Passo 4: Configurar Auth
1. Vá em **Authentication** > **Providers**
2. Certifique-se que **Email** está habilitado
3. Opcional: Desabilite "Confirm email" para testes

## Passo 5: Obter Credenciais
1. Vá em **Project Settings** > **API**
2. Copie:
   - **Project URL** (começa com https://...)
   - **anon public key** (chave grande)

## Passo 6: Configurar no Código
Abra `js/supabase.js` e substitua:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://SEU_PROJETO.supabase.co',
    anonKey: 'SUA_CHAVE_ANON_AQUI'
};
```

## Pronto!
O sistema agora usará o Supabase para autenticação e banco de dados.

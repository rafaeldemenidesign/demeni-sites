# Configuração de DNS para Subdomínios

## Objetivo
Permitir que sites publicados fiquem em `cliente.rafaeldemeni.com`

## Pré-requisitos
- Acesso ao painel DNS do domínio `rafaeldemeni.com`
- Projeto hospedado na Vercel (demeni-sites.vercel.app)

---

## Opção 1: Wildcard DNS (Recomendado)

### Passo 1: Adicionar registro no DNS
Acesse o painel do seu provedor de domínio (ex: Registro.br, Cloudflare, GoDaddy) e adicione:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | `*` | `cname.vercel-dns.com` | Auto |

> O asterisco (*) significa "qualquer subdomínio"

### Passo 2: Configurar na Vercel
1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Clique no projeto `demeni-sites`
3. Vá em **Settings** → **Domains**
4. Adicione: `*.rafaeldemeni.com`
5. Siga as instruções de verificação

### Passo 3: Verificar
Após propagação (até 48h, geralmente 15min):
- `teste.rafaeldemeni.com` → deve mostrar seu app
- `cliente.rafaeldemeni.com` → deve mostrar seu app

---

## Opção 2: Subdomínios Individuais

Se seu provedor não suporta wildcard, adicione cada subdomínio manualmente:

| Tipo | Nome | Valor |
|------|------|-------|
| CNAME | `cliente1` | `cname.vercel-dns.com` |
| CNAME | `cliente2` | `cname.vercel-dns.com` |

---

## Opção 3: Usando Cloudflare (Grátis)

1. Transfira o DNS do domínio para Cloudflare
2. Adicione registro CNAME wildcard
3. Ative "Proxy" para SSL automático
4. Configure na Vercel

---

## Configuração SSL
A Vercel gera certificados SSL automaticamente para domínios verificados. Não precisa de configuração adicional.

---

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "DNS não propagou" | Aguarde até 48h, use [dnschecker.org](https://dnschecker.org) |
| "Certificado inválido" | Aguarde Vercel emitir SSL (automático) |
| "Wildcard não funciona" | Verifique se provedor suporta CNAME wildcard |

---

## Próximo Passo: Roteamento de Subdomínios

Após DNS configurado, precisamos fazer o app mostrar o site correto para cada subdomínio. Isso será feito via:

```javascript
// js/router.js (a criar)
const subdomain = window.location.hostname.split('.')[0];
if (subdomain !== 'www' && subdomain !== 'demeni-sites') {
    // Carregar site do cliente baseado no subdomain
    loadSiteBySlug(subdomain);
}
```

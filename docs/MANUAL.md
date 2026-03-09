# MANUAL DA OPERAÇÃO — DEMENI SITES

> **Este é o documento vivo do projeto. Toda decisão, regra e arquitetura está aqui.**
> Agentes de IA: LEIAM ESTE DOCUMENTO ANTES DE QUALQUER AÇÃO.

---

## 1. O QUE É O DEMENI SITES

Plataforma SaaS de criação de sites para franqueados que não são designers nem programadores.
Modelo de franquia digital onde o franqueado compra créditos para publicar sites e revende para seus clientes.

### Modelo de Negócio

```
RAFAEL (Plataforma) → cobra créditos → FRANQUEADO → cobra mensalidade → CLIENTE FINAL
```

- **Rafael paga:** domínio (~R$50/ano), Supabase (free→$25/mês), Vercel (free→$20/mês)
- **Rafael recebe:** R$25-60 por publicação (venda de créditos, cobrança única)
- **Renovação:** R$20/ano por site publicado (após 1 ano grátis). Auto-despublicação se não renovar.
- **NÃO existe mensalidade** do franqueado para a plataforma — só créditos + renovação anual.

---

## 2. AS 4 PERSONAS

### 🏢 Persona 1: Demeni Sites (Rafael)
- **Papel:** Dono, desenvolvedor e administrador da plataforma
- **Cria as contas** dos franqueados (o franqueado NÃO se cadastra sozinho)
- **Acessa:** Admin dashboard, painel de controle, métricas, gestão de franqueados
- **Receita:** Créditos de publicação + renovação anual

### 👤 Persona 2: Franqueado
- **Quem é:** Empreendedor sem skills técnicos. Quer renda extra criando sites.
- **Acessa:** Dashboard, Editor D2 (e D1 quando pronto), preview, publicação
- **Compra:** Créditos do Demeni Sites para publicar
- **Vende:** Sites para clientes finais, cobrando o que quiser
- **Renda recorrente:** Cobra R$5-30/mês do Cliente Final (manutenção) via ferramenta externa (Mercado Pago, PIX etc)
- **Dados:** `profiles` (perfil, créditos, XP), `projects` (seus projetos) no Supabase
- **Jornada:** Rafael cria conta → Franqueado compra créditos → Cria site no editor → Publica → Vende para o cliente

### 🏪 Persona 3: Cliente Final
- **Quem é:** Dono de negócio local (loja, restaurante, serviço)
- **NÃO tem login** na plataforma — interage apenas com o Franqueado
- **Recebe:** Link do site publicado (`slug.rafaeldemeni.com`)
- **Paga:** Diretamente ao Franqueado (fora da plataforma)
- **Dados na plataforma:** Nenhum

### 👁️ Persona 4: Visitante
- **Quem é:** Consumidor que acessa o site do Cliente Final
- **Acessa:** Apenas o site publicado
- **Consome:** Bandwidth (cada visita = tamanho do site)
- **Dados na plataforma:** Nenhum

---

## 3. COMO O FRANQUEADO LUCRA

| Ação | Valor |
|---|---|
| Compra créditos do Demeni Sites | R$25-60 (uma vez) |
| Vende o site para o Cliente Final | R$200-800 (uma vez, preço livre) |
| Cobra manutenção mensal | R$5-30/mês (3 planos possíveis) |
| Renovação anual Demeni Sites | R$20/ano |

**Exemplo com 10 clientes a R$15/mês:**
- Receita: R$150/mês = R$1.800/ano
- Custo Demeni: R$200/ano (10 × R$20 renovação)
- **Lucro: R$1.600/ano em renda recorrente**

**Cobrança recorrente:** O franqueado usa Mercado Pago Assinaturas, PagBank, InfinityPay ou PIX manual para cobrar seus clientes. A plataforma Demeni Sites não processa pagamentos do Cliente Final.

---

## 4. ARQUITETURA TÉCNICA

### Stack

| Componente | Tecnologia | Função |
|---|---|---|
| Frontend | HTML5/CSS3/JS vanilla | Plataforma, editor, preview |
| Hosting | Vercel (CDN global) | Serve a plataforma e sites publicados |
| Database | Supabase (PostgreSQL) | Auth, perfis, projetos, HTML publicado |
| Storage local | IndexedDB + localStorage | Cache de projetos no navegador |
| Domínio | `rafaeldemeni.com` | Wildcard subdomínios para sites |

### Como sites são publicados

1. Franqueado edita no Editor D2 → estado salvo em IndexedDB + sync Supabase
2. Clica "Publicar" → HTML completo gerado (auto-contido, com CSS/JS inline)
3. HTML salvo no Supabase `projects.html_content`
4. Visitante acessa `slug.rafaeldemeni.com` ou `/s/slug`
5. **Edge Function** (`api/subdomain.js`) busca HTML no Supabase via REST API
6. Resposta servida com **cache CDN** (1h cache, 24h stale-while-revalidate)
7. Visitantes na mesma região recebem resposta instantânea do cache sem tocar no Supabase

### Custos de infraestrutura

**O que pesa:** tamanho do site × número de visitas

| Cenário | Custo/mês |
|---|---|
| Até ~200 sites, tráfego moderado | **R$0** (free tier) |
| ~500 sites | **~R$255/mês** (Supabase Pro + Vercel Pro) |
| ~1.000 sites | **~R$400/mês** |

### Limites recomendados por site

| Item | Máximo | Motivo |
|---|---|---|
| Produtos | 30 | Performance e UX |
| Feedbacks | 10 | Poluição visual |
| Categorias | 8 | Espaço na tela |

### Proteção de dados (implementado)

- `_dataLoaded` flag: bloqueia auto-save antes de carregar dados reais
- `loadState()`: rejeita dados null/vazios
- `scheduleSave()` / `saveToStorage()`: dupla proteção contra save de defaults
- Template default neutro ("Meu Negócio") em vez de dados branded

---

## 5. EDITORES

### Editor D2 (Minisite Boutique) — ✅ Funcionando
- Editor visual completo com seções: Hero, Categorias, Produtos, Feedbacks, CTA, Footer, PWA
- Preview mobile em tempo real
- Personalização granular de cores, fontes, gradientes, imagens
- Publicação com slug customizado

#### Seções planejadas para o D2:

| Seção | Tipo | Descrição |
|---|---|---|
| **Banner Divisor** | Destaque | Seção curta com título + subtítulo. Funciona como separador/destaque entre seções. Pode ser inserido em qualquer posição, múltiplas vezes. |
| **Acordeão** | Conteúdo | Cards que expandem/recolhem verticalmente. Ideal para currículo digital (experiências, formações, habilidades). Cada card tem título + conteúdo detalhado. |

### Editor D1 (Link-na-Bio) — 🔧 Em desenvolvimento
- Template de links tipo Linktree
- Previsão: fim de fevereiro/2026

---

## 6. DEMENI CORE — 8 FRENTES DE GESTÃO

O Demeni Core é o sistema de gestão interna do SaaS, organizado em 8 frentes (protocolos) que cobrem 126 micro-tarefas:

| # | Frente | Emoji | Cor | Escopo |
|---|---|---|---|---|
| P1 | **Saúde do Código** | 🔧 | `#D4944C` | Auditoria de erros, funcionalidades D2/D1, limpeza de código morto |
| P2 | **Segurança de Dados** | 🛡️ | `#5B9BD5` | Soft-delete, lixeira, proteção anti-massa, continuidade |
| P3 | **Identidade Visual** | 🎨 | `#C47058` | Design tokens, auditoria de componentes, padrões visuais |
| P4 | **Experiência UX** | 👤 | `#7BA884` | Fluxos críticos, navegação, mensagens, onboarding |
| P5 | **Segurança vs Ataques** | 🔐 | `#E06B56` | Isolamento, proteção frontend, headers/config |
| P6 | **Marketing & Conteúdo** | 📱 | `#C4727E` | Templates de conteúdo, landing page, material de apoio |
| P7 | **Franquia & Crescimento** | 🏢 | `#6B9EA3` | Automações, documentação para franqueados |
| P8 | **Saúde Financeira** | 💰 | `#9B7EB8` | Infraestrutura de pagamentos, controles de crédito |

> Gerenciado pelo app Demeni Core (projeto separado em `ORGANIZAÇÃO/`).

---

## 7. ROADMAP / PENDÊNCIAS

### Prioridade Alta
- [x] Proteção de dados (4 camadas anti-overwrite) — commit `c9f14dd`
- [x] Edge Function com cache CDN — commit `008b523`
- [ ] Implementar limites de itens por seção no editor
- [ ] Nova seção: **Banner Divisor** (destaque entre seções)
- [ ] Nova seção: **Acordeão** (cards expansíveis para currículo)
- [ ] Sistema de despublicação automática (renovação anual)

### Prioridade Média
- [ ] Editor D1 finalização
- [ ] Material de vendas para o franqueado ("como lucrar")
- [ ] Dashboard de métricas para o admin

### Prioridade Baixa
- [ ] Domínios custom por site (cliente paga extra)
- [ ] Templates adicionais
- [ ] Analytics de visitantes por site

---

## 8. REGRAS PARA AGENTES DE IA

1. **SEMPRE leia este MANUAL.md antes de qualquer modificação no projeto**
2. O template default NÃO pode conter dados branded (nada de "TechCell", "iPhone" etc)
3. Auto-save NUNCA deve funcionar antes de `_dataLoaded = true`
4. Quem cria conta de franqueado é o RAFAEL, não o próprio franqueado
5. A plataforma NÃO processa pagamentos do Cliente Final
6. Documentação avulsa vai para `_archive/`, este MANUAL é o documento principal

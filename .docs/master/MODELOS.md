# 📱 MODELOS DE SITE - DEMENI SITES

> Especificação técnica e funcional dos modelos disponíveis  
> **Atualizado**: 29/01/2026

---

## 🏷️ Nomenclatura e Preços

| Modelo | Nome | Custo Créditos | Preço Venda | Status |
|--------|------|----------------|-------------|--------|
| D-1 | Bio Link | 40 cr | ~R$ 250 | ✅ Disponível |
| D-2 | Landing Multi-Seção | 80 cr | ~R$ 450 | 🔄 Sprint 03 |
| Prime-D | Site Completo | 140 cr | ~R$ 700 | 📋 Futuro |

---

## 📲 Modelo D-1 (Bio Link)

### Visão Geral
Site de página única estilo Linktree/Bio, otimizado para mobile.

### Funcionalidades
- ✅ Foto de perfil com recorte
- ✅ Nome e descrição personalizáveis
- ✅ Links ilimitados com ícones
- ✅ Cores de destaque (sólidas e degradês)
- ✅ Fundo (cor, degradê ou imagem)
- ✅ Estilos de botão (glass, solid, outline)
- ✅ Fontes personalizáveis
- ✅ Badge "online"
- ✅ Banners promocionais
- ✅ Embed de vídeo (YouTube/Vimeo)
- ✅ Footer personalizado

### Ferramenta "Seções"
- Apenas **reordenar** seções existentes
- Não permite adicionar novas seções

### Características
- Mobile-only
- Página única
- Subdomínio: `slug.rafaeldemeni.com`

---

## 🖥️ Modelo D-2 (Landing Multi-Seção)

### Visão Geral
Site mobile com múltiplas seções e páginas internas. Ideal para catálogos, serviços, e apresentações comerciais.

### Diferencial vs D-1
| D-1 | D-2 |
|-----|-----|
| Links externos | Navegação interna |
| Página única | Até 2 páginas extras |
| Seções fixas | Seções adicionáveis |
| Vitrine rápida | Catálogo/Mini-loja |

### Funcionalidades

#### Ferramenta "Seções" (evoluída)
- ✅ Reordenar seções (igual D-1)
- ✅ **ADICIONAR seções pré-prontas**:
  - Cards de categorias/produtos
  - Depoimentos
  - FAQ
  - Banner promocional
  - Lista de benefícios/diferenciais

#### Ferramenta "Páginas" (NOVA)
- Limite: **2 páginas internas**
- Tipos disponíveis:
  - 📷 **Galeria/Catálogo** (grid de produtos com links)
  - ℹ️ **Informações** (texto + contato)

#### Estilos de Fundo
- **Individual**: cada seção com cor/imagem/degradê próprio
- **Coletivo**: mesma configuração em todas as seções

### Estrutura Base
```
┌─────────────────────────┐
│ Header: Logo + Menu     │  ← Fixo
│ [Item1] [Item2] [Item3] │
├─────────────────────────┤
│ Hero: Banner + CTA      │  ← Fixo
│ "Título impactante"     │
│ [Botão principal]       │
├─────────────────────────┤
│ [Seções adicionáveis]   │  ← Variável
│ Cards, Depoimentos...   │
├─────────────────────────┤
│ Footer: Contato/Redes   │  ← Fixo
└─────────────────────────┘
```

### Limitações Intencionais
- ❌ Mobile-only (desktop no Prime-D)
- ❌ Máximo 2 páginas internas
- ❌ Seções pré-prontas apenas (custom no Prime-D)

### Casos de Uso Ideais
- Floriculturas, doceiras, confeitarias
- Barbearias, salões de beleza
- Lojas de roupas, acessórios
- Prestadores de serviço
- Mini catálogos Shopee/Mercado Livre

---

## 👑 Modelo Prime-D (Site Completo) - FUTURO

### Visão Geral
Site profissional com múltiplas páginas e design responsivo completo.

### Funcionalidades Planejadas
- [ ] Tudo do D-2, mais:
- [ ] Páginas ilimitadas
- [ ] Design responsivo (mobile + desktop)
- [ ] Seções 100% customizáveis
- [ ] Mini-loja integrada
- [ ] SEO avançado
- [ ] Analytics integrado

### Características
- Responsivo (mobile + tablet + desktop)
- Subdomínio ou domínio próprio
- Otimizado para SEO

---

## 📐 Requisitos Técnicos

### Imagens
| Elemento | Dimensões | Formato |
|----------|-----------|---------|
| Avatar | 200x200px | WebP |
| Background | 1080x1920px | WebP |
| Cards | 400x400px | WebP |
| Banner Hero | 750x500px | WebP |

---

## 🔮 Roadmap

```
Janeiro 2026: D-1 completo ✅
Fevereiro 2026: D-2 em desenvolvimento
Março 2026: D-2 completo + NFC
Abril 2026: Prime-D início
```

---

> 💡 **Regra de Ouro**: Cada modelo resolve um problema diferente. D-1 = vitrine rápida. D-2 = catálogo visual. Prime-D = site completo.

# 🎨 Plano: Sistema de Templates por Nicho

> **Fase 2** da refatoração do editor D-2  
> **Contexto:** B2B2C - Franqueados profissionais criando 5-20 sites/mês

---

## 📋 Resumo Executivo

Implementar uma biblioteca de templates pré-configurados por nicho de mercado, permitindo que franqueados iniciem projetos com cores, fontes, seções e conteúdo placeholder já definidos para cada tipo de negócio.

### Decisões Confirmadas (Socratic Gate)

| Decisão | Escolha |
|---------|---------|
| **Momento de Seleção** | Na criação do site (modal antes do editor) |
| **Liberdade Pós-Template** | Total - template é ponto de partida |
| **Conteúdo Exemplo** | Placeholders realistas por nicho |
| **Paletas de Cores** | 2-3 opções por nicho |
| **Seções Obrigatórias** | Sim, por nicho (ex: Pizzaria → Cardápio) |

---

## 🎯 Nichos a Implementar

| # | Nicho | Estilo | Seções Obrigatórias |
|---|-------|--------|---------------------|
| 1 | **Florista** | Boutique elegante | Hero, Categorias, Produtos, Contato |
| 2 | **Salão de Beleza** | Beauty moderno | Hero, Serviços, Galeria, Horários |
| 3 | **Pizzaria** | Delivery quente | Hero, Cardápio, Promoções, Contato |
| 4 | **Academia** | Fitness energético | Hero, Planos, Modalidades, Contato |
| 5 | **Imóveis** | Premium sofisticado | Hero, Imóveis Destaque, Busca, Contato |
| 6 | **Advogado** | Sóbrio profissional | Hero, Áreas de Atuação, Sobre, Contato |
| 7 | **Confeitaria** | Doce acolhedor | Hero, Produtos, Galeria, Encomendas |
| 8 | **Pet Shop** | Amigável divertido | Hero, Serviços, Produtos, Contato |

---

## 🏗️ Arquitetura Técnica

### Estrutura de Arquivos

```
demeni-sites/
├── js/
│   ├── editor.js          # [MODIFY] Função applyNicheTemplate()
│   ├── dashboard.js        # [MODIFY] Modal de seleção de template
│   └── templates/          # [NEW] Pasta de templates
│       ├── index.js        # Exporta todos os templates
│       ├── florista.js     # Template Florista
│       ├── salao.js        # Template Salão
│       ├── pizzaria.js     # Template Pizzaria
│       ├── academia.js     # Template Academia
│       ├── imoveis.js      # Template Imóveis
│       ├── advogado.js     # Template Advogado
│       ├── confeitaria.js  # Template Confeitaria
│       └── petshop.js      # Template Pet Shop
├── css/
│   └── dashboard.css       # [MODIFY] Estilos do modal de templates
└── app.html                 # [MODIFY] Modal de seleção de template
```

### Estrutura de um Template JSON

```javascript
// Exemplo: templates/florista.js
const TEMPLATE_FLORISTA = {
    id: 'florista',
    name: 'Floricultura',
    description: 'Elegante e delicado, perfeito para floriculturas e boutiques de flores',
    icon: 'fa-leaf',
    palettes: [
        {
            id: 'classico',
            name: 'Clássico',
            preview: ['#F5F0E8', '#1B4D3E', '#D4AF37'],
            style: {
                accentColor: '#1B4D3E',
                bgColor: '#F5F0E8',
                buttonColor: '#D4AF37',
                buttonTextColor: '#1B4D3E'
            }
        },
        {
            id: 'romantico',
            name: 'Romântico',
            preview: ['#FFF0F5', '#8B4557', '#FFD700'],
            style: {
                accentColor: '#8B4557',
                bgColor: '#FFF0F5',
                buttonColor: '#FFD700',
                buttonTextColor: '#8B4557'
            }
        },
        {
            id: 'moderno',
            name: 'Moderno',
            preview: ['#0A0A0A', '#2E8B57', '#FFFFFF'],
            style: {
                accentColor: '#2E8B57',
                bgColor: '#0A0A0A',
                buttonColor: '#FFFFFF',
                buttonTextColor: '#0A0A0A'
            }
        }
    ],
    typography: {
        fontFamily: 'Playfair Display',
        headerStyle: { fontFamily: 'serif' }
    },
    sections: [
        {
            type: 'hero',
            required: true,
            data: {
                title: 'Flores que Encantam',
                subtitle: 'Arranjos exclusivos para todos os momentos especiais',
                ctaText: 'Ver Catálogo',
                ctaLink: '#produtos',
                variant: 'split-left',
                fontStyle: 'serif'
            }
        },
        {
            type: 'categories',
            required: true,
            data: {
                title: 'Nossas Categorias',
                items: [
                    { name: 'Buquês', icon: 'fa-heart', description: 'Para presentear' },
                    { name: 'Arranjos', icon: 'fa-seedling', description: 'Decoração' },
                    { name: 'Plantas', icon: 'fa-leaf', description: 'Para cultivar' },
                    { name: 'Cestas', icon: 'fa-gift', description: 'Com chocolates' }
                ]
            }
        },
        {
            type: 'products',
            required: true,
            data: {
                title: 'Produtos em Destaque',
                items: [
                    { name: 'Buquê Romântico', price: 'R$ 189,00', description: '12 rosas vermelhas' },
                    { name: 'Arranjo Primavera', price: 'R$ 159,00', description: 'Mix colorido' },
                    { name: 'Orquídea Phalaenopsis', price: 'R$ 129,00', description: 'Vaso decorativo' }
                ]
            }
        },
        {
            type: 'contact',
            required: true,
            data: {
                title: 'Fale Conosco',
                phone: '(11) 99999-9999',
                email: 'contato@suafloricultura.com.br',
                address: 'Rua das Flores, 123 - Centro',
                hours: 'Seg-Sáb: 8h às 19h'
            }
        }
    ],
    navigation: {
        brandName: 'Sua Floricultura',
        subtitle: 'Flores & Presentes'
    }
};
```

---

## 📝 Task Breakdown

### Fase 1: Infraestrutura (Core)

#### Task 1.1: Criar pasta e estrutura de templates
- **Agent:** `frontend-specialist`
- **Skill:** `clean-code`
- **Priority:** P0 (Blocker)
- **Dependencies:** Nenhuma
- **INPUT:** Estrutura JSON definida acima
- **OUTPUT:** `js/templates/` com `index.js` base
- **VERIFY:** `index.js` exporta objeto vazio sem erros

#### Task 1.2: Implementar função `applyNicheTemplate()`
- **Agent:** `frontend-specialist`
- **Skill:** `nextjs-react-expert` (padrões JS)
- **Priority:** P0 (Blocker)
- **Dependencies:** Task 1.1
- **INPUT:** Template JSON, `state` atual
- **OUTPUT:** Função em `editor.js` que popula `state` com dados do template
- **VERIFY:** Chamar `applyNicheTemplate('florista', 'classico')` popula state corretamente

#### Task 1.3: Criar função `loadTemplateInEditor()`
- **Agent:** `frontend-specialist`
- **Priority:** P0 (Blocker)
- **Dependencies:** Task 1.2
- **INPUT:** URL param `?template=florista&palette=classico`
- **OUTPUT:** Editor carrega com template aplicado
- **VERIFY:** Acessar `editor.html?model=d2&template=florista` mostra preview correto

---

### Fase 2: Templates (8 nichos)

#### Task 2.1: Template Florista
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho + paletas definidas
- **OUTPUT:** `js/templates/florista.js`
- **VERIFY:** Template aplicado renderiza corretamente no preview

#### Task 2.2: Template Salão de Beleza
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Beauty, moderno)
- **OUTPUT:** `js/templates/salao.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.3: Template Pizzaria
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Delivery, quente)
- **OUTPUT:** `js/templates/pizzaria.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.4: Template Academia
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Fitness, energético)
- **OUTPUT:** `js/templates/academia.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.5: Template Imóveis
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Premium, sofisticado)
- **OUTPUT:** `js/templates/imoveis.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.6: Template Advogado
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Sóbrio, profissional)
- **OUTPUT:** `js/templates/advogado.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.7: Template Confeitaria
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Doce, acolhedor)
- **OUTPUT:** `js/templates/confeitaria.js`
- **VERIFY:** Template aplicado renderiza corretamente

#### Task 2.8: Template Pet Shop
- **Agent:** `frontend-specialist`
- **Priority:** P1
- **Dependencies:** Task 1.2
- **INPUT:** Briefing nicho (Amigável, divertido)
- **OUTPUT:** `js/templates/petshop.js`
- **VERIFY:** Template aplicado renderiza corretamente

---

### Fase 3: UI de Seleção

#### Task 3.1: Modal de Seleção de Template
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P2
- **Dependencies:** Task 2.1 (pelo menos 1 template pronto)
- **INPUT:** Lista de templates disponíveis
- **OUTPUT:** Modal em `app.html` com grid de cards de nicho
- **VERIFY:** Modal abre ao clicar em "Novo Site D-2"

#### Task 3.2: Seletor de Paleta por Nicho
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 3.1
- **INPUT:** Template selecionado com suas paletas
- **OUTPUT:** Step 2 do modal mostrando 2-3 opções de paleta com preview visual
- **VERIFY:** Clicar em paleta atualiza preview instantaneamente

#### Task 3.3: Integrar com fluxo de criação
- **Agent:** `frontend-specialist`
- **Priority:** P2
- **Dependencies:** Task 3.2
- **INPUT:** Seleção de template + paleta
- **OUTPUT:** Redirecionamento para `editor.html?model=d2&template=X&palette=Y`
- **VERIFY:** Fluxo completo: Dashboard → Modal → Editor com template

---

### Fase 4: CSS e Polish

#### Task 4.1: Estilos do Modal de Templates
- **Agent:** `frontend-specialist`
- **Skill:** `frontend-design`
- **Priority:** P3
- **Dependencies:** Task 3.1
- **INPUT:** Mockup mental (cards com ícone, nome, descrição)
- **OUTPUT:** CSS em `dashboard.css` ou novo `templates.css`
- **VERIFY:** Modal visualmente polido, hover states, transições

#### Task 4.2: Preview de Paleta em Tempo Real
- **Agent:** `frontend-specialist`
- **Priority:** P3
- **Dependencies:** Task 3.2
- **INPUT:** Cores da paleta
- **OUTPUT:** Mini-preview mostrando como ficará o site
- **VERIFY:** Preview atualiza ao hover/click na paleta

---

## ⚙️ Fluxo de Usuário Final

```
┌─────────────────────────────────────────────────────────────────┐
│  DASHBOARD                                                       │
│  [+ Novo Site D-2]                                              │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODAL: Escolha o Tipo de Negócio                               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 🌸      │ │ 💇      │ │ 🍕      │ │ 💪      │               │
│  │Florista │ │ Salão   │ │Pizzaria │ │Academia │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │ 🏠      │ │ ⚖️      │ │ 🎂      │ │ 🐕      │               │
│  │ Imóveis │ │Advogado │ │Confeit. │ │Pet Shop │               │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
└───────────────────────────────┬─────────────────────────────────┘
                                │ (Clica em "Florista")
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  MODAL: Escolha a Paleta de Cores                               │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ■■■ Clássico │ │ ■■■ Romântico│ │ ■■■ Moderno  │            │
│  │ Bege/Verde   │ │ Rosa/Dourado │ │ Preto/Verde  │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  [← Voltar]                              [Criar Site →]         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  EDITOR D-2 (Já com template aplicado!)                         │
│  - Hero: "Flores que Encantam"                                  │
│  - Categorias: Buquês, Arranjos, Plantas, Cestas                │
│  - Produtos: 3 exemplos com preços                              │
│  - Contato: Dados placeholder                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Phase X: Verificação Final

### Checklist Obrigatório

- [ ] Todos os 8 templates renderizam sem erros JS
- [ ] Modal de seleção abre corretamente
- [ ] Paletas são aplicadas corretamente
- [ ] Preview do editor reflete template escolhido
- [ ] Franqueado pode modificar qualquer campo após aplicar template
- [ ] Seções obrigatórias são criadas automaticamente
- [ ] Salvar/Carregar projeto mantém dados do template

### Testes Manuais

1. Criar site com cada um dos 8 templates
2. Verificar todas as 3 paletas de cada template
3. Editar todos os campos e verificar que salvam
4. Publicar um site com template aplicado
5. Duplicar projeto com template

---

## 📊 Estimativas

| Fase | Tasks | Tempo Estimado |
|------|-------|----------------|
| Infraestrutura | 3 | ~45 min |
| Templates (8x) | 8 | ~2h |
| UI de Seleção | 3 | ~1h |
| CSS/Polish | 2 | ~30 min |
| **Total** | **16** | **~4h** |

---

## ✅ Próximos Passos

1. **Revisar este plano** e confirmar estrutura
2. **Iniciar Fase 1** - Infraestrutura core
3. **Criar templates em paralelo** após core pronto
4. **Integrar UI** quando houver pelo menos 2 templates
5. **Polish e testes finais**

---

> **Backup disponível em:** `BACKUP_2026-01-30_D2_antes_limpeza`  
> **Fase 1 (Limpeza):** ✅ Concluída  
> **Fase 2 (Templates):** 🔄 Este plano

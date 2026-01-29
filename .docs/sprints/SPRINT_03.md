# 🏃 SPRINT 03 - Modelo D-2

> **Período**: 30/01/2026 - 20/02/2026  
> **Foco**: Editor D-2 (Landing Multi-Seção)  
> **Atualizado**: 29/01/2026

---

## 🎯 OBJETIVO

Criar o editor do modelo D-2 baseado no D-1, adicionando:
- Ferramenta "Seções" com capacidade de adicionar novas seções
- Ferramenta "Páginas" para criar até 2 páginas internas
- Header com menu navegável
- Estilos de fundo (individual/coletivo)

---

## 📋 TAREFAS

### Fase 1: Preparação
- [ ] Analisar código atual do editor D-1
- [ ] Identificar padrões e "gambiarras" usadas
- [ ] Documentar estrutura de dados do projeto
- [ ] Duplicar arquivos base para D-2

### Fase 2: Ferramenta "Seções"
- [ ] Renomear "Ordem" para "Seções" no D-1
- [ ] Manter funcionalidade de reordenar
- [ ] No D-2: Adicionar botão "+ Adicionar Seção"
- [ ] Criar templates de seções pré-prontas:
  - [ ] Cards de categorias
  - [ ] Cards de produtos
  - [ ] Depoimentos
  - [ ] FAQ/Accordion
  - [ ] Banner promocional
  - [ ] Lista de benefícios

### Fase 3: Ferramenta "Páginas"
- [ ] Criar interface de gerenciamento de páginas
- [ ] Limite de 2 páginas internas
- [ ] Templates de página:
  - [ ] Galeria/Catálogo (grid de itens)
  - [ ] Informações (texto + contato)
- [ ] Navegação entre páginas (links no menu)
- [ ] Botão "Voltar" nas páginas internas

### Fase 4: Header e Menu
- [ ] Header com logo + nome + ícones
- [ ] Menu horizontal com até 4 itens
- [ ] Cada item do menu pode linkar para:
  - Página interna
  - Seção da home (âncora)
  - Link externo

### Fase 5: Estilos de Fundo
- [ ] Opção "Individual" vs "Coletivo"
- [ ] Se individual: cada seção escolhe seu fundo
- [ ] Se coletivo: um fundo para todas as seções
- [ ] Tipos de fundo: cor, degradê, imagem

### Fase 6: Publicação
- [ ] Adaptar sistema de publicação para D-2
- [ ] Cobrar 80 créditos
- [ ] Gerar HTML com múltiplas páginas

---

## ⚙️ ESPECIFICAÇÕES TÉCNICAS

### Estrutura de Dados (JSON do projeto)
```json
{
  "model": "d2",
  "header": {
    "logo": "url",
    "name": "Nome",
    "menu": [
      { "label": "Produtos", "target": "page:galeria" },
      { "label": "Sobre", "target": "section:diferenciais" },
      { "label": "Contato", "target": "external:whatsapp" }
    ]
  },
  "sections": [
    { "type": "hero", "data": {...}, "order": 0 },
    { "type": "cards", "data": {...}, "order": 1 },
    { "type": "testimonials", "data": {...}, "order": 2 }
  ],
  "pages": [
    { "id": "galeria", "type": "gallery", "data": {...} },
    { "id": "sobre", "type": "info", "data": {...} }
  ],
  "styles": {
    "backgroundMode": "individual", // ou "collective"
    "collectiveBackground": {...}
  }
}
```

### Tipos de Seção
| Tipo | Descrição | Componentes |
|------|-----------|-------------|
| `hero` | Banner principal | Imagem, título, subtítulo, CTA |
| `cards` | Grid de cards | 3-6 cards com imagem, título, link |
| `testimonials` | Depoimentos | Texto, autor, foto |
| `faq` | Perguntas frequentes | Accordion expansível |
| `benefits` | Lista de benefícios | Ícone + texto |
| `banner` | Banner promocional | Imagem full-width |

### Tipos de Página
| Tipo | Descrição | Componentes |
|------|-----------|-------------|
| `gallery` | Galeria/Catálogo | Grid de itens com imagem, nome, preço, link |
| `info` | Informações | Título, texto livre, dados de contato |

---

## ✅ CRITÉRIOS DE CONCLUSÃO

- [ ] Editor D-2 funcional
- [ ] Pelo menos 4 tipos de seção
- [ ] Páginas internas funcionando
- [ ] Publicação gerando HTML correto
- [ ] Teste em produção OK

---

## 📝 NOTAS

- Tudo mobile-only (desktop só no Prime-D)
- D-2 é cobrado 80 créditos
- Máximo 2 páginas internas
- Seções são templates pré-prontos

# D2 CSS Variables Map

## Variáveis Editáveis

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `--d2-primary` | Cor principal (header, footer, produtos) | `#1a365d` |
| `--d2-accent` | Cor de destaque (botões CTA) | `#5167E7` |
| `--d2-bg-light` | Fundo claro (categorias) | `#ffffff` |
| `--d2-bg-medium` | Fundo médio (feedbacks) | `#e8e8e8` |
| `--d2-card-bg` | Fundo dos cards | `#ffffff` |

## Implementação CSS

```css
:root {
    --d2-primary: #1a365d;
    --d2-accent: #5167E7;
    --d2-bg-light: #ffffff;
    --d2-bg-medium: #e8e8e8;
    --d2-card-bg: #ffffff;
    --d2-text-on-primary: #ffffff;
    --d2-text-on-light: #333333;
}
```

## Mapeamento por Seção

| Seção | background | texto |
|-------|------------|-------|
| Header | `--d2-primary` | `--d2-text-on-primary` |
| Hero | imagem + overlay | branco fixo |
| Categorias | `--d2-bg-light` | `--d2-text-on-light` |
| Produtos | `--d2-primary` | `--d2-text-on-primary` |
| Feedbacks | `--d2-bg-medium` | `--d2-text-on-light` |
| CTA | imagem + overlay | branco fixo |
| Footer | `--d2-primary` | `--d2-text-on-primary` |

# 🛡️ Demeni Sites — Registro de Estabilidade

> Documento vivo que registra bugs recorrentes, soluções tentadas, e o que realmente funcionou.
> **Objetivo:** Não repetir soluções que já falharam. Sempre consultar antes de "fixar" algo.

---

## 🔴 Bug #1: Duplicação de Projetos no Dashboard

**Sintoma:** Cards duplicados no dashboard (ex: 2+ "Yharley"). Badge mostra 25+ projetos quando deveria ser ~4.

**Status:** ✅ Resolvido (25/02/2026 — commit `4962a4f`)

### Causa Raiz Verdadeira

`publishSite()` em `supabase.js` usava `.upsert({ onConflict: 'slug' })`. Como o projeto original (criado por `createProject`) tinha `slug = null`, o upsert **não encontrava conflito** e criava uma **NOVA ROW** no Supabase com um UUID diferente.

**Cadeia de duplicação:**
1. `createProject()` → `.insert()` → UUID_A (slug=null)
2. `publishSite()` → `.upsert(onConflict:'slug')` → UUID_B (slug="yharley") ← **FANTASMA**
3. `publishProject()` → `.update(UUID_A)` → Atualiza metadata do original
4. `syncFromCloud()` → Puxa UUID_A + UUID_B → 2 cards com IDs diferentes

### Soluções que NÃO resolveram (tentadas antes)

| Tentativa | Por que não resolveu |
|---|---|
| `publishProject()` async + await cloud save | Prevenia race condition mas não impedia a criação de rows novas pelo `publishSite` |
| Cloud save com dados reais (não `{}`) | Melhorou qualidade dos dados mas não resolveu a duplicação |
| `syncFromCloud` merge com data quality check | Não detectava duplicatas com IDs diferentes |
| Dedup por ID em `getProjects()` | IDs eram diferentes — cada publish criava um UUID novo |
| Dedup por `publishedUrl` | Nem todos os duplicatas tinham publishedUrl setado |
| Guard de dedup em `createProject` | Só prevenia duplicatas no `.push()` local, não no Supabase |

### Solução Final (3 frentes)

1. **`supabase.js` — `publishSite()`:** Trocar `.upsert(onConflict:'slug')` por `.update().eq('id', projectId)` → Atualiza a row existente, não cria nova
2. **`userData.js` — `getProjects()` Pass 2.5:** Dedup por slug/subdomain — detecta projetos com mesmo slug mas IDs diferentes
3. **`userData.js` — `syncFromCloud()` phantom cleanup:** Detecta duplicatas de slug durante sync e **deleta as fantasmas do Supabase automaticamente**

---

## 🟡 Bug #2: Cor do Texto do Botão CTA (Hero) Não Aplicava

**Sintoma:** "Cor do texto" setada para #192b45 (escuro) mas o botão aparecia com texto branco.

**Status:** ✅ Resolvido (25/02/2026 — commit `4962a4f`)

### Causa Raiz

Especificidade CSS: `.d2-preview-container a { color: inherit; }` (specificidade 0,1,1) ganhava de `.d2-cta-btn { color: ${heroBtnFontColor}; }` (specificidade 0,1,0). O `<a>` herdava `color: #fff` do container.

### Solução

Aumentar especificidade do seletor: `.d2-preview-container .d2-cta-btn` (0,2,0).

> **Lição:** Sempre checar se `.d2-preview-container a { color: inherit }` está sobreescrevendo. Qualquer novo seletor de link precisa ter especificidade > 0,1,1.

---

## 🟡 Bug #3: `showNotification()` Usava `alert()` do Browser

**Sintoma:** Pop-up intrusivo ao salvar projeto, bloqueando a tela.

**Status:** ✅ Resolvido (25/02/2026 — commit `55f5599`)

### Solução

Substituído `alert()` por toast in-app (slide-in, auto-dismiss 3s, suporta tipos success/error/info).

---

## 🟢 Bug #4: Ícones PNG Não Respeitavam "Cor do Ícone"

**Sintoma:** O color picker da seção Categorias funcionava para FontAwesome mas não para ícones PNG customizados.

**Status:** ✅ Resolvido (25/02/2026 — commit `55f5599`)

### Solução

Adicionado dropdown "Cor do ícone (PNG)" com opções Branco/Preto/Original, usando CSS `filter`:
- Branco: `brightness(0) invert(1)`
- Preto: `brightness(0)`
- Original: `none`

Mesmo padrão da logo (hero-editor/footer-editor).

---

## 📌 Padrões Conhecidos (Referência Rápida)

### Recolorir imagens PNG via CSS
```css
/* Branco */ filter: brightness(0) invert(1);
/* Preto */  filter: brightness(0);
/* Original */ filter: none;
```

### Especificidade CSS no Preview
O seletor `.d2-preview-container a { color: inherit }` tem especificidade 0,1,1.
Todo seletor de cor em links/botões deve usar `.d2-preview-container .classe` (mínimo 0,2,0).

### Cloud Save — Regras de Segurança
- Nunca enviar `{}` para o cloud — sempre verificar `Object.keys(data).length > 0`
- `syncFromCloud` deve preferir local se `localSize >= cloudSize`
- **Nunca usar `.upsert()` para publicação** — usar `.update().eq('id')` para atualizar rows existentes
- `.insert()` só deve ser usado em `createProject()` (criação intencional)

### Dedup no `getProjects()` — Ordem dos Passes
1. **Pass 1:** Dedup por ID (mantém mais recente)
2. **Pass 2:** Dedup por publishedUrl (mantém mais recente)
3. **Pass 2.5:** Dedup por slug/subdomain (mantém mais recente)
4. **Pass 3:** Migração de dados embutidos para IndexedDB

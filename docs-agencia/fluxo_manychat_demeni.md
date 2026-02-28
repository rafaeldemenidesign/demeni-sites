# DEMENI — Fluxo ManyChat v7

> ManyChat Pro + Google Sheets. Sem IA, sem Make.

---

## Jornada visual

```
"quero meu site"
     │
     ├─► [Quero meu site!] → Briefing → Pagamento* → Produção → Entrega
     │
     ├─► [Quero indicar 🎁] → Código → Indica → Acompanha 
     │         │                         no indicacoes.demeni.com
     │         └──► "ESTOU PRONTO" → Briefing → Pagamento c/ desconto
     │
     ├─► [Vim por indicação] → Digita código → Segue com 10% off
     │
     └─► [Como funciona?] → FAQ
     
     * Na hora do pagamento sempre pergunta:
       "Tem código de indicação?" → se sim, aplica 10%
```

---

## Custom Fields

`nome_dono` · `nome_negocio` · `descricao` · `servicos` · `endereco` · `instagram` · `cores` · `cta_tipo` · `cta_custom` · `link_site` · `alteracoes` (num:0) · `status` · `nota` (num) · `origem` · `codigo_indicacao` · `indicacoes_convertidas` (num:0) · `desconto_pct` (num:0) · `indicado_por`

---

## FLUXO 1 — Entrada (4 caminhos)

**Trigger**: "site", "quero", "indicar", "como funciona"

```
📩 "Oi! 🧡 Tudo bem?

A Demeni cria sites profissionais pra pequenos 
negócios. R$ 250, sem mensalidade, pronto em 24h.

Como posso te ajudar?"

[Quero meu site! 🚀] → FLUXO BRIEFING
[Quero indicar pessoas 🎁] → FLUXO INDICAR
[Vim por indicação 🎟️] → FLUXO INDICADO
[Como funciona? 🤔] → FAQ
```

---

## FLUXO INDICAR — Programa de indicação

```
📩 "Boa! 🎁 O programa funciona assim:

Você ganha um código de indicação.
Cada pessoa que comprar com seu código te dá 
15% de desconto no seu site!

🧮 Na prática:
1 indicação → 15% off = R$ 212
2 → 30% = R$ 175
3 → 45% = R$ 137
4 → 60% = R$ 100
5 → 75% = R$ 62
6 → 90% = R$ 25
7 → 🆓 GRÁTIS!

E seu indicado ganha 10% de desconto também!

Quer participar?"

[Quero meu código! 🎟️]
[Prefiro comprar direto 🚀] → FLUXO BRIEFING
```

### Gera código:

```
📩 "Qual seu nome completo?"
→ DIGITA → salva {{nome_dono}}

⚙️ Gera: primeiras 4 letras CAPS
   João Silva → JOAO · Maria Santos → MARI

📩 "Seu código de indicação:

🎟️ {{codigo_indicacao}}

📲 Manda pras pessoas! Quando elas comprarem
usando seu código, seu desconto acumula.

📊 Acompanhe suas indicações aqui:
🔗 indicacoes.demeni.com

Quando quiser comprar o seu, manda ESTOU PRONTO ✅"
```

### Quando indicado compra (automático):

```
📩 ao INDICADOR:

"🎉 Boa! Alguém comprou com seu código!

Indicações: {{indicacoes_convertidas}}
Desconto: {{indicacoes_convertidas × 15}}%
💰 Seu site agora: R$ {{preço}}

📊 Acompanhe: indicacoes.demeni.com

[Quero meu site agora! 🚀] → FLUXO BRIEFING (com desconto)
[Vou indicar mais 💪]"
```

### "ESTOU PRONTO":

```
📩 "Bora! 🎉

Indicações: {{indicacoes_convertidas}}
Desconto: {{desconto_pct}}%
💰 Valor: R$ {{preço}}

Vamos montar seu site!"

→ FLUXO BRIEFING
```

---

## FLUXO INDICADO — Vim por indicação

```
📩 "Que legal que alguém te indicou! 🧡
Digita o código de indicação:"
→ DIGITA → salva {{indicado_por}}

⚙️ Busca no Sheets: código existe?

SIM: "Código válido! ✅ Você tem 10% de desconto! 🎉"
NÃO: "Código não encontrado... mas sem problema, 
      vamos fazer seu site! 😊"

→ FLUXO BRIEFING
```

---

## FLUXO BRIEFING

```
📩 "Me conta: já tem negócio ou tá começando?"
[Já tenho] / [Tô começando]
→ "Qual o nome?" → salva {{nome_negocio}}

📩 "O que você faz?" → salva {{descricao}}
📩 "Serviços/produtos com preço 👇" → salva {{servicos}}
📩 "Ponto físico?" [Sim → endereço] [Não]
📩 "Instagram?" → DIGITA / [Não tenho]

📩 "Cor do site?"
[Preto/Dourado] [Azul/Branco] [Rosa/Branco]
[Vermelho/Preto] [Verde/Branco] [Escolhe pra mim]

📩 "Botão principal:"
[1 WhatsApp] [2 Instagram] [3 Ligar] [4 Mapa] [5 Outro → DIGITA]

📩 "Logo! 🎨" → IMAGEM / [Não tenho]
📩 "Fotos! 📸 Quando acabar: PRONTO" → imagens até PRONTO
```

### Resumo:

```
📩 "Briefing completo! 🎉

🏪 {{nome_negocio}}
📝 {{descricao}}
🎨 {{cores}}

Certo?"
[✅] [✏️ Corrigir → live chat]
```

### Pagamento:

```
📩 "Última coisa antes do pagamento:
tem código de indicação?"
[Sim 🎟️] → DIGITA → aplica 10%
[Não, compra direto] → preço cheio
```

#### Se indicador (tem desconto acumulado):
```
📩 "Preço: R$ 250
Desconto indicação ({{desconto}}%): -R$ {{valor}}
💰 Total: R$ {{final}}
🔗 [link pagamento]"
```

#### Se indicado (10%):
```
📩 "Desconto indicação: 10%!
💰 R$ 225
🔗 [link pagamento]"
```

#### Sem desconto:
```
📩 "💰 R$ 250 · Sem mensalidade · NFC incluso
🔗 [link pagamento]"
```

```
[Paguei! ✅] → verificação
[Depois] → follow-up
```

---

## VERIFICAÇÃO DE PAGAMENTO

```
📩 "Verificando... ⏳ Até 2 minutinhos!"

⚙️ Webhook Mercado Pago

✅: "Confirmado! 🎉 Em produção! ⏰ 24h"
    → Se indicado_por existe: notifica indicador (+15%)
⏳: "Me manda o comprovante 😊" → live chat
```

---

## APROVAÇÃO (alterações progressivas)

```
📩 "{{nome_dono}}, olha! 🚀 {{link_site}}"
[Perfeito! 🎉] → ENTREGA
[Mudar ✏️] →

  1ª: "Pede TUDO de uma vez, são 3! 👇"
  2ª: "Depois dessa tem mais UMA..."
  3ª: "ÚLTIMA! Capricha 👇"
  Acabou: "R$ 100 = mais 3. Não fica na mão!"
```

---

## ENTREGA

```
📩 "NO AR! 🎉 {{link_site}}
🔑 NFC a caminho! 📌 Sem mensalidade 💪"

     ⏰ 5 min
"De 1 a 5?"
[4-5] → "Seu código de indicação: {{codigo}}
         Indica e ganha desconto na repaginação! 🎁
         📊 indicacoes.demeni.com"
[1-3] → live chat
```

---

## PÓS-VENDA

```
⏰ 30d: "1 mês! Tudo bem? 🧡"
⏰ 60d: "Renovar? R$ 100 ({{indicações}} indic. = {{desc}}% off!)"
⏰ 90d: "Atualize! R$ 100"
```

---

## PÁGINA: indicacoes.demeni.com

Mesma estrutura do `tracking.html`. A pessoa digita seu código e vê:

```
┌──────────────────────────────────┐
│         🎁 Indicações            │
│    Acompanhe seu programa        │
│                                  │
│  [   Digite seu código   ] [🔍] │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🎟️ Código: JOAO           │  │
│  │ 👤 João Silva              │  │
│  │                            │  │
│  │ Indicações: 3 de 7         │  │
│  │ Desconto: 45%              │  │
│  │ Seu preço: R$ 137          │  │
│  │                            │  │
│  │ ████████████░░░░░  45%     │  │
│  │                            │  │
│  │ ✅ Maria (comprou)         │  │
│  │ ✅ Pedro (comprou)         │  │
│  │ ✅ Ana (comprou)           │  │
│  │ ○ ─ ─ ─                   │  │
│  │ ○ ─ ─ ─                   │  │
│  │ ○ ─ ─ ─                   │  │
│  │ ○ ─ ─ ─  → 🆓             │  │
│  │                            │  │
│  │ [Quero meu site! 🚀]      │  │
│  └────────────────────────────┘  │
│                                  │
│     Demeni — Agência Digital     │
└──────────────────────────────────┘
```

**Funciona igual ao tracking.html**:
- Input: código de indicação
- Busca no Supabase (tabela `referrals`)
- Mostra: indicações convertidas, barra de progresso, desconto, lista de indicados
- Botão "Quero meu site" → redireciona pro WhatsApp com keyword

---

*Demeni — Agência Digital*

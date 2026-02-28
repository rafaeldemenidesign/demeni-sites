# DEMENI — Fluxo ManyChat FINAL (v8)

> ManyChat Pro (US$ 15/mês) + Google Sheets nativo. Sem IA, sem Make.  
> 🔗 Cadastro: https://manychat.com

---

## Jornada

```
"quero meu site"
     │
     ├─► [Quero meu site!] ─► Briefing ─► Código? ─► Pagamento ─► Produção ─► Aprovação ─► Entrega
     │                                     (10% off)
     ├─► [Indicar 🎁] ─► Código ─► Indica ─► "ESTOU PRONTO" ─► Briefing ─► Pagamento c/ desconto
     │   (escolha exclusiva: quem indica NÃO usa código de outro)
     │
     ├─► [Vim por indicação] ─► Digita código ─► 10% off ─► Briefing ─► Pagamento
     │   (escolha exclusiva: quem usa código NÃO pode indicar pra desconto próprio)
     │
     └─► [Como funciona?] ─► FAQ ─► volta
```

---

## Custom Fields

| Campo | Tipo | Default |
|---|---|---|
| `nome_dono` | Texto | — |
| `nome_negocio` | Texto | — |
| `descricao` | Texto | — |
| `servicos` | Texto | — |
| `endereco` | Texto | — |
| `instagram` | Texto | — |
| `cores` | Texto | — |
| `cta_tipo` | Texto | — |
| `cta_custom` | Texto | — |
| `link_site` | Texto | — |
| `alteracoes` | Número | 0 |
| `status` | Texto | — |
| `nota` | Número | — |
| `origem` | Texto | — |
| `codigo_indicacao` | Texto | — |
| `indicacoes_convertidas` | Número | 0 |
| `desconto_pct` | Número | 0 |
| `indicado_por` | Texto | — |
| `tipo_desconto` | Texto | — |

## Tags

`lead` · `indicador` · `indicado` · `cliente` · `briefing_completo` · `em_producao` · `aguardando_aprovacao` · `alteracao_1` · `alteracao_2` · `alteracao_3` · `entregue` · `lead_frio` · `recompra`

---

## FLUXO 1 — ENTRADA

**Triggers**: keyword "site", "quero", "indicar", "como funciona", "preço"

```
📩 "Oi! 🧡 Tudo bem?

A Demeni cria sites profissionais pra pequenos 
negócios. R$ 250, sem mensalidade, pronto em 24h.

Como posso te ajudar?"

[Quero meu site! 🚀] → FLUXO 3 (BRIEFING)
[Quero indicar 🎁] → FLUXO 2A (INDICAR)
[Vim por indicação 🎟️] → FLUXO 2B (INDICADO)
[Como funciona? 🤔] → FLUXO FAQ
```

Ações: tag `lead` · `origem` = canal

---

## FLUXO FAQ

```
📩 "A Demeni cria sites profissionais pra pequenos 
negócios. Funciona assim:

✅ Responde umas perguntas rápidas
✅ Manda fotos e logo
✅ Em 24h seu site fica pronto
✅ 3 alterações inclusas
✅ Sem mensalidade — pra sempre!
🔑 + Chaveiro NFC inteligente

Dúvida específica?"

[Quanto custa?] → "R$ 250. Pagamento único. Sem mensalidade!"
[Preciso de logo?] → "Se tiver manda, senão a gente resolve!"
[Tem mensalidade?] → "Zero! Paga uma vez, é seu pra sempre."
[Posso mudar depois?] → "3 alterações inclusas. Futuramente: R$100."
[Ver exemplos] → [carrossel de sites]
[Falar com alguém] → live chat

📩 "Esclareceu? 😊"
[Bora fazer o meu! 🚀] → FLUXO 3
[Outra dúvida] → repete FAQ
```

---

## FLUXO 2A — INDICAR (pré-compra)

```
📩 "Boa! 🎁 Funciona assim:

Cada pessoa que comprar com seu código te dá 
15% de desconto no seu site!

1 indicação = 15% = R$ 212
2 = 30% = R$ 175
3 = 45% = R$ 137
4 = 60% = R$ 100
5 = 75% = R$ 62
6 = 90% = R$ 25
7 = 🆓 GRÁTIS!

Seu indicado ganha 10% de desconto!

⚠️ Importante: quem indica não pode usar 
código de outra pessoa.

Quer participar?"

[Quero meu código! 🎟️]
[Prefiro comprar direto 🚀] → FLUXO 3
```

### Gera código:

```
📩 "Qual seu nome completo?"
→ DIGITA → salva {{nome_dono}}

⚙️ Gera código: 4 primeiras letras CAPS do nome
⚙️ Salva no Google Sheets (planilha "Indicações")
⚙️ tipo_desconto = "indicador"

📩 "Seu código:

🎟️ {{codigo_indicacao}}

📲 Manda pras pessoas!
📊 Acompanhe: indicacoes.demeni.com

Quando quiser comprar, manda ESTOU PRONTO ✅"
```

Ações: tag `indicador`

### Quando indicado compra:

```
⚙️ Trigger: novo pagamento com campo indicado_por = código
⚙️ Incrementa indicacoes_convertidas do indicador
⚙️ Recalcula: desconto_pct = indicacoes_convertidas × 15

📩 ao INDICADOR:
"🎉 Alguém comprou com seu código!

Indicações: {{indicacoes_convertidas}}
Desconto: {{desconto_pct}}%
💰 Seu site: R$ {{250 - (250 × desconto_pct / 100)}}

📊 indicacoes.demeni.com"

[Quero meu site agora! 🚀] → FLUXO 3 (com desconto)
[Vou indicar mais 💪]
```

### Keyword "ESTOU PRONTO":

```
📩 "Anotado! ✅

Indicações: {{indicacoes_convertidas}}
Desconto: {{desconto_pct}}%
💰 Valor: R$ {{250 - (250 × desconto_pct / 100)}}

Vamos montar seu site!"

→ FLUXO 3
```

---

## FLUXO 2B — VIM POR INDICAÇÃO

```
📩 "Legal! 🧡 Digita o código de quem te indicou:"
→ DIGITA → salva {{indicado_por}}

⚙️ Busca no Sheets: código existe?

SIM:
  ⚙️ tipo_desconto = "indicado"
  ⚙️ desconto_pct = 10
  📩 "Código válido! ✅ Você tem 10% de desconto!"
  → tag indicado

NÃO:
  📩 "Código não encontrado. Mas sem problema!"
  ⚙️ desconto_pct = 0

→ FLUXO 3
```

---

## FLUXO 3 — BRIEFING

⚙️ Se `nome_dono` já preenchido (veio do INDICAR), pula P1.

```
P1: "Como posso te chamar?"
→ DIGITA → salva {{nome_dono}}

P2: "Qual o nome do seu negócio?"
→ DIGITA → salva {{nome_negocio}}

P3: "Anotado! ✅ O que seu negócio faz?"
→ DIGITA → salva {{descricao}}

P4: "Show! ✅ Serviços/produtos com preço 👇"
→ DIGITA → salva {{servicos}}

P5: "Anotado! ✅ Tem ponto físico?"
[Sim] → "Qual endereço?" → DIGITA → salva {{endereco}}
[Não]

P6: "Instagram?"
→ DIGITA / [Não tenho]

P7: "Cor do site?"
[Preto/Dourado] [Azul/Branco] [Rosa/Branco]
[Vermelho/Preto] [Verde/Branco] [Escolhe pra mim]
→ salva {{cores}}

P8: "Botão principal leva pra:"
[1 WhatsApp] [2 Instagram] [3 Ligar] [4 Mapa]
[5 Outro] → "Qual? Digite:" → DIGITA → salva {{cta_custom}}

P9: "Manda a logo! 🎨"
→ IMAGEM / [Não tenho] → "Sem problema!"

P10: "Fotos do negócio! 📸
Manda quantas quiser. Quando acabar, digite PRONTO"
→ imagens até keyword PRONTO
```

### Resumo:

```
📩 "Briefing completo! 🎉

🏪 {{nome_negocio}}
📝 {{descricao}}
🎨 {{cores}}
📍 {{endereco}}

Tudo certo?"
[✅ Sim] → FLUXO 4
[✏️ Corrigir] → live chat
```

Ações: tag `briefing_completo` · salva no Sheets

---

## FLUXO 4 — PAGAMENTO

### Pergunta código (só se tipo_desconto está vazio):

```
⚙️ Condição: tipo_desconto vazio?

SIM: 📩 "Tem código de indicação?"
     [Sim 🎟️] → DIGITA → busca Sheets
       → Se válido: desconto_pct = 10 · tipo_desconto = "indicado"
       → Se inválido: "Código não encontrado, segue sem desconto"
     [Não] → segue

NÃO: pula (já tem desconto de indicador ou indicado)
```

### Mostra preço:

```
⚙️ Condição: desconto_pct > 0?

SIM:
  📩 "Preço: R$ 250
  Desconto ({{desconto_pct}}%): -R$ {{250 × desconto_pct / 100}}
  💰 Total: R$ {{250 - (250 × desconto_pct / 100)}}
  🔗 [link pagamento com valor ajustado]"

NÃO:
  📩 "💰 R$ 250 · Sem mensalidade · NFC incluso
  🔗 [link pagamento]"

[Paguei! ✅] → FLUXO 5
[Depois] → follow-up
[Falar com alguém] → live chat
```

### Follow-up (não pagou):

```
⏰ 4h: "Ficou alguma dúvida? Me chama!"
⏰ 24h: "Seu briefing tá salvo 😊 Só pagar!"
⏰ 3d: "Posso ajudar com algo?"
⏰ 7d → tag lead_frio · remove do fluxo
```

---

## FLUXO 5 — VERIFICAÇÃO

```
📩 "Verificando... ⏳ Até 2 minutinhos!"

⚙️ External Request: Mercado Pago API
   GET /v1/payments?external_reference={{ref}}

✅ Pago:
  📩 "Confirmado! 🎉 Em produção! ⏰ 24h"
  ⚙️ tag cliente · status = "Em Produção"
  ⚙️ Se indicado_por existe:
     → incrementa indicacoes_convertidas do indicador
     → notifica indicador: "🎉 +1 indicação!"
  ⚙️ Notifica criadora: "📋 Novo: {{nome_negocio}}"

⏳ Não encontrou:
  📩 "Não localizei ainda. Me manda o comprovante 😊"
  → live chat
```

---

## FLUXO 6 — APROVAÇÃO

**Trigger**: `link_site` preenchido

```
📩 "{{nome_dono}}, olha! 🚀

👁️ {{link_site}}"

[Perfeito! 🎉] → FLUXO 7
[Mudar ✏️] → subfluxo alterações
```

### Alterações progressivas:

```
⚙️ Lê {{alteracoes}}

= 0: "Pede TUDO de uma vez, são 3! 👇"
     → DIGITA · alteracoes = 1 · tag alteracao_1
     → notifica criadora · "Anotado! ✅"
     → (quando pronto, volta pro FLUXO 6)

= 1: "Depois dessa tem mais UMA. Aproveita!"
     → DIGITA · alteracoes = 2 · tag alteracao_2
     → notifica criadora · "Anotado! ✅"

= 2: "ÚLTIMA! Capricha 👇"
     → DIGITA · alteracoes = 3 · tag alteracao_3
     → notifica criadora · "Anotado! ✅"

= 3: "Acabaram! Mas não fica na mão.
     💰 R$ 100 = mais 3 alterações"
     [Quero (R$100)] → link pagamento
     [Tá ótimo, publica!] → FLUXO 7
```

---

## FLUXO 7 — ENTREGA

```
📩 "SEU SITE TÁ NO AR! 🎉🚀

🔗 {{link_site}}
🔑 Chaveiro NFC a caminho!
📌 Sem mensalidade — pra sempre! 💪"

⚙️ tag entregue · status = "Concluído"

     ⏰ delay 5 min

📩 "De 1 a 5, como foi?"
[1⭐] [2⭐] [3⭐] [4⭐] [5⭐]
→ salva {{nota}}

⚙️ nota >= 4:
  ⚙️ Gera código se não tem
  📩 "🧡 Seu código: {{codigo_indicacao}}
  Indica e ganha desconto na repaginação!
  📊 indicacoes.demeni.com"

⚙️ nota <= 3:
  📩 "Poxa, me conta o que aconteceu"
  → live chat
```

---

## FLUXO 8 — PÓS-VENDA

```
⏰ 30d: "{{nome_dono}}! 1 mês de site no ar! Tudo bem? 🧡"

⏰ 60d: "Renovar o visual? 🎨
        R$ 100 com 3 alterações!
        Indicações: {{indicacoes_convertidas}}
        Desconto: {{indicacoes_convertidas × 15}}%
        Seu preço: R$ {{max(0, 100 - (indicacoes_convertidas × 15))}}"
        [Quero!] → link pagamento · tag recompra
        [Tô bem 😊]

⏰ 90d: "Atualize com novidades! R$ 100"
⏰ 180d: "Refresh? 😊"
```

---

## FLUXO 9 — LEAD FRIO (reativação)

**Trigger**: tag `lead_frio`, 30 dias depois

```
📩 "{{nome_dono}}, lembra do site profissional?
R$ 250, sem mensalidade. Ainda tô aqui! 😊"

[Quero!] → FLUXO 3
[Não, obrigado] → remove do fluxo
```

---

## ALERTAS INTERNOS

| Evento | → Quem | Mensagem |
|---|---|---|
| Pagamento confirmado | Criadora | "📋 Novo: {{nome_negocio}} — ver Sheets" |
| Em produção | Cliente | "🎨 Em produção!" |
| Site pronto | Cliente | Preview + aprovação |
| Ajuste pedido | Criadora | "✏️ {{nome_negocio}}: [descrição]" |
| Aprovado | Gestora | "✅ {{nome_negocio}}" |
| Indicação converteu | Indicador | "🎉 +1! Desconto: {{pct}}%" |

---

*Demeni — Agência Digital*  
*🔗 ManyChat: https://manychat.com*

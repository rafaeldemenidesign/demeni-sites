# Demeni Sites - Ideias e Decisões

> Documento para registrar ideias, decisões e requisitos do Rafael

---

## 💰 Sistema de Créditos

### Decisão (22/01/2026)
- **1 crédito = R$ 1** - Para o usuário ter noção real do dinheiro
- **1 site = 40 créditos** - Custo para publicar um site
- **Starter Pack**: R$ 1 = 40 créditos (só primeira compra)

---

## 🏆 Sistema de Níveis

### Decisão (22/01/2026)
- NÃO usar: Iniciante, Avançado, Pro
- USAR: **Bronze → Prata → Ouro → Turmalina → Fire**

---

## 📦 Pacotes de Créditos

### Decisão (22/01/2026)
| Pacote | Preço | Créditos | Bônus | Sites |
|--------|-------|----------|-------|-------|
| Primeira Compra | R$ 1 | 40 | 0 | 1 |
| Essencial | R$ 200 | 200 | 0 | 5 |
| Profissional | R$ 400 | 400 | 200 | 15 |
| Empresarial | R$ 600 | 600 | 400 | 25 |

---

## 💡 Ideias Futuras

### 🏦 Checkout Próprio com Split de Pagamentos (29/01/2026)

> **STATUS**: IDEIA - Não implementar agora por complexidade tributária

**Conceito**: Processar todos os pagamentos pela plataforma com split automático.

**Como funcionaria**:
```
Cliente paga R$500 → PSP divide automaticamente
├─ 80% = R$400 → Franqueado
├─ 10% = R$50  → Afiliado
└─ 10% = R$50  → Demeni
```

**PSPs Considerados**:
- Efí Bank (Gerencianet)
- Asaas
- Transfeera

**Por que adiar?**:
- Complexidade tributária (cada parte fatura separado)
- Requer CNPJ e contratos com PSP
- Custo de implementação alto (4-6 semanas)
- Volume atual não justifica

**Quando implementar?**:
- Quando tiver +50 franqueados ativos
- Faturamento mensal > R$10k
- Contador especializado contratado

---

### 📊 Marketplace de Templates

> **STATUS**: IDEIA

- Franqueados podem criar templates
- Vender para outros franqueados
- Split: 70% criador / 30% Demeni

---

### 🎮 Gamificação Avançada

> **STATUS**: IDEIA

- Missões diárias/semanais
- Ranking de franqueados
- Prêmios em créditos

---

## 📝 Notas

- Primeira compra é oferta única (aparece só 1 vez)
- Descontos baseados no tier do usuário
- PIX é importante como opção de pagamento
- Afiliados: comissão em créditos (evita saída de caixa e impostos)


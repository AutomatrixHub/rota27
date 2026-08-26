# Rota 27 v0.25.10 — Resumo por Produto Atual

## Objetivo
Corrigir o quadro **Mais vendidos hoje** para que renomeações de produtos sejam refletidas automaticamente sem alterar comandas fechadas nem valores históricos.

## Regra nova
O resumo passa a:
1. agrupar vendas pelo **ID/código do produto**;
2. usar o **nome atual do cadastro** quando o produto ainda existe;
3. somar quantidade pelas comandas fechadas do dia;
4. calcular receita com o **preço histórico salvo em cada comanda**;
5. usar o nome histórico como fallback quando o produto não existir mais no catálogo.

## Exemplo validado
`Cerveja IPA 500ml - Rochi Beer` corrigido no cadastro para `Cerveja IPA 500ml - Ronchi Beer` passa a aparecer com o nome atual em **Mais vendidos hoje**, mantendo intactos preços e snapshots das vendas antigas.

## Arquivos principais
- `assets/v02510-turn-summary-current-name.js`
- `assets/v0256-release.js`
- `index.html`
- `sw.js`
- `VERSION`

## Backend
Sem alteração em Supabase, Edge Functions, migrations ou tipos de evento.

## PWA
- `VERSION = 0.25.10`
- Service Worker: `rota27-comandas-v0.25.10-r1`
- Ajuda: v6.1

## Rollback
Baseline: **v0.25.9**.

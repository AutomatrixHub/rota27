# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.64 — Estabilidade mobile e fechamento interno
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.64-r1`
- **Baseline anterior:** v0.25.63

## Hotfix v0.25.64

### Desempenho mobile / iPhone
- remove do caminho crítico de `save()` a varredura de todo o Histórico introduzida na v0.25.63;
- somente comandas abertas recebem a normalização operacional necessária antes da persistência/sincronização;
- não cria nova ponte de renderização do Painel nem novo polling;
- preserva a coerência por `businessDate` implementada na v0.25.63.

### Botão + / Nova comanda
- o FAB `+` permanece interativo em **Comandas**, tanto em **Lista** quanto em **Mapa**;
- ao voltar para Comandas, uma barra de comanda anterior não pode encobrir/desabilitar o FAB;
- Lista e Mapa continuam abrindo a mesma tela segura de Nova comanda;
- a regra de não focar automaticamente campos permanece preservada.

### Consumo interno
- finalização de Consumo interno passa por uma interceptação canônica antes dos wrappers financeiros de A Receber;
- o fechamento não depende mais da ordem em que `finalizeCommand` foi embrulhado por módulos antigos;
- continua sem faturamento, ticket médio, forma de pagamento ou A Receber;
- valor é mantido apenas como referência operacional e de estoque.

## Turnos, Painel e Histórico
A v0.25.63 permanece como regra vigente:
- data operacional vem da abertura da comanda;
- horário físico de fechamento não muda o turno da venda;
- Painel usa **Turno atual** e apresenta **Último turno fechado** separadamente;
- A Receber representa saldos não recebidos, não novo faturamento;
- Histórico diferencia data operacional e horário físico de fechamento.

## Backend
Projeto Supabase: `owkvwsiblbzlpxjwybrt`. A v0.25.64 não altera schema, migration, Edge Function ou dados históricos.

## Roadmap original
Planejamento 0–10 permanece **concluído**. v0.25.63 e v0.25.64 são correções pós-roadmap motivadas por uso real.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.64.md`
- `docs/RELEASE-v0.25.63.md`

## Versão
Produção: **0.25.64**

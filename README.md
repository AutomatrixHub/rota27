# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.67 — Estado visual de aniversários
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.67-r1`
- **Baseline anterior:** v0.25.66

## v0.25.67 — Estado visual de aniversários

### Problema corrigido
A automação de aniversário já estava correta no backend, mas o card **Aniversários próximos** podia voltar ao HTML antigo depois de um rerender da camada v0.25.57. Isso apagava visualmente:
- a informação de envio automático às 09:30;
- o bloco de status da automação;
- os badges **Autorizado / Sem autorização / Sem WhatsApp**.

### Correção
- o renderer v0.25.57 passa a emitir `rota27:v02557-rendered` após cada reconstrução do card;
- a v0.25.67 reconcilia imediatamente a camada v0.25.66 de elegibilidade;
- o bloco da automação v0.25.65 é restaurado usando o último status já consultado, sem polling adicional;
- o texto base do próprio renderer já informa: **Parabéns automático às 09:30 no dia do aniversário para clientes autorizados**;
- shell e roadmap loader usam cache-buster v0.25.67 para evitar HTML/JS antigo.

Não há `MutationObserver`, polling contínuo, migration ou alteração da Edge Function nesta release.

## Regra de elegibilidade vigente
A v0.25.66 permanece como regra:
- cliente que fornece **data de nascimento** recebe `relationshipMarketingOptIn=true` no mesmo fluxo de cadastro;
- o mesmo evento consolida `birthDate` + autorização;
- opt-out explícito posterior continua sendo respeitado;
- mensagens operacionais de comanda permanecem separadas.

Em 29/08/2026 foi executado backfill append-only para os **21 clientes** que já possuíam data de nascimento. Nenhum histórico foi apagado ou reescrito.

## Automação de aniversário
- template: `aniversario_cliente_rota27_v1`;
- categoria: **MARKETING**;
- idioma: `pt_BR`;
- template: **APPROVED**;
- cron: `rota27-birthday-greeting-0930`;
- horário: **09:30** em `America/Sao_Paulo`;
- idempotência anual preservada;
- Sandbox não envia WhatsApp real.

## Correções anteriores preservadas
- v0.25.66: elegibilidade e backfill de autorização;
- v0.25.65: parabéns automático de aniversário;
- v0.25.64: estabilidade mobile, FAB + e fechamento de Consumo interno;
- v0.25.63: coerência operacional de turnos;
- planejamento original 0–10 permanece concluído.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.67.md`
- `docs/RELEASE-v0.25.66.md`

## Versão
Produção: **0.25.67**

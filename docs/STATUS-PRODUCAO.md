# Rota 27 — Status de produção

Última revisão: 21/08/2026

## Baseline atual

- versão: **v0.15.1**
- branch de produção: `main`
- entrada pública: `index.html`
- Service Worker: cache `rota27-comandas-v0.15.1`
- código da release funcional v0.15.1 promovido pelo PR #7
- piloto em ambiente real autorizado

## Estado do GitHub no fechamento desta revisão

- PRs de desenvolvimento ativos: **nenhum**;
- issues abertas: **nenhuma**;
- PR histórico v0.14 que ainda estava aberto foi encerrado como superseded;
- README, guia de publicação, release notes, princípios de produto, roteiro do piloto e roadmap pós-piloto foram atualizados na `main`.

Branches históricas podem permanecer como registro de desenvolvimento; elas não representam trabalho ativo nem produção pendente.

## Backends

- `rota27-whatsapp`: versão validada permanece implantada;
- `rota27-sync`: versão validada permanece implantada;
- secrets/tokens não são armazenados no GitHub;
- autenticação customizada por `x-rota27-device-token` preservada.

## PWA / dados locais

- atualizar sem reinstalar;
- não limpar dados do Safari/Chrome;
- `localStorage` continua sendo a base local do aparelho;
- sync e WhatsApp possuem filas separadas;
- cancelamento possui fila própria para propagação quando necessário.

## Pendências funcionais

**Nenhuma pendência funcional conhecida bloqueia o piloto real da v0.15.1.**

## Pontos de evolução já registrados

Não são bugs bloqueantes e não devem ser alterados durante o turno:

- tornar cancelamento um evento nativo/tombstone com trilha de auditoria, caso o piloto demonstre necessidade;
- normalizar identificadores internos DEV/RC usados apenas em metadados técnicos da camada histórica de sincronização;
- avaliar busca em comandas abertas somente se o volume real justificar;
- avaliar proteção por PIN para ações administrativas somente se houver risco real de uso indevido;
- avaliar resumo de turno apenas se substituir tarefa manual existente.

Todos esses itens estão registrados em `docs/ROADMAP-POST-PILOTO.md` e serão priorizados por evidência do ambiente real.

## Regra a partir daqui

Durante o piloto, a v0.15.1 fica congelada. Só publicar nova versão se surgir P0/P1 com impacto real em integridade, cobrança, sincronização, WhatsApp ou continuidade da operação.

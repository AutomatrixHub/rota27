# Rota 27 v0.25.8 — Replay Hibernado

Data: 25/08/2026

## Objetivo
Retirar da interface e da execução normal o replay excepcional das 23 mensagens históricas de 25/08/2026, preservando o código para eventual uso futuro.

## O que muda
- o bloco **Reenviar histórico de 25/08** deixa de aparecer em WhatsApp do gerente;
- `assets/v0257-history-replay.js` e `assets/v0257-history-replay.css` permanecem no repositório, mas não são carregados em produção;
- os assets do replay deixam de fazer parte do APP_SHELL da PWA;
- o estado local do replay não é apagado;
- os IDs históricos permanecem preservados para manter idempotência caso a ferramenta seja reativada futuramente.

## O que permanece ativo
A cópia fixa contínua de novos lançamentos para:

`+55 27 99776-9279` (`5527997769279`)

continua funcionando normalmente, com fila própria, batching, retry e proteção contra duplicidade.

Também permanecem inalterados:
- WhatsApp do gerente;
- WhatsApp da comanda;
- sincronização entre aparelhos;
- Lista + Mapa de comandas;
- Clientes & Fidelização;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Backend
Sem alterações em Supabase, Edge Functions, migrations, tabelas ou tipos de evento.

## PWA
- `VERSION = 0.25.8`;
- cache `rota27-comandas-v0.25.8-r1`;
- Ajuda v5.9;
- caches antigos são substituídos pelo novo Service Worker.

## Hibernação
O replay não foi excluído. Para reativar no futuro, será necessário voltar a carregar seus assets e expor novamente sua interface de execução.

Baseline de rollback: **v0.25.7 — Replay de histórico WhatsApp**.

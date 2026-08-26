# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.8 — Replay Hibernado**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.8-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.7 — Replay de histórico WhatsApp**.

## v0.25.8 — replay histórico hibernado
A operação excepcional **Reenviar histórico de 25/08** foi retirada da interface e deixa de ser carregada em produção.

### Preservação
Os arquivos abaixo continuam no repositório:
- `assets/v0257-history-replay.js`;
- `assets/v0257-history-replay.css`.

Eles não são executados pela PWA e também deixam de integrar o APP_SHELL do Service Worker.

O estado local do replay e os IDs estáveis das 23 mensagens não são apagados. Isso preserva a idempotência caso a ferramenta seja reativada futuramente.

## WhatsApp fixo contínuo
Permanece ativa a cópia fixa de novos lançamentos para:

`+55 27 99776-9279` (`5527997769279`)

Regras preservadas:
- fila própria;
- batching curto por comanda;
- retry em falha;
- mesmo backend/template `rota27-whatsapp`;
- proteção contra duplicidade quando gerente ou cliente usam o mesmo número.

## Comandas — Lista + Mapa
Permanece a paridade visual da v0.25.6, com o Mapa reutilizando a estrutura visual da Lista.

## Backend e sincronização
A v0.25.8 não exige nova Edge Function, migration, tabela ou tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v5.9**, identificando Rota 27 v0.25.8.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.8`;
6. abrir **Painel → Configurações & Integrações → WhatsApp do gerente** e confirmar que o bloco de replay não aparece mais.

Ver `docs/RELEASE-v0.25.8.md`.

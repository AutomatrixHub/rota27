# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.7 — Replay de histórico WhatsApp**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.7-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.6 — Paridade Visual Lista / Mapa**.

## v0.25.7 — replay de histórico WhatsApp
A release adiciona uma operação controlada para reenviar 23 mensagens históricas de 25/08/2026 ao número fixo:

`+55 27 99776-9279` (`5527997769279`)

O replay preserva a ordem cronológica, inclusões, remoções e totais informados pelo proprietário e usa os mesmos templates do `rota27-whatsapp`.

### Operação
Em **WhatsApp do gerente** aparece o bloco **Reenviar histórico de 25/08** com progresso e botão de execução.

Regras:
- não envia automaticamente ao atualizar a PWA;
- exige confirmação explícita;
- 23 mensagens com IDs estáveis/idempotentes;
- retoma pendentes em caso de interrupção;
- o WhatsApp mostra o horário real do reenvio, não o horário histórico;
- `clientTimestamp` mantém internamente o horário original de cada lançamento.

## WhatsApp fixo contínuo
Permanece a cópia fixa da v0.25.5 para novos lançamentos no mesmo número `+55 27 99776-9279`.

## Comandas — Lista + Mapa
Permanece a paridade visual implementada na v0.25.6, com o Mapa reutilizando a estrutura visual da Lista.

## Backend e sincronização
A v0.25.7 não exige nova Edge Function, migration, tabela ou tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v5.8**, identificando Rota 27 v0.25.7.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.7`;
6. abrir **Painel → Configurações & Integrações → WhatsApp do gerente** para executar o replay.

Ver `docs/RELEASE-v0.25.7.md`.

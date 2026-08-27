# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.17 — Aniversário no cadastro de clientes**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.17-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.17 — Aniversário no cadastro de clientes
A v0.25.17 adiciona **Data de nascimento** opcional ao cadastro de clientes sem criar novo tipo de evento de sincronização.

A implementação usa o `client_upsert` já existente e preserva a arquitetura offline-first/multidispositivo:
- campo de data no editor de cliente;
- armazenamento normalizado em `AAAA-MM-DD`;
- exibição no perfil de Relacionamento & Fidelização em `DD/MM/AAAA`;
- sincronização entre aparelhos com cursor próprio para o complemento de aniversário;
- atualizações antigas de clientes sem `birthDate` não apagam uma data já cadastrada;
- remoção explícita da data é sincronizada com `birthDate: ""`;
- exportação CSV passa a incluir `data_nascimento`;
- importação CSV/TXT reconhece `data_nascimento`, `nascimento`, `aniversario`, `birthdate` e `birthday`;
- sem `MutationObserver` e sem polling visual frequente.

Nenhuma migration ou alteração de Edge Function é necessária: o backend continua usando `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
A v0.25.16 preserva a regra da v0.25.15 — a data de abertura da comanda define a data operacional — e adiciona um reparo administrativo, idempotente e rastreável para o fechamento histórico originado pela comanda `c1787690191876` (Fred / Balcão / R$ 145,00).

O evento original `turn_closed_2026-08-26` / seq 539 **não é apagado**. Ele é supersedido apenas na visão operacional efetiva por um reparo explícito que reconstrói o turno de 25/08 a partir do event log canônico.

Estado canônico do turno reparado de 25/08:
- faturamento: **R$ 448,00**;
- comandas fechadas: **8**;
- itens: **33 unidades**;
- pagamentos: A receber R$ 145,00; Pix R$ 132,00; Débito R$ 104,00; Crédito R$ 67,00;
- `closedAt` real do fechamento administrativo permanece preservado;
- a pendência de Fred continua aberta até baixa real.

O frontend inclui uma migração local one-shot/idempotente que arquiva localmente o fechamento supersedido e mantém o fechamento reparado como efetivo, sem limpar `localStorage` e sem reinstalar a PWA. O módulo usa cursor próprio para ler `turn_closure_repair`, de modo que aparelhos que atualizarem depois também convergem.

## Regra operacional preservada
A data de abertura da comanda define a qual turno a venda pertence. Uma comanda aberta em 26/08 e fechada às 01h ou 02h de 27/08 continua no turno operacional de 26/08; o horário real de fechamento permanece preservado.

Múltiplos turnos no mesmo dia continuam suportados: o fechamento anterior é o corte e somente comandas abertas depois dele entram no próximo turno da mesma data.

## Preservado
- seleção pesquisável de clientes na nova comanda (v0.25.13);
- A receber / Paga depois, inclusive recebimentos parciais;
- rankings por ID/código com nome atual do produto;
- referência de produtos ao editar categorias;
- Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Backend
- `rota27-sync`: versão **9 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.25.16`;
- `client_upsert` continua sendo o evento de domínio usado pelo cadastro de clientes, agora podendo transportar `birthDate` e `birthDateUpdatedAt`;
- `turn_closure_repair`, `receivable_upsert` e `receivable_payment` permanecem aceitos;
- `ALLOWED_TYPES` da Edge Function e `rota27_sync_events_type_ck` permanecem alinhados;
- última migration relacionada ao sync: `expand_rota27_sync_event_types_v02516`.

## Ajuda
Ajuda **v6.8** identifica a release v0.25.17 e inclui orientação sobre data de nascimento no cadastro de clientes.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/GATE-v0.25.16.md`
- `docs/TESTE-v0.25.16.md`

Baseline de rollback do código: **v0.25.16**. O rollback de código não remove eventos administrativos já gravados no backend.

## Versão
Produção: **0.25.17**

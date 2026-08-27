# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.17 — Aniversário no cadastro de clientes**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.17-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.16 — Reparo histórico de fechamento**.

## v0.25.17 — Aniversário no cadastro de clientes
A release inclui **Data de nascimento** opcional no cadastro compartilhado de clientes.

Regras:
- formato canônico: `AAAA-MM-DD`;
- exibição no perfil de Relacionamento & Fidelização: `DD/MM/AAAA`;
- datas futuras e datas inválidas são rejeitadas;
- o campo é opcional e pode ser removido explicitamente;
- a sincronização reutiliza `client_upsert`, sem novo tipo de evento;
- `birthDateUpdatedAt` acompanha o dado no evento mais recente;
- eventos antigos de `client_upsert` sem `birthDate` não apagam uma data já cadastrada;
- o complemento usa cursor próprio para convergir entre aparelhos;
- o CSV de clientes inclui `data_nascimento`;
- importação reconhece `data_nascimento`, `nascimento`, `aniversario`, `birthdate` e `birthday`;
- não foi introduzido `MutationObserver` nem polling visual frequente.

Nenhuma migration PostgreSQL nem alteração de Edge Function foi necessária nesta release. `ALLOWED_TYPES` e `rota27_sync_events_type_ck` permanecem inalterados e alinhados.

## v0.25.16 — Reparo histórico de fechamento
A release corrige de forma explícita, idempotente e rastreável o fechamento histórico relacionado à comanda real `c1787690191876`:
- cliente/local: Fred / Balcão;
- valor: R$ 145,00;
- abertura: 25/08/2026 17:36:31 BRT;
- fechamento administrativo: 26/08/2026 09:19:42 BRT;
- forma: A receber;
- recebível: `recv_c1787690191876`.

O `turn_closed` seq 539 (`turn_closed_2026-08-26` / `turn_2026-08-26`) permanece no event log para auditoria e passa a ser **supersedido operacionalmente**, não apagado.

A reconstrução canônica do movimento aberto em 25/08 resulta em:
- faturamento: **R$ 448,00**;
- 8 comandas fechadas;
- 33 unidades;
- A receber: R$ 145,00;
- Pix: R$ 132,00;
- Débito: R$ 104,00;
- Crédito: R$ 67,00.

O fechamento efetivo reparado usa `businessDate = 2026-08-25`, preserva o horário real de encerramento administrativo e mantém Fred em A receber até baixa real.

## Proteção multidispositivo
`assets/v02516-repair.js` aplica uma migração local one-shot/idempotente:
- mantém cópia auditável local do fechamento supersedido;
- remove apenas sua participação na visão operacional efetiva;
- instala o fechamento canônico reparado de 25/08;
- não limpa `localStorage`;
- não reinstala a PWA;
- usa cursor próprio para `turn_closure_repair`;
- reaplica a regra em eventos de ciclo de vida, sem polling visual frequente e sem `MutationObserver`.

Assim, um aparelho antigo que volte a sincronizar não deve reintroduzir o fechamento de 26/08 como verdade operacional.

## Backend v0.25.16
- migration `expand_rota27_sync_event_types_v02516` aplicada;
- novo tipo `turn_closure_repair` aceito no CHECK PostgreSQL;
- `rota27-sync` versão 9 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.25.16`;
- `ALLOWED_TYPES` inclui `turn_closure_repair`;
- `receivable_upsert` e `receivable_payment` permanecem aceitos.

## Regra operacional preservada da v0.25.15
A data operacional é determinada pela **abertura da comanda**, não pelo instante do fechamento.

Regras:
- aberta em 26/08 e fechada em 27/08 às 01h/02h → pertence a 26/08;
- `closedAt` real permanece preservado para auditoria;
- uma comanda aberta antes da meia-noite continua bloqueando o fechamento do turno de origem até ser resolvida;
- múltiplos turnos no mesmo dia continuam possíveis;
- o fechamento anterior funciona como corte: só comandas abertas depois dele entram no turno seguinte da mesma data;
- históricos antigos sem movimento recente não assumem o turno corrente.

## A receber
`A receber / Paga depois` segue a regra de data operacional pela abertura. A baixa total ou parcial posterior não cria nova venda e não duplica faturamento/itens.

## Cliente cadastrado
Permanece ativo o seletor pesquisável da v0.25.13 na nova comanda, compatível com iPhone/PWA, com busca por nome/WhatsApp e digitação livre para cliente novo. A v0.25.17 acrescenta a data de nascimento opcional ao cadastro compartilhado.

## Preservado
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento.

## Ajuda
Ajuda **v6.8**, identificando Rota 27 v0.25.17 e incluindo o novo campo de data de nascimento.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.17`.

Ver `docs/RELEASE-v0.25.17.md`.

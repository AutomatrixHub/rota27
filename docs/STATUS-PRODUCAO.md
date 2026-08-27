# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.18 — Cadastro completo na abertura da comanda**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.18-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.17 — Aniversário no cadastro de clientes**.

## v0.25.18 — Cadastro completo na abertura da comanda
A abertura de uma nova comanda passa a aceitar **Data de nascimento** opcional além de Cliente e WhatsApp.

Regras:
- ao selecionar um cliente cadastrado, WhatsApp e data de nascimento são preenchidos quando disponíveis;
- ao abrir uma comanda para cliente novo com WhatsApp válido, o cadastro automático já recebe a data de nascimento informada;
- cliente existente sem nascimento pode ter o cadastro complementado diretamente pela abertura da comanda;
- campo vazio na abertura não remove nascimento já salvo;
- data inválida ou futura é rejeitada;
- o dado continua usando `client_upsert` com `birthDate`/`birthDateUpdatedAt`;
- sem migration e sem alteração da Edge Function;
- sem polling visual frequente e sem `MutationObserver`.

## v0.25.17 — Aniversário no cadastro de clientes
A release incluiu Data de nascimento opcional no cadastro compartilhado de clientes, no perfil de Relacionamento & Fidelização e no CSV de clientes.

Regras preservadas:
- formato canônico: `AAAA-MM-DD`;
- exibição: `DD/MM/AAAA`;
- eventos antigos sem `birthDate` não apagam uma data cadastrada;
- remoção explícita do nascimento continua sincronizada;
- cursor próprio de aniversário continua convergindo entre aparelhos.

## v0.25.16 — Reparo histórico de fechamento
O reparo administrativo da comanda `c1787690191876` permanece ativo e rastreável. O `turn_closed` seq 539 continua preservado no event log, mas supersedido operacionalmente pelo fechamento canônico de 25/08.

Estado canônico do movimento de 25/08:
- faturamento: **R$ 448,00**;
- 8 comandas fechadas;
- 33 unidades;
- A receber: R$ 145,00;
- Pix: R$ 132,00;
- Débito: R$ 104,00;
- Crédito: R$ 67,00.

## Regra operacional preservada da v0.25.15
A data operacional é definida pela **abertura da comanda**, não pelo instante do fechamento.

Regras:
- comanda aberta antes da meia-noite e fechada depois pertence ao dia da abertura;
- `closedAt` real permanece preservado;
- múltiplos turnos no mesmo dia continuam possíveis;
- o fechamento anterior funciona como corte para o turno seguinte.

## A receber
`A receber / Paga depois` continua sem duplicar venda/faturamento em baixas totais ou parciais posteriores.

## Cliente cadastrado
O seletor pesquisável permanece ativo. A partir da v0.25.18, a própria abertura da comanda também pode cadastrar/complementar a data de nascimento do cliente.

## Backend
- `rota27-sync` versão 9 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.25.16`;
- `client_upsert` continua sendo o evento usado por clientes/aniversário;
- `turn_closure_repair`, `receivable_upsert` e `receivable_payment` permanecem aceitos;
- `ALLOWED_TYPES` e `rota27_sync_events_type_ck` permanecem alinhados;
- nenhuma migration nova na v0.25.18.

## Preservado
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Ajuda
Ajuda **v6.9**, identificando Rota 27 v0.25.18 e o campo de nascimento na nova comanda.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.18`.

Ver `docs/RELEASE-v0.25.18.md`.

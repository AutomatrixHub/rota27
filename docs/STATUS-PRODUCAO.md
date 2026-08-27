# Rota 27 — Status de produção

Última revisão: 26/08/2026

## Produção
- versão: **v0.25.19 — Cards compactos de comandas**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.19-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.18 — Cadastro completo na abertura da comanda**.

## v0.25.19 — Cards compactos de comandas
Refinamento exclusivamente visual da tela **Comandas** com base em uso real no celular.

### Lista
- cards mais baixos;
- padding vertical reduzido;
- nome, local, itens/tempo, valor e rodapé mais compactos;
- botão **Abrir** menor sem perder área de toque adequada;
- espaçamento entre cards reduzido.

### Mapa
- em viewport mobile (até 520 CSS px), o grid passa para **2 cards por linha**;
- cards mais baixos e com tipografia secundária compactada;
- melhor distribuição entre nome, local, valor e último lançamento;
- fallback para 1 coluna somente abaixo de 310 CSS px.

Nenhuma mudança de domínio, event log, sync, Supabase ou Edge Function foi necessária.

## v0.25.18 — Cadastro completo na abertura da comanda
A abertura de nova comanda aceita Data de nascimento opcional junto com Cliente e WhatsApp. Cliente existente pode ter o nascimento preenchido/complementado, e cliente novo pode ser cadastrado já com o dado.

## v0.25.17 — Aniversário no cadastro de clientes
Data de nascimento opcional no cadastro compartilhado, Relacionamento & Fidelização e CSV, via `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
O reparo administrativo da comanda `c1787690191876` permanece ativo e rastreável. O fechamento canônico de 25/08 permanece em R$ 448,00 / 8 comandas / 33 unidades.

## Regra operacional preservada
A data operacional é definida pela **abertura da comanda**, não pelo instante do fechamento. Múltiplos turnos no mesmo dia continuam possíveis.

## A receber
`A receber / Paga depois` continua sem duplicar venda/faturamento em baixas totais ou parciais posteriores.

## Cliente cadastrado
O seletor pesquisável permanece ativo. A abertura da comanda também pode cadastrar/complementar a data de nascimento do cliente.

## Backend
- `rota27-sync` versão 9 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.25.16`;
- `ALLOWED_TYPES` e `rota27_sync_events_type_ck` permanecem alinhados;
- nenhuma migration nova na v0.25.19.

## Preservado
- rankings por ID/código com nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Ajuda
Ajuda **v6.9**, identificando Rota 27 v0.25.19.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.19`.

Ver `docs/RELEASE-v0.25.19.md`.

# Rota 27 — Status de produção

Última revisão: 27/08/2026

## Produção
- versão: **v0.25.24 — Acabamento visual do Histórico & resultados**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.24-r1`;
- `rota27-whatsapp`: versão **23 ACTIVE** (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão **2 ACTIVE** (`rota27-whatsapp-inbound-v2-birthday`);
- `rota27-birthday-campaign`: versão **2 ACTIVE** (`rota27-birthday-campaign-v2`);
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.23**, HEAD `167d7d3029a9fa58dcac2cfed1446e18547eb012`.

## v0.25.24 — Acabamento visual do Histórico & resultados
Refinamento exclusivamente visual da tela principal **Histórico & resultados**, seguindo o padrão aprovado na tela **Fechamentos**.

### Acabamento
- título, subtítulo e contador com hierarquia mais clara;
- barra **Hoje / Ontem / 7 dias / 30 dias / Todos** e busca mais compactas;
- bloco de **Ontem** com marcador discreto de **Último fechamento**;
- métricas mais densas, com valores maiores e rótulos mais suaves;
- **Comandas** é apresentado visualmente como **Comandas fechadas**;
- ações de CSV/backup mantêm área de toque confortável com menor peso visual;
- painéis de produtos/categorias, rankings e lista de comandas fechadas ficam mais compactos e fáceis de escanear.

### Estabilidade
- sem alteração da lógica de períodos ou dos cálculos;
- sem `MutationObserver`;
- sem polling visual frequente;
- sem alteração de Supabase, Edge Functions ou event log;
- sem limpeza de `localStorage` e sem reinstalação da PWA.

Ver `docs/RELEASE-v0.25.24.md`.

## v0.25.23 — Acabamento visual dos Fechamentos
A tela **Fechamentos** foi validada em aparelho real com:
- data operacional dominante e horário físico mais discreto;
- valores mais destacados e rótulos mais suaves;
- cards/status/rodapé mais compactos;
- marcador **Último fechamento**;
- **Ajuste administrativo** apresentado de forma amigável;
- proteção contra reaparecimento do ID técnico `turn_...`;
- sem alteração de domínio ou backend.

Ver `docs/RELEASE-v0.25.23.md`.

## v0.25.22 — Refinamento dos Fechamentos
A grade dos fechamentos permanece:
- **Faturamento | Ticket médio**;
- **Comandas fechadas | Comandas canceladas**;
- **Itens vendidos | Formas de pagamento**.

Os hotfixes r2–r4 eliminaram a disputa visual do renderer legado sem `MutationObserver` ou polling contínuo. Ver `docs/RELEASE-v0.25.22.md` e `docs/HOTFIX-v0.25.22-r4.md`.

## v0.25.21 — Ontem no Histórico
A tela **Histórico** possui **Hoje / Ontem / 7 dias / 30 dias / Todos**. A aba **Ontem** usa o fechamento operacional do dia anterior e, quando necessário, respeita o corte do fechamento anterior.

## Funcionalidades preservadas
- data operacional pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- reparo histórico do fechamento de 25/08;
- `A receber / Paga depois`, inclusive baixas parciais sem duplicar faturamento;
- seletor pesquisável de clientes;
- data de nascimento no cadastro e na abertura da comanda;
- campanha de aniversário via WhatsApp;
- rankings por ID/código usando nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Reparo histórico de 25/08
O reparo administrativo relacionado à comanda `c1787690191876` permanece ativo e rastreável. O fechamento canônico de 25/08 permanece em **R$ 448,00 / 8 comandas / 33 unidades**.

## Backend
Nenhuma alteração na v0.25.24. Permanecem:
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v2 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE;
- sem novo tipo de evento de sync e sem alteração de `rota27_sync_events_type_ck`.

## Ajuda
Ajuda **v7.0**, identificando Rota 27 v0.25.24.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.24`.

## Releases recentes
- `docs/RELEASE-v0.25.24.md`
- `docs/RELEASE-v0.25.23.md`
- `docs/RELEASE-v0.25.22.md`
- `docs/RELEASE-v0.25.21.md`
- `docs/RELEASE-v0.25.20.md`
- `docs/RELEASE-v0.25.19.md`
- `docs/RELEASE-v0.25.18.md`
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`

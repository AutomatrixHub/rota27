# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.18 — Cadastro completo na abertura da comanda**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.18-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.18 — Cadastro completo na abertura da comanda
A nova comanda passa a aceitar **Data de nascimento** opcional junto com Cliente e WhatsApp.

Regras:
- cliente já cadastrado: nome selecionado preenche WhatsApp e data de nascimento quando disponíveis;
- cliente novo: ao abrir a comanda, nome/WhatsApp continuam alimentando o cadastro e a data de nascimento também é persistida;
- cliente existente sem nascimento: se o atendente preencher a data na abertura, o cadastro é complementado;
- deixar o campo de nascimento vazio na abertura **nunca apaga** uma data já cadastrada;
- datas futuras/inválidas são rejeitadas;
- a sincronização reutiliza `client_upsert`, sem novo tipo de evento e sem migration;
- nenhuma nova rotina de polling visual ou `MutationObserver` foi introduzida.

## v0.25.17 — Aniversário no cadastro de clientes
A v0.25.17 adicionou Data de nascimento opcional ao cadastro compartilhado, perfil de Relacionamento & Fidelização e CSV de clientes. O dado usa formato canônico `AAAA-MM-DD`, exibição `DD/MM/AAAA` e sincronização multidispositivo via `client_upsert`.

## v0.25.16 — Reparo histórico de fechamento
A v0.25.16 preserva a regra da v0.25.15 — a data de abertura da comanda define a data operacional — e mantém o reparo administrativo rastreável do fechamento histórico ligado à comanda `c1787690191876` (Fred / Balcão / R$ 145,00).

Estado canônico reparado de 25/08:
- faturamento: **R$ 448,00**;
- comandas fechadas: **8**;
- itens: **33 unidades**;
- pagamentos: A receber R$ 145,00; Pix R$ 132,00; Débito R$ 104,00; Crédito R$ 67,00.

## Regra operacional preservada
A data de abertura da comanda define a qual turno a venda pertence. Múltiplos turnos no mesmo dia continuam suportados; o fechamento anterior funciona como corte.

## Preservado
- seletor pesquisável de clientes na nova comanda;
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
- `client_upsert` continua sendo o evento de domínio do cadastro de clientes e pode transportar `birthDate` e `birthDateUpdatedAt`;
- `turn_closure_repair`, `receivable_upsert` e `receivable_payment` permanecem aceitos;
- nenhuma migration nem alteração de Edge Function na v0.25.18.

## Ajuda
Ajuda **v6.9** identifica a release v0.25.18 e documenta o cadastro rápido com data de nascimento na abertura da comanda.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.18.md`
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.17**.

## Versão
Produção: **0.25.18**

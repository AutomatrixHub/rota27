# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

- **Versão:** v0.25.58 — Vencimento rápido em A Receber
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.58-r1`
- **Baseline anterior:** v0.25.57

## Navegação

- **Comandas = atender**
- **Cardápio = o que é vendido**
- **Painel = administrar o negócio**
- **Histórico = o que aconteceu**

## Estado funcional atual

### Comandas
- abertura rápida por Mesa, Balcão, Parklet ou cliente;
- Lista e Mapa preservados;
- cards compactos na Lista;
- local exibido ao lado do nome do cliente;
- edição, fechamento e cancelamento de comandas;
- consumo interno/próprio sem contaminar faturamento;
- `A receber / Paga depois`, inclusive recebimentos parciais;
- ao fechar como **A receber**, vencimento opcional com atalhos **Sem data / Hoje / Amanhã / 7 dias**;
- barra de ação com `Ver/Editar itens` e `Fechar`;
- Nova comanda sem foco automático obrigatório em `Mesa/Local`.

### A Receber
- vencimento é opcional; o padrão continua **Sem data**;
- vencimentos também podem ser ajustados depois na lista de pendências;
- pendências vencidas e com vencimento hoje ganham destaque;
- ordenação prioriza vencidas, depois hoje, futuras e sem data;
- Painel destaca vencidas ou vencimentos do dia antes do resumo geral;
- a data é sincronizada pelo `receivable_upsert` já existente, sem novo tipo de evento;
- não existe cobrança automática.

### Cardápio
- catálogo por categorias;
- busca;
- histórico de preço e gestão de produtos/categorias;
- ícones vetoriais no padrão Rota27;
- bloco **Mais usados hoje** com Top 3 calculado automaticamente a partir do uso real.

### Painel
- visão da operação atual;
- resultados do dia;
- situação de Internet, sincronização, WhatsApp e conflitos;
- acessos a Visão Gerencial, Clientes & Fidelização, A Receber, Estoque e Compras;
- bloco **Hoje precisa de atenção** por exceção, sem polling contínuo.

### Histórico e fechamento
- data operacional definida pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- fechamento imutável e sincronizado;
- períodos Hoje / Ontem / 7 dias / 30 dias / Todos;
- rankings por produto/categoria;
- CSV e backup;
- reparos administrativos históricos preservados com rastreabilidade.

### Estoque, compras, inventário e custos
- Estoque Essencial;
- reposição derivada do estoque;
- compras e recebimentos parciais;
- inventário com divergências e ajustes controlados;
- custo real e margem bruta estimada sem inventar custo ausente.

### Clientes & Fidelização
- cadastro compartilhado e sincronizado;
- WhatsApp e data de nascimento;
- cards com nascimento, última compra, cliente desde, total de compras e última visita;
- recorrência/fidelização;
- campanha de solicitação de aniversário via WhatsApp;
- bloco **Aniversários próximos** com contagem de hoje e dos próximos 7 dias, sem envio automático;
- toque no nome do aniversariante localiza o cliente na lista;
- Eventos & Convites com consentimento próprio de marketing.

### WhatsApp
- envio transacional da comanda;
- campanha de aniversário;
- Eventos & Convites;
- callbacks assíncronos `sent`, `delivered`, `read` e `failed`;
- funil de Eventos distinguindo **Aceito Meta / Enviado / Entregue / Lido / Falhou**.

## Backend de produção

Projeto Supabase: `owkvwsiblbzlpxjwybrt`.

Principais Edge Functions:

- `rota27-whatsapp` — v23 ACTIVE;
- `rota27-sync` — v9 ACTIVE;
- `rota27-whatsapp-inbound` — v3 ACTIVE;
- `rota27-birthday-campaign` — v2 ACTIVE;
- `rota27-event-campaign` — v4 ACTIVE;
- `rota27-event-delivery-status` — v1 ACTIVE, somente leitura;
- `rota27-audit` — v1 ACTIVE, somente leitura.

As funções administrativas temporárias de replay/reenvio permanecem publicadas apenas como **tombstones encerrados**, exigem JWT e respondem HTTP 410; não executam mais reprocessamento.

## Releases recentes

- **v0.25.56** — consolidação da baseline e documentação operacional;
- **v0.25.57** — Aniversários próximos;
- **v0.25.58** — Vencimento rápido em A Receber.

## Roadmap retomado

Concluídos:

0. Lista de comandas mais compacta;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. Funil real de entrega dos Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber.

Próximos:

6. Receber tudo em Compras;
7. dias de cobertura do Estoque;
8. classificação/ordenação inteligente de Clientes;
9. pré-fechamento por exceção;
10. alertas de custo/margem.

## Regras de atualização da PWA

Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção para atualizar versão. Com internet ativa, abrir o app, aguardar a atualização do Service Worker, fechar completamente e abrir novamente.

## Documentação principal

- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.58.md`
- `docs/RELEASE-v0.25.57.md`
- `docs/RELEASE-v0.25.56.md`

## Versão

Produção: **0.25.58**

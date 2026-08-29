# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

- **Versão:** v0.25.59 — Dias de cobertura do Estoque
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.59-r1`
- **Baseline anterior:** v0.25.58

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
- edição, fechamento e cancelamento de comandas;
- consumo interno/próprio sem contaminar faturamento;
- `A receber / Paga depois`, inclusive recebimentos parciais;
- vencimento opcional em A Receber: **Sem data / Hoje / Amanhã / 7 dias**;
- Nova comanda sem foco automático obrigatório.

### A Receber
- vencimento opcional e sincronizado pelo `receivable_upsert` existente;
- vencidas e vencimentos do dia destacados;
- ordenação por urgência;
- sem cobrança automática.

### Cardápio
- catálogo, categorias, busca e histórico de preços;
- ícones vetoriais no padrão Rota27;
- **Mais usados hoje** em Top 3.

### Estoque, compras, inventário e custos
- Estoque Essencial;
- reposição derivada do estoque;
- compras e recebimentos parciais;
- no fluxo atual de recebimento, as quantidades pendentes já vêm integralmente preenchidas e o usuário altera somente exceções — comportamento que já atende ao item planejado **Receber tudo** sem botão redundante;
- **dias de cobertura** calculados automaticamente com até 7 dias operacionais recentes;
- consumo interno, cancelamentos e não faturáveis não entram na média;
- na Reposição, o sistema informa também quanto comprar para aproximadamente 7 dias de cobertura, sem alterar a quantidade automaticamente;
- inventário com divergências e ajustes controlados;
- custo real e margem bruta estimada sem inventar custo ausente.

### Clientes & Fidelização
- cadastro compartilhado e sincronizado;
- WhatsApp e data de nascimento;
- cards enriquecidos;
- **Aniversários próximos**: hoje e próximos 7 dias;
- Eventos & Convites com consentimento próprio de marketing.

### WhatsApp
- transacional da comanda;
- campanha de aniversário;
- Eventos & Convites;
- callbacks `sent`, `delivered`, `read` e `failed`;
- funil real de entrega.

## Backend de produção

Projeto Supabase: `owkvwsiblbzlpxjwybrt`.

Principais Edge Functions permanecem:
- `rota27-whatsapp` — v23 ACTIVE;
- `rota27-sync` — v9 ACTIVE;
- `rota27-whatsapp-inbound` — v3 ACTIVE;
- `rota27-birthday-campaign` — v2 ACTIVE;
- `rota27-event-campaign` — v4 ACTIVE;
- `rota27-event-delivery-status` — v1 ACTIVE;
- `rota27-audit` — v1 ACTIVE.

## Releases recentes

- **v0.25.57** — Aniversários próximos;
- **v0.25.58** — Vencimento rápido em A Receber;
- **v0.25.59** — Dias de cobertura do Estoque.

## Roadmap retomado

Concluídos:

0. Lista de comandas mais compacta;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. Funil real de entrega dos Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — **já atendido pelo comportamento existente de pré-preenchimento integral das pendências**;
7. Dias de cobertura do Estoque.

Próximos:

8. classificação/ordenação inteligente de Clientes;
9. pré-fechamento por exceção;
10. alertas de custo/margem.

## Atualização da PWA

Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção para atualizar versão. Com internet ativa, abrir o app, aguardar a atualização do Service Worker, fechar completamente e abrir novamente.

## Documentação principal

- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.59.md`
- `docs/RELEASE-v0.25.58.md`
- `docs/RELEASE-v0.25.57.md`

## Versão

Produção: **0.25.59**

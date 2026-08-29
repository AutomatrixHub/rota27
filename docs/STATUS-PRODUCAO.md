# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção

- versão: **v0.25.59 — Dias de cobertura do Estoque**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.59-r1`;
- baseline anterior: **v0.25.58**, merge `cb854a335a964a8a2c27d647ddd088bca1773eec`.

## Estado operacional

### Comandas e A Receber
- Lista e Mapa ativos;
- Mapa rápido desabilitado;
- consumo interno/próprio preservado;
- `A receber / Paga depois` preservado;
- vencimento opcional **Sem data / Hoje / Amanhã / 7 dias**;
- vencidas e vencimentos do dia destacados;
- Nova comanda sem foco automático obrigatório.

### Cardápio
- catálogo, categorias, busca e gestão de preços preservados;
- **Mais usados hoje** em Top 3.

### Estoque & Compras
- Estoque Essencial preservado;
- cada produto controlado recebe estimativa de **dias de cobertura** quando há consumo recente suficiente;
- cálculo usa até 7 dias operacionais recentes e exclui cancelamentos, consumo interno e não faturáveis;
- sem histórico recente, exibe **Sem consumo recente**;
- Reposição mostra também a quantidade aproximada necessária para chegar a 7 dias de cobertura, sem alterar o campo Comprar automaticamente;
- o fluxo de recebimento de compras já abre com todas as quantidades pendentes preenchidas, exigindo edição somente das exceções; isso atende ao item planejado **Receber tudo** sem criar botão redundante.

### Clientes & Fidelização
- cards enriquecidos;
- data de nascimento sincronizada;
- **Aniversários próximos** mostra hoje e próximos 7 dias;
- Eventos & Convites preservados.

### WhatsApp
- callbacks `sent/delivered/read/failed` preservados;
- funil real de Eventos preservado.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`.

Permanecem sem alteração nesta release:
- `rota27-whatsapp` — v23 ACTIVE;
- `rota27-sync` — v9 ACTIVE;
- `rota27-whatsapp-inbound` — v3 ACTIVE;
- `rota27-birthday-campaign` — v2 ACTIVE;
- `rota27-event-campaign` — v4 ACTIVE;
- `rota27-event-delivery-status` — v1 ACTIVE;
- `rota27-audit` — v1 ACTIVE.

A v0.25.59 não cria Edge Function, migration, schema ou tipo de evento.

## Roadmap retomado

Concluído:

0. compactação de Comandas/Lista;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — já atendido pelo pré-preenchimento integral existente;
7. Dias de cobertura do Estoque.

Próximo item funcional:

8. **Inteligência de Clientes: classificação e ordenação**.

Depois:

9. pré-fechamento por exceção;
10. alertas de custo/margem.

## Regras de preservação

- não limpar `localStorage` de produção;
- não reinstalar PWA como mecanismo normal de atualização;
- não resetar Supabase;
- não recriar clientes;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- novas alterações usam branch curta + PR + merge + confirmação do GitHub Pages.

## Rollback

Para rollback funcional imediato, usar a baseline **v0.25.58** / merge `cb854a335a964a8a2c27d647ddd088bca1773eec`.

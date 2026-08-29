# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção

- versão: **v0.25.58 — Vencimento rápido em A Receber**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.58-r1`;
- baseline anterior: **v0.25.57**, merge `5f3a23c9423cf1604e6a4861e91a263b76f67db2`.

## Estado operacional do frontend

### Comandas
- Lista e Mapa ativos;
- Mapa rápido desabilitado, preservando a visualização Mapa normal;
- Lista compacta com local ao lado do nome do cliente;
- abertura, edição, cancelamento e fechamento preservados;
- consumo interno/próprio preservado;
- `A receber / Paga depois` preservado;
- ao fechar como A receber, vencimento opcional com **Sem data / Hoje / Amanhã / 7 dias**;
- barra da comanda com `Ver/Editar itens` e `Fechar`;
- FAB `+` oculto enquanto a barra da comanda está ativa;
- Nova comanda sem foco automático obrigatório em `Mesa/Local`.

### A Receber
- vencimento continua opcional e o padrão é **Sem data**;
- vencimento pode ser definido no fechamento ou alterado posteriormente na própria pendência;
- vencidas e vencimentos de hoje recebem destaque visual;
- ordem operacional: vencidas → hoje → futuras → sem data;
- Painel mostra primeiro vencidas ou vencimentos do dia;
- sincronização usa o evento já existente `receivable_upsert`;
- não existe cobrança automática nem novo backend.

### Cardápio
- catálogo completo, categorias e busca preservados;
- gestão de produtos/categorias e histórico de preços preservados;
- **Mais usados hoje** em Top 3, sem rolagem horizontal e sem a faixa legada `Mais lançados`.

### Painel
- `Hoje precisa de atenção` por exceção;
- A Receber agora diferencia vencidas e vencimentos do dia;
- sem polling contínuo;
- acessos gerenciais existentes preservados.

### Clientes & Fidelização
- cadastro compartilhado e sincronizado;
- data de nascimento preservada via `client_upsert`;
- cards enriquecidos com nascimento, última compra, cliente desde e histórico;
- **Aniversários próximos** mostra hoje e próximos 7 dias;
- nenhuma mensagem é enviada automaticamente por esse recurso.

### Eventos & Convites
- consentimento específico de marketing preservado;
- proteção contra duplicidade preservada;
- funil real: Registrados / Aceitos Meta / Enviados / Entregues / Lidos / Falharam;
- erro real da Meta disponível quando houver callback `failed`.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`.

Edge Functions principais:

- `rota27-whatsapp` — **v23 ACTIVE**;
- `rota27-sync` — **v9 ACTIVE**;
- `rota27-whatsapp-inbound` — **v3 ACTIVE**;
- `rota27-birthday-campaign` — **v2 ACTIVE**;
- `rota27-event-campaign` — **v4 ACTIVE**;
- `rota27-event-delivery-status` — **v1 ACTIVE**, somente leitura;
- `rota27-audit` — **v1 ACTIVE**, somente leitura.

A v0.25.58 não altera Edge Functions, banco, schema ou tipos de evento.

## Marcos recentes

- **v0.25.56** — baseline/documentação reconciliadas com produção;
- **v0.25.57** — Aniversários próximos;
- **v0.25.58** — Vencimento rápido em A Receber.

## Roadmap retomado

Concluído:

0. compactação de Comandas/Lista;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber.

Próximo item funcional:

6. **Receber tudo em Compras**.

Depois:

7. dias de cobertura do Estoque;
8. inteligência de Clientes;
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

Para rollback funcional imediato, usar a baseline **v0.25.57** / merge `5f3a23c9423cf1604e6a4861e91a263b76f67db2`.

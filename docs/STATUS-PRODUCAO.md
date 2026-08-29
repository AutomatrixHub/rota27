# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.60 — Inteligência de Clientes**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.60-r1`;
- baseline anterior: **v0.25.59**, merge `08904789aeb01eec1efaf0bd985a725468322869`.

## Estado operacional

### Comandas, A Receber e Cardápio
- Lista e Mapa ativos;
- consumo interno/próprio preservado;
- vencimento rápido em A Receber preservado;
- Mais usados hoje em Top 3;
- Nova comanda sem foco automático obrigatório.

### Estoque & Compras
- cobertura estimada em dias ativa;
- cálculo usa até 7 dias operacionais recentes e ignora cancelamentos/consumo interno/não faturáveis;
- Reposição mostra quantidade aproximada para ~7 dias sem alterar Comprar;
- recebimento de compras já pré-preenche toda quantidade pendente, deixando o usuário corrigir apenas exceções.

### Clientes & Fidelização
- `Rota27V025.profileFor` permanece a fonte oficial de classificação;
- níveis: **Novo (0–1), Recorrente (2–4), Frequente (5–9), Cliente da casa (10+)**;
- **Sumido** continua significando cliente com pelo menos 2 visitas e 30+ dias sem voltar;
- a lista principal exibe esses selos sem gravar novo dado;
- ordenações disponíveis: **Nome / Última visita / Mais frequentes / Aniversário próximo**;
- ordenação é somente visual/local e não altera cadastro nem sync;
- Aniversários próximos e Eventos & Convites preservados.

### WhatsApp
- callbacks `sent/delivered/read/failed` e funil real de Eventos preservados.

## Backend Supabase
Projeto: `owkvwsiblbzlpxjwybrt`.

Sem alteração nesta release:
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp-inbound` v3 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE;
- `rota27-event-campaign` v4 ACTIVE;
- `rota27-event-delivery-status` v1 ACTIVE;
- `rota27-audit` v1 ACTIVE.

## Roadmap
Concluído:
0. compactação de Comandas/Lista;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — já atendido pelo comportamento existente;
7. Dias de cobertura do Estoque;
8. Inteligência de Clientes.

Próximo:
9. **Pré-fechamento por exceção**.

Depois:
10. alertas de custo/margem.

## Regras de preservação
- não limpar `localStorage` de produção;
- não reinstalar PWA como mecanismo normal de atualização;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- novas alterações usam branch curta + PR + merge + confirmação do GitHub Pages.

## Rollback
Baseline anterior: **v0.25.59** / merge `08904789aeb01eec1efaf0bd985a725468322869`.

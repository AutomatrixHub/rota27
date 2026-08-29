# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.64 — Estabilidade mobile e fechamento interno**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.64-r1`;
- baseline anterior: **v0.25.63**, merge `c8b8d54a99eefee047e294ba7bf9ce01dc64b14f`.

## Incidente pós-v0.25.63
Uso real apontou três regressões:
1. responsividade mais lenta no iPhone;
2. botão `+` de Nova comanda sem resposta em Comandas / Lista;
3. Consumo interno com item lançado sem concluir o fechamento.

A auditoria confirmou que a comanda interna `c1788014228867` foi aberta com `internalConsumption=true`, recebeu item e não gerou fechamento; posteriormente foi cancelada. Nenhum reparo histórico automático é feito nesta release.

## Correção v0.25.64

### Desempenho
- o wrapper pesado da v0.25.63, que normalizava `commands + history` a cada `save()`, é substituído por normalização somente das comandas abertas;
- nenhuma nova rotina de polling contínuo;
- nenhuma nova ponte `innerHTML` é criada pelo hotfix;
- a coerência operacional da v0.25.63 permanece preservada.

### FAB + Nova comanda
- em `screenCommands.active`, o FAB `+` é mantido visível e interativo em Lista e Mapa;
- `cartbar.show` residual é removido ao retornar para a tela de Comandas;
- o clique do FAB chama diretamente a rotina real `openNewCommandSheet()`;
- a Nova comanda continua sem foco automático obrigatório.

### Consumo interno
- o botão de finalizar é interceptado em captura antes dos wrappers financeiros legados;
- Consumo interno é fechado pelo fluxo canônico próprio, independentemente da ordem dos módulos de A Receber;
- continua com `nonRevenue=true`, sem faturamento, sem pagamento e sem A Receber;
- valor permanece somente como referência operacional/estoque.

## Turnos
As regras da v0.25.63 permanecem:
- `businessDate`/data operacional pela abertura da comanda;
- Turno atual separado do Último turno fechado;
- A Receber separado visualmente do faturamento;
- Consumo interno fora das métricas de venda.

## Backend Supabase
Projeto `owkvwsiblbzlpxjwybrt`.
- nenhuma migration;
- nenhum schema alterado;
- nenhuma Edge Function alterada;
- nenhum reset ou reprocessamento de dados;
- eventos reais foram apenas consultados para diagnóstico.

## Regras de preservação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.63** / merge `c8b8d54a99eefee047e294ba7bf9ce01dc64b14f`.

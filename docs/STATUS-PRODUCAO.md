# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.61 — Pré-fechamento por exceção**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.61-r1`;
- baseline anterior: **v0.25.60**, merge `0d133579f443684753ff592e44c9ff37cfd537a5`.

## Estado operacional

### Fechamento
O fluxo de fechamento já bloqueava comandas abertas e cancelamentos aguardando sincronização. A v0.25.61 traz essa leitura para o card de Fechamento no Painel antes de abrir a folha final.

Estados possíveis:
- comandas abertas — bloqueio já existente;
- cancelamentos pendentes — bloqueio já existente;
- fechamento anterior aguardando sincronização — aviso, não bloqueio novo;
- sem movimento para fechar;
- **Tudo certo para fechar**.

Não existe checklist obrigatório e não foi criada nova condição de bloqueio.

### Demais módulos
- A Receber com vencimento rápido preservado;
- Mais usados hoje preservado;
- dias de cobertura do Estoque preservados;
- Clientes com classificação/ordenação preservados;
- Aniversários próximos e Eventos & Convites preservados.

## Backend Supabase
Projeto `owkvwsiblbzlpxjwybrt`. Nenhuma Edge Function, migration, schema ou tipo de evento foi alterado nesta release.

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
8. Inteligência de Clientes;
9. Pré-fechamento por exceção.

Próximo:
10. **Alertas de custo/margem**.

## Regras de preservação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.60** / merge `0d133579f443684753ff592e44c9ff37cfd537a5`.

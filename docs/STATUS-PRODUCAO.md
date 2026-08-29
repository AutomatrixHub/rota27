# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.62 — Alertas de custo/margem**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.62-r1`;
- baseline anterior: **v0.25.61**, merge `90098ef4509b7f3633624bb6d8d57645ac32e054`.

## Estado operacional

### Fechamento
- pré-fechamento por exceção preservado;
- comandas abertas e cancelamentos pendentes continuam usando os bloqueios existentes;
- sync pendente é aviso operacional, não novo bloqueio;
- quando não há exceções, o card informa **Tudo certo para fechar**.

### A Receber, Estoque, Compras e Clientes
- vencimento rápido em A Receber preservado;
- dias de cobertura do Estoque preservados;
- recebimento de Compras já pré-preenche integralmente as quantidades pendentes;
- inteligência de Clientes e Aniversários próximos preservados.

### Custos & Margem
A v0.25.62 acrescenta alertas somente quando há exceção relevante, sem configuração adicional:
- margem bruta estimada negativa: alerta sempre;
- aumento de **10% ou mais** entre os dois custos efetivos mais recentes, quando o custo mais recente ocorreu nos últimos 30 dias: alerta;
- produtos sem custo real conhecido continuam fora das estimativas e não geram margem inventada;
- a Central **Custos & Margem** mostra os detalhes;
- **Hoje precisa de atenção** recebe somente uma linha consolidada apontando para Custos & Margem;
- quando não há exceções, nenhum bloco extra ocupa espaço;
- refresh orientado a eventos, sem polling contínuo e sem novo `MutationObserver`.

## Backend Supabase
Projeto `owkvwsiblbzlpxjwybrt`. Nenhuma Edge Function, migration, schema ou tipo de evento foi alterado na v0.25.62.

## Roadmap original — encerrado
Concluído:
0. compactação de Comandas/Lista;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — atendido pelo comportamento existente de pré-preenchimento integral;
7. Dias de cobertura do Estoque;
8. Inteligência de Clientes;
9. Pré-fechamento por exceção;
10. Alertas de custo/margem.

**Itens planejados 0–10: concluídos.**

## Regras de preservação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.61** / merge `90098ef4509b7f3633624bb6d8d57645ac32e054`.

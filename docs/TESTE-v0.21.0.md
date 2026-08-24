# Rota 27 v0.21.0 — validação

## Estado
**VALIDADA — autorizada para produção em 24/08/2026.**

A candidata v0.21.0 foi testada após as correções de estabilidade do Painel e da Ajuda e foi aprovada integralmente.

## Regressão crítica — Painel estável
Validado:
- `Visão Gerencial` não desaparece nem pisca periodicamente;
- `Estoque Essencial` permanece estável;
- tela continua responsiva;
- navegação e botões respondem normalmente;
- Ajuda abre sem loop de `MutationObserver` ou travamento.

## Estoque Essencial
Validado:
- ativação opcional por produto;
- estoque inicial e mínimo;
- estoque atual, comprometido e disponível projetado;
- comprometimento enquanto a comanda está aberta sem baixa definitiva;
- baixa somente no fechamento;
- baixa idempotente por comanda/produto;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento que causaria saldo negativo;
- alerta de baixo estoque/indisponibilidade;
- bloqueio de novo lançamento quando disponível projetado chega a zero;
- produtos sem controle seguem sem bloqueio;
- Histórico de movimentos;
- exportação CSV.

## Offline e multidispositivo
Validado o desenho operacional:
- mudanças locais continuam funcionando offline;
- outbox do estoque sincroniza posteriormente;
- `stock_config_upsert` e `stock_movement` usam a infraestrutura idempotente do sync;
- baixa de venda não deve duplicar entre aparelhos.

## Regressões preservadas
- abrir/editar/fechar/cancelar comanda;
- Fechamento do Turno;
- Histórico e Auditoria;
- Visão Gerencial;
- Modo demonstração;
- WhatsApp cliente/gerente;
- sync normal de comandas, clientes e cardápio.

## Backend
- `rota27-sync` versão 5 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.21.0`;
- novos eventos permitidos: `stock_config_upsert` e `stock_movement`;
- nenhuma migration ou tabela nova.

## Resultado
**v0.21.0 aprovada para promoção à `main`.**

Baseline anterior de rollback: **v0.20.0**.

Não limpar `localStorage` e não reinstalar a PWA como procedimento de atualização.

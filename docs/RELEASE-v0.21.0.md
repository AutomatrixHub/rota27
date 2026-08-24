# Rota 27 — Release v0.21.0

Data: 24/08/2026

## Estado
**PRODUÇÃO — VALIDADA**

A v0.21.0 foi validada e autorizada para promoção sobre a v0.20.0.

## Objetivo
Adicionar um **Estoque Essencial** simples, opcional e confiável, sem transformar o Rota 27 em ERP e sem criar etapas extras no atendimento normal.

## Entregas
- `Painel → Estoque Essencial`;
- controle opcional por produto;
- estoque inicial e mínimo;
- estoque atual, comprometido e disponível projetado;
- baixa definitiva somente ao fechar a comanda;
- ID determinístico por comanda/produto contra baixa duplicada;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de movimento manual que causaria saldo negativo;
- bloqueio de lançamento quando o disponível projetado chega a zero;
- alertas somente quando há ação necessária;
- filtro `Atenção` para reposição;
- histórico de movimentos;
- exportação CSV;
- offline-first e sincronização multidispositivo;
- Ajuda v4.5.

## Correções de estabilidade da candidata
Durante o primeiro teste foram encontrados:
- cintilação do card `Visão Gerencial` no Painel;
- risco de travamento por ciclo de `MutationObserver` na compatibilidade da Ajuda.

A versão final elimina polling visual, observa apenas filhos diretos do Painel para restaurar extensões e desconecta observers da Ajuda assim que concluem seu trabalho. A versão corrigida foi retestada e aprovada.

## Backend
`rota27-sync` foi promovido para **versão 5 ACTIVE** (`rota27-sync-v0.21.0`).

Novos tipos permitidos:
- `stock_config_upsert`;
- `stock_movement`.

Não houve migration, tabela nova ou alteração destrutiva. Contratos anteriores permanecem compatíveis.

## Preservações
A v0.21.0 não altera:
- cálculo financeiro da comanda;
- forma de pagamento;
- cancelamento;
- Fechamento do Turno;
- fonte de verdade da Visão Gerencial;
- Modo demonstração;
- WhatsApp cliente/gerente e inbound;
- outbox local de WhatsApp.

## Atualização da PWA
Não reinstalar e não limpar dados.

1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.21.0`.

## Rollback
Baseline anterior: **v0.20.0**.

## Próxima versão planejada
**v0.22.0 — Compras & Reposição**. Ver `docs/PLANEJAMENTO-v0.22.0.md`.

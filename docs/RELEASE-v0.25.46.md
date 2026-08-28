# Rota 27 — Release v0.25.46

Data: 28/08/2026

## Objetivo

Mostrar no topo do Painel somente situações que realmente merecem ação, sem criar nova rotina obrigatória.

## Hoje precisa de atenção

O bloco aparece apenas quando há ao menos uma exceção acionável. Ele consolida dados já existentes de:

- A receber;
- estoque baixo ou zerado;
- pedidos de compra em andamento;
- clientes sem voltar há 30 dias ou mais.

Cada linha abre o módulo correspondente. Quando não existe nenhuma exceção, o bloco fica oculto e não ocupa espaço.

## Implementação

A release reaproveita APIs existentes e atualiza a leitura por eventos da própria aplicação, entrada no Painel, armazenamento e retomada de visibilidade. Não adiciona polling contínuo nem MutationObserver.

## Preservações

Não altera comandas, preços, fechamento, sincronização, A receber, estoque, compras, clientes, WhatsApp, Supabase ou Edge Functions.

## PWA

- VERSION: 0.25.46
- cache: `rota27-comandas-v0.25.46-r1`

## Rollback

Baseline anterior: v0.25.45.

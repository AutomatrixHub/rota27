# Rota 27 v0.25.30 — Ordem dos cards do Painel

Data: 27/08/2026

## Objetivo
Reposicionar **Clientes & Fidelização** para a segunda posição entre os quatro cards de gestão da aba **Painel**, imediatamente abaixo de **Visão Gerencial**.

## Nova ordem
1. **Visão Gerencial**
2. **Clientes & Fidelização**
3. **Estoque Essencial**
4. **Compras & Reposição**

## Implementação
- a rotina canônica `ensureRelationshipOrder()` em `assets/v0252-panel-polish.js` passa a ancorar `#v0252RelationshipSection` após `#v020ManagerEntry`;
- a ponte já existente para os redraws do Painel continua sendo usada, sem adicionar `MutationObserver` ou polling contínuo;
- identidade da release atualizada para `v0.25.30`;
- Service Worker atualizado para `rota27-comandas-v0.25.30-r1`.

## Preservado
- conteúdo e estilo dos quatro cards;
- abertura da Visão Gerencial, Clientes, Estoque e Compras;
- A receber e demais blocos do Painel;
- catálogo, preços, clientes, estoque, compras e histórico;
- sincronização, Supabase, Edge Functions e event log.

## Backend
Nenhuma alteração.

## Rollback
Baseline anterior: **v0.25.29**, HEAD `2a8d632a65088918f007b668fa0e7c48cafad56f`.

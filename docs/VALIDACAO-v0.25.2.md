# Rota 27 v0.25.2 — Validação

Data: 25/08/2026

## Histórico do gate
A candidata foi refinada em ciclos curtos com feedback real do cliente/proprietário.

### Validado durante a rodada
- conceito do Mapa Rápido aprovado;
- seletor Lista/Mapa aprovado após reforço visual;
- estabilidade do bloco Relacionamento aprovada após correção R4;
- ícones com emoji rejeitados e substituídos por ícones lineares R6;
- normalização visual final dos quatro cards solicitada como R7.

## R7
A publicação final foi autorizada explicitamente junto com a implementação da R7.

A R7:
- normaliza Visão Gerencial, Estoque Essencial, Compras & Reposição e Clientes & Fidelização;
- remove visualmente `v0.22.0` do card de Compras;
- usa tipografia, padding, altura, ícones e ações equivalentes;
- mantém cores funcionais próprias dos botões;
- mantém o acesso de Clientes reutilizando o fluxo v0.25.1.

## Estabilidade técnica
- nenhum evento de sync novo;
- nenhuma migration;
- nenhuma Edge Function nova;
- nenhum `setInterval` novo nas camadas v0.25.2;
- nenhum `MutationObserver` novo nas camadas v0.25.2;
- cache final `rota27-comandas-v0.25.2-r7`.

## Autorização
Instrução final do proprietário: implementar, publicar no GitHub e colocar a nova versão em produção.

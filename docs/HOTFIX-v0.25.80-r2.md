# Rota 27 — Hotfix v0.25.80-r2

Data: 31/08/2026

## Objetivo
Aplicar às telas **Novo produto** e **Nova categoria** o mesmo comportamento sem foco automático já implantado em **Editar produto** e **Editar categoria**.

## Alterações
- **Novo produto** abre sem foco inicial em `NOME DO PRODUTO`;
- **Nova categoria** abre sem foco/seleção inicial em `NOME DA CATEGORIA`;
- o teclado virtual não deve abrir sozinho;
- **Editar produto** e **Editar categoria** mantêm o comportamento sem foco já aprovado;
- o campo visual **Ícone** continua removido do cadastro/edição de produtos;
- `menuItemEmoji` permanece somente como compatibilidade interna oculta.

## Implementação
A camada `assets/v02580-product-category-no-autofocus.js` foi refinada para proteger tanto os fluxos `new` quanto `edit`, bloqueando apenas o `focus()`/`select()` tardio durante uma janela curta e restaurando os métodos nativos logo depois.

Não há `MutationObserver`, polling contínuo, migration, Edge Function ou alteração de dados reais.

## Baseline
- baseline funcional: **v0.25.80**;
- revisão operacional: **r2**;
- rollback: conteúdo anterior do asset na v0.25.80 / PR #116.

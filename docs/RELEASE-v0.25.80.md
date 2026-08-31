# Rota 27 — Release v0.25.80

Data: 31/08/2026

## Título
**Edição sem foco + campo Ícone removido**

## Objetivo
Ajustar as telas administrativas de produto e categoria para o mesmo padrão de abertura sem foco automático já adotado em outros fluxos do app, e simplificar o cadastro de produtos removendo o campo visual **Ícone**.

## Causa raiz — foco automático
A base legada ainda agenda foco 120 ms após abrir os sheets:
- `openMenuItemSheet(id)` chama `menuItemName.focus()`;
- `openCategorySheet('edit', ...)` chama `categoryName.focus()` e `select()`.

## Correção
- no modo **Editar produto**, o foco tardio de `menuItemName` é bloqueado durante uma janela curta e o sheet é neutralizado imediatamente, em microtask, frame e após o timeout legado;
- no modo **Editar categoria**, o foco/seleção tardios de `categoryName` são neutralizados pelo mesmo padrão;
- depois da janela de abertura, `focus()` e `select()` nativos são restaurados normalmente;
- **Novo produto** e **Nova categoria** não são alterados por esta regra.

## Campo Ícone
- o campo visual **Ícone** é removido do formulário de produto;
- o elemento `menuItemEmoji` é mantido somente como `input type="hidden"` interno para compatibilidade com `openMenuItemSheet()` e `saveMenuItem()` legados;
- valores históricos não são apagados;
- a categoria passa a ocupar toda a largura da linha do formulário;
- nenhum ícone volta a aparecer nos cards do Cardápio ou nos botões de lançamento.

## Implementação
- novo asset: `assets/v02580-product-category-no-autofocus.js`;
- camada finita e idempotente;
- sem `MutationObserver`;
- sem polling contínuo;
- sem alteração de `base-v013.html`;
- sem alteração de regras de produto ou categoria.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum dado real apagado;
- produtos, preços, estoque, comandas, clientes, recebíveis e histórico preservados;
- Lista e Mapa preservados;
- WhatsApp e consentimentos preservados;
- não limpar `localStorage`.

## PWA
- `VERSION`: `0.25.80`;
- shell: `rota27-release-version=0.25.80`;
- novo asset revisionado em `02580r1`;
- Service Worker: `rota27-comandas-v0.25.80-r1`.

## Rollback
Baseline anterior: **v0.25.79**, PR #115, merge `ef27799a6cb14076c1e42476e704a337e09054c3`.

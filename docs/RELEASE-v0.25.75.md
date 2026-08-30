# Rota 27 — Release v0.25.75

Data: 30/08/2026

## Título
**Cardápio compacto e edição de comanda em destaque**

## Objetivo
Refinar a tela de lançamento da comanda para reduzir rolagem e tornar as ações mais claras, preservando integralmente regras de negócio, sincronização, WhatsApp e dados reais.

## Cards de produtos
- remove o ícone/emoji dos botões de produtos na tela de lançamento;
- aumenta a descrição do produto em 1px, de 14px para 15px;
- move o badge de quantidade já lançada para o canto inferior direito;
- reduz a altura mínima dos cards de 112px para 96px;
- em telas de até 390px, usa 92px de altura mínima;
- mantém o preço visível e reserva espaço para o badge no rodapé do card.

## Mais usados hoje/recentemente
- mantém o Top 3 em uma única faixa;
- aumenta a tipografia do nome dos produtos;
- aplica contraste discreto em borda, fundo, preço e badge histórico;
- usa a mesma referência de altura dos cards normais compactos;
- não reintroduz ícones nos atalhos rápidos.

## Editar comanda
O botão antigo de lápis permanece com a mesma ação funcional (`openEditCommandSheet()`), mas ganha apresentação explícita:
- botão laranja;
- texto **Editar comanda**;
- total da comanda permanece em destaque no mesmo cabeçalho;
- layout se adapta também a telas estreitas.

## Implementação
A release é deliberadamente pequena e de causa direta:
- novo asset: `assets/v02575-cardapio-compact-edit.css`;
- sem novo wrapper JavaScript;
- sem `MutationObserver`;
- sem polling;
- sem alteração em `save()`;
- sem backend.

## Preservação
- Lista e Mapa de comandas preservados;
- consentimento persistente `command_updates` da v0.25.74 preservado;
- aviso de cancelamento por WhatsApp da v0.25.73 preservado;
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou exclusão de dados;
- nenhuma limpeza de `localStorage`.

## PWA
- `VERSION`: `0.25.75`;
- release meta do shell: `0.25.75`;
- asset v0.25.75 carregado diretamente pelo shell e pelo roadmap loader;
- Service Worker: `rota27-comandas-v0.25.75-r1`.

## Rollback
Baseline anterior: **v0.25.74** / merge `3e291ef5fe118f69f7f85a7c287a6f7e29487679`.

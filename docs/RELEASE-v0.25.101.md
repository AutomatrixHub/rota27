# Rota 27 v0.25.101 — FAB corrigido na origem

## Objetivo

Eliminar a cadeia em que o Painel legado exibia indevidamente o botão **Nova comanda** e uma camada posterior interceptava toda navegação para ocultá-lo novamente.

## Alterações

- `v015-dev4.js` passa a manter o FAB oculto ao abrir o Painel;
- removido de `v02592-fab-visibility.js` o wrapper de `showScreen()`;
- removidas as correções por microtask e `requestAnimationFrame` após navegação;
- a camada v0.25.92 permanece somente com a padronização dos botões X;
- a regra CSS declarativa continua como proteção defensiva independente de JavaScript.

## Critérios de promoção

- FAB visível somente em Comandas;
- FAB oculto no Painel, Cardápio, Histórico e tela de venda;
- retorno a Comandas restaura o FAB;
- botões X continuam padronizados e funcionais;
- Nova comanda continua abrindo;
- nenhum erro no navegador.

Não há alteração em dados, Supabase, sincronização, WhatsApp ou regras operacionais. Rollback: v0.25.100.

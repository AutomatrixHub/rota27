# Release v0.25.92 — FAB Nova comanda somente em Comandas

## Problema
Na v0.25.91, o botão flutuante `+ Nova comanda` voltou a aparecer no **Painel**.

## Causa
A camada legada `assets/v015-dev4.js` ainda força `#fabNew` para `display='block'` ao abrir o Painel. A navegação-base, por outro lado, já possui a regra correta: esconde o FAB em qualquer tela e só o reexibe em `Comandas`.

## Correção
A v0.25.92 adiciona uma regra de autoridade única:
- `#fabNew` fica visível somente quando `#screenCommands` está ativo;
- Painel, Cardápio, Histórico e demais telas mantêm o FAB oculto;
- adicionada guarda CSS declarativa e fallback JavaScript;
- sem polling e sem `MutationObserver`;
- navegação por `showScreen`, barra inferior e atalhos internos é normalizada após a troca de tela.

## Segurança operacional
- nenhuma alteração em Supabase;
- nenhuma migration;
- nenhuma mudança em Edge Functions;
- nenhuma alteração em comandas, clientes, produtos, estoque, pagamentos, sync ou WhatsApp;
- correção exclusivamente de navegação/interface.

## PWA
- release: `0.25.92`;
- cache: `rota27-comandas-v0.25.92-r1`;
- novos assets:
  - `assets/v02592-fab-visibility.css`;
  - `assets/v02592-fab-visibility.js`.

## Baseline anterior
- v0.25.91;
- merge: `b07de6155062faa030ee01e57affbaf693b3dc59`.

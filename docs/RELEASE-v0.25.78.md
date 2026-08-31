# Rota 27 — Release v0.25.78

Data: 30/08/2026

## Título
**Bordas vermelhas refinadas no Cardápio**

## Objetivo
Aproximar a tela real do Cardápio da proposta visual Opção B aprovada, corrigindo somente o tom dos acentos vermelhos dos cards.

## Alteração
- acento vertical dos cards: de gradiente alaranjado para vermelho-terra sólido `#da693d`;
- contorno do botão **Editar**: mesma referência `#da693d`;
- preço, fundo, tipografia, altura, espaçamento e organização dos cards permanecem inalterados;
- ícones continuam removidos.

## Implementação
- ajuste em `assets/v02577-menu-option-b.css`;
- revisão de asset `02578r1` no shell e roadmap loader;
- nenhuma alteração em `renderMenu()` ou regras de produto;
- nenhum JavaScript novo.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum dado real modificado;
- Lista e Mapa preservados;
- WhatsApp, consentimentos, estoque, histórico e recebíveis preservados;
- sem `MutationObserver` ou polling novo;
- não limpar `localStorage`.

## PWA
- `VERSION`: `0.25.78`;
- shell: `rota27-release-version=0.25.78`;
- Service Worker: `rota27-comandas-v0.25.78-r1`.

## Rollback
Baseline anterior: **v0.25.77**, PR #113, merge `e7bba0fc7a91bfe6de08e9fbb53aaaad56ec6522`.

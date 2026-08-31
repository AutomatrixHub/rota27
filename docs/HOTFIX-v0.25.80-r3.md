# Rota 27 — Hotfix v0.25.80-r3

Data: 31/08/2026

## Título
**Lista vazia em paridade com Mapa + topbar compacta**

## Objetivo
Aplicar dois refinamentos visuais aprovados sobre a baseline funcional **v0.25.80-r2**.

## 1. Estado vazio de Comandas — Lista
Quando não há comandas abertas, o modo **Lista** passa a usar a mesma composição visual exibida no modo **Mapa**:
- título `Nenhuma comanda aberta`;
- texto auxiliar `Use um dos atalhos acima para abrir a primeira.`;
- mesmo fundo, borda tracejada, arredondamento, espaçamento e centralização do estado vazio do Mapa.

A lógica de Lista e Mapa não foi alterada. O elemento legado `#commandsEmpty` é preservado e recebe apenas apresentação equivalente ao componente `.v0252-map-empty`.

## 2. Topbar fixa
O cabeçalho comum a todas as telas foi reorganizado para aproveitar melhor a área vertical:
- logo no canto superior esquerdo;
- botão **Ajuda** no canto superior direito;
- versão no canto inferior direito;
- subtítulo quebrado deterministicamente em duas linhas, com `Jardim Camburi` inteiro na segunda linha;
- logo e botão Ajuda compactados de forma moderada;
- padding e altura total do quadro reduzidos sem alterar sua identidade visual.

## Implementação
- novo CSS: `assets/v02580-r3-list-empty-topbar.css`;
- a camada operacional existente `assets/v02580-product-category-no-autofocus.js` ativa a folha de estilo e executa uma única vez a quebra do subtítulo;
- não há `MutationObserver`;
- não há polling contínuo;
- não há nova varredura em `save()`;
- o Service Worker atual já trata assets comuns como network-first, portanto a camada revisada e o novo CSS são atualizados ao abrir online e ficam disponíveis no cache após o carregamento.

## Preservação
- nenhuma alteração de Supabase, Edge Functions ou banco;
- nenhum dado real alterado;
- WhatsApp e consentimentos preservados;
- Lista e Mapa preservados funcionalmente;
- Cardápio, Painel e Histórico preservados;
- nenhuma limpeza de `localStorage`;
- nenhuma reinstalação da PWA necessária.

## Baseline
- baseline funcional visível: **v0.25.80**;
- baseline operacional anterior: **v0.25.80-r2**;
- PR anterior: **#117**;
- merge anterior: `fc32a20148dcc9a66f3c005ee5489a2dab71b97a`;
- revisão operacional desta hotfix: **r3**.

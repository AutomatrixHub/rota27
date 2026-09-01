# Rota 27 v0.25.96 — Topbar atual desde o primeiro paint

## Problema observado
Ao carregar/recarregar o aplicativo, a interface podia exibir por um instante a Topbar legada do `base-v013.html` (logo maior, layout flex e sem a composição final de Ajuda/versão) antes de assumir a Topbar compacta atual.

## Causa raiz
- `base-v013.html` contém a geometria histórica da Topbar;
- `assets/v0182-brand-theme.css` já é carregado no `<head>` pelo bootstrap, mas até v0.25.95 continha apenas o tema de cores, não a geometria compacta atual;
- a geometria final da Topbar estava em `assets/v02580-r3-list-empty-topbar.css`;
- esse CSS era inserido somente depois, por JavaScript em `v02580-product-category-no-autofocus.js`;
- por isso o navegador conseguia pintar a Topbar antiga antes de receber a folha compacta (FOUC/flash de UI legada).

## Correção
1. A geometria crítica da Topbar atual foi promovida para `assets/v0182-brand-theme.css`, que já participa do carregamento bloqueante do `<head>`.
2. O subtítulo também ganha representação de primeiro paint em duas linhas (`Das delícias capixabas •` / `Jardim Camburi`) antes de o JavaScript transformar o conteúdo nos spans definitivos.
3. O CSS `v02580-r3-list-empty-topbar.css` continua carregado depois como camada canônica, sem mudança visual.
4. O Service Worker passa a forçar `cache:'reload'` para `v0182-brand-theme.css`, evitando que um HTTP cache antigo reintroduza o flash.
5. `v02580-r3-list-empty-topbar.css` foi incluído explicitamente no App Shell para paridade offline.

## Preservações
- nenhuma alteração em comandas, clientes, produtos, estoque ou histórico;
- nenhuma alteração em Supabase;
- nenhuma alteração em WhatsApp;
- nenhuma alteração na lógica do Modo Teste;
- nenhuma mudança funcional de navegação.

## PWA
- VERSION: `0.25.96`
- cache: `rota27-comandas-v0.25.96-r1`
- Ajuda: v11.0

## Validação esperada
1. Abrir o aplicativo do zero ou recarregar a página.
2. A Topbar deve nascer já no formato compacto atual.
3. Não deve aparecer o estado intermediário com logo grande de 82px/layout flex.
4. A inclusão posterior do botão Ajuda, badge e spans do subtítulo não deve deslocar a geometria da Topbar.
5. Repetir o teste com PWA fechado/reaberto para validar o novo cache.

## Rollback
Baseline anterior: v0.25.95 / merge `2ec4cd9401a8e11fb7864cdd9668d4c197e2bd77`.

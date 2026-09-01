# Rota 27 v0.25.100 — TOPBAR canônica

## Objetivo

Eliminar a montagem tardia da TOPBAR observada na v0.25.99, substituindo a cadeia legada por uma única estrutura disponível desde o HTML inicial.

## Alterações

- subtítulo, versão e botão Ajuda passam a existir em `base-v013.html`;
- removido o bloqueio `v02597-topbar-ready`;
- `v02580-product-category-no-autofocus.js` volta a ter responsabilidade única;
- removida a transformação JavaScript do subtítulo;
- removida a carga dinâmica e o asset `v02580-r3-list-empty-topbar.css`;
- estilo canônico consolidado em `v0182-brand-theme.css`;
- botão Ajuda existente passa a receber o mesmo listener do botão anteriormente criado por JavaScript.

## Segurança e rollback

Não há mudança em dados, Supabase, sincronização, WhatsApp ou regras operacionais. O rollback é a restauração da v0.25.99. Antes da promoção devem passar: integridade de referências, sintaxe, primeiro carregamento móvel, Ajuda, Lista/Mapa e abertura de comanda.

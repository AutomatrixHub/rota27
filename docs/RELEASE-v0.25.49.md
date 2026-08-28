# Rota 27 Bodega — v0.25.49

## Hotfix — Mais usados hoje

Release de urgência para substituir a implementação da v0.25.47 de atalhos automáticos do Cardápio.

### Problemas corrigidos

- no Safari/iPhone, o SVG podia ser renderizado antes do CSS dinâmico e aparecer com dimensões grandes e preenchimento preto;
- a visibilidade dependia demais do estado do filtro de categoria, gerando comportamento diferente entre aparelhos;
- o bloco podia ocupar espaço excessivo e conflitar visualmente com a barra da comanda;
- histórico com IDs antigos de produto podia deixar de resolver alguns atalhos.

### Nova implementação

- componente autossuficiente em `assets/v02549-turn-favorites-hotfix.js`;
- estilo crítico é instalado antes da renderização dos atalhos;
- SVGs têm largura, altura, `fill` e `stroke` explícitos;
- até 6 atalhos compactos em faixa horizontal;
- cada atalho mostra ícone vetorial, nome, preço e quantidade usada;
- usa comandas abertas e fechadas da data operacional atual;
- exclui cancelamentos e consumo interno/não faturável do ranking;
- resolve produto por ID e, quando necessário, pelo snapshot/nome do item;
- quando ainda não há movimento do dia, usa histórico recente e informa isso no título;
- o bloco permanece disponível independentemente da categoria selecionada e só se oculta durante uma busca textual;
- clique no atalho continua usando o lançamento normal de produto da comanda;
- nenhuma configuração ou favorito manual é necessário.

### Compatibilidade de cache

`assets/v02547-turn-favorites.js` passa a funcionar como ponte para a v0.25.49. Assim, aparelhos que ainda carregarem o loader antigo podem receber o hotfix sem executar novamente a implementação problemática.

### PWA

- `VERSION`: `0.25.49`
- cache: `rota27-comandas-v0.25.49-r1`
- `index.html` aponta para `roadmap-loader.js?v=02549r1`
- o novo asset é pré-carregado pelo Service Worker.

### Escopo e segurança

Frontend apenas. Não altera Supabase, WhatsApp, estoque, preços, sincronização, comandas, fechamento de turno ou histórico.

### Rollback

Retornar ao merge da v0.25.48 (`71d1cdc68abd7d153f0d7354cd5fb6817ab4326e`).

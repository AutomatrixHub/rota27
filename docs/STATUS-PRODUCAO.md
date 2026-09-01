# Rota 27 — Status de produção

Última revisão: 01/09/2026

## Produção
- versão: **v0.25.100 — TOPBAR canônica no primeiro carregamento**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.100-r1`;
- baseline anterior: **v0.25.99**, merge `975b0b254aa0c922bd2d274c333f353602064f45`.

## Produção homologada — v0.25.100
- promovida pelo PR #146, merge `2327d0ee249396b17047d787ed7786bdcb8c5674`;
- TOPBAR completa incorporada diretamente ao HTML inicial;
- removido o bloqueio de visibilidade que aguardava JavaScript;
- removidas a transformação tardia do subtítulo e a carga dinâmica de CSS;
- removido o asset redundante `v02580-r3-list-empty-topbar.css` e sua dependência no App Shell;
- preservado o acionamento da Ajuda para o botão que agora nasce no HTML;
- sem alterações em dados, Supabase, regras operacionais ou sincronização;
- validada em viewport móvel sem cache anterior: TOPBAR, Ajuda, Lista/Mapa e Nova comanda;
- GitHub Pages publicado com `VERSION` 0.25.100 e asset removido respondendo 404.

## Produção homologada — v0.25.99
- promovida pelo PR #144, merge `975b0b254aa0c922bd2d274c333f353602064f45`;
- adiciona `text-align:center` diretamente ao componente canônico `#commandsEmpty.commands-empty-list`;
- nenhum asset ou wrapper novo;
- sem alterações em dados, regras operacionais ou integrações.
- homologada no Android com Lista e Mapa aprovados.

## Produção homologada — v0.25.98
- promovida pelo PR #142, merge `751a5e263218608b207356383f2bdae3cfd6061d`;
- o shell passa a conter diretamente o estado vazio aprovado da Lista;
- Lista e Mapa passam a controlar apenas seus próprios estados vazios;
- removidos `v02580-r4-list-empty-parity.css` e `v02588-list-empty-visibility.js`;
- removida da v0.25.80 a reconstrução tardia do componente;
- sem alterações em dados, Supabase, Edge Functions, WhatsApp ou regras operacionais.
- homologada no Android, inclusive Lista, Mapa, abertura de comanda e Modo Teste;
- observação não bloqueante: a TOPBAR atual ainda é o último elemento a concluir a renderização.

## Produção homologada — v0.25.97
- promovida pelo PR #140, merge `e26a14274808425507da784527e47607f8171e1f`;
- corrige a exibição transitória da Topbar legada;
- corrige a recursão silenciosa ao abrir Nova comanda;
- não altera Supabase, Edge Functions, WhatsApp, schemas ou dados;
- homologada no celular com abertura de comanda e Modo Teste aprovados;
- observação não bloqueante: a TOPBAR atual pode levar um pequeno intervalo para aparecer, sem exibir a composição antiga.

## Edição de produto/categoria — v0.25.80
A base legada ainda forçava foco 120 ms após a abertura das telas administrativas:
- `openMenuItemSheet(id)` chamava `menuItemName.focus()` ao editar um produto;
- `openCategorySheet('edit', ...)` chamava `categoryName.focus()` e `select()` ao editar uma categoria.

A v0.25.80 neutraliza somente esses focos tardios nos modos de **edição**:
- Editar produto abre sem campo focado e sem teclado virtual automático;
- Editar categoria abre sem campo focado/selecionado e sem teclado virtual automático;
- novos produtos e novas categorias mantêm o comportamento legado, pois a solicitação é restrita às telas de edição;
- a proteção é finita, por janela curta, e depois o `focus()`/`select()` nativos são restaurados;
- não há `MutationObserver`, polling ou varredura contínua.

## Campo Ícone removido do cadastro de produtos — v0.25.80
O campo visual **Ícone** foi retirado do formulário de produto.

Para preservar compatibilidade sem migration:
- o input visível `menuItemEmoji` é substituído uma única vez por um `input type="hidden"` com o mesmo ID;
- o valor anterior é preservado quando existir e o default legado `🍽️` permanece disponível internamente;
- `saveMenuItem()` continua funcionando sem alteração destrutiva;
- a coluna de categoria passa a ocupar toda a largura da linha;
- nenhum ícone volta a ser exibido nos cards do Cardápio ou nos botões de lançamento.

## Borda vermelha arredondada do Cardápio — v0.25.79
A comparação visual mostrou que a v0.25.78 acertou o tom, mas não o formato do acento vermelho. A causa era estrutural: o vermelho ainda era desenhado como pseudo-elemento interno `::before`, uma faixa retangular recortada pelo card.

A v0.25.79 corrige a causa:
- remove a pseudo-faixa `::before`;
- transforma o acento em `border-left: 4px solid #da693d` do próprio `.menu-item`;
- como a borda faz parte do card, ela acompanha naturalmente o `border-radius: 15px` nos cantos superior e inferior;
- o padding esquerdo é reduzido na mesma proporção para preservar a posição visual dos textos;
- `box-sizing:border-box` mantém a dimensão externa dos cards;
- em telas até 390px, o mesmo ajuste proporcional é aplicado;
- produtos inativos usam a mesma estrutura, com borda esquerda cinza.

A correção é exclusivamente CSS. Altura, largura, preço, botão **Editar**, tipografia, categoria, status e responsividade permanecem iguais à v0.25.78.

## Refinamento visual do Cardápio — v0.25.78
Após comparação direta entre a proposta visual aprovada e a tela v0.25.77 em produção:
- o acento vertical dos cards passa de gradiente alaranjado para vermelho-terra sólido `#da693d`;
- o contorno do botão **Editar** passa a usar a mesma referência `#da693d`;
- o layout Opção B permanece inalterado;
- dimensões, altura, nome, preço, categoria, status e responsividade permanecem iguais à v0.25.77.

A correção é exclusivamente CSS, sem JavaScript novo e sem alteração funcional.

## Cardápio — Opção B aprovada — v0.25.77
A lista administrativa de produtos foi redesenhada sem alterar a lógica do Cardápio:
- ícones dos produtos ocultados integralmente na tela **Cardápio**;
- cada card passa de três colunas para duas áreas: conteúdo à esquerda e preço/ação à direita;
- barra vertical de destaque cria a hierarquia visual aprovada sem desperdiçar largura;
- nome permanece como elemento principal;
- categoria e status permanecem na segunda linha;
- preço recebe pill suave terracota;
- botão **Editar** fica abaixo do preço;
- cards mantêm altura compacta e responsividade em telas estreitas;
- produtos inativos preservam diferenciação visual própria.

A implementação é exclusivamente CSS, carregada depois das camadas antigas de ícones. Nenhum JavaScript novo foi necessário; os elementos de ícone existentes continuam no DOM apenas por compatibilidade e ficam `display:none` no `#screenMenu`.

## Correções de UX — v0.25.76
### Editar comanda sem foco automático
A abertura da tela **Editar comanda** passa a neutralizar o foco inicial exatamente como já ocorre na **Nova comanda**:
- nenhum campo recebe foco automaticamente ao abrir;
- teclado virtual não deve abrir sozinho;
- `autofocus` dentro do modal é removido;
- foco inicial dentro da área de edição é removido imediatamente, em microtask e no próximo frame;
- depois da abertura, o operador pode tocar e editar qualquer campo normalmente.

A implementação é finita e idempotente, sem `MutationObserver` e sem polling.

### Preço dos produtos
Nos cards de produtos da tela de lançamento, o preço volta para vermelho/terracota `#d85f2c`, preservando integralmente a compactação da v0.25.75, os cards sem ícones, o texto aumentado em 1px e o badge no canto inferior direito.

## Backend preservado
- `rota27-whatsapp`: v23 ACTIVE;
- `rota27-sync`: v9 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- `rota27-birthday-campaign`: v3 ACTIVE.

A v0.25.80 **não altera Edge Functions**, schemas ou tabelas.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou exclusão de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- Lista e Mapa de comandas preservados;
- sem polling contínuo e sem `MutationObserver` novo;
- dados históricos de ícone não são apagados.

## Atualização PWA
- shell declara `rota27-release-version=0.25.80`;
- `v02580-product-category-no-autofocus.js` é carregado diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.80-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.79** / PR #115 / merge `ef27799a6cb14076c1e42476e704a337e09054c3`.

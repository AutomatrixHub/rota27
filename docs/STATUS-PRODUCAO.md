# Rota 27 — Status de produção

Última revisão: 02/09/2026

## Produção
- versão: **v0.25.129 — remoção de encadeamento UX obsoleto**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.129-r1`;
- baseline anterior: **v0.25.128**, merge `1a2209a5068cb42a6c40d683d99367457755cec5`.

## Produção pendente de homologação — v0.25.129
- remove `v02546-attention-panel.js`, ponte que só apontava para a v0.25.50 já removida;
- retira a chamada correspondente de `v0256-release.js` e do App Shell;
- preserva `v02546-attention-panel.css` e `v02551-ux-hotfix.js`, responsáveis pelo painel visual e pela UX ativa;
- não altera comandas, Painel, carrinho, sincronização ou dados armazenados.

## Produção pendente de homologação — v0.25.128
- remove `v02550-ui-stability.js`, ponte que apenas carregava o módulo v0.25.51;
- preserva `v02551-ux-hotfix.js`, já carregado diretamente no bootstrap e no roadmap;
- retira o arquivo não executado do App Shell;
- não altera comandas, produtos, carrinho, Painel, sincronização ou dados armazenados.

## Produção pendente de homologação — v0.25.127
- remove a injeção transitória do Service Worker que carregava novamente os módulos v0.25.90;
- mantém o roadmap como origem única do coordenador de atualização e da clareza de aparelhos;
- remove a reescrita redundante de versão, selo e rodapé de Ajuda;
- não altera comandas, vendas, histórico, sincronização, gestão de aparelhos ou armazenamento local.

## Produção pendente de homologação — v0.25.126
- remove `v02587-auto-update.js`, coordenador antigo já integralmente substituído pela v0.25.90;
- remove a injeção transitória do Service Worker que apenas bloqueava esse coordenador antigo;
- preserva `v02590-update-coordinator.js`, atualização remota, proteção contra loop e gestão de aparelhos;
- não altera comandas, vendas, histórico, sincronização de dados ou armazenamento local.

## Produção pendente de homologação — v0.25.125
- remove `v0255-release.js`, camada antiga sem consumidores que só inseria conteúdo de Ajuda e identidade obsoleta;
- incorpora na Ajuda atual a orientação sobre a cópia fixa adicional e a prevenção de duplicidade;
- preserva sem alterações `v0255-fixed-whatsapp-copy.js`, responsável pelo envio operacional;
- não altera comandas, vendas, histórico, sincronização, fila ou dados armazenados.

## Produção pendente de homologação — v0.25.124
- usa um controle visual fixo de 185 px sobre o seletor mensal nativo;
- evita que particularidades de largura do Android alterem o layout;
- não altera o recorte mensal, métricas, comparação, CSV ou dados operacionais.

## Produção pendente de homologação — v0.25.123
- limita o seletor mensal da Visão Gerencial a 200 px;
- preserva o mês e ano completos em um campo proporcional;
- não altera o recorte mensal, métricas, comparação, CSV ou dados operacionais.

## Produção pendente de homologação — v0.25.122
- amplia o seletor mensal da Visão Gerencial para comportar mês e ano completos;
- não altera o recorte mensal, métricas, comparação, CSV ou dados operacionais.

## Produção pendente de homologação — v0.25.121
- adiciona o período **Mês** na Visão Gerencial;
- filtra pela data operacional dos fechamentos imutáveis e reúne todos os fechamentos do mês selecionado;
- aplica o mesmo recorte a métricas, gráfico, listas e CSV;
- compara com o mês calendário anterior, quando houver base;
- não altera comandas, fechamentos, sincronização ou armazenamento local.

## Produção pendente de homologação — v0.25.120
- remove `v0253-release.js` e `v0254-release.js`, camadas sem consumidores que apenas atualizavam a versão antiga da Ajuda;
- preserva o núcleo funcional do Mapa (`v0252`), seus estilos e os refinamentos posteriores;
- remove dois ouvintes de clique/visibilidade redundantes;
- não altera comandas, vendas, histórico, sincronização ou armazenamento local.

## Produção pendente de homologação — v0.25.119
- adiciona o período **Data** na tela Histórico & resultados;
- usa a data operacional da abertura da comanda, inclusive quando o fechamento físico ocorreu depois da meia-noite;
- aplica o mesmo recorte aos cartões, rankings, lista detalhada e exportação CSV;
- não altera comandas, vendas, fechamento, sincronização ou dados armazenados.

## Produção homologada — v0.25.116
- exclui `v015-preview.html` e três scripts do laboratório v0.15 isolado;
- confirma que a branch requerida não existe mais no remoto;
- preserva o histórico Git e assets funcionais carregados pela aplicação;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados.

## Produção homologada — v0.25.115
- exclui sete scripts de preview v0.18–v0.21 sem referências de execução;
- todos exigiam branches históricas ausentes do remoto e versões incompatíveis com a `main` atual;
- preserva os assets e os comportamentos funcionais dessas versões ainda carregados pela aplicação;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados.

## Produção homologada — v0.25.114
- exclui `v014-preview.html`, preview DEV.3 sem rota ou dependência de carregamento atual;
- preserva `v014-rc.html`, que continua carregando sua cadeia própria RC.2;
- preserva `v015-preview.html`, ainda referenciado por scripts de laboratório histórico;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados.

## Produção homologada — v0.25.113
- exclui `assets/logo-rota27.png`, PNG histórico de 106 KB sem referência de carregamento;
- confirma ausência em HTML, páginas auxiliares, loader dinâmico e App Shell;
- preserva `v014-rc2.js`, que continua atendendo à página auxiliar `v014-rc.html`;
- mantém a identidade visual atual, cuja logo é incorporada diretamente no HTML-base;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados.

## Produção homologada — v0.25.112
- exclui o executor e o estilo do replay excepcional de mensagens históricas de 25/08;
- confirma que ambos já estavam fora de `index.html`, roadmap, App Shell e páginas auxiliares desde a v0.25.8;
- elimina a possibilidade de reativação acidental do reenvio histórico pelo código preservado;
- mantém a limpeza defensiva de vestígios de interface para clientes com cache antigo;
- não apaga estado local, dados, Supabase, sincronização, regras operacionais ou assets carregados.

## Produção homologada — v0.25.111
- exclui seis marcadores/protetores de versão das releases v0.14 a v0.18;
- confirma ausência de carregamento em HTML, roadmap, App Shell e páginas auxiliares;
- preserva as menções documentais como histórico, sem depender dos arquivos físicos;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados;
- mantém rollback por avanço de versão, restaurando os arquivos em cache novo se necessário.

## Produção homologada — v0.25.110
- exclui quatro scripts órfãos: RC v0.15, selo v0.18.1, fechamento v0.25.14 e polimento v0.25.22;
- confirma que eles não integram `index.html`, roadmap, App Shell nem páginas auxiliares;
- preserva os módulos ativos de fechamento `v02515-turn-close.js` e `v02522r3-closure-render.js`;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados;
- mantém rollback por avanço de versão, restaurando os arquivos em cache novo se necessário.

## Produção homologada — v0.25.109
- exclui `assets/v0182-final.js`, que não integrava `index.html`, roadmap ou App Shell;
- exclui sua única dependência, `assets/brand/rota27-logo-oficial.png`;
- preserva a identidade visual atual, cuja logo está embutida em `base-v013.html`;
- não altera dados, Supabase, sincronização, regras operacionais ou assets carregados;
- mantém rollback por avanço de versão, restaurando a cadeia em cache novo se necessário.

## Produção homologada — v0.25.108
- exclui fisicamente cinco assets observados fora do App Shell na v0.25.107;
- confirma ausência de referências de carregamento para os cinco caminhos;
- preserva `assets/brand/rota27-logo-oficial.png` devido à dependência indireta de `v0182-final.js`;
- não altera o App Shell funcional, dados, Supabase, sincronização ou regras operacionais;
- mantém rollback por avanço de versão, restaurando os arquivos em cache novo se necessário.

## Produção homologada — v0.25.107
- retira do App Shell seis assets não executados pela produção atual;
- mantém os seis arquivos fisicamente publicados para observação e rollback;
- não altera o loader funcional, dados, Supabase, sincronização ou regras operacionais;
- inicia o ciclo controlado `desreferenciar → publicar → observar → apagar em release posterior`;
- a exclusão física permanece bloqueada até aprovação dos gates de atualização, offline, operação e ausência de acessos diretos.

## Produção homologada — v0.25.106
- promovida pelo PR #158, merge `41b92ccc5889a94481f5a6761c89c003390bb7ab`;
- remove diretamente de `v017-core.js` o foco automático do campo Nome;
- aplica o comportamento tanto a **Novo cliente** quanto a **Editar cliente**;
- preserva foco manual, validações, cancelamento e salvamento;
- sem nova camada corretiva e sem alterações em dados, Supabase ou sincronização;
- atualiza o cache-buster do módulo de clientes para impedir reutilização do JavaScript antigo.
- Novo cliente e Editar cliente aprovados em viewport móvel sem foco automático;
- foco manual nos campos, salvamento local e Voltar aprovados;
- GitHub Pages publicado com `VERSION` 0.25.106 e módulo servido sem o foco legado.

## Produção homologada — v0.25.105
- promovida pelo PR #156, merge `24f5b8e8bc68908d6d8e547d08111631a82d4580`;
- remove na origem os focos automáticos dos editores de produto e categoria;
- incorpora ao HTML inicial o campo oculto compatível `menuItemEmoji`;
- exclui `v02580-product-category-no-autofocus.js` e suas referências;
- preserva edição manual, categorias, preço, status ativo e o valor histórico do ícone;
- sem alterações em dados, Supabase, estoque, sincronização ou regras operacionais;
- novo/editar produto e nova/editar categoria aprovados em viewport móvel;
- foco manual, cancelamento e criação local de produto/categoria aprovados;
- GitHub Pages publicado com `VERSION` 0.25.105 e asset removido respondendo 404.

## Produção homologada — v0.25.104
- promovida pelo PR #154, merge `792da68dd87ce8cb14215b82aded35de9341ef80`;
- remove na origem o foco automático do campo Mesa/Local ao abrir **Editar comanda**;
- exclui `v02576-edit-command-no-autofocus.js`, que existia apenas para neutralizar esse foco por interceptação global;
- remove o asset do roadmap e do App Shell;
- preserva foco manual, edição, cancelamento e salvamento;
- sem alterações em dados, Supabase, sincronização ou regras operacionais;
- edição abriu sem foco automático e o campo manteve foco manual por toque;
- fechamento sem alteração aprovado no teste móvel;
- GitHub Pages publicado com `VERSION` 0.25.104 e asset removido respondendo 404.

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

## Produção homologada — v0.25.101
- promovida pelo PR #148, merge `85cffbfbce194af7da8cd90fb3675b317f1b9220`;
- corrige em `v015-dev4.js` a origem que reexibia o FAB no Painel;
- remove da camada v0.25.92 o wrapper de `showScreen()` e a sincronização compensatória do FAB;
- preserva a regra CSS defensiva e a responsabilidade de padronizar botões de fechar;
- sem alterações em dados, Supabase, sincronização ou regras operacionais;
- validada em viewport móvel em Comandas, Painel, Cardápio, Histórico e venda;
- Nova comanda e botão X da Ajuda aprovados, sem erros no navegador;
- GitHub Pages publicado com `VERSION` 0.25.101 e override legado ausente.

## Produção homologada — v0.25.102
- promovida pelo PR #150, merge `38fb4777d91ff1ddca5b6eae4dd70163cc5665fc`;
- remove o foco automático da busca diretamente em `v0151-help.js`;
- exclui `v02594-help-no-autofocus.js`, que existia apenas para neutralizar esse foco;
- remove o asset do roadmap e do App Shell;
- preserva foco manual, fechamento da Ajuda e restauração de foco;
- sem alterações em dados, Supabase, sincronização ou regras operacionais;
- abertura sem foco automático, busca manual e restauração de foco aprovadas;
- Ajuda v11 e botão X aprovados, sem erros no navegador;
- GitHub Pages publicado com `VERSION` 0.25.102 e asset removido respondendo 404.

## Produção homologada — v0.25.103
- promovida pelo PR #152, merge `a715368d6d4a9b1d481dae5b4bbba3db3921bad9`;
- incorpora geometria e cores atuais da TOPBAR ao CSS do arquivo-base;
- incorpora a estrutura final `Comandas / Cardápio / Painel / Histórico` à barra inferior inicial;
- elimina a conversão tardia de `navNew` para `navPanel` no caminho normal;
- remove do módulo do Painel as escritas transitórias de título e versão antigos;
- retira da folha v0.18.2 a geometria da TOPBAR agora pertencente ao shell;
- sem alterações em dados, Supabase, sincronização ou regras operacionais;
- shell isolado e aplicativo completo mantiveram a mesma TOPBAR móvel de 96,03 px;
- navegação, FAB e Nova comanda aprovados, sem erros no navegador;
- GitHub Pages confirma `navPanel`, ausência de `navNew` e CSS canônico no arquivo-base.

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

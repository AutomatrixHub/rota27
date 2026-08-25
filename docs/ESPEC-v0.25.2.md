# Rota 27 v0.25.2 — Especificação

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.1 — Navegação & Configurações**.

## Tema
**Mapa Rápido de Comandas + refinamentos operacionais do Painel**.

## Objetivo
Reduzir tempo e rolagem para localizar e abrir uma comanda já existente, principalmente no celular, sem alterar a estrutura de dados, regras de negócio, sincronização ou tela de lançamento. A candidata também consolida pequenos refinamentos de UX observados no uso real do Painel.

Classificação de produto: **P1 — velocidade operacional**.

## Regra central
A v0.25.2 não substitui a lista atual. A tela `Comandas` passa a ter dois modos:
- **Lista** — visualização já conhecida;
- **Mapa** — visualização compacta/esquemática das mesmas comandas abertas.

A preferência `Lista/Mapa` é local ao aparelho e não precisa sincronizar.

## Mapa
As comandas abertas são organizadas automaticamente pelas informações já existentes em `table` e `customer`.

### Zonas
1. **Mesas** — locais iniciados por `Mesa` ou abreviações reconhecíveis; ordenação numérica quando houver número.
2. **Balcão** — `Balcão`/`Balcao` e equivalentes simples.
3. **Parklet** — locais iniciados por `Parklet` ou abreviações reconhecíveis; ordenação numérica quando houver número.
4. **Clientes** — comandas sem mesa/local e identificadas apenas pelo cliente.
5. **Outros locais** — qualquer localização válida que não se encaixe nas zonas anteriores.

Nenhuma comanda aberta pode desaparecer por não se encaixar em uma categoria.

## Card compacto
Cada bloco do Mapa exibe identificação curta, valor, cliente/local complementar, quantidade de itens, tempo desde a abertura e último lançamento. Toque no bloco abre a mesma comanda existente usando o fluxo atual.

### Correção R2 — toque nos cards
A R2 corrige a abertura dos cards do Mapa com listener direto, validação do ID atual e abertura por `window.openCommand`. Todo o card é área clicável.

## Seletor Lista / Mapa — R2
O modo ativo usa fundo laranja, texto branco, borda/sombra de seleção, foco visível e modo inativo discreto.

## Abertura rápida
No topo do Mapa existem atalhos `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente`. Eles reutilizam a tela existente `Nova comanda` e apenas pré-preenchem o contexto.

## Painel — R3
### Padronização dos botões principais
`Abrir visão gerencial`, `Abrir estoque` / estado equivalente e a ação de `Compras & Reposição` compartilham largura, altura, tipografia, peso e alinhamento visual. As cores de cada módulo são preservadas.

### Ordem do Relacionamento
**Relacionamento — Clientes & Fidelização** fica imediatamente após **Compras & Reposição**.

## Estabilidade do Relacionamento — R4
O Painel legado redesenha `screenPanel` por `innerHTML`. A R4 instala uma ponte específica no setter `innerHTML` de `screenPanel` para recolocar Relacionamento imediatamente depois de Compras & Reposição após cada render, sem novo polling ou novo `MutationObserver`.

## Ícones dos cards principais — R6
A R5 tentou usar elementos de ícone inseridos por JavaScript. No reteste, esses elementos eram removidos pelos `innerHTML` internos dos módulos legados; a grade permanecia reservando a coluna e espremia os textos.

A R6 substitui completamente essa abordagem:
- nenhum ícone é inserido por JavaScript;
- os três ícones são pseudo-elementos CSS `::before` do cabeçalho de cada card;
- os desenhos usam SVG linear monocromático embutido no CSS, sem emoji;
- **Visão Gerencial** usa gráfico de barras;
- **Estoque Essencial** usa caixa/volume;
- **Compras & Reposição** usa carrinho;
- os ícones sobrevivem aos `innerHTML` internos dos módulos legados;
- desktop usa `ícone + texto + ação`;
- mobile usa `ícone + texto` e ação em largura total abaixo;
- cores dos botões continuam sendo definidas pelos próprios módulos.

A ponte da R4 continua existindo somente para a posição de Relacionamento. A R6 não adiciona polling nem `MutationObserver`.

## Lista
O modo Lista continua funcionalmente idêntico ao anterior.

## Mobile
Prioridade máxima:
- grade compacta;
- sem rolagem horizontal;
- alvos confortáveis para toque;
- textos sem esmagamento;
- redução perceptível de rolagem em relação à Lista;
- cards do Painel estáveis após atualizações internas.

## Persistência
Chave local da preferência: `rota27_command_view_v0252` (`list` ou `map`). É apenas de interface e não integra sync.

## Sincronização
Nenhuma alteração de backend. A v0.25.2 consome `state.commands`, que já converge pelo mecanismo existente.

Não há evento novo, tabela, migration, Edge Function, duplicação de comanda ou estado paralelo de negócio.

## PWA / cache da candidata
A R6 usa:
- `VERSION = 0.25.2`;
- cache `rota27-comandas-v0.25.2-r6`;
- assets v0.25.2 carregados com query `0252r6`.

## Ajuda
Ajuda candidata **v5.3** com seção `Mapa rápido de comandas`.

## Fora de escopo
Mapa físico personalizável, drag-and-drop, quantidade configurável de mesas, planta baixa, heatmap, automação de fechamento, status artificiais e alteração de backend.

## Critérios de aceite
1. seletor Lista/Mapa com modo ativo claramente destacado;
2. Lista preservada;
3. Mapa exibe todas as comandas abertas uma única vez;
4. zonas classificadas corretamente;
5. um toque em qualquer ponto do card abre a comanda correta;
6. atalhos de nova comanda apenas pré-preenchem o formulário atual;
7. preferência Lista/Mapa persiste no aparelho;
8. criação/edição/fechamento reflete no Mapa;
9. mobile sem overflow horizontal;
10. botões principais do Painel padronizados mantendo cores;
11. Relacionamento imediatamente abaixo de Compras & Reposição e estável;
12. três ícones lineares coerentes e permanentes;
13. nenhum texto fica espremido após atualização dos cards;
14. desktop e mobile preservam alinhamento e leitura;
15. nenhuma regressão P0/P1;
16. nenhum `setInterval` ou novo `MutationObserver` nas camadas v0.25.2.

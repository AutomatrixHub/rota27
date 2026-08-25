# Rota 27 v0.25.2 — Especificação

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.1 — Navegação & Configurações**.

## Tema
**Mapa Rápido de Comandas + refinamentos operacionais do Painel**.

## Origem
Melhoria solicitada a partir do uso real no celular: a lista atual de comandas é boa e deve ser preservada, porém quando existem várias comandas abertas o operador precisa rolar a tela para localizar uma mesa/balcão/cliente. A v0.25.2 acrescenta uma segunda visualização mais compacta para reduzir rolagem e tempo de acesso.

Durante os gates visuais também surgiram dois refinamentos de Painel: padronização dos botões principais e reposicionamento do bloco Relacionamento.

## Objetivo
Reduzir tempo e rolagem para localizar e abrir uma comanda já existente, principalmente no celular, sem alterar a estrutura de dados, regras de negócio, sincronização ou tela de lançamento. Também melhorar a coerência visual e hierárquica do Painel sem criar novas funções.

Classificação de produto: **P1 — velocidade operacional / refinamento de UX**.

## Regra central
A v0.25.2 não substitui a lista atual. A tela `Comandas` passa a ter dois modos:
- **Lista** — visualização já conhecida;
- **Mapa** — visualização compacta/esquemática das mesmas comandas abertas.

A preferência `Lista/Mapa` é local ao aparelho e não precisa sincronizar.

## Mapa
As comandas abertas são organizadas automaticamente pelas informações já existentes em `table` e `customer`.

### Zonas
1. **Mesas** — `Mesa`/abreviações, com ordenação numérica;
2. **Balcão** — `Balcão`/`Balcao` e equivalentes simples;
3. **Parklet** — `Parklet`/abreviações, com ordenação numérica;
4. **Clientes** — comandas sem mesa/local;
5. **Outros locais** — qualquer localização válida fora das anteriores.

Nenhuma comanda aberta pode desaparecer por não se encaixar em uma categoria.

## Card compacto
Cada bloco do Mapa exibe:
- identificação curta;
- valor atual;
- cliente/local complementar;
- quantidade de itens;
- tempo desde a abertura;
- tempo desde o último lançamento.

Toque no bloco abre a mesma comanda existente usando o fluxo atual.

### Correção R2 — toque nos cards
No primeiro gate visual, o Mapa apareceu corretamente, porém foi identificado um defeito P1: tocar nos cards não abria a comanda.

A R2 corrige o comportamento com:
- listener direto em cada card após renderização;
- validação do ID contra comandas abertas;
- abertura por `window.openCommand`;
- handler delegado como fallback;
- card inteiro como área clicável;
- feedback se a comanda já não existir.

## Seletor Lista / Mapa — R2
O modo ativo usa:
- fundo laranja;
- texto branco;
- borda e sombra;
- foco visível;
- feedback de toque.

A mudança é somente visual.

## Abertura rápida
Atalhos:
- `+ Mesa`;
- `+ Balcão`;
- `+ Parklet`;
- `+ Cliente`.

Todos reutilizam a tela existente `Nova comanda` e somente pré-preenchem o contexto.

## Lista
O modo Lista permanece funcionalmente idêntico ao anterior.

## Painel — R3
### Padronização dos botões principais
Os botões de:
- `Visão Gerencial`;
- `Estoque Essencial`;
- `Compras & Reposição`;

passam a compartilhar a mesma caixa visual:
- mesma largura/altura em telas largas;
- mesma tipografia, peso, alinhamento e raio;
- largura total e mesma altura em mobile.

A cor continua pertencendo a cada módulo e não é uniformizada.

### Ordem de Relacionamento
O bloco **Relacionamento** deixa de ficar separado abaixo do conjunto principal e passa a ser inserido imediatamente após **Compras & Reposição** dentro do Painel.

O card `Clientes & Fidelização` é o mesmo já existente; não há segundo cadastro, segunda ação ou estado paralelo.

A seção `Configurações & Integrações` permanece no agrupamento próprio já criado na v0.25.1.

### Implementação do R3
A camada `v0252-panel-polish.js/css`:
- reaproveita o bloco Relacionamento da v0.25.1 quando ele já existe;
- recria apenas a apresentação do mesmo acesso se o DOM legado tiver removido o bloco;
- usa o mesmo `data-v0251-action="clients"` e o mesmo resumo de clientes;
- reage somente a navegação/eventos já existentes;
- não adiciona polling nem observer.

## Mobile
Prioridade máxima:
- Mapa compacto sem scroll horizontal;
- alvos confortáveis;
- textos truncados quando necessário;
- botões principais do Painel com largura total e altura uniforme.

## Persistência
Chave local da preferência de visualização:
`rota27_command_view_v0252` (`list` ou `map`).

A preferência é somente de interface.

## Sincronização
Nenhuma alteração de backend.

Não há:
- evento novo;
- tabela;
- migration;
- Edge Function;
- duplicação de comanda;
- estado paralelo de negócio.

## Estabilidade
A camada v0.25.2 não deve adicionar:
- `setInterval`;
- `MutationObserver`.

Atualizações usam renderizações/eventos já existentes e visibilidade da página.

## PWA / cache da candidata
A R3 usa:
- `VERSION = 0.25.2`;
- cache `rota27-comandas-v0.25.2-r3`;
- `v0252-command-map.js/css?v=0252r3`;
- `v0252-panel-polish.js/css?v=0252r3`.

## Ajuda
Ajuda candidata **v5.3** com seção `Mapa rápido de comandas`.

## Fora de escopo
- mapa físico personalizável;
- drag-and-drop;
- planta baixa;
- heatmap;
- automação de fechamento;
- alteração de backend;
- nova camada de Clientes/CRM.

## Critérios de aceite
1. seletor Lista/Mapa visível e claramente destacado;
2. Lista preservada;
3. Mapa exibe todas as comandas abertas uma única vez;
4. zonas classificadas corretamente;
5. Outros locais nunca somem;
6. um toque em qualquer ponto do card abre a comanda correta;
7. atalhos de nova comanda só pré-preenchem o formulário atual;
8. preferência Lista/Mapa persiste no aparelho;
9. criação/edição/fechamento reflete no Mapa;
10. mobile sem overflow horizontal;
11. três botões principais do Painel padronizados, com cores preservadas;
12. Relacionamento imediatamente abaixo de Compras & Reposição;
13. nenhuma regressão P0/P1;
14. nenhum `setInterval` ou `MutationObserver` novo.

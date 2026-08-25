# Rota 27 v0.25.2 — Especificação

## Tema
**Mapa Rápido de Comandas**.

## Origem
Melhoria solicitada a partir do uso real no celular: a lista atual de comandas é boa e deve ser preservada, porém quando existem várias comandas abertas o operador precisa rolar a tela para localizar uma mesa/balcão/cliente. A v0.25.2 acrescenta uma segunda visualização mais compacta para reduzir rolagem e tempo de acesso.

## Objetivo
Reduzir tempo e rolagem para localizar e abrir uma comanda já existente, principalmente no celular, sem alterar a estrutura de dados, regras de negócio, sincronização ou tela de lançamento.

Classificação de produto: **P1 — velocidade operacional**.

## Regra central
A v0.25.2 não substitui a lista atual. A tela `Comandas` passa a ter dois modos:
- **Lista** — visualização já conhecida;
- **Mapa** — visualização compacta/esquemática das mesmas comandas abertas.

A preferência `Lista/Mapa` é local ao aparelho e não precisa sincronizar.

## Mapa
As comandas abertas são organizadas automaticamente pelas informações já existentes em `table` e `customer`.

### Zonas
1. **Mesas**
   - locais iniciados por `Mesa` ou abreviações reconhecíveis;
   - ordenação numérica quando houver número.
2. **Balcão**
   - `Balcão`/`Balcao` e equivalentes simples.
3. **Parklet**
   - locais iniciados por `Parklet` ou abreviações reconhecíveis;
   - ordenação numérica quando houver número.
4. **Clientes**
   - comandas sem mesa/local e identificadas apenas pelo cliente.
5. **Outros locais**
   - qualquer localização válida que não se encaixe nas zonas anteriores.

Nenhuma comanda aberta pode desaparecer por não se encaixar em uma categoria.

## Card compacto
Cada bloco do Mapa exibe, de forma resumida:
- identificação curta (`M1`, `P2`, `Balcão` ou nome do cliente/local);
- valor atual da comanda;
- cliente/local complementar quando existir;
- quantidade de itens;
- tempo desde a abertura;
- tempo desde o último lançamento.

Toque no bloco abre a mesma comanda existente usando o fluxo atual.

## Abertura rápida
No topo do Mapa existem atalhos:
- `+ Mesa`;
- `+ Balcão`;
- `+ Parklet`;
- `+ Cliente`.

Eles reutilizam a tela existente `Nova comanda`.

Comportamento:
- `+ Mesa` pré-preenche `Mesa ` e deixa o cursor pronto para o número;
- `+ Balcão` pré-preenche `Balcão` e leva o foco ao cliente;
- `+ Parklet` pré-preenche `Parklet ` e deixa o cursor pronto para o número;
- `+ Cliente` deixa mesa/local vazio e leva o foco ao nome do cliente.

Nenhum atalho grava dados antes da confirmação normal da nova comanda.

## Lista
O modo Lista deve continuar funcionalmente idêntico ao anterior:
- cards completos;
- valor;
- itens;
- tempo;
- toque para abrir;
- estado vazio original.

## Mobile
Prioridade máxima:
- grade de 3 colunas em celulares comuns;
- 2 colunas em telas muito estreitas;
- 4 colunas em larguras maiores;
- sem rolagem horizontal;
- alvos confortáveis para toque;
- textos truncados quando necessário, sem quebrar layout.

O objetivo do Mapa é ser mais denso que a Lista, não conter todos os detalhes dela.

## Persistência
Chave local da preferência de visualização:
`rota27_command_view_v0252`.

Valores:
- `list`;
- `map`.

Essa preferência é apenas de interface e não integra snapshots/eventos de sync.

## Sincronização
Nenhuma alteração de backend.

A v0.25.2 consome `state.commands`, que já converge pelo mecanismo existente.
Quando uma comanda chega/remota é alterada, o Mapa deve ser redesenhado junto com `renderCommands`.

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

A atualização do Mapa ocorre:
- após o `renderCommands` já existente;
- ao trocar Lista/Mapa;
- ao retornar à tela/visibilidade;
- em eventos de domínio já disponíveis.

## Ajuda
Ajuda candidata **v5.3** com seção `Mapa rápido de comandas`.

## Fora de escopo
- mapa físico personalizável do salão;
- arrastar e soltar comandas;
- mover mesa por drag-and-drop;
- quantidade configurável de mesas;
- planta baixa;
- heatmap;
- automação de fechamento;
- status artificiais não existentes no modelo atual;
- alteração de backend.

## Critérios de aceite
1. seletor Lista/Mapa visível na tela Comandas;
2. Lista preservada;
3. Mapa exibe todas as comandas abertas uma única vez;
4. Mesa/Balcão/Parklet/Cliente classificados corretamente nos testes;
5. Outros locais nunca somem;
6. toque em um card abre a comanda correta;
7. atalhos de nova comanda apenas pré-preenchem o formulário atual;
8. preferência Lista/Mapa persiste no aparelho;
9. criação/edição/fechamento reflete no Mapa após renderização normal;
10. mobile sem overflow horizontal;
11. nenhuma regressão P0/P1;
12. nenhum `setInterval` ou `MutationObserver` novo.

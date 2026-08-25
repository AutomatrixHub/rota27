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
Cada bloco do Mapa exibe, de forma resumida:
- identificação curta (`M1`, `P2`, `Balcão` ou nome do cliente/local);
- valor atual da comanda;
- cliente/local complementar quando existir;
- quantidade de itens;
- tempo desde a abertura;
- tempo desde o último lançamento.

Toque no bloco abre a mesma comanda existente usando o fluxo atual.

### Correção R2 — toque nos cards
No primeiro gate visual, o Mapa apareceu corretamente, porém foi identificado um defeito P1: tocar nos cards não abria a comanda.

A R2 corrige o comportamento com uma camada de interação mais robusta:
- cada card recebe listener direto logo após o render do Mapa;
- o ID tocado é validado contra as comandas abertas atuais;
- a abertura usa `window.openCommand`;
- todo o card é área clicável;
- se a comanda já tiver deixado de existir, o mapa é atualizado e o usuário recebe feedback.

## Seletor Lista / Mapa — R2
O modo ativo usa:
- fundo laranja;
- texto branco;
- borda e sombra de seleção;
- modo inativo mais discreto;
- foco visível;
- efeito de toque curto.

## Abertura rápida
No topo do Mapa existem atalhos:
- `+ Mesa`;
- `+ Balcão`;
- `+ Parklet`;
- `+ Cliente`.

Eles reutilizam a tela existente `Nova comanda` e apenas pré-preenchem o contexto. Nenhum atalho grava dados antes da confirmação normal.

## Painel — R3
Foram incorporados dois refinamentos:

### Padronização dos botões principais
Os botões:
- `Abrir visão gerencial`;
- `Abrir estoque` / estado equivalente;
- ação de `Compras & Reposição`;

passam a compartilhar largura, altura, tipografia, peso e alinhamento visual. As cores de cada módulo são preservadas.

### Ordem do Relacionamento
O bloco **Relacionamento — Clientes & Fidelização** deve ficar imediatamente após **Compras & Reposição**.

O fluxo de Clientes & Fidelização é o mesmo já existente; não há segundo cadastro ou estado paralelo.

## Estabilidade do Relacionamento — R4
No reteste da R3, o Relacionamento aparecia e desaparecia logo depois.

### Causa
O Painel legado ainda redesenha `screenPanel` por atribuição de `innerHTML`. Como o Relacionamento havia sido inserido dentro desse elemento, um render posterior removia o bloco.

### Solução
A camada `v0252-panel-polish.js` instala uma ponte específica no setter `innerHTML` do elemento `screenPanel`.

Após cada render legado:
1. o conteúdo nativo é redesenhado normalmente;
2. as camadas existentes recompõem Visão Gerencial, Estoque e Compras;
3. a R4 recoloca Relacionamento imediatamente depois de Compras & Reposição;
4. a contagem de clientes é atualizada.

A R4 não adiciona `setInterval` nem novo `MutationObserver`. Usa apenas uma recomposição agendada após a escrita do próprio Painel e, se necessário, um único `requestAnimationFrame` como fallback de ordenação de microtasks.

## Lista
O modo Lista deve continuar funcionalmente idêntico ao anterior.

## Mobile
Prioridade máxima:
- grade compacta;
- sem rolagem horizontal;
- alvos confortáveis para toque;
- textos truncados quando necessário;
- redução perceptível de rolagem em relação à Lista.

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

Não há:
- evento novo;
- tabela;
- migration;
- Edge Function;
- duplicação de comanda;
- estado paralelo de negócio.

## PWA / cache da candidata
A R4 usa:
- `VERSION = 0.25.2`;
- cache `rota27-comandas-v0.25.2-r4`;
- assets v0.25.2 carregados com query `0252r4`.

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
1. seletor Lista/Mapa visível e com modo ativo claramente destacado;
2. Lista preservada;
3. Mapa exibe todas as comandas abertas uma única vez;
4. Mesa/Balcão/Parklet/Cliente classificados corretamente;
5. Outros locais nunca somem;
6. um toque em qualquer ponto do card abre a comanda correta;
7. atalhos de nova comanda apenas pré-preenchem o formulário atual;
8. preferência Lista/Mapa persiste no aparelho;
9. criação/edição/fechamento reflete no Mapa;
10. mobile sem overflow horizontal;
11. botões principais do Painel padronizados mantendo cores;
12. Relacionamento imediatamente abaixo de Compras & Reposição;
13. Relacionamento permanece estável por pelo menos 10 segundos e após sair/voltar ao Painel;
14. nenhuma regressão P0/P1;
15. nenhum `setInterval` ou novo `MutationObserver` nas camadas v0.25.2.

# Rota 27 v0.25.2 — Especificação

## Estado
**RELEASE CANDIDATE — PUBLICAÇÃO AUTORIZADA EM 25/08/2026.**

Baseline anterior: **v0.25.1 — Navegação & Configurações**.

## Tema
**Mapa Rápido de Comandas + refinamentos operacionais e normalização visual do Painel**.

## Objetivo
Reduzir tempo e rolagem para localizar e abrir comandas, principalmente no celular, sem alterar estrutura de dados, regras de negócio, sincronização ou backend. A release também consolida refinamentos de UX observados no uso real do Painel.

Classificação de produto: **P1 — velocidade operacional**.

## Mapa Rápido de Comandas
A tela `Comandas` passa a ter dois modos:
- **Lista** — visualização já existente;
- **Mapa** — visualização compacta das mesmas comandas abertas.

A preferência `Lista/Mapa` é local ao aparelho (`rota27_command_view_v0252`) e não sincroniza.

### Zonas
- Mesas;
- Balcão;
- Parklet;
- Clientes sem local;
- Outros locais.

Nenhuma comanda aberta é descartada por classificação.

### Card compacto
Exibe identificação curta, valor, cliente/local, quantidade de itens, tempo desde abertura e último lançamento. Um toque em qualquer ponto do card abre a comanda existente.

### Abertura rápida
Atalhos `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente` reutilizam a tela `Nova comanda` e apenas pré-preenchem o contexto.

## R2 — interação
- correção do toque nos cards do Mapa;
- todo o card virou área clicável;
- seletor `Lista / Mapa` recebeu destaque claro do modo ativo.

## R3 — Painel
- botões de Visão Gerencial, Estoque e Compras padronizados em dimensão/peso;
- cores funcionais preservadas;
- `Relacionamento` movido para logo após `Compras & Reposição`.

## R4 — estabilidade do Relacionamento
O Painel legado ainda reescreve `screenPanel` via `innerHTML`. A R4 instalou uma ponte específica no setter desse elemento para recolocar `Relacionamento` após o render, sem novo polling e sem novo `MutationObserver`.

## R6 — ícones estáveis
A tentativa anterior com emojis inseridos por JavaScript foi descartada. Os três cards principais passaram a usar ícones lineares monocromáticos via CSS `::before`, que sobrevivem aos renders internos dos módulos legados:
- gráfico — Visão Gerencial;
- caixa — Estoque Essencial;
- carrinho — Compras & Reposição.

## R7 — normalização final dos quatro cards
Os quatro acessos principais do topo do Painel passam a compartilhar a mesma gramática visual:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

Padronização:
- mesma moldura, raio, fundo e sombra;
- mesma altura mínima e padding;
- ícones lineares de 50 px em desktop e 46 px no mobile;
- mesma tipografia de título e descrição;
- mesma caixa para o botão de ação;
- mobile com `ícone + texto` e ação em largura total abaixo;
- Clientes & Fidelização deixa de usar o card/emoji legado e entra no mesmo padrão visual dos demais;
- o badge visual `v0.22.0` de Compras & Reposição é ocultado definitivamente pela camada final.

A ação de Clientes continua reutilizando o fluxo existente por `data-v0251-action="clients"`; não existe segundo cadastro.

## Mobile
Prioridades:
- sem overflow horizontal;
- toque confortável;
- textos sem esmagamento;
- redução perceptível de rolagem;
- quatro cards principais visualmente equivalentes.

## Sincronização / backend
Nenhuma alteração de backend.

A v0.25.2 consome `state.commands` e os domínios já sincronizados. Não há:
- evento novo;
- tabela;
- migration;
- Edge Function;
- estado paralelo de negócio.

`rota27-sync` permanece versão 7 ACTIVE (`rota27-sync-v0.23.0`).

## PWA
- `VERSION = 0.25.2`;
- cache final: `rota27-comandas-v0.25.2-r7`;
- assets v0.25.2 carregados com query `0252r7`.

## Ajuda
Ajuda v5.3 com seção `Mapa rápido de comandas`.

## Estabilidade
As camadas v0.25.2 não adicionam `setInterval` nem novo `MutationObserver`. A ponte do Painel é específica ao setter `innerHTML` de `screenPanel` e só recompõe o quarto card após renders legados.

## Fora de escopo
Mapa físico personalizável, drag-and-drop, planta baixa, heatmap, automação de fechamento, status artificiais e alteração de backend.

## Critérios de aceite
1. Lista preservada;
2. Mapa mostra todas as comandas abertas uma única vez;
3. zonas corretas;
4. um toque abre a comanda certa;
5. Lista/Mapa alternam e persistem localmente;
6. atalhos rápidos não criam nada antes da confirmação;
7. quatro cards principais do Painel seguem o mesmo padrão;
8. `v0.22.0` não aparece no card de Compras;
9. ícones lineares permanecem estáveis;
10. Relacionamento permanece logo após Compras;
11. mobile sem overflow/texto esmagado;
12. nenhuma regressão P0/P1;
13. nenhuma alteração de backend.

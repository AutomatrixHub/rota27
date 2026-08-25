# Rota 27 v0.25.2 — Plano de teste

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.1 — Navegação & Configurações**.

### Revisão R2
Mapa aprovado em conceito; correção do toque nos cards e destaque de `Lista / Mapa`.

### Revisão R3
Padronização dos três botões principais do Painel e posicionamento de `Relacionamento` logo abaixo de `Compras & Reposição`.

### Revisão R4
Correção do desaparecimento de `Relacionamento` após redesenhos legados do Painel.

### Revisão R6
A R5 usava emojis inseridos por JavaScript. No reteste, os módulos legados removiam esses elementos e deixavam a grade CSS reservando a coluna vazia, espremendo os textos.

A R6:
- remove os emojis e a reinjeção de ícones via JavaScript;
- usa ícones lineares monocromáticos por CSS `::before`;
- gráfico para Visão Gerencial;
- caixa para Estoque Essencial;
- carrinho para Compras & Reposição;
- mantém a ponte R4 apenas para a posição de Relacionamento;
- usa cache `rota27-comandas-v0.25.2-r6`.

## A — versão e estabilidade
1. Abrir a candidata.
2. Confirmar badge `v0.25.2` estável por pelo menos 15 segundos.
3. Navegar entre Comandas, Cardápio, Painel e Histórico.

Esperado: sem cintilação/travamento, rolagem horizontal ou perda de módulo.

## B — Lista preservada
No modo Lista, cards, valores, itens, tempo e abertura de comanda continuam iguais.

## C — alternância Lista / Mapa
Alternar várias vezes, fechar/reabrir e confirmar modo ativo laranja, persistência local e nenhuma duplicação.

## D — classificação do Mapa
Testar Mesa, Balcão, Parklet, cliente sem local e outro local. Cada comanda deve aparecer uma única vez na zona correta.

## E — abrir pelo Mapa
Tocar em título, valor, nome, linha de itens/tempo e área vazia do card.

Esperado: um único toque abre a comanda correta em todos os pontos.

## F — abertura rápida
Testar `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente`.

Esperado: reutilizam `Nova comanda`, sem criar antes da confirmação.

## G — Painel — gate R3/R4/R6
1. Abrir **Painel**.
2. Confirmar sequência:
   - Visão Gerencial;
   - Estoque Essencial;
   - Compras & Reposição;
   - Relacionamento.
3. Confirmar os três ícones lineares:
   - gráfico;
   - caixa;
   - carrinho.
4. Aguardar pelo menos **15 segundos**.
5. Ir para outra aba e voltar.
6. Minimizar/retomar o navegador.
7. Provocar atualização de Estoque/Compras e voltar ao Painel.

Esperado:
- Relacionamento permanece no lugar;
- os três ícones não somem;
- nenhum texto fica comprimido em coluna estreita;
- os três botões mantêm mesma dimensão/peso e suas cores originais;
- todos continuam abrindo os módulos corretos;
- sem overflow horizontal em desktop/mobile.

## H — sincronização A→B
Criar/editar comanda no A, sincronizar A e B, abrir Mapa no B e confirmar zona/valor/itens/cliente/local convergentes.

## I — fechamento
Abrir pelo Mapa, fechar, voltar e confirmar remoção do Mapa/Lista e inclusão correta no Histórico.

## J — mobile
Validar toque confortável, grade compacta, seletor Lista/Mapa, cards do Painel sem texto esmagado e botões sem overflow.

## K — Ajuda
Rodapé `Ajuda v5.3 • Rota 27 v0.25.2` e seção `Mapa rápido de comandas`.

## L — regressão P0/P1
Confirmar abrir/editar/fechar/cancelar comanda, lançar itens, sync, WhatsApp, Cardápio, Painel, Histórico e Clientes & Fidelização.

## Gate
Somente promover após:
- teste local desktop/mobile aprovado;
- toque do Mapa aprovado;
- Painel R3/R4/R6 aprovado;
- A→B coerente;
- nenhuma regressão P0/P1;
- autorização explícita para publicação.

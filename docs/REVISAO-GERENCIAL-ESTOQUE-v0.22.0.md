# Rota 27 v0.22.0 — Revisão gerencial do Estoque Essencial

## Motivo
O Estoque Essencial v0.21.0 foi validado como uma base funcional estável, simples e adequada ao Rota 27. Com a evolução de Compras & Reposição na v0.22.0, a interface de estoque passou a parecer simples demais para o gerente entender rapidamente a situação antes de agir.

A revisão mantém a lógica validada da v0.21.0 e acrescenta somente uma camada gerencial de apresentação na branch da v0.22.0.

## Diretriz
**Entender o estoque antes de movimentá-lo.**

A tela continua sem características de ERP pesado. O objetivo é responder rapidamente:
- o que está crítico;
- o que está abaixo do mínimo;
- quanto existe fisicamente;
- quanto já está comprometido em comandas abertas;
- quanto realmente está disponível;
- quanto já está em pedido;
- o que entrou e saiu hoje;
- quais foram as movimentações mais recentes;
- quando vale abrir Compras & Reposição.

## Indicadores superiores
A nova camada apresenta seis indicadores:
- produtos controlados;
- produtos críticos;
- produtos abaixo do mínimo;
- disponível projetado agregado;
- unidades comprometidas em comandas abertas;
- quantidade de movimentações registradas no dia.

## Ações rápidas
A central oferece atalhos para:
- alertas;
- produtos controlados;
- Compras & Reposição;
- movimentações recentes.

Os atalhos carregam contexto operacional antes do clique.

## Saúde do estoque
A central mostra uma barra de saúde com três grupos:
- crítico: disponível projetado menor ou igual a zero;
- atenção: disponível projetado acima de zero e menor ou igual ao estoque mínimo;
- saudável: disponível projetado acima do estoque mínimo.

Também apresenta:
- estoque físico agregado;
- comprometido agregado;
- disponível projetado agregado;
- unidades em pedidos abertos;
- percentual de produtos controlados com fornecedor associado;
- quantidade de eventos de estoque aguardando sincronização quando houver.

## Fluxo do dia
A visão diária resume:
- entradas;
- baixas por vendas;
- perdas e consumo interno;
- ajustes de saldo;
- total de movimentações registradas hoje.

Os valores são derivados exclusivamente dos movimentos do Estoque Essencial. Não há estimativa financeira.

## Prioridades
Os produtos em atenção aparecem em ordem de urgência com:
- estoque físico;
- quantidade comprometida;
- disponível projetado;
- estoque mínimo;
- quantidade pendente em pedidos;
- fornecedor padrão quando houver.

Cada prioridade oferece acesso direto a:
- Movimentar;
- Configurar.

Há também acesso direto para Compras & Reposição.

## Movimentações recentes
A central exibe os últimos registros com:
- produto;
- tipo do movimento;
- data e hora;
- motivo/observação quando houver;
- delta positivo ou negativo.

## Lista operacional
A lista de produtos continua usando os filtros nativos da v0.21.0:
- Atenção;
- Todos;
- Controlados.

A camada v0.22 acrescenta contexto às linhas controladas:
- estoque mínimo;
- quantidade já em pedido;
- fornecedor associado;
- situação visual crítica / reposição / saudável.

Os botões nativos `Configurar` e `Movimentar` permanecem com a mesma lógica validada.

## Integração com Compras & Reposição
A visão de estoque consulta, quando disponíveis:
- pedidos abertos da v0.22;
- recebimentos;
- fornecedores associados.

Essa integração é somente de leitura para contexto gerencial. A lógica de saldo continua pertencendo ao Estoque Essencial v0.21.0.

## Responsividade
A revisão foi construída já com comportamento específico para celular.

Em telas menores:
- os seis indicadores viram duas colunas;
- ações rápidas reorganizam-se em duas colunas e depois uma coluna em telas muito estreitas;
- cartões gerenciais ficam empilhados;
- fatos das prioridades viram grade de duas colunas;
- toolbar não cria rolagem horizontal;
- linhas de estoque reorganizam números em cartões pequenos de duas colunas;
- Configurar e Movimentar continuam com alvos de toque amplos;
- nenhuma informação depende de hover.

## Estabilidade
A revisão:
- não altera `assets/v021-stock.js`;
- não muda as fórmulas de estoque;
- não adiciona polling visual;
- não adiciona `MutationObserver`;
- reage somente a eventos já existentes e a busca/filtros da própria tela;
- mantém a `main` intacta em v0.21.0 até aprovação da candidata.

## Arquivos da camada
- `assets/v022-stock-manager-view.js`;
- `assets/v022-stock-manager-view.css`;
- `assets/v022-stock-view-bridge.js`.

## Gate de validação
Antes de promover a v0.22.0, validar em desktop e celular:
1. ausência de rolagem horizontal;
2. abertura e fechamento do Estoque Essencial;
3. indicadores coerentes com as linhas;
4. filtros Atenção / Todos / Controlados;
5. busca por produto;
6. acesso a Configurar;
7. acesso a Movimentar;
8. entrada, perda, consumo interno e ajuste;
9. atualização após fechamento de comanda;
10. integração visual com quantidade em pedido e fornecedor;
11. acesso a Compras & Reposição;
12. movimentações recentes;
13. ausência de cintilação ou travamento do Painel.

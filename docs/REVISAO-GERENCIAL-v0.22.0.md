# Rota 27 v0.22.0 — Revisão gerencial de Compras & Estoque

## Motivo
A primeira candidata de Compras & Reposição ficou funcional e estável, porém simples demais para uma operação gerencial que exige entender a situação antes de agir.

A revisão mantém o fluxo curto de compra, mas amplia a densidade informacional e o uso do espaço disponível.

## Diretriz
**Primeiro entender; depois agir.**

A tela de Compras & Reposição passa a funcionar como uma central gerencial integrada ao Estoque Essencial, sem transformar o Rota 27 em ERP.

## Visão superior
A faixa de indicadores mostra:
- produtos controlados;
- produtos críticos;
- produtos para repor;
- unidades sugeridas para reposição;
- pedidos abertos;
- rascunhos e enviados;
- unidades ainda em pedido;
- unidades comprometidas em comandas abertas.

## Ações rápidas
Atalhos diretos para:
- Repor agora;
- Pedidos;
- Fornecedores;
- Estoque Essencial.

Cada atalho já mostra contexto operacional antes do clique.

## Situação do estoque
A central apresenta:
- quantidade de produtos críticos;
- abaixo do mínimo;
- saudáveis;
- estoque físico agregado dos produtos controlados;
- quantidade comprometida em comandas abertas;
- disponível projetado agregado;
- produtos em atenção sem fornecedor padrão.

Uma barra de saúde resume visualmente a distribuição entre crítico, atenção e saudável.

## Prioridades
Os produtos que exigem decisão aparecem em ordem de urgência com:
- disponível projetado;
- estoque mínimo;
- quantidade sugerida;
- quantidade já pendente em pedidos;
- fornecedor padrão quando houver.

A informação `Já em pedido` é exibida para reduzir o risco de compra duplicada sem alterar automaticamente a regra de sugestão nesta revisão.

## Fluxo de compras
A central mostra:
- rascunhos;
- pedidos enviados;
- unidades pendentes;
- recebimentos parciais;
- unidades recebidas no dia;
- unidades recebidas nos últimos 7 dias.

## Reposição detalhada
Cada linha de reposição passa a exibir, lado a lado:
- estoque físico;
- comprometido;
- disponível projetado;
- mínimo;
- quantidade já em pedido;
- quantidade a comprar;
- fornecedor.

Produtos sem disponível projetado recebem destaque de criticidade.

## Pedidos
Cada pedido passa a mostrar progresso operacional:
- quantidade pedida;
- quantidade recebida;
- quantidade pendente;
- percentual de recebimento.

As ações existentes de marcar enviado, receber, cancelar e copiar permanecem.

## Fornecedores
Cada fornecedor passa a mostrar:
- quantidade de produtos vinculados;
- quantos desses produtos precisam de reposição;
- quantos pedidos estão abertos;
- amostra dos produtos associados.

## Recebimentos recentes
A central mostra os últimos recebimentos por compra com:
- código do pedido;
- fornecedor;
- data/hora;
- total de unidades recebidas.

## Informação financeira
Esta revisão **não calcula valor de estoque nem valor estimado de compra**.

O catálogo atual contém preço de venda, mas isso não deve ser usado como custo de aquisição. Valor financeiro de compras só deve entrar quando houver um campo de custo confiável e uma regra explícita para sua manutenção.

## Revisão mobile
Após a validação visual da central ampliada em desktop, foi identificado que simplesmente comprimir o dashboard para a largura do celular manteria informação demais lado a lado.

A interface mobile passa a usar composição própria:
- folha de Compras ocupa toda a largura útil e bloqueia overflow horizontal;
- indicadores superiores reorganizam em duas colunas;
- ações rápidas quebram de forma responsiva e, em telas estreitas, passam para uma coluna;
- cartões gerenciais ficam em uma única coluna;
- totais de estoque, fluxo e fatos de prioridade usam grades de duas colunas;
- abas Reposição/Pedidos/Fornecedores ocupam a largura disponível sem rolagem horizontal;
- busca, filtros e botões de toolbar passam para linhas de largura total;
- linha de reposição deixa de tentar manter produto, quantidade e fornecedor lado a lado;
- quantidade e fornecedor passam para linhas próprias no celular;
- fatos de estoque continuam visíveis em blocos compactos de duas colunas;
- progresso e ações de pedido reorganizam verticalmente;
- cartões de fornecedores deixam de usar coluna lateral fixa.

A meta mobile não é esconder informação, e sim preservar a mesma informação em leitura vertical natural, com alvos de toque maiores e sem exigir zoom ou rolagem lateral.

## Teste mobile real
A revisão é suficientemente previsível para ser implementada antes do teste em aparelho, mas a aprovação final de responsividade exige pelo menos um teste físico em celular.

Checar no aparelho:
- ausência de rolagem horizontal;
- nenhum corte de card, botão, input ou select;
- inputs sem zoom automático;
- abas legíveis;
- criação de pedido sem necessidade de girar a tela;
- recebimento parcial/total operável com uma mão;
- rolagem vertical natural do início ao fim da central.

## Estabilidade
A ampliação não adiciona polling visual nem novo MutationObserver.

A camada gerencial reage a:
- abertura da tela;
- eventos já existentes de estoque/compras/domínio;
- cliques e alterações dentro da própria tela.

A `main` permanece na v0.21.0 até aprovação completa da candidata.

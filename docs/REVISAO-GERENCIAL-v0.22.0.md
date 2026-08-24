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

## Estabilidade
A ampliação não adiciona polling visual nem novo MutationObserver.

A camada gerencial reage a:
- abertura da tela;
- eventos já existentes de estoque/compras/domínio;
- cliques e alterações dentro da própria tela.

A `main` permanece na v0.21.0 até aprovação completa da candidata.

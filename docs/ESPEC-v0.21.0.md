# Rota 27 v0.21.0 — Especificação do Estoque Essencial

## Objetivo
Adicionar controle de estoque simples e opcional por produto sem transformar o Rota 27 em um ERP e sem acrescentar etapas ao atendimento normal.

## Princípios
- produto sem controle de estoque continua funcionando exatamente como antes;
- estoque saudável permanece silencioso;
- alertas aparecem apenas para baixo estoque, indisponibilidade ou erro de sincronização;
- itens em comandas abertas contam como comprometidos, mas a baixa definitiva ocorre somente no fechamento da conta;
- uma venda real não deve ser perdida por causa do módulo de estoque;
- movimentos manuais que causariam saldo negativo são bloqueados;
- adição de item é bloqueada quando o disponível projetado chega a zero.

## Modelo
Cada produto controlado possui:
- estoque inicial;
- estoque mínimo;
- estado ativo/inativo para controle.

O saldo atual é calculado por:

`estoque inicial + soma dos movimentos imutáveis`

Movimentos suportados:
- Entrada;
- Venda (baixa automática e idempotente por comanda/produto);
- Perda;
- Consumo interno;
- Ajuste de saldo.

## Estoque projetado
O app exibe:
- `Estoque`: saldo contabilizado;
- `Comprometido`: unidades já lançadas em comandas abertas;
- `Disponível projetado`: estoque menos comprometido.

A quantidade comprometida não altera o saldo definitivo enquanto a comanda estiver aberta. Editar ou cancelar a comanda altera apenas a projeção. Ao fechar a comanda, a baixa automática é registrada uma única vez.

## Operação
Acesso em `Painel → Estoque Essencial`.

A tela possui:
- resumo de produtos controlados;
- contagem abaixo do mínimo;
- zerados/indisponíveis;
- fila de sincronização;
- filtro `Atenção` como visão de reposição;
- busca;
- configuração por produto;
- movimentos manuais;
- histórico de movimentos;
- exportação CSV.

## Multidispositivo e offline
Configurações e movimentos usam os eventos:
- `stock_config_upsert`;
- `stock_movement`.

Os eventos usam a infraestrutura idempotente de `rota27-sync`. Não há nova tabela ou migration. A Edge Function apenas amplia o allowlist existente.

Movimentos têm IDs imutáveis. A baixa de venda usa ID determinístico por `comanda + produto`, prevenindo baixa duplicada.

## Preservações
A v0.21.0 não altera:
- cálculo financeiro da comanda;
- forma de pagamento;
- Fechamento do Turno;
- Visão Gerencial;
- WhatsApp cliente/gerente;
- filas de WhatsApp;
- contratos existentes de comandas, histórico, clientes e cardápio.

# RELEASE v0.25.64 — Estabilidade mobile e fechamento interno

Data: 29/08/2026

## Objetivo
Corrigir regressões observadas em uso real após a v0.25.63, sem alterar regras financeiras, backend ou dados históricos.

## Problemas observados
- responsividade lenta no iPhone;
- botão `+` de Nova comanda sem resposta na visualização Lista;
- Consumo interno não concluía o fechamento.

## Diagnóstico
### iPhone
A v0.25.63 adicionou normalização de `state.commands + state.history` no caminho de todo `save()`. Como lançamentos de itens geram saves frequentes, o custo cresce com o histórico local e pesa especialmente no Safari/iPhone.

### FAB
A camada antiga da v0.25.52 esconde o FAB quando `#cartbar.show` existe. Em alguns retornos para a Lista, a barra podia permanecer ativa e tornar o `+` indisponível.

### Consumo interno
Módulos financeiros antigos podem reembrulhar `finalizeCommand` em momentos diferentes. A ordem desses wrappers podia retirar do topo o interceptador específico de Consumo interno.

## Correções
- substituição do wrapper pesado de save por normalização somente das comandas abertas;
- sem novo polling contínuo e sem nova ponte `innerHTML` no hotfix;
- FAB garantido em Comandas / Lista e Mapa, com chamada direta à Nova comanda;
- remoção de `cartbar.show` residual na tela de Comandas;
- interceptação do botão de finalizar em captura para Consumo interno;
- finalização interna canônica independente da ordem dos wrappers financeiros;
- preservação de `nonRevenue=true` e do valor apenas como referência operacional.

## Evidência operacional
No Supabase, a comanda interna `c1788014228867` foi aberta com as flags corretas, recebeu item, não gerou fechamento e depois foi cancelada. A v0.25.64 não reescreve esse registro; corrige apenas o fluxo para novas operações.

## Backend
Nenhuma alteração no Supabase, migrations, schema ou Edge Functions.

## Service Worker
`rota27-comandas-v0.25.64-r1`

## Rollback
Baseline anterior: **v0.25.63**, merge `c8b8d54a99eefee047e294ba7bf9ce01dc64b14f`.

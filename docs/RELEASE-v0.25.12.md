# Rota 27 v0.25.12 — Pendências / A Receber

## Estado
Release aprovada para produção.

## Problema real
Um cliente pode sair devendo parte da conta. Manter a comanda aberta bloqueia o fechamento do turno e contamina o próximo expediente; marcar Pix/Crédito/etc. inventaria um recebimento que não ocorreu.

## Solução
Nova forma de fechamento: **A receber / Paga depois**.

Ao usar:
- a comanda é fechada como venda;
- o valor entra no faturamento e no histórico de itens;
- o pagamento não é marcado como recebido;
- nasce uma pendência vinculada à comanda/cliente;
- o turno deixa de ficar bloqueado.

## Painel — A receber
Mostra:
- quantidade de pendências abertas;
- saldo total a receber;
- cliente, origem e saldo de cada pendência;
- pendências quitadas recentemente.

Permite registrar recebimento:
- total;
- parcial;
- Pix;
- Dinheiro;
- Débito;
- Crédito;
- Outro.

A baixa posterior não cria nova venda, não incrementa itens vendidos e não duplica faturamento.

## Fechamento do turno
Quando houver venda em A receber, o fechamento continua mostrando o faturamento integral e acrescenta:
- **Recebido no turno**;
- **A receber**.

A forma `A receber` também aparece na composição do fechamento imutável.

## Sincronização
Novos eventos append-only/idempotentes:
- `receivable_upsert` — abertura da pendência;
- `receivable_payment` — baixa total/parcial.

Backend:
- migration `expand_rota27_sync_event_types_v02512`;
- `rota27-sync` versão 8;
- `EDGE_VERSION = rota27-sync-v0.25.12`;
- `verify_jwt=false` preservado porque a função usa autenticação própria `x-rota27-device-token`.

## PWA
- `VERSION = 0.25.12`;
- cache `rota27-comandas-v0.25.12-r1`;
- Ajuda v6.3.

## Rollback
Código: v0.25.11.

Observação: eventos `receivable_*` já aceitos pelo backend devem continuar preservados mesmo em rollback de frontend.

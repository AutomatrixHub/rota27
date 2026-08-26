# Rota 27 v0.25.14 — Novo turno no mesmo dia

## Motivo
Hotfix operacional: após um fechamento realizado hoje, o aplicativo bloqueava qualquer nova comanda até o dia seguinte.

## Correção
O fechamento passa a encerrar o **turno corrente**, não o dia civil inteiro.

- novas comandas podem ser abertas imediatamente após um fechamento anterior;
- um novo turno começa automaticamente com o primeiro movimento posterior;
- o próximo fechamento considera somente vendas após o fechamento anterior;
- múltiplos fechamentos no mesmo dia recebem IDs e eventos `turn_closed` únicos;
- fechamentos anteriores permanecem imutáveis;
- nenhuma migration ou novo tipo de evento é necessário;
- A receber / Paga depois e o seletor de clientes permanecem ativos.

## PWA
- VERSION 0.25.14
- cache `rota27-comandas-v0.25.14-r1`

Baseline de rollback: v0.25.13.

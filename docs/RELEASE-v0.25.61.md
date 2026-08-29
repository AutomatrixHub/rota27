# Rota 27 — Release v0.25.61

Data: 29/08/2026

## Objetivo

Antecipar a situação do fechamento sem criar checklist obrigatório nem nova rotina para o usuário.

## Pré-fechamento por exceção

O card **Fechamento do turno** no Painel passa a informar, antes da abertura da folha final:

- comandas abertas;
- cancelamentos aguardando confirmação da sincronização;
- fechamento anterior ainda aguardando sincronização;
- ausência de movimento;
- **Tudo certo para fechar**.

## Regras preservadas

A folha de fechamento já possuía os bloqueios de domínio para comandas abertas e cancelamentos pendentes. A v0.25.61 não cria novos bloqueios.

Fechamento anterior aguardando sincronização é apenas um aviso; o sistema offline-first continua funcionando normalmente.

## Implementação

- `assets/v02561-turn-preflight.css`;
- `assets/v02561-turn-preflight.js`.

A camada lê `Rota27V019.buildSummary()` e as filas já existentes. Nenhum dado novo é gravado.

Sem polling contínuo, MutationObserver, backend ou migration.

## PWA
- VERSION `0.25.61`;
- cache `rota27-comandas-v0.25.61-r1`.

## Rollback
Baseline anterior: **v0.25.60** / merge `0d133579f443684753ff592e44c9ff37cfd537a5`.

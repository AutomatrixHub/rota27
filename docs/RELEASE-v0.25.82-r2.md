# Rota 27 v0.25.82-r2 — Remoção do Modo demonstração legado

Data: 31/08/2026

## Objetivo
Remover da Visão Gerencial o quadro legado **Modo demonstração**, redundante após a implantação do **Modo Teste Global**.

## Correção
A camada visual do Modo Teste Global passa a ocultar permanentemente os dois pontos de entrada legados conhecidos:

- `#v020DemoMode`;
- `#v022DemoBox`.

O segundo (`v022DemoBox`) era o quadro ainda visível na Visão Gerencial.

A regra é global e vale tanto quando o aplicativo está usando dados reais quanto quando o Modo Teste Global está ativo.

## Preservado
- Modo Teste Global continua sendo o único mecanismo oficial de simulação;
- dados reais permanecem preservados;
- sandbox continua reversível;
- sync/Edge Functions continuam bloqueados no Modo Teste;
- WhatsApp real continua bloqueado no Modo Teste;
- nenhuma migration, tabela ou Edge Function é alterada.

Baseline funcional permanece **v0.25.82**. Esta é uma revisão operacional `r2`.

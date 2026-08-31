# Rota 27 v0.25.82-r3 — Atualização imediata da Visão Gerencial

Data: 31/08/2026

## Problema
Ao ativar ou desativar o **Modo Teste Global** com a **Visão Gerencial** já aberta, o tema e o quadro de estado mudavam imediatamente, mas os indicadores gerenciais permaneciam com o dataset anterior até o usuário trocar de período ou sair e voltar à tela.

## Causa
A ponte `v02581-manager-test-bridge.js` reagia ao evento `rota27:test-mode-changed` apenas atualizando o quadro **Modo Teste Global**. O corpo da Visão Gerencial não era solicitado a recalcular o período ativo.

Os botões `7 dias`, `30 dias`, `90 dias` e `Todos` já possuem o caminho canônico de renderização do dashboard.

## Correção
A ponte passa a:

- atualizar o quadro do Modo Teste Global;
- detectar se a Visão Gerencial está aberta;
- reacionar programaticamente o período atualmente selecionado;
- repetir uma confirmação curta após 80 ms para absorver a troca completa do sandbox;
- aplicar o mesmo comportamento ao ativar, desativar ou regenerar o cenário de teste.

Não há polling contínuo nem novo cálculo paralelo das métricas.

## Preservado
- dados reais e sandbox permanecem isolados;
- sync/Edge Functions continuam bloqueados no Modo Teste;
- WhatsApp real continua bloqueado;
- nenhuma migration, tabela ou Edge Function é alterada;
- nenhuma regra de cálculo gerencial foi duplicada.

Baseline funcional permanece **v0.25.82**. Esta é uma revisão operacional `r3`.

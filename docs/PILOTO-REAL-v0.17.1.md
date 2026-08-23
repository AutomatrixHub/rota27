# Rota 27 — Piloto real v0.17.1

Data de início: 23/08/2026

## Decisão

A versão **v0.17.1** fica congelada como baseline operacional para o piloto real.

Durante o piloto, não entram novos recursos ou refinamentos cosméticos. Só justificam hotfix imediato problemas classificados como P0/P1:

- perda ou corrupção de dados;
- total, cobrança ou fechamento incorreto;
- duplicidade grave de lançamentos/mensagens;
- falha de sincronização que impeça convergência entre aparelhos;
- cancelamento que não propague corretamente;
- indisponibilidade do fluxo operacional;
- falha relevante no WhatsApp que possa gerar erro de atendimento.

## Antes do turno

- confirmar v0.17.1 nos aparelhos;
- confirmar sincronização saudável;
- confirmar internet disponível em pelo menos um ciclo antes de iniciar;
- confirmar gerente/responsável configurado corretamente;
- não limpar dados do navegador;
- não reinstalar a PWA;
- não mexer em secrets/tokens durante o turno.

## Cenários que devem acontecer naturalmente

1. abrir comandas com mesa, parklet, balcão e/ou cliente;
2. lançar produtos em sequência rápida;
3. remover/corrigir pelo menos um item quando ocorrer de verdade;
4. editar uma comanda já aberta;
5. usar dois aparelhos no mesmo turno;
6. fechar comandas normalmente;
7. cancelar somente quando houver motivo operacional real;
8. enviar atualizações de WhatsApp para clientes que autorizaram;
9. deixar clientes responderem usando o recurso **Responder** do WhatsApp;
10. confirmar que o gerente recebe os encaminhamentos esperados.

## O que observar

Registrar somente fatos que gerem atrito, risco ou perda de tempo:

- passo que exigiu cliques demais;
- informação difícil de encontrar;
- lançamento que pareceu ambíguo;
- risco de cobrar item errado;
- demora perceptível;
- sync que demorou a convergir;
- WhatsApp duplicado, ausente ou confuso;
- ação que o atendente precisou explicar para outra pessoa;
- comportamento diferente entre aparelhos.

Não abrir tarefa apenas por preferência estética durante o piloto.

## Critério de severidade

### P0 — parar e corrigir

- perda/corrupção de dados;
- total ou cobrança incorreta;
- fechamento/cancelamento inconsistente;
- indisponibilidade do atendimento.

### P1 — hotfix prioritário

- sync não converge;
- duplicidade operacional relevante;
- resposta do cliente não chega ao gerente quando deveria;
- WhatsApp pode induzir a erro de atendimento;
- comanda fica inacessível ou inconsistente em um aparelho.

### P2/P3 — backlog pós-piloto

- melhoria de conveniência;
- refinamento visual;
- nova informação gerencial;
- automações não essenciais.

## Fechamento do piloto

Ao final do período de uso real, consolidar:

- problemas P0/P1 encontrados e correções necessárias;
- atritos repetidos observados pelos atendentes;
- recursos realmente pedidos durante o uso;
- o que funcionou sem intervenção e deve permanecer intocado;
- decisão de escopo da próxima versão.

## Candidata inicial para v0.18

A hipótese inicial é um **Resumo do Turno**, sem alterar a velocidade de lançamento:

- comandas fechadas;
- comandas canceladas;
- total movimentado;
- produtos mais lançados;
- ocorrências relevantes de sync/WhatsApp;
- pontos que mereçam conferência gerencial.

Essa hipótese só será promovida para desenvolvimento após o piloto real confirmar valor.

## Segurança pós-ativação Meta

Credenciais que tenham sido expostas durante a configuração devem ser rotacionadas fora do horário operacional, de forma coordenada, substituindo primeiro a credencial no ambiente que a utiliza e revogando a antiga somente após validação do novo fluxo.

A função temporária de diagnóstico `rota27-meta-webhook-bootstrap` não participa do fluxo operacional e deve ser removida quando houver uma janela segura de manutenção e uma ação de exclusão disponível.

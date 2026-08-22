# Rota 27 — Piloto real v0.16.1

Data prevista: **22/08/2026**

## Objetivo

Usar a v0.16.1 em ambiente real, preservando a operação validada da v0.15.1 e observando também se a nova Ajuda integrada reduz dúvidas sem atrapalhar o atendimento.

A v0.16.1 inclui o hotfix preventivo que deixa apenas um protetor final de versão ativo, evitando disputa entre selos/títulos de releases anteriores.

## Antes de começar o turno

Em cada aparelho que será usado:

- confirmar selo `v0.16.1`;
- confirmar internet quando necessária;
- confirmar sincronização inicializada;
- aguardar fila local de sync chegar a `0` após convergência;
- conferir se não há conflito não entendido;
- conferir se comandas abertas existentes estão coerentes entre os aparelhos;
- manter WhatsApp configurado apenas nos aparelhos autorizados a enviar;
- abrir `? Ajuda` uma vez para confirmar que a versão nova está carregada;
- abrir **Se acontecer isso…** e conferir se os títulos quebram em linhas normais, sem quebra palavra por palavra.

Não reinstalar a PWA e não limpar dados do navegador.

## Durante a operação

O atendente trabalha normalmente. A Ajuda deve ser usada somente quando houver dúvida; ela não precisa permanecer aberta.

Observar:

- quantidade de toques excessiva;
- dificuldade para localizar uma comanda;
- dificuldade para conferir itens;
- lançamento duplicado ou perdido;
- divergência entre aparelhos;
- comanda que reaparece depois de fechar/cancelar;
- WhatsApp duplicado, atrasado ou não enviado;
- erro ao editar quantidade;
- erro no total;
- dúvida entre fechar e cancelar;
- se a Ajuda responde a dúvida sem depender de explicação externa;
- se alguma explicação da Ajuda estiver confusa, longa ou faltar contexto;
- qualquer oscilação anormal do selo/título da versão ou lentidão associada à interface.

## Ajuda — pontos específicos a testar

- abrir e fechar sem perder a tela atual;
- pesquisar `Pix`, `cancelar`, `internet`, `WhatsApp`, `backup` e `mesa errada`;
- abrir **Primeiros 3 minutos**;
- abrir **Ver itens, Editar itens ou Fechar?**;
- abrir **Cancelar uma comanda**;
- abrir **Se acontecer isso…**;
- conferir cartões com ícone, etiqueta e resposta **O que fazer**;
- conferir destaque especial de **O total parece errado**;
- testar no desktop, Android e iPhone quando possível.

## Quando NÃO interromper a operação

Não interromper o turno por:

- preferência estética;
- pedido de nova métrica;
- mudança de cor/tamanho sem impacto real;
- ideia de relatório;
- texto da Ajuda que possa ser refinado depois sem risco operacional;
- conveniência de baixa frequência.

Registrar esses pontos como P2/P3.

## Classificação de incidentes

### P0 — parar e corrigir

- perda/corrupção de dados;
- cobrança ou total incorreto;
- fechamento registrando venda errada;
- duplicação grave de comanda/venda;
- sistema impedindo a operação em todos os aparelhos.

### P1 — registrar imediatamente e avaliar hotfix

- sync que não converge após reconexão;
- cancelamento que não propaga;
- WhatsApp duplicando mensagens;
- comanda não aparecendo em outro aparelho após tempo razoável;
- ação frequente ficando impraticável;
- Ajuda cobrindo ou bloqueando de forma persistente alguma ação operacional depois de fechada;
- oscilação repetida de versão/título ou lentidão anormal causada pela interface.

### P2/P3 — depois do turno

- melhoria de layout;
- novo atalho;
- refinamento de texto da Ajuda;
- nova métrica;
- novo relatório;
- conveniência de baixa frequência.

## Encerramento do turno

- aguardar sincronização convergir;
- conferir fila local de sync em `0` nos aparelhos principais;
- revisar conflitos antes de limpá-los;
- confirmar que vendas fechadas esperadas aparecem no Histórico;
- confirmar que comandas canceladas não entraram no faturamento;
- verificar mensagens de WhatsApp pendentes/falhadas relevantes;
- exportar backup JSON se houver qualquer dúvida sobre integridade;
- registrar quais tópicos da Ajuda foram realmente usados e quais dúvidas ainda exigiram explicação humana.

## Registro de observações

Para cada problema real:

- aparelho;
- horário aproximado;
- comanda/mesa/cliente;
- o que o usuário tentou fazer;
- o que aconteceu;
- impacto financeiro ou retrabalho;
- screenshot quando útil;
- se a Ajuda foi consultada e se resolveu a dúvida.

## Critério de sucesso

A v0.16.1 pode continuar em operação se:

- nenhuma venda for perdida ou duplicada;
- totais permanecerem corretos;
- sync convergir após uso simultâneo e reconexões;
- WhatsApp não duplicar mensagens;
- cancelamentos não entrarem no faturamento;
- atendente operar sem depender de telas técnicas;
- a Ajuda reduzir dúvidas sem atrapalhar o fluxo principal;
- o fluxo principal continuar tão rápido quanto ou melhor que a v0.15.1;
- o selo de versão permanecer estável em `v0.16.1`.

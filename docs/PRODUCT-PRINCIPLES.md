# Rota 27 — Princípios de produto

## Regra principal: respeitar o tempo do cliente

A Rota 27 não deve ganhar funcionalidades apenas porque são tecnicamente possíveis. Cada nova função precisa justificar o tempo que exige de quem está operando o estabelecimento.

Uma funcionalidade só entra quando atender pelo menos um destes critérios:

1. reduzir tempo ou número de toques em uma tarefa frequente;
2. evitar erro operacional, perda de informação, retrabalho ou cobrança incorreta;
3. ajudar a recuperar ou aumentar receita de forma direta e compreensível;
4. resolver uma obrigação operacional realmente necessária;
5. substituir uma tarefa manual já existente por um fluxo claramente mais simples.

Se a função apenas adiciona informação, tela, configuração ou curiosidade sem mudar a próxima decisão do usuário, ela deve ficar fora do produto.

## Consequências para a interface

- ações frequentes ficam mais próximas; configurações raras ficam fora do caminho principal;
- evitar duas entradas para a mesma ação;
- reutilizar telas e dados existentes antes de criar uma nova ferramenta;
- alertas devem existir somente quando há algo que merece ação;
- métricas devem ser curtas e orientadas à operação; análise detalhada permanece no Histórico;
- o Painel é um resumo para decidir rápido, não uma segunda área de relatórios;
- novas configurações exigem benefício operacional proporcional ao esforço de aprendizado.

## Gate de produto

Antes de desenvolver qualquer nova função, responder:

- Qual tarefa real ela melhora?
- Quantas vezes por dia/semana essa tarefa ocorre?
- Quanto tempo, erro ou dinheiro ela economiza?
- Existe uma forma de obter o mesmo benefício com algo que o app já possui?
- O usuário entende o valor sem treinamento adicional?

Se essas respostas não forem fortes, não implementar.

## Regra de operação real

Durante piloto ou turno real, estabilidade tem prioridade sobre evolução. A baseline em uso fica congelada durante o turno.

Só publicar uma alteração durante a operação quando ela corrigir um problema de alta gravidade, como:

- risco de perda ou corrupção de dados;
- cobrança incorreta;
- falha que impeça lançar, editar, fechar ou cancelar uma comanda;
- falha de sincronização com impacto direto na operação;
- falha de WhatsApp que provoque duplicidade, perda ou erro relevante.

Melhorias visuais, novas métricas, atalhos e funcionalidades não críticas devem ser registradas e avaliadas depois da operação. O comportamento observado no ambiente real vale mais do que hipótese de laboratório.

## Regra para o pós-piloto

Cada melhoria candidata deve ser classificada em uma destas categorias:

- **P0 — integridade:** evita perda, duplicidade, cobrança incorreta ou indisponibilidade;
- **P1 — velocidade operacional:** reduz toques, tempo e retrabalho em tarefas frequentes;
- **P2 — gestão:** melhora decisão gerencial sem atrapalhar o atendente;
- **P3 — conveniência:** útil, mas sem impacto operacional forte.

A prioridade de desenvolvimento segue P0 → P1 → P2 → P3, sempre confirmada por evidência do uso real.

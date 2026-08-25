# Rota 27 v0.25.2 — Plano de teste

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.1 — Navegação & Configurações**.

### Revisão R2
Após o primeiro teste visual, o Mapa foi aprovado em conceito, mas foi encontrada uma regressão P1: **tocar nos cards das comandas no Mapa não abria a comanda**.

A R2 corrige esse ponto com binding direto em cada card, usando `window.openCommand` já consolidado pelas camadas operacionais. Também aumenta o contraste visual do seletor `Lista / Mapa`.

### Revisão R3
Após revisão visual do Painel foram solicitados dois refinamentos:
- padronizar tamanho e peso dos botões `Abrir visão gerencial`, `Abrir estoque` e ação de `Compras & Reposição`, preservando a cor de cada módulo;
- posicionar `Relacionamento` imediatamente abaixo de `Compras & Reposição`.

A R3 mantém a lógica existente e usa cache `rota27-comandas-v0.25.2-r3`.

## A — versão e estabilidade
1. Abrir a candidata.
2. Confirmar badge `v0.25.2` estável por pelo menos 15 segundos.
3. Navegar entre Comandas, Cardápio, Painel e Histórico.

Esperado:
- sem cintilação/travamento;
- nenhuma rolagem horizontal;
- nenhuma perda de módulo anterior.

## B — Lista preservada
Na tela **Comandas**, manter o modo `Lista`.

Esperado:
- cards atuais continuam iguais;
- valor, itens, tempo e ação de abrir funcionam;
- estado vazio original continua correto;
- abrir uma comanda leva à tela de lançamento existente.

## C — alternância Lista / Mapa
1. Tocar em `Mapa`.
2. Voltar para `Lista`.
3. Voltar para `Mapa`.
4. Fechar/reabrir a candidata.

Esperado:
- troca instantânea;
- modo ativo com fundo laranja e texto branco, claramente diferente do inativo;
- nenhum dado muda;
- a preferência escolhida permanece neste aparelho;
- não há duplicação de comandas.

## D — classificação do Mapa
Criar ou usar comandas de teste com exemplos:
- `Mesa 1`;
- `Mesa 3` + cliente;
- `Balcão` + cliente;
- `Parklet 1`;
- somente nome do cliente, sem mesa/local;
- um local diferente, ex.: `Área externa`.

Esperado:
- Mesa 1 e Mesa 3 em `Mesas`, ordenadas numericamente;
- Balcão em `Balcão`;
- Parklet 1 em `Parklet`;
- cliente sem local em `Clientes`;
- Área externa em `Outros locais`;
- cada comanda aparece uma única vez.

## E — card compacto
Para cada comanda, conferir identificação, valor, cliente/local, itens, tempo de abertura e último lançamento.

Esperado:
- informação suficiente para reconhecer a comanda sem ocupar a altura do card completo da Lista;
- textos longos não quebram a grade.

## F — abrir pelo Mapa — gate crítico R2
Tocar em pontos diferentes do mesmo card:
- identificação da mesa/local;
- valor;
- nome do cliente;
- linha de itens/tempo;
- área vazia do card.

Esperado:
- **um único toque abre exatamente a comanda tocada**;
- lançamentos existentes permanecem;
- incluir/remover item funciona normalmente;
- ao voltar às Comandas, o Mapa reflete os valores atualizados;
- nenhum toque no card fica sem resposta.

## G — abertura rápida
Testar `+ Mesa`, `+ Balcão`, `+ Parklet` e `+ Cliente`.

Esperado:
- todos reutilizam a mesma tela `Nova comanda`;
- cancelar não cria nada;
- confirmar cria apenas uma comanda;
- WhatsApp/opções atuais continuam funcionando.

## H — sincronização A→B
1. No A, criar/editar uma comanda em uma das zonas.
2. Sincronizar A.
3. Sincronizar B.
4. Abrir o Mapa no B.

Esperado:
- a mesma comanda aparece na mesma zona;
- valor/itens/cliente/local convergem;
- Lista e Mapa enxergam o mesmo conjunto de `state.commands`;
- preferência Lista/Mapa pode ser diferente entre A e B, pois é local de interface.

## I — fechamento
Abrir uma comanda pelo Mapa, fechar normalmente e voltar para Comandas.

Esperado:
- comanda desaparece do Mapa e da Lista;
- Histórico recebe o fechamento normalmente;
- nenhuma comanda fantasma permanece.

## J — mobile
Validar em celular real.

Esperado:
- grade compacta sem scroll horizontal;
- toque confortável;
- sem sobreposição com FAB ou navegação inferior;
- redução perceptível de rolagem em relação à Lista;
- seletor Lista/Mapa claramente legível.

## K — Ajuda
Esperado:
- rodapé `Ajuda v5.3 • Rota 27 v0.25.2`;
- seção `Mapa rápido de comandas`;
- explicação de Lista/Mapa e abertura rápida.

## L — Painel — gate visual R3
Abrir **Painel** e conferir a sequência inicial.

Esperado:
1. `Visão Gerencial`;
2. `Estoque Essencial`;
3. `Compras & Reposição`;
4. **Relacionamento** imediatamente abaixo de Compras & Reposição.

Conferir os três botões principais:
- `Abrir visão gerencial`;
- `Abrir estoque` ou seu texto de alerta;
- `Ver N pedido(s)` / `Repor N` / `Abrir compras`.

Esperado:
- mesma largura e altura em telas largas;
- mesma tipografia, peso e alinhamento;
- cores originais preservadas: preto, verde/estado do estoque e azul/amarelo/verde conforme Compras;
- no celular, os três ocupam largura completa com a mesma altura;
- todos continuam abrindo seus módulos corretos.

## M — regressão P0/P1
Confirmar rapidamente:
- abrir/editar/fechar/cancelar comanda;
- lançar e editar itens;
- sincronizar;
- WhatsApp transacional;
- Cardápio;
- Painel;
- Histórico;
- Clientes & Fidelização.

## Gate
Somente promover após:
- teste local desktop/mobile aprovado;
- **gate de toque R2 aprovado**;
- **gate visual do Painel R3 aprovado**;
- A→B coerente;
- nenhuma regressão P0/P1;
- autorização explícita para publicação.

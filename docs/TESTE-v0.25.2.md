# Rota 27 v0.25.2 — Plano de teste

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.25.1 — Navegação & Configurações**.

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
- valor, itens, tempo e botão/ação de abrir funcionam;
- estado vazio original continua correto;
- abrir uma comanda leva à tela de lançamento existente.

## C — alternância Lista / Mapa
1. Tocar em `Mapa`.
2. Voltar para `Lista`.
3. Voltar para `Mapa`.
4. Fechar/reabrir a candidata.

Esperado:
- troca instantânea;
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
Para cada comanda, conferir:
- identificação curta/local;
- valor;
- cliente/local complementar quando existir;
- quantidade de itens;
- tempo de abertura;
- último lançamento.

Esperado:
- informação suficiente para reconhecer a comanda sem ocupar a altura do card completo da Lista;
- textos longos não quebram a grade.

## F — abrir pelo Mapa
Tocar em cada tipo de card.

Esperado:
- abre exatamente a comanda tocada;
- lançamentos existentes permanecem;
- incluir/remover item funciona normalmente;
- ao voltar às Comandas, o Mapa reflete os valores atualizados.

## G — abertura rápida
Testar:
- `+ Mesa` → campo deve começar com `Mesa `;
- `+ Balcão` → campo deve vir `Balcão` e foco ir para cliente;
- `+ Parklet` → campo deve começar com `Parklet `;
- `+ Cliente` → mesa/local vazio e foco no cliente.

Esperado:
- todos reutilizam a mesma tela `Nova comanda`;
- cancelar não cria nada;
- confirmar cria apenas uma comanda;
- WhatsApp/opções atuais da nova comanda continuam funcionando.

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
1. Abrir uma comanda pelo Mapa.
2. Fechar normalmente.
3. Voltar para Comandas.

Esperado:
- comanda desaparece do Mapa e da Lista;
- Histórico recebe o fechamento normalmente;
- nenhuma comanda fantasma permanece.

## J — mobile
Validar em celular real.

Esperado:
- 3 colunas em largura comum;
- 2 colunas em tela muito estreita;
- sem scroll horizontal;
- toque confortável;
- sem sobreposição com FAB ou navegação inferior;
- redução perceptível de rolagem em relação à Lista.

## K — Ajuda
Abrir Ajuda.

Esperado:
- rodapé `Ajuda v5.3 • Rota 27 v0.25.2`;
- seção `Mapa rápido de comandas`;
- explicação de Lista/Mapa e abertura rápida.

## L — regressão P0/P1
Confirmar rapidamente:
- abrir comanda;
- editar nome/mesa;
- lançar itens;
- editar itens;
- fechar;
- cancelar conforme fluxo existente;
- sincronizar;
- WhatsApp transacional;
- Cardápio;
- Painel;
- Histórico.

## Gate
Somente promover após:
- teste local desktop/mobile aprovado;
- A→B coerente;
- nenhuma regressão P0/P1;
- autorização explícita para publicação.

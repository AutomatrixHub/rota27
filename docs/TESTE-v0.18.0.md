# Rota 27 — Roteiro de teste v0.18.0

## Objetivo

Validar a primeira entrega da v0.18 sem mexer na produção v0.17.1.

## Pré-condições

- usar a branch/preview candidata v0.18.0;
- não limpar dados;
- não reinstalar a PWA de produção;
- manter pelo menos um aparelho de referência na v0.17.1;
- não alterar secrets/tokens durante o teste funcional.

## Gate 1 — carregamento

1. abrir a candidata;
2. confirmar selo `v0.18.0`;
3. confirmar que Comandas, Cardápio, Histórico e Ajuda continuam abrindo;
4. confirmar que não há travamento ou reload contínuo.

## Gate 2 — Resumo do Turno

Na tela Histórico, confirmar o novo bloco **Resumo do turno** antes dos filtros do histórico.

Validar:

- Faturamento hoje = soma das comandas fechadas hoje;
- Fechadas = quantidade de comandas fechadas hoje;
- Em aberto = quantidade atual de comandas abertas;
- valor em aberto = soma correta das comandas abertas;
- Ticket médio = faturamento / comandas fechadas;
- Itens vendidos = unidades das comandas fechadas hoje;
- Mais vendidos hoje = ranking coerente por quantidade;
- Formas de pagamento = total por método quando registrado.

## Gate 3 — atualização automática

1. abrir uma nova comanda e lançar itens;
2. voltar ao Histórico;
3. confirmar aumento de `Em aberto` e do valor em aberto;
4. fechar a comanda;
5. confirmar que ela sai de `Em aberto` e entra em Faturamento/Fechadas/Itens vendidos;
6. confirmar que ranking e forma de pagamento são atualizados.

## Gate 4 — saúde operacional

Com tudo saudável, o Resumo não deve ocupar espaço com cartões verdes.

Testes controlados:

- colocar o aparelho offline e confirmar alerta de offline;
- voltar online e confirmar que o alerta desaparece;
- se houver fila de WhatsApp com status `failed`, confirmar alerta correspondente;
- se houver erro real da sincronização de domínio, confirmar alerta correspondente.

Não provocar falhas destrutivas apenas para testar alertas.

## Gate 5 — regressão operacional

Repetir smoke da baseline:

- abrir comanda;
- lançar produtos rapidamente;
- remover/corrigir item;
- editar comanda;
- fechar comanda;
- cancelar uma comanda de teste;
- sincronizar entre dois aparelhos;
- enviar WhatsApp para cliente;
- receber cópia no gerente;
- responder a uma mensagem da comanda e confirmar encaminhamento ao gerente.

## Gate 6 — Ajuda

Abrir `? Ajuda` e confirmar a nova seção **Resumo do turno**, incluindo a explicação de que cancelamentos ainda não possuem contador histórico consolidado.

## Aprovação

A candidata só pode ir para `main` se:

- todos os números do resumo estiverem corretos;
- nenhum fluxo operacional da v0.17.1 regredir;
- não houver disputa de selo/versão;
- não houver P0/P1;
- o usuário aprovar visual e funcionalmente a nova tela.

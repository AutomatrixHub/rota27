# Rota 27 — Roteiro de teste v0.18.1

## Objetivo

Validar auditoria operacional e contador de cancelamentos sem alterar a produção v0.18.0.

## Gate 1 — carregamento

1. abrir a preview v0.18.1;
2. confirmar selo `v0.18.1`;
3. abrir Comandas, Painel, Cardápio, Histórico e Ajuda;
4. confirmar ausência de travamento/reload contínuo.

## Gate 2 — captura local

Na preview, criar uma comanda de teste e executar:

1. abrir a comanda;
2. adicionar dois produtos;
3. remover um produto;
4. editar cliente/local;
5. voltar a Histórico;
6. tocar em `Ver auditoria`.

Esperado: a auditoria exibe abertura, lançamentos, remoção e alteração em ordem cronológica, sem duplicações aparentes.

## Gate 3 — cancelamento

1. criar uma segunda comanda de teste;
2. adicionar pelo menos um item;
3. cancelar a comanda pelo fluxo normal;
4. abrir Histórico.

Esperado:

- `Canceladas` aumenta para 1;
- a comanda cancelada não entra no faturamento;
- a auditoria mostra `Comanda cancelada`;
- não há envio pendente indevido de WhatsApp daquela comanda;
- o restante da operação continua responsivo.

## Gate 4 — fechamento

1. criar/usar outra comanda;
2. lançar itens;
3. fechar com Pix ou outra forma de pagamento.

Esperado:

- faturamento e fechadas aumentam normalmente;
- `Canceladas` não muda;
- a auditoria registra `Comanda fechada`;
- o valor fechado continua correto.

## Gate 5 — offline

1. desconectar a internet;
2. abrir, alterar e cancelar uma comanda de teste;
3. conferir a auditoria.

Esperado: os eventos locais continuam aparecendo. O app pode indicar que a auditoria ainda está local/aguardando reconciliação.

## Gate 6 — multidispositivo / reconciliação

Executar na PWA configurada com sincronização:

1. realizar uma operação em um aparelho;
2. aguardar sincronização;
3. abrir `Ver auditoria` no outro aparelho;
4. usar `Atualizar` se necessário.

Esperado: o evento compartilhado aparece com indicação de aparelho e sem duplicar a mesma ocorrência local.

## Gate 7 — regressão

Repetir smoke operacional:

- abrir comanda;
- lançamento rápido;
- correção/remoção;
- editar comanda;
- fechar;
- cancelar;
- sync multidispositivo;
- WhatsApp cliente;
- cópia gerente;
- resposta do cliente encaminhada ao gerente.

## Aprovação

Promover somente se:

- cancelamentos forem contados corretamente;
- auditoria não duplicar eventos de forma relevante;
- total/faturamento não sofrer regressão;
- cancelamento continuar seguro;
- sync e WhatsApp permanecerem estáveis;
- nenhum P0/P1 for encontrado.

# Rota 27 — Release v0.25.72

## Seletor persistente de clientes + Painel sem redundância

### Nova comanda — Nome do cliente
A v0.25.71 eliminou o conflito visual principal, mas a camada antiga `v017-core.js` ainda podia voltar a aplicar `list="v017ClientSuggestions"` após determinados refreshes de domínio. Além disso, o seletor v0.25.13 ainda podia registrar listeners antes da camada nova.

A v0.25.72 endurece a correção:
- `v02513-client-picker.js` entra em modo de compatibilidade nas releases modernas e deixa de instalar os listeners legados;
- `#newCustomer` recebe uma proteção local que ignora novas tentativas de `setAttribute('list', ...)` feitas por camadas antigas;
- o atributo `list` é removido e o seletor v0.25.71 permanece como a única lista visual da Nova comanda;
- a proteção é reaplicada por eventos reais: foco, sincronização de domínio, storage, retorno do app e abertura de Nova comanda;
- sem polling e sem `MutationObserver`.

### Painel — A Receber
O card isolado `#v02512ReceivablesEntry` era redundante quando existiam pendências, pois o bloco **Hoje precisa de atenção** já exibia o mesmo total e já abria A Receber.

A v0.25.72:
- oculta a entrada isolada de A Receber no Painel;
- mantém o acesso a A Receber pela ação dentro de **Hoje precisa de atenção**;
- dá destaque visual específico à ação de recebíveis com fundo laranja, texto branco e contraste maior;
- não altera saldos, recebimentos, vencimentos ou sincronização.

### Publicação
- `VERSION`: 0.25.72;
- shell: `rota27-release-version=0.25.72`;
- roadmap loader: 0.25.72;
- Service Worker: `rota27-comandas-v0.25.72-r1`.

### Preservação
- nenhuma migration;
- nenhuma Edge Function;
- nenhum dado modificado;
- nenhuma alteração em comandas, clientes, preços, estoque, A Receber ou histórico;
- categorias e demais funcionalidades da v0.25.71 preservadas.

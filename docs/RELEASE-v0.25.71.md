# Rota 27 — Release v0.25.71

## Prioridade de categorias e seletor real de clientes

### Categorias
A ordem fixa passa a ser:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. **Charcutaria**;
5. **Vinhos**;
6. demais categorias.

No **Cardápio administrativo**, as demais categorias continuam em ordem alfabética.

No **lançamento de produtos em comandas**, as demais categorias continuam ordenadas pela quantidade histórica vendida, da mais consumida para a menos consumida, com desempate alfabético. Consumo interno/non-revenue permanece fora do ranking.

A rotina reconhece `Charcutaria` e também o alias legado/erro de digitação `Carchutaria`, sem renomear categorias cadastradas.

### Nome do cliente na Nova comanda
A auditoria confirmou concorrência entre duas soluções:
- `v017-core.js` recriava um `<datalist>` nativo e voltava a aplicar `list="v017ClientSuggestions"` em `#newCustomer` após sincronizações;
- `v02513-client-picker.js` mantinha simultaneamente o seletor visual próprio.

No Android isso podia resultar em comportamento semelhante a cache/autocomplete nativo e, ao mesmo tempo, o seletor próprio usava `pointerdown.preventDefault()`, prejudicando a rolagem por toque.

A v0.25.71 adiciona uma camada canônica para a Nova comanda:
- remove o `list` nativo de `#newCustomer`;
- desativa autocomplete/autocorreção do navegador nesse campo;
- chama `Rota27V017.syncDomainNow()` ao focar o campo;
- usa a lista sincronizada de clientes do domínio Rota27;
- deduplica por WhatsApp/ID;
- exibe todos os resultados correspondentes em painel próprio;
- painel fica no fluxo da tela, sem sobrepor WhatsApp/ações;
- rolagem vertical por toque com `-webkit-overflow-scrolling: touch`;
- seleção por `click`, sem `pointerdown.preventDefault()`;
- continua preenchendo automaticamente nome e WhatsApp do cliente selecionado.

### Publicação
- `VERSION`: 0.25.71;
- shell `index.html`: `rota27-release-version=0.25.71`;
- `v02569-menu-category-order.js` publicado com cache-buster `02571r1`;
- novos assets `v02571-client-picker.css/js` carregados diretamente pelo shell e pelo roadmap loader;
- Service Worker: `rota27-comandas-v0.25.71-r1`.

### Preservação
- nenhuma migration;
- nenhuma Edge Function;
- nenhuma alteração nos clientes do banco;
- nenhuma alteração em produtos, preços, estoque, comandas ou histórico;
- automações de aniversário e relacionamento preservadas;
- abertura canônica de Nova comanda da v0.25.70 preservada.

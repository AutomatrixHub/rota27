# Rota 27 — Release v0.25.70

## Abertura canônica de Nova comanda

Hotfix para a regressão observada em produção na v0.25.69: ao tocar no botão `+` em Comandas, o aplicativo podia exibir **“Não foi possível abrir Nova comanda.”**.

### Causa
A v0.25.64 removeu o `onclick` original do FAB e passou a chamar `window.openNewCommandSheet`. Em determinados ciclos do bootstrap/PWA essa referência global pode não estar exposta, apesar de o formulário `#newCommandWrap` estar presente e funcional no DOM.

### Correção
A v0.25.70 adiciona `assets/v02570-new-command-root.js` como camada raiz:
- intercepta `#fabNew` em captura antes dos listeners legados;
- protege também o botão **Abrir primeira comanda**;
- tenta preservar o opener legado quando disponível;
- se a referência global estiver ausente ou falhar, abre diretamente `#newCommandWrap`;
- reinicia Mesa/Local, Cliente, WhatsApp, opt-in e Data de nascimento;
- reinicia o modo de Consumo interno;
- remove `autofocus` e mantém a Nova comanda sem foco automático;
- reinstala a referência em `visibilitychange`, sem polling e sem `MutationObserver`.

### Publicação
- `VERSION`: 0.25.70;
- shell `index.html`: release meta 0.25.70 e asset direto `v02570-new-command-root.js?v=02570r1`;
- roadmap loader: 0.25.70;
- Service Worker: `rota27-comandas-v0.25.70-r1`.

### Preservação
- nenhuma migration;
- nenhuma Edge Function;
- nenhuma alteração de dados;
- nenhuma alteração em preços, estoque, comandas ou histórico;
- organização do Cardápio da v0.25.69 preservada;
- automações de aniversário/recontato preservadas.

## Validação esperada
Em **Comandas**, tanto com Lista quanto Mapa selecionados:
1. tocar no `+` abre **Nova comanda**;
2. com zero comandas, **Abrir primeira comanda** também abre o mesmo formulário;
3. nenhum campo recebe foco automático;
4. o teclado não deve abrir até o operador tocar em um campo.

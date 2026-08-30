# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.71 — Prioridade de categorias e seletor real de clientes**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.71-r1`;
- baseline anterior: **v0.25.70**, merge `33cd7e314c738bc0e939d62d5b6836a7133bccb5`.

## Categorias
Ordem fixa no Cardápio e no lançamento:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. **Charcutaria**;
5. **Vinhos**.

No Cardápio, as demais categorias ficam em ordem alfabética. No lançamento, as demais continuam ordenadas pela quantidade histórica faturável vendida, com empate alfabético. Consumo interno/non-revenue permanece fora. O alias `Carchutaria` é reconhecido sem alterar o cadastro.

## Nova comanda — seleção de clientes
A auditoria confirmou concorrência entre o `<datalist>` nativo criado por `v017-core.js` e o seletor visual `v02513-client-picker.js`.

A v0.25.71 adiciona `v02571-client-picker.css/js`:
- remove `list=v017ClientSuggestions` de `#newCustomer` sempre que a camada é ativada;
- desativa autocomplete/autocorreção nativos no campo;
- chama `Rota27V017.syncDomainNow()` ao focar o campo;
- usa `Rota27V017.clients()` após sincronização;
- deduplica clientes por WhatsApp/ID;
- substitui o picker antigo por um nó sem o handler `pointerdown.preventDefault()` legado;
- usa seleção por `click`;
- painel fica no fluxo da folha e é rolável por toque;
- preenche nome e WhatsApp do cliente selecionado.

## Nova comanda — abertura preservada
A v0.25.70 permanece responsável pela abertura canônica do `+` e de **Abrir primeira comanda**, com fallback direto no DOM e sem autofocus.

## Backend de relacionamento preservado
- `rota27-birthday-campaign`: v3 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- parabéns automático às 09:30 preservado;
- solicitação de data de nascimento em até 3 tentativas / 7 dias preservada.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes e histórico preservados;
- nenhum polling ou `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.71`;
- `v02569-menu-category-order.js` usa cache-buster `02571r1`;
- `v02571-client-picker.css/js` são carregados diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.71-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.70** / merge `33cd7e314c738bc0e939d62d5b6836a7133bccb5`.

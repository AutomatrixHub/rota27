# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.72 — Seletor persistente de clientes + Painel sem redundância**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.72-r1`;
- baseline anterior: **v0.25.71**, merge `5bc6f45e26b4926c7b73084c2e7a06c1a7a18442`.

## Nova comanda — seletor de clientes
A v0.25.71 eliminou a sobreposição principal, mas o core v0.17 ainda possui `refreshClientDatalist()` e pode tentar recolocar `list=v017ClientSuggestions` após refreshes de domínio. A imagem real de produção confirmou a reincidência.

A v0.25.72 resolve a concorrência de forma persistente:
- `v02513-client-picker.js` não instala mais listeners legados em releases modernas;
- `#newCustomer` recebe proteção local que ignora novas tentativas de `setAttribute('list', ...)`;
- o datalist `v017ClientSuggestions` é removido da Nova comanda quando a camada moderna é preparada;
- o campo recebe um nome de formulário próprio da release para evitar reaproveitamento indevido de sugestões antigas do navegador;
- o seletor v0.25.71 continua sendo a única lista visual, com clientes sincronizados, deduplicação, rolagem por toque e seleção por click;
- a proteção é orientada a eventos; não há polling nem `MutationObserver`.

## Painel — A Receber
O card isolado `#v02512ReceivablesEntry` foi removido visualmente por redundância.

Quando existem pendências, **Hoje precisa de atenção** já apresenta:
- quantidade de pendências;
- saldo ainda não recebido;
- ação para abrir A Receber.

Na v0.25.72, essa ação recebe destaque laranja/alto contraste. O módulo, os dados e a sincronização de A Receber permanecem intactos.

## Categorias preservadas
A v0.25.71 continua responsável pela ordem:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. **Charcutaria**;
5. **Vinhos**.

No Cardápio, demais categorias ficam alfabéticas. No lançamento, demais categorias continuam por consumo histórico faturável.

## Backend de relacionamento preservado
- `rota27-birthday-campaign`: v3 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- parabéns automático às 09:30 preservado;
- solicitação de data de nascimento em até 3 tentativas / 7 dias preservada.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset ou alteração de dados;
- preços, produtos, estoque, comandas, clientes, recebíveis e histórico preservados;
- nenhum polling ou `MutationObserver` novo.

## Atualização PWA
- shell declara `rota27-release-version=0.25.72`;
- `v02572-panel-client-stability.css/js` são carregados diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.72-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.71** / merge `5bc6f45e26b4926c7b73084c2e7a06c1a7a18442`.

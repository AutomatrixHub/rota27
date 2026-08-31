# Rota 27 — Release v0.25.76

Data: 30/08/2026

## Título
**Editar comanda sem foco automático + preço vermelho nos produtos**

## Objetivo
Corrigir dois refinamentos de UX reportados em produção após a v0.25.75, sem alterar regras de negócio, dados, sincronização ou backend.

## Editar comanda sem foco automático
A tela **Editar comanda** passa a seguir o mesmo princípio já aplicado à **Nova comanda**:
- nenhum campo recebe foco automático ao abrir;
- teclado virtual não deve abrir sozinho;
- atributos `autofocus`, caso existam na área de edição, são neutralizados;
- qualquer foco inicial dentro do modal é removido imediatamente, em microtask e no próximo frame;
- o usuário continua podendo tocar normalmente em qualquer campo depois da abertura.

A correção é finita e idempotente, sem `MutationObserver` e sem polling.

## Preço dos produtos
Nos cards da tela de lançamento da comanda:
- o preço volta a usar a cor vermelha/terracota `#d85f2c`;
- permanecem os cards compactos da v0.25.75;
- permanecem os nomes maiores em 1px;
- permanecem os cards sem ícones;
- permanece o badge da quantidade no canto inferior direito.

## Implementação
- novo asset: `assets/v02576-edit-command-no-autofocus.js`;
- ajuste direto em `assets/v02575-cardapio-compact-edit.css` para restaurar a cor do preço;
- shell, roadmap loader e PWA atualizados para a nova release.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum reset/exclusão de dados;
- nenhum disparo real amplo de WhatsApp;
- nenhum `MutationObserver` novo;
- nenhum polling novo;
- Lista e Mapa de comandas preservados;
- consentimento persistente da v0.25.74 preservado;
- cancelamento + WhatsApp da v0.25.73 preservado.

## PWA
- `VERSION`: `0.25.76`;
- release meta do shell: `0.25.76`;
- roadmap loader: `0.25.76`;
- Service Worker: `rota27-comandas-v0.25.76-r1`.

## Rollback
Baseline anterior: **v0.25.75** / PR #111 / merge `ece7e8a6539f16a2f30ee8c1c06b8bf6cbe2ae2f`.

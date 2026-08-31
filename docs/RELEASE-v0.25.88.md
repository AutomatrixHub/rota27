# Rota 27 — Release v0.25.88

Data: 31/08/2026

## Correção principal — estado vazio da Lista

Foi corrigido o quadro **“Nenhuma comanda aberta”** que podia permanecer visível mesmo quando existiam comandas abertas na Lista.

### Causa
- `renderCommandCardsV017()` já controlava corretamente `#commandsEmpty` com `display:none` quando havia comandas;
- a hotfix visual v0.25.80-r4 passou a aplicar `display:block!important` no mesmo elemento;
- o `!important` anulava a visibilidade definida pelo render canônico.

### Correção
- removido o `display:block!important` da camada visual;
- adicionada uma guarda v0.25.88 que sincroniza a visibilidade do estado vazio com `state.commands`;
- o quadro continua visualmente idêntico ao Mapa quando a lista estiver realmente vazia;
- com uma ou mais comandas abertas, o estado vazio fica oculto.

## Atualização automática — gate de segurança

A captura de produção da v0.25.87 mostrou o aviso “Atualização pronta” sem modal visível. O gate considerava qualquer wrapper `.open` como operação ativa, inclusive elementos ocultos.

A v0.25.88 passa a bloquear reload somente quando o sheet/dialog aberto estiver **realmente visível** (display/visibility/opacidade e dimensões válidas).

## Evidência operacional analisada

A comanda Haddad permanece aberta e aparece corretamente na Lista. A comanda “Rodriginho” observada no WhatsApp foi aberta, recebeu 2x Chope Brahma 500 ml (R$ 30,00) e foi fechada às 19:50 com Pix; portanto, não deve permanecer em Comandas abertas.

## Preservação
- nenhuma migration;
- nenhuma Edge Function alterada;
- `rota27-sync` permanece v10;
- `rota27-device-control` permanece v2;
- nenhum dado de produção alterado;
- comandas, histórico, clientes, estoque e WhatsApp preservados.

## PWA
- versão: `0.25.88`;
- cache: `rota27-comandas-v0.25.88-r1`;
- novo asset: `assets/v02588-list-empty-visibility.js`.

## Rollback
Baseline anterior: v0.25.87, merge `48c462f0d5e2ec20a81328902cac3e21ac454055`.

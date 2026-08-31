# Rota 27 — Release v0.25.79

Data: 30/08/2026

## Título
**Borda vermelha real com cantos arredondados**

## Objetivo
Corrigir o formato do destaque vermelho dos cards do Cardápio para corresponder à proposta visual aprovada.

## Causa raiz
Na v0.25.78, o vermelho ainda era desenhado por um pseudo-elemento interno `::before`. Mesmo com a cor correta, essa solução gerava uma faixa vertical retangular recortada pelo card, diferente da proposta em que o vermelho acompanha o arredondamento dos cantos.

## Correção
- remove a pseudo-faixa interna `::before`;
- usa `border-left: 4px solid #da693d` no próprio `.menu-item`;
- mantém `border-radius: 15px`, fazendo a borda vermelha acompanhar os cantos superior e inferior;
- usa `box-sizing:border-box` para preservar a dimensão externa;
- compensa o padding esquerdo para manter o conteúdo na mesma posição visual;
- aplica a mesma lógica proporcional em telas estreitas;
- produtos inativos continuam com borda esquerda cinza.

## Preservação
- altura e largura dos cards inalteradas;
- preço, botão Editar, nome, categoria, status e responsividade preservados;
- nenhum JavaScript funcional novo;
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum dado real modificado;
- Lista, Mapa, WhatsApp, consentimentos, estoque, histórico e recebíveis preservados;
- sem `MutationObserver` ou polling novo;
- não limpar `localStorage`.

## PWA
- `VERSION`: `0.25.79`;
- shell: `rota27-release-version=0.25.79`;
- revisão do CSS: `02579r1`;
- Service Worker: `rota27-comandas-v0.25.79-r1`.

## Rollback
Baseline anterior: **v0.25.78**, PR #114, merge `e181f6cb4ef22fc3ce7993619524bb4516e7e68c`.

# HOTFIX v0.25.22-r4 — Corrida de renderização em Fechamentos

Data: 27/08/2026

## Sintoma observado no aparelho
Ao abrir **Fechamentos**, o rodapé e o status de sincronização apareciam corretos por uma fração de segundo e depois voltavam ao HTML legado. O ID técnico `turn_...` reaparecia no rodapé.

## Causa confirmada
O módulo-base `v02515-turn-close.js` mantém listeners próprios que podem chamar `refresh()` / `renderOpenSheets()` depois do renderer visual mais novo. Isso redesenha a sheet com o HTML legado após o primeiro paint.

## Correção r4
- CSS passa a ocultar o conteúdo bruto do rodapé e renderiza uma camada visual segura; mesmo se o módulo legado redesenhar a linha, `turn_...` não volta a ficar visível;
- quando o renderer canônico está ativo, o nome do aparelho é preservado via `data-r27-device`;
- o status sincronizado usa `data-r27-sync-text`, portanto alterações posteriores de `textContent` pelo legado não mudam o texto exibido;
- o renderer canônico faz apenas uma pequena sequência de estabilização de evento (0/90/220 ms) após abertura/sync, sem polling contínuo e sem `MutationObserver`;
- os mesmos eventos do módulo-base são tratados após o ciclo corrente para o renderer canônico ficar por último.

## Segurança
Nenhum dado de domínio é alterado. Não há mudança em Supabase, Edge Functions, `turn_closed`, event log ou cálculo do turno.

## PWA
Service Worker: `rota27-comandas-v0.25.22-r4`.

## Rollback
`v0.25.22-r3`.

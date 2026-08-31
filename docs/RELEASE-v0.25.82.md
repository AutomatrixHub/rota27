# Rota 27 v0.25.82 — Hotfix Modo Teste: rolagem e Fila

Data: 31/08/2026

## Objetivo
Corrigir dois problemas identificados na validação real da v0.25.81 — Modo Teste Global:

1. algumas telas/overlays não permitiam rolagem vertical em determinados fluxos mobile;
2. as comandas abertas do cenário fictício podiam não aparecer na visualização Lista/Fila, embora o `state.commands` estivesse correto.

## Correção de rolagem
A hotfix adiciona uma classe operacional somente enquanto o Modo Teste está ativo e normaliza:

- rolagem vertical de `html` e `body`;
- altura/overflow das telas principais ativas;
- `touch-action: pan-y` em contexto mobile;
- rolagem interna de sheets/overlays;
- rolagem da Ajuda quando aplicável.

Ao sair do Modo Teste, a classe é removida e o comportamento normal de produção volta a valer.

## Correção da Fila de comandas
Durante o Modo Teste, a visualização Lista/Fila passa a ser reconstruída diretamente a partir de `state.commands`, preservando:

- quantidade de comandas abertas;
- valor total em aberto;
- quantidade de itens;
- cliente/local;
- valor de cada comanda;
- tempo desde a abertura/último lançamento;
- abertura da comanda pelo card.

O Mapa continua usando o mesmo `state.commands` e é atualizado junto com a Fila.

A reconstrução adicional existe apenas no sandbox. Fora do Modo Teste, a cadeia de renderização de produção permanece inalterada.

## Segurança operacional
Esta hotfix não altera a arquitetura de isolamento da v0.25.81:

- nenhum dado fictício é persistido sobre os dados reais;
- sync/Edge Functions continuam bloqueados no Modo Teste;
- WhatsApp real continua bloqueado;
- `localStorage` real não é limpo;
- não há migration, tabela ou Edge Function nova.

## Arquivos novos
- `assets/v02582-test-mode-hotfix.css`
- `assets/v02582-test-mode-hotfix.js`

## PWA
- `VERSION = 0.25.82`
- cache `rota27-comandas-v0.25.82-r1`
- Ajuda `10.0`

Baseline de rollback: **v0.25.81 — Modo Teste Global**.

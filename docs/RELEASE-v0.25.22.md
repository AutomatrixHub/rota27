# RELEASE v0.25.22 — Refinamento dos Fechamentos

Data: 27/08/2026

## Objetivo
Refinar a tela **Fechamentos** a partir do uso real no celular, sem alterar cálculo, sincronização ou persistência dos turnos.

## Alterações visuais
A grade de seis indicadores passa a seguir esta ordem:

1. Faturamento | Ticket médio
2. Comandas fechadas | Comandas canceladas
3. Itens vendidos | Formas de pagamento

Também foram ajustados os rótulos para ficarem completos e mais claros:
- `Fechadas` → `Comandas fechadas`;
- `Canceladas` → `Comandas canceladas`;
- `Itens` → `Itens vendidos`;
- `Formas pgto.` → `Formas de pagamento`.

## Cabeçalho do fechamento
O horário físico passa a ser identificado explicitamente no canto superior direito:

`Fechado: DD/MM HH:MM`

A data grande à esquerda continua sendo a **data operacional** do turno.

## Metadados
O identificador técnico do fechamento (`turn_...`) deixa de ocupar a tela operacional.

A linha passa a mostrar apenas:

`Data operacional pela abertura • fechado em <aparelho>`

O ID original continua preservado no armazenamento e no event log; somente deixou de ser exibido nessa visão.

## Sincronização
O aviso verde foi compactado para:

`Sincronizado • DD/MM/AAAA HH:MM:SS`

Estados de sincronização em andamento, pendência ou erro continuam usando as mensagens já existentes.

## Área rolável
Foi acrescentado espaço inferior na lista de fechamentos para permitir que o último card suba completamente acima dos botões **Sincronizar** e **Concluir**.

## Hotfix r2
A captura real em produção mostrou que a primeira publicação da v0.25.22 aplicava corretamente a nova ordem dos cards, mas parte dos textos voltava ao formato antigo depois que o renderer-base concluía uma sincronização assíncrona.

O hotfix **r2** corrige essa disputa sem `MutationObserver` e sem polling visual frequente:
- o botão **Fechamentos** é tratado em captura e abre a mesma sheet existente com render determinístico;
- a sincronização continua sendo executada por `Rota27V019.syncTurnClosures()`;
- após a sincronização, a tela é redesenhada uma única vez no formato v0.25.22;
- o botão **Sincronizar** usa o mesmo fluxo determinístico;
- rótulos completos e o prefixo **Fechado:** possuem fallback CSS, evitando regressão visual durante redesenhos internos;
- nenhum dado de fechamento é recalculado ou regravado por esse renderer.

## Arquivos
- `assets/v02522-closure-polish.css`
- `assets/v02522-closure-polish.js`
- `assets/v0256-release.js`
- `sw.js`
- `VERSION`
- `README.md`
- `docs/STATUS-PRODUCAO.md`

## Backend
Nenhuma alteração no Supabase, banco ou Edge Functions.

Permanecem:
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v2 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE.

Nenhum novo tipo de evento foi criado.

## Segurança e estabilidade
- sem `MutationObserver`;
- sem polling visual frequente;
- sem limpeza de `localStorage`;
- sem reinstalação da PWA;
- fechamento imutável permanece inalterado;
- reparos históricos da v0.25.16 continuam preservados.

## Service Worker
`rota27-comandas-v0.25.22-r2`

## Rollback
Baseline anterior: **v0.25.21 — Ontem no Histórico + leitura dos fechamentos**.

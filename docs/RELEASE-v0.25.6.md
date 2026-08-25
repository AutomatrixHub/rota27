# Rota 27 v0.25.6 — Paridade Visual Lista / Mapa

Data: 25/08/2026

## Objetivo
Corrigir definitivamente o desenho dos cards da visualização Mapa reutilizando a estrutura visual real da Lista, em vez de manter uma interpretação paralela.

## Fonte visual reutilizada
A Lista já usa:
- `command-card` / `v017-command-card`;
- `v017-command-primary`;
- `command-title`;
- `v017-command-info` / `v017-command-copy`;
- `v017-command-location`;
- `command-sub`;
- `money`;
- `command-bottom` / `meta`.

A v0.25.6 aplica essa mesma estrutura aos cards do Mapa e mantém apenas uma classe adicional para compactação.

## Faixa lateral
O Mapa passa a usar exatamente a regra oficial já aplicada à Lista pelo tema Rota 27:
- largura 6 px;
- laranja nos 68% superiores;
- preto nos 32% inferiores;
- faixa de ponta a ponta do card.

## Hierarquia
A mesma regra da Lista é preservada:
- título principal = cliente, quando houver; senão local/mesa;
- quando cliente + local coexistem, o local aparece como linha secundária forte;
- itens + tempo de abertura aparecem abaixo;
- valor permanece à direita;
- último lançamento fica no rodapé com divisor tracejado.

O Mapa não mostra o botão interno `Abrir →`, porque o card inteiro já é acionável.

## WhatsApp
A cópia fixa implementada na v0.25.5 permanece preservada para `+55 27 99776-9279` (`5527997769279`).

## Backend
Sem alteração de Supabase, Edge Functions, migrations, tabelas, eventos ou templates.

## Estabilidade
A nova camada não adiciona `setInterval` nem `MutationObserver`. Atua somente após os renders/eventos já existentes.

## PWA
- VERSION: `0.25.6`
- Service Worker: `rota27-comandas-v0.25.6-r1`
- Ajuda: v5.7

## Rollback
Baseline anterior: **v0.25.5 — Mapa Refinado & Cópia Fixa de WhatsApp**.

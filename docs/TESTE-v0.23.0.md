# Rota 27 v0.23.0 — Validação da release

## Estado
**APROVADA PARA PRODUÇÃO.**

PR: **#28 — Rota 27 v0.23.0 — Inventário & Conferência**.

Em 24/08/2026 a candidata foi validada em desktop, celular e em dois aparelhos com sincronização A→B.

## Objetivo validado
Conferência física rápida e segura, garantindo que:
- nenhum saldo mude durante a contagem;
- o sistema compare esperado x contado em tempo real;
- divergências só alterem estoque após confirmação final;
- cada divergência gere no máximo um ajuste idempotente;
- sessões e ajustes converjam entre aparelhos.

## Gate local — APROVADO
Foram validados:
- carregamento estável da candidata v0.23.0;
- Estoque Essencial e Compras & Reposição preservados;
- acesso ao Inventário dentro do Estoque Essencial;
- início de uma única conferência por vez;
- snapshot do saldo esperado dos produtos controlados;
- contagem igual, menor e maior que o esperado;
- diferença em tempo real;
- atalhos `Igual ao sistema` e `Sem unidade`;
- navegação Anterior / Salvar e próximo;
- busca, categoria, Pendentes e Divergentes;
- pausar e continuar;
- persistência após fechar/reabrir;
- nenhuma alteração de saldo antes da finalização;
- revisão de corretos, faltas e sobras;
- bloqueio com item não contado;
- bloqueio se o estoque se movimentar depois do início da conferência;
- finalização sem divergência sem movimento desnecessário;
- finalização com divergência gerando `adjust`;
- ID determinístico `inventory_adjust_<inventoryId>_<productId>`;
- histórico e CSV;
- operação offline local;
- layout mobile sem problema relevante de rolagem horizontal.

## Backend v0.23 — APROVADO
`rota27-sync` foi promovido aditivamente para:
- versão **7 ACTIVE**;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- novo evento permitido: `inventory_upsert`;
- ajustes físicos continuam usando `stock_movement`;
- todos os contratos anteriores preservados;
- `verify_jwt=false` preservado por usar autenticação própria via `x-rota27-device-token`;
- nenhuma migration e nenhuma tabela nova.

## Smoke multidispositivo A→B — APROVADO
O teste real entre dois aparelhos passou.

Foram confirmados:
- sessão iniciada no aparelho A disponível no B;
- contagens realizadas em um aparelho convergindo no outro;
- pausar/continuar entre aparelhos;
- finalização da sessão convergindo;
- saldo final consistente;
- ajuste de inventário sem duplicidade relevante;
- reconexão/sincronização mantendo a idempotência.

## Regressão crítica
Durante o ciclo não foi identificado P0/P1 em:
- Comandas;
- Estoque Essencial;
- Compras & Reposição;
- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração;
- operação mobile.

## Gate de produção
**APROVADO em 24/08/2026.**

A release pode ser marcada ready e mesclada na `main`.
# Rota 27 — Release v0.25.60

Data: 29/08/2026

## Objetivo

Levar a inteligência de Fidelização para a lista principal de Clientes, sem criar novo cadastro, nova regra ou nova rotina.

## Classificação

A lista reutiliza `Rota27V025.profileFor`, portanto mantém exatamente as regras já existentes:

- Novo: 0–1 visita;
- Recorrente: 2–4 visitas;
- Frequente: 5–9 visitas;
- Cliente da casa: 10+ visitas;
- Sumido: pelo menos 2 visitas e 30+ dias sem voltar.

Os níveis aparecem como selos compactos nos cards dos clientes.

## Ordenação

Novo seletor local:

- Nome;
- Última visita;
- Mais frequentes;
- Aniversário próximo.

A ordenação apenas reorganiza visualmente os cards já carregados. Não grava preferência no cliente e não sincroniza nenhum novo dado.

## Preservações

- cards enriquecidos v0.25.44;
- Aniversários próximos;
- busca de clientes;
- edição do cadastro;
- Relacionamento & Fidelização;
- WhatsApp e Eventos & Convites.

Sem backend, migration, polling contínuo ou MutationObserver.

## PWA
- VERSION `0.25.60`;
- cache `rota27-comandas-v0.25.60-r1`.

## Rollback
Baseline anterior: **v0.25.59** / merge `08904789aeb01eec1efaf0bd985a725468322869`.

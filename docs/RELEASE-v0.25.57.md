# Rota 27 — Release v0.25.57

Data: 29/08/2026

## Objetivo

Retomar o roadmap funcional com uma melhoria de relacionamento que aproveita dados já existentes, sem criar novo cadastro nem envio automático.

## Aniversários próximos

Na área **Clientes & Fidelização**, o Rota 27 passa a mostrar um bloco compacto com:

- quantidade de aniversários **hoje**;
- quantidade de aniversários nos **próximos 7 dias**;
- até 5 clientes ordenados pela proximidade do aniversário;
- data em `DD/MM`;
- indicação `Hoje`, `Amanhã` ou `Em N dias`.

Ao tocar no nome de um aniversariante, a busca de clientes existente é preenchida para localizar o cadastro na própria lista.

## Regras

- usa somente a `birthDate` já cadastrada/sincronizada;
- não cria novo campo;
- não altera a data de nascimento;
- não envia WhatsApp automaticamente;
- não reaproveita consentimento transacional como consentimento de marketing;
- considera apenas a ocorrência anual da data, ignorando o ano para calcular o próximo aniversário;
- 29/02 é tratado somente em anos em que a data existe, sem inventar conversão para 28/02 ou 01/03.

## Implementação

Novos assets:

- `assets/v02557-upcoming-birthdays.css`;
- `assets/v02557-upcoming-birthdays.js`.

Atualização orientada por eventos já existentes de clientes/aniversário e abertura da área de clientes. Sem polling contínuo e sem MutationObserver.

## Preservações

Não altera:

- campanha de solicitação de aniversários;
- Eventos & Convites;
- WhatsApp;
- Supabase;
- sincronização;
- comandas;
- estoque;
- fechamento;
- A Receber.

## PWA

- VERSION: 0.25.57
- cache: `rota27-comandas-v0.25.57-r1`

## Rollback

Baseline anterior: v0.25.56 / merge `ae010727766e57ff315d2cbe29ac85017427f08a`.

# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.66 — Elegibilidade de aniversário**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.66-r1`;
- baseline anterior: **v0.25.65**, merge `9a9e2a64bd6d2b3b01004dc2e804128386221a02`.

## Parabéns automático
- envio diário às **09:30**, fuso `America/Sao_Paulo`;
- cron backend: `rota27-birthday-greeting-0930` / `30 12 * * *` UTC;
- template `aniversario_cliente_rota27_v1`: **APPROVED**, categoria MARKETING, `pt_BR`;
- idempotência anual: `birthday_greeting_v1::<ano>::<clientId>`;
- Sandbox não envia;
- sem fallback por texto livre.

## Regra de elegibilidade v0.25.66
Quando uma data de nascimento é fornecida ou alterada no cadastro:
- a data é sincronizada no `client_upsert`;
- `relationshipMarketingOptIn=true` acompanha o mesmo fluxo;
- `eventMarketingOptIn=true` é mantido por compatibilidade;
- fonte: `birth_date_provided_v02566`.

Se o cliente fizer opt-out explicitamente depois, sem alterar novamente a data, o opt-out continua podendo ser salvo.

## Backfill aprovado
Foi executado um backfill append-only em produção para **21 clientes** que já possuíam data de nascimento. Foram inseridos novos `client_upsert` com a data preservada e autorização `true`.

O backfill corrigiu também clientes cuja data existia em evento anterior, mas não no snapshot mais recente, como o caso de **JJ Ivan Lins**.

Nenhum evento histórico foi apagado ou atualizado in-place.

## Interface
Em **Clientes & Fidelização → Aniversários próximos**:
- o texto passa a informar o envio automático às 09:30;
- cada cliente recebe um status de elegibilidade;
- `Autorizado • 09h30 no dia`: data + WhatsApp válido + autorização;
- `Sem autorização`: relacionamento desabilitado;
- `Sem WhatsApp`: telefone ausente/inválido;
- no dia do aniversário, os estados da entrega permanecem: Agendado 09:30, Aceito pela Meta, Enviado, Entregue, Lido ou Falhou.

## Consentimentos
- atualizações da comanda: consentimento operacional separado;
- aniversário, eventos e relacionamento: `relationshipMarketingOptIn`;
- o editor continua permitindo opt-out posterior.

## Preservação
- v0.25.65 permanece responsável pela automação de parabéns e status de entrega;
- v0.25.64 permanece responsável por estabilidade mobile, FAB + e Consumo interno;
- v0.25.63 permanece responsável pela data operacional de turnos;
- nenhum reset de dados;
- nenhum envio de WhatsApp foi feito durante o backfill.

## Regras de operação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.65** / merge `9a9e2a64bd6d2b3b01004dc2e804128386221a02`.

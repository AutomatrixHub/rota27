# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.67 — Estado visual de aniversários**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.67-r1`;
- baseline anterior: **v0.25.66**, merge `a801ddbd821e88a92c6a703713be54b317027b8f`.

## Incidente visual corrigido
A automação de aniversário estava correta no backend, porém o renderer legado v0.25.57 reconstruía `#v02557UpcomingBirthdays` depois das camadas v0.25.65/66. Isso podia apagar visualmente:
- a frase de envio automático às 09:30;
- o bloco de status da automação;
- os badges de elegibilidade.

## Correção v0.25.67
- `v02557-upcoming-birthdays.js` agora usa a cópia correta de automação e emite `rota27:v02557-rendered` após cada render;
- `v02567-birthday-visual-state.js` escuta esse evento e reaplica o estado de elegibilidade v0.25.66;
- o bloco `v02565BirthdayAutomation` é restaurado a partir do último status já consultado, sem polling adicional;
- o shell carrega diretamente a camada v0.25.67 antes do roadmap loader;
- o roadmap loader usa cache-buster `02567r1` para as camadas de aniversário;
- não foi adicionado `MutationObserver` nem varredura contínua.

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
- opt-out explícito posterior continua sendo respeitado.

## Backfill aprovado
Foi executado backfill append-only em produção para **21 clientes** que já possuíam data de nascimento. Os 21 possuem autorização de relacionamento `true` no snapshot consolidado.

Para 30/08, **Cliente X** e **JJ Ivan Lins** possuem data, WhatsApp válido e autorização, ficando elegíveis para o cron das 09:30.

Nenhum evento histórico foi apagado ou atualizado in-place.

## Interface esperada
Em **Clientes & Fidelização → Aniversários próximos**:
- subtítulo: `Parabéns automático às 09:30 no dia do aniversário para clientes autorizados.`;
- `Autorizado • 09h30 no dia` para aniversariantes futuros elegíveis;
- `Sem autorização` para relacionamento desabilitado;
- `Sem WhatsApp` para telefone ausente/inválido;
- no próprio dia, os estados de entrega permanecem: Agendado 09:30, Aceito pela Meta, Enviado, Entregue, Lido ou Falhou.

## Preservação
- nenhuma migration nesta release;
- nenhuma Edge Function alterada;
- nenhum reset de dados;
- nenhum envio de WhatsApp disparado pela correção visual;
- v0.25.66 continua responsável pela elegibilidade/backfill;
- v0.25.65 continua responsável pela automação e entrega;
- v0.25.64 continua responsável por estabilidade mobile/FAB/Consumo interno;
- v0.25.63 continua responsável pela data operacional de turnos.

## Regras de operação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.66** / merge `a801ddbd821e88a92c6a703713be54b317027b8f`.

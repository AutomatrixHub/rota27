# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.65 — Parabéns automático de aniversário**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.65-r1`;
- baseline anterior: **v0.25.64**, merge `3e730cdbb4f97b6511bb1e70709d6c47ea117731`.

## Parabéns automático
- envio diário às **09:30**, fuso `America/Sao_Paulo`;
- cron backend: `rota27-birthday-greeting-0930` / `30 12 * * *` UTC;
- aniversariante precisa ter data de nascimento válida, WhatsApp válido e `relationshipMarketingOptIn=true`;
- idempotência: `birthday_greeting_v1::<ano>::<clientId>`, impedindo duplicidade anual;
- Sandbox não envia;
- template não aprovado gera `skip`, nunca texto livre ou fallback promocional.

## Consentimento
O editor de Clientes mantém dois contextos separados:
- atualizações da comanda: consentimento operacional já existente;
- **Receber mensagens da Rota 27 pelo WhatsApp**: aniversário, eventos e relacionamento.

O novo consentimento é persistido como `relationshipMarketingOptIn` e também mantém compatibilidade com `eventMarketingOptIn` para campanhas futuras de eventos. Autorizações antigas exclusivamente de eventos não são usadas automaticamente para parabéns até nova confirmação no cadastro.

## Template Meta
- `aniversario_cliente_rota27_v1`;
- `MARKETING` / `pt_BR`;
- texto aprovado no produto: `Olá, {{1}}! A equipe da Rota 27 Bodega deseja a você um feliz aniversário, com muita saúde, alegria e bons momentos. Parabéns pelo seu dia!`;
- submissão inicial executada em 29/08/2026;
- retorno inicial da Meta: **PENDING**, id `2886374555032299`;
- a automação só envia quando o status remoto for `APPROVED`.

## Edge Function
`rota27-birthday-greeting`:
- versão inicial: `rota27-birthday-greeting-v1`;
- ações de status e envio manual exigem `x-rota27-device-token`;
- execução automática só funciona na janela local 09:30–09:45 e sempre recalcula a elegibilidade;
- usa `whatsapp_message_log` para auditoria e entrega;
- o webhook `rota27-whatsapp-inbound` continua sendo a fonte dos estados entregue/lido/falhou por `wa_message_id`.

## Banco / scheduling
Migration `birthday_greeting_cron_0930` aplicada em produção:
- habilita `pg_cron` e `pg_net`;
- registra o job `rota27-birthday-greeting-0930`;
- job ativo confirmado em produção.

## Interface
Em **Clientes & Fidelização → Aniversários próximos**:
- informa que parabéns é automático às 09:30;
- mostra estado do template e contagem do dia;
- aniversariante pode aparecer como Agendado 09:30, Aceito pela Meta, Enviado, Entregue, Lido, Falhou ou Sem autorização;
- botão Atualizar consulta o backend sem polling contínuo.

## Preservação
- v0.25.64 permanece responsável por estabilidade mobile, FAB + e Consumo interno;
- v0.25.63 permanece responsável pela data operacional de turnos;
- nenhum dado histórico foi resetado ou reprocessado;
- nenhuma mensagem de aniversário foi enviada durante a implantação, pois o template ainda estava PENDING.

## Regras de operação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.64** / merge `3e730cdbb4f97b6511bb1e70709d6c47ea117731`.

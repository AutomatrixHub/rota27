# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.65 — Parabéns automático de aniversário
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.65-r1`
- **Baseline anterior:** v0.25.64

## v0.25.65 — Parabéns de aniversário

### Consentimento
- mensagens de comanda continuam com consentimento operacional separado;
- o cadastro de cliente passa a usar o consentimento **Receber mensagens da Rota 27 pelo WhatsApp**;
- esse consentimento cobre aniversário, eventos e relacionamento;
- clientes com autorização antiga somente para eventos não são automaticamente promovidos para o novo consentimento genérico até nova confirmação no cadastro.

### Aniversários
- o bloco **Aniversários próximos** passa a informar a automação de parabéns;
- aniversariantes do dia com WhatsApp válido e consentimento explícito ficam elegíveis;
- envio automático programado para **09:30**, fuso `America/Sao_Paulo`;
- um cliente recebe no máximo uma mensagem de aniversário por ano;
- status aproveita `whatsapp_message_log` e o webhook existente: agendado, aceito pela Meta, enviado, entregue, lido ou falhou;
- Sandbox permanece sem envio real.

### Template Meta
- nome: `aniversario_cliente_rota27_v1`;
- categoria: **MARKETING**;
- idioma: `pt_BR`;
- texto: `Olá, {{1}}! A equipe da Rota 27 Bodega deseja a você um feliz aniversário, com muita saúde, alegria e bons momentos. Parabéns pelo seu dia!`;
- template submetido à Meta em 29/08/2026 e inicialmente retornado como **PENDING**;
- enquanto não estiver `APPROVED`, o cron não envia mensagens.

### Backend
- nova Edge Function: `rota27-birthday-greeting`;
- nova migration versionada para `pg_cron` + `pg_net`;
- job: `rota27-birthday-greeting-0930`;
- cron: `30 12 * * *` UTC, correspondente a 09:30 em `America/Sao_Paulo`;
- a própria função revalida data, horário local, telefone, consentimento, aprovação do template e idempotência anual antes de enviar.

## Correções anteriores preservadas
- v0.25.64: estabilidade mobile, FAB + e fechamento de Consumo interno;
- v0.25.63: coerência operacional de turnos;
- planejamento original 0–10 permanece concluído.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.65.md`
- `docs/RELEASE-v0.25.64.md`

## Versão
Produção: **0.25.65**

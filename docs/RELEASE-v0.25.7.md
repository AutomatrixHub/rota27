# Rota 27 v0.25.7 — Replay de histórico WhatsApp

## Objetivo
Permitir o reenvio controlado de 23 mensagens históricas de 25/08/2026 para o número fixo `+55 27 99776-9279`, usando os mesmos templates do backend `rota27-whatsapp`.

## Conteúdo do replay
Foram codificados, na ordem cronológica informada pelo proprietário, 23 lançamentos entre 17:40 e 19:42, incluindo inclusões, remoções e os totais acumulados de cada momento.

O replay usa:
- destinatário fixo `5527997769279`;
- saudação `Rony` para reproduzir o conteúdo histórico fornecido;
- `commandLabel` no formato `Balcão • <cliente>`;
- IDs estáveis por mensagem para idempotência no backend;
- `clientTimestamp` com o horário original de cada lançamento;
- envio sequencial com pequeno intervalo entre mensagens.

## Operação
Em **WhatsApp do gerente** aparece o quadro **Reenviar histórico de 25/08**.

O operador toca em **Enviar 23 mensagens agora** e confirma. O aplicativo mostra progresso e marca cada mensagem aceita pelo backend. Em caso de interrupção, o botão muda para **Continuar envio** e retoma somente as pendentes locais; o backend também ignora IDs já marcados como enviados.

## Limitação de horário
O WhatsApp exibirá o horário real do reenvio. Os horários históricos são preservados no `clientTimestamp`/manifesto de replay, mas não podem ser retroativamente aplicados à interface do WhatsApp.

## Segurança
- nenhuma mensagem é disparada automaticamente ao atualizar a PWA;
- é necessária ação explícita no botão;
- o aparelho precisa ter a integração WhatsApp já configurada;
- não há nova Edge Function, migration, tabela ou evento de sync.

## PWA
- `VERSION = 0.25.7`;
- Service Worker `rota27-comandas-v0.25.7-r1`;
- assets `v0257-history-replay.js/css`;
- identidade em runtime atualizada para v0.25.7;
- Ajuda v5.8.

## Rollback
Baseline anterior: **v0.25.6 — Paridade Visual Lista / Mapa**.

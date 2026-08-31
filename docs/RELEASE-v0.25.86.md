# Rota 27 v0.25.86 — Telemetria e solicitações remotas de aparelhos

## Objetivo
Evoluir a gestão de aparelhos sincronizados para permitir diagnóstico operacional sem acesso físico imediato ao dispositivo.

## Telemetria por aparelho
Cada aparelho ativo que estiver com o Rota 27 aberto e online reporta periodicamente, sem dados sensíveis:
- se a integração local de WhatsApp está configurada;
- quantidade agregada de envios WhatsApp pendentes;
- quantidade agregada de envios em falha/retry;
- último erro local sanitizado;
- horário do último diagnóstico recebido.

Não são enviados nem armazenados URL da Edge Function, token técnico, telefone, conteúdo de mensagens ou credenciais.

## Solicitações remotas
Na tela **Painel → Operação → Aparelhos sincronizados**, o menu de aparelhos ativos passa a oferecer:
- **Solicitar sincronização** — registra um pedido persistente; o aparelho chama o sync normal assim que estiver ativo com a PWA aberta;
- **Solicitar diagnóstico** — registra um pedido persistente; o aparelho reporta a telemetria local e confirma o atendimento assim que estiver ativo.

Essas ações não acordam um iPhone/PWA fechado. O pedido permanece pendente no Supabase até o agente v0.25.86 daquele aparelho executar.

## Arquitetura
- `rota27-sync` permanece inalterada na versão 10;
- nova Edge Function isolada `rota27-device-control` v1;
- migration `device_telemetry_remote_requests` adiciona somente colunas de telemetria e controle em `rota27_sync_devices`;
- agente PWA `v02586-device-telemetry.js` roda a cada ~15 s somente fora do Modo Teste e quando online;
- o agente reutiliza `window.v15SyncNow()` para atender um pedido de sincronização; não existe uma segunda implementação de sync.

## Segurança
- autenticação continua usando `x-rota27-device-token`, igual ao sync existente;
- somente aparelhos registrados e `active` podem usar a função de controle;
- aparelhos `retired`/`removed` não respondem às solicitações;
- telemetria é sanitizada e deliberadamente não inclui segredos;
- Modo Teste não publica telemetria real nem atende solicitações remotas.

## PWA
- versão: `0.25.86`;
- cache: `rota27-comandas-v0.25.86-r1`;
- novos assets: `v02586-device-telemetry.js` e `v02586-device-telemetry.css`.

## Rollback
O frontend pode ser revertido para v0.25.85 sem perda de dados. As novas colunas são aditivas e podem permanecer no banco. A Edge Function `rota27-device-control` é independente de `rota27-sync`.

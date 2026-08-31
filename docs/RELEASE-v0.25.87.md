# Rota 27 v0.25.87 — Atualização automática e solicitação remota

## Objetivo
Reduzir a dependência de fechar e reabrir manualmente a PWA para receber novas versões e permitir solicitar atualização de um aparelho pela Gestão de Aparelhos.

## Atualização automática
- verifica `VERSION` ao iniciar, ao voltar ao primeiro plano, ao recuperar internet e periodicamente;
- solicita `registration.update()` quando detecta release mais nova;
- Service Worker informa a release ativa antes do reload;
- reload automático somente em janela segura;
- se houver sheet/dialog aberto ou campo em edição, a atualização aguarda;
- Modo Teste Global não executa atualização automática.

## Solicitação remota
Em **Painel → Operação → Aparelhos sincronizados → ⋮**:
- nova ação **Solicitar atualização**;
- registra versão-alvo e horário no Supabase;
- aparelho fechado não é acordado pelo iOS;
- quando o Rota 27 voltar a executar e estiver online, o pedido é atendido;
- confirmação só é registrada após a versão atualizada carregar.

## Backend
- migration aditiva em `rota27_sync_devices`;
- `rota27-device-control` v2 ACTIVE;
- `rota27-sync` v10 permanece inalterada;
- eventos históricos e dados operacionais não são modificados.

## Segurança operacional
Nenhum reload é feito enquanto houver interface de edição/dialog aberta ou campo editável em foco. A solicitação remota não consegue acordar um PWA suspenso pelo iOS; ela permanece pendente até o aparelho voltar a executar.

## PWA
- versão: `0.25.87`
- cache: `rota27-comandas-v0.25.87-r1`

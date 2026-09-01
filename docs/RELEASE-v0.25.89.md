# Rota 27 — Release v0.25.89

Data: 31/08/2026

## 1. Gestão de aparelhos — release oficial do Rota 27

A tela **Aparelhos sincronizados** deixa de tratar `app_version` como se fosse a versão instalada do aplicativo.

### Causa
O campo histórico `app_version` também é enviado por módulos internos antigos (`0.15-dev.1`, `0.21.0`, `0.25.71` etc.) e pode ser sobrescrito por qualquer heartbeat do sync. Portanto, ele não representa de forma confiável a release do PWA mostrada na topbar.

### Correção
- adicionada a coluna `release_version` em `rota27_sync_devices`;
- `rota27-device-control` passa a receber `releaseVersion` separadamente;
- somente o agente v0.25.89 reporta a release oficial obtida de `meta[name="rota27-release-version"]`;
- a UI passa a mostrar **Versão do Rota 27: vX.Y.Z**;
- a linha principal passa a mostrar somente **Última atividade**, sem misturar versão interna;
- aparelhos que ainda não executaram a nova release mostram **aguardando telemetria desta release**;
- pedidos remotos antigos já pendentes são elevados automaticamente para a release atual quando a gestão é aberta; nenhum pedido novo é criado para aparelhos que não tinham atualização pendente.

`app_version` é preservado no banco por compatibilidade, mas deixa de ser apresentado ao gerente como “versão instalada”.

## 2. A receber — quitação explícita

Os dados de pagamento já guardavam `paidAt`, valor e forma, mas os cartões exibiam apenas textos como “último 29/08/2026”.

A v0.25.89 passa a mostrar:
- pendência sem pagamento: **Nenhum recebimento registrado**;
- pagamento parcial: valor já recebido + **Último recebimento em DD/MM/AAAA às HH:MM** + forma;
- pendência quitada: valor recebido + **Quitado em DD/MM/AAAA às HH:MM** + forma do pagamento que concluiu a quitação;
- seção **Quitadas recentemente** ordenada pela data real do último pagamento/quitação;
- subtítulo da seção alterado para **por data de quitação**.

A data de origem da dívida continua visível separadamente.

## 3. Compatibilidade com vencimentos

A camada v0.25.58 de vencimentos foi preservada. Sempre que a v0.25.89 reconstrói os cartões, o decorador existente é reaplicado para manter:
- Sem vencimento;
- Vence hoje;
- Vencida há N dias;
- prioridade visual e ordenação dos pendentes.

## Backend
- migration aditiva: `20260831205000_device_release_version.sql`;
- `rota27-device-control` v3 ACTIVE;
- `rota27-sync` v10 preservado e inalterado;
- nenhuma comanda, histórico, cliente, estoque, recebível ou pagamento foi alterado pela migration.

## PWA
- versão: `0.25.89`;
- cache: `rota27-comandas-v0.25.89-r1`;
- novos assets:
  - `assets/v02589-device-release.js`;
  - `assets/v02589-receivable-settlement.js`.

## Rollback
Baseline anterior: v0.25.88, merge `7217645c6cd6ca20c1f23c9af4b1810b3da141ff`.

# Rota 27 — Backup Manifest Pré-Azure

Data de referência: 2026-09-09

## Fonte de verdade do código

- Repositório: `AutomatrixHub/rota27`
- Visibilidade no momento do snapshot: `public`
- Branch de produção: `main`
- Commit consolidado: `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`
- Tree SHA: `b80b1195ad5c5fb7042914a5d746582f1a020168`
- Tamanho reportado pelo GitHub: 3557 KB
- Branch de restauração exata: `archive/pre-azure-migration-v025224-20260909`

A branch de restauração exata aponta diretamente para o commit acima e não contém este manifesto adicional.

## Segurança / migração

- PR #278 foi mesclada por squash em `main`.
- PR #279 (`security: exigir assinatura Meta no webhook inbound`) permanece em draft e fora de produção.
- PR #280 (`migration: preparar baseline privado pré-Azure`) permanece em draft e fora de produção.
- O frontend/PWA, DNS e GitHub Pages não foram alterados pelo lote de backend nem pelas branches de migração.
- GitHub Pages foi validado HTTP 200 após o merge da PR #278.

## Supabase

Projeto: `owkvwsiblbzlpxjwybrt`

- região: `sa-east-1`
- PostgreSQL: 17
- status no preflight: `ACTIVE_HEALTHY`

### Tabelas públicas — contagem exata no snapshot

| Tabela | Linhas |
|---|---:|
| `rota27_sync_events` | 2784 |
| `rota27_sync_devices` | 18 |
| `rota27_device_enrollments` | 5 |
| `rota27_whatsapp_inbound` | 44 |
| `whatsapp_message_log` | 1702 |
| `rota27_automation_credentials` | 1 |

Todas as 6 tabelas públicas estavam com RLS habilitado e sem policies públicas; o acesso operacional é feito pelas Edge Functions/service role.

### Serviços internos relevantes

- Supabase Auth: 0 usuários, 0 identidades e 0 sessões no preflight.
- Supabase Storage: 0 buckets e 0 objetos no preflight.

Portanto não havia usuários Auth nem objetos binários de Storage para preservar separadamente no estado auditado.

### Edge Functions ACTIVE

| Função | Versão | verify_jwt |
|---|---:|---|
| `rota27-whatsapp` | 24 | false |
| `rota27-sync` | 14 | false |
| `rota27-lab` | 1 | false |
| `rota27-whatsapp-inbound` | 4 | false |
| `rota27-meta-webhook-bootstrap` | 4 | true |
| `rota27-audit` | 2 | false |
| `rota27-birthday-campaign` | 4 | false |
| `rota27-birthday-bootstrap` | 4 | false |
| `rota27-admin-replay-beto-20260827` | 3 | true |
| `rota27-event-campaign` | 5 | false |
| `rota27-admin-resend-mamute-20260828` | 5 | true |
| `rota27-admin-retry-mamute-20260828` | 13 | true |
| `rota27-event-delivery-status` | 1 | false |
| `rota27-birthday-greeting` | 2 | false |
| `rota27-device-control` | 5 | false |
| `rota27-access-control` | 3 | false |
| `rota27-device-enroll` | 2 | false |

As funções com `verify_jwt=false` usam autenticação própria ou são webhooks. A migração não deve alterar esse comportamento sem validação individual.

### Edge Functions ACTIVE sem fonte em `main`

Sete funções do control-plane não estavam presentes em `supabase/functions` do commit fonte:

- `rota27-lab` — laboratório legado;
- `rota27-meta-webhook-bootstrap` — desativada, HTTP 410;
- `rota27-birthday-bootstrap` — desativada, HTTP 410;
- `rota27-admin-replay-beto-20260827` — desativada, HTTP 410;
- `rota27-admin-resend-mamute-20260828` — desativada, HTTP 410;
- `rota27-admin-retry-mamute-20260828` — desativada, HTTP 410;
- `rota27-event-delivery-status` — legado funcional, sem referência operacional encontrada no código atual.

Os fontes atuais dessas sete funções foram exportados em pacote privado de recuperação fora do Git público:

- arquivo: `rota27-orphan-edge-functions-20260909.zip`
- SHA-256: `ca1a26605131c5b5b46e004a3cf3359f25fe05fd6be26103d89adee029539356`
- secret scan: nenhum padrão de secret detectado.

Esse pacote não deve ser usado para redeploy automático no baseline novo; serve apenas como material de recuperação durante a janela de rollback.

### Migrações recentes

- `20260909215902 birthday_greeting_automation_auth`
- `20260907153604 allow_developer_device_role_v025215`
- `20260906221637 device_enrollment_v025211`
- `20260906185209 first_device_owner_v025208`
- `20260906154600 device_permission_write_guard_v025208`
- `20260906154002 device_employee_permissions_v025208`
- `20260831235201 device_release_version`
- `20260831223906 device_remote_update_requests`
- `20260831220217 device_telemetry_remote_requests`
- `20260831210527 device_lifecycle`
- `20260830002128 birthday_greeting_cron_0930`

### Cron

- job: `rota27-birthday-greeting-0930`
- schedule: `30 12 * * *` (12:30 UTC / 09:30 America/Sao_Paulo no horário de referência)
- active: `true`
- o `run_due` já exige credencial server-to-server armazenada em tabela protegida por RLS.

### Advisors

- Security Advisor: nenhum alerta crítico; 6 itens INFO `rls_enabled_no_policy`, compatíveis com o desenho server-side/service-role atual.
- Performance Advisor: 4 índices ainda sem uso; nenhum será removido durante a migração.

## Tags existentes no snapshot

- `production-v0.25.96-freeze`
- `v0.25.97`
- `v0.25.98`
- `v0.25.99`
- `v0.25.100`
- `v0.25.101`
- `v0.25.102`
- `v0.25.103`
- `v0.25.104`
- `v0.25.105`
- `v0.25.106`

## Bloqueio conhecido — Meta

O health de produção de `rota27-whatsapp-inbound` informou `signatureVerification=false`. Portanto `META_APP_SECRET` não estava configurado no runtime no momento deste snapshot. A PR #279 não deve ser mesclada/deployada até que:

1. `META_APP_SECRET` seja configurado no Supabase;
2. `META_WEBHOOK_VERIFY_TOKEN` seja configurado/rotacionado em coordenação com a Meta;
3. o handshake GET seja validado;
4. a função assinada seja implantada;
5. um POST real assinado e status de entrega sejam validados.

## Backup lógico do banco — preparado, ainda não executado

A conexão Supabase disponível nesta sessão não expõe download de backup nem recebe a senha administrativa do banco. Por isso o dump real não foi executado nesta sessão.

A PR #280 contém `scripts/migration/backup-supabase-postgres.ps1`, alinhado ao fluxo oficial do Supabase CLI e preparado para gerar fora do Git:

- `roles.sql`;
- `schema.sql`;
- `data.sql`;
- `history_schema.sql`;
- `history_data.sql`;
- `backup-manifest.json`;
- `SHA256SUMS.txt`.

A connection string é solicitada de forma oculta e não é persistida. O backup real deve ser executado e os hashes validados antes de qualquer cutover.

## Regra de restauração

Para restaurar o código exatamente ao estado pré-Azure, usar o commit:

`5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`

ou a branch:

`archive/pre-azure-migration-v025224-20260909`

# Rota 27 Bodega — Comandas

> Este arquivo foi alterado apenas na branch `migration/private-baseline-v1` para documentar a infraestrutura de migração. A produção permanece em `main`.

## Migração pré-Azure

Ferramentas preparadas nesta branch:

- `scripts/migration/build-private-baseline.ps1` — cria mirror Git, bundle integral, baseline operacional sanitizado e novo root commit;
- `scripts/migration/backup-supabase-postgres.ps1` — gera backup lógico pelo Supabase CLI (`roles.sql`, `schema.sql`, `data.sql`) com hashes SHA-256;
- `docs/PRIVATE-BASELINE-MIGRATION-v1.md` — regras de inclusão/exclusão, rollback e promoção Azure.

## Fonte congelada

- commit de produção: `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`
- restore ref: `archive/pre-azure-migration-v025224-20260909`
- manifesto técnico: `archive/manifest-pre-azure-v025224-20260909`

## Segurança

Nenhum secret deve ser colocado no Git. A PR #279 do webhook Meta permanece separada e bloqueada até `META_APP_SECRET` ser configurado.

Para a documentação completa do produto e do histórico, use o `README.md` da branch `main`; esta branch existe apenas como workspace controlado da migração.

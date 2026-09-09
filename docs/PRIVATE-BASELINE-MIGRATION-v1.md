# Rota 27 — Baseline Privado v1

Data: 2026-09-09

## Objetivo

Criar um novo repositório privado para a fase Azure sem carregar o histórico incremental completo do repositório público e sem perder a capacidade de restauração do sistema atual.

## Fonte congelada

- repositório legado: `AutomatrixHub/rota27`
- commit fonte: `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`
- tree SHA: `b80b1195ad5c5fb7042914a5d746582f1a020168`
- restore ref: `archive/pre-azure-migration-v025224-20260909`
- manifesto: `archive/manifest-pre-azure-v025224-20260909`

## Regra do frontend

O baseline não seleciona patches manualmente. O script lê o `APP_SHELL` do `sw.js` do commit congelado, remove query strings e copia exatamente os arquivos referenciados, acrescentando explicitamente `index.html`, `base-v013.html`, `sw.js`, `manifest.webmanifest` e `VERSION`.

Isso preserva o PWA que está operacional hoje, incluindo dependências indiretas carregadas pelo `roadmap-loader.js`.

## Regra do backend

Copiar somente `supabase/functions` presente em `main` no commit fonte, incluindo `_shared`.

No estado auditado, o código versionado contém:

- `_shared`
- `rota27-access-control`
- `rota27-audit`
- `rota27-birthday-campaign`
- `rota27-birthday-greeting`
- `rota27-device-control`
- `rota27-device-enroll`
- `rota27-event-campaign`
- `rota27-sync`
- `rota27-whatsapp-inbound`
- `rota27-whatsapp`

Funções ACTIVE no Supabase que não possuem mais fonte em `main` são consideradas legado/órfãs e não devem ser recriadas automaticamente no repositório novo. Isso inclui funções de replay/retry administrativo, lab/bootstrap antigos e `rota27-event-delivery-status`. A remoção delas do runtime atual será tratada em etapa própria, depois de comprovar ausência de dependências.

## Banco de dados

O projeto Supabase atual permanece como backend durante a migração. O novo repositório não deve reaplicar automaticamente a cadeia histórica de migrations.

As migrations históricas continuam preservadas no repositório legado e no backup Git. No baseline novo, `supabase/migrations` começa uma nova linha após o corte.

Antes de qualquer migração definitiva de dados ou abandono do backend atual, deve existir um backup lógico oficial do PostgreSQL. O script `scripts/migration/backup-supabase-postgres.ps1` segue o fluxo recomendado pelo Supabase CLI:

- `roles.sql` com `supabase db dump --role-only`;
- `schema.sql` com `supabase db dump`;
- `data.sql` com `supabase db dump --use-copy --data-only` e exclusão das tabelas vetoriais de Storage recomendadas pela documentação;
- `SHA256SUMS.txt` e `backup-manifest.json` sem connection string/senha.

A conexão deve usar preferencialmente o Session Pooler na porta 5432, copiado do painel `Connect` do projeto. O backup deve ser testado em ambiente isolado antes do corte definitivo.

## Secrets

O baseline não copia `.env`, chaves privadas, dumps ou backups. Antes do primeiro commit, o script procura padrões típicos de JWT, token Meta, chave Supabase secreta e chave privada. Se encontrar algo, aborta antes do push.

Variáveis como `SUPABASE_SERVICE_ROLE_KEY`, `ROTA27_DEVICE_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `META_APP_SECRET` e similares devem permanecer apenas como nomes de variáveis no código; os valores são configurados no ambiente.

## Histórico

O script gera dois artefatos separados:

1. `rota27-history-20260909.bundle`: backup integral de refs/histórico do Git legado;
2. `baseline/`: árvore operacional sanitizada inicializada com `git init`, gerando um novo root commit sem herdar o histórico público.

O SHA-256 do bundle e o SHA do root commit são registrados em `artifacts/baseline-verification.txt`.

## Advisors Supabase — preflight 2026-09-09

Security Advisor: nenhum alerta crítico. Foram reportados 6 itens `INFO` do tipo `rls_enabled_no_policy`, correspondentes às 6 tabelas públicas do Rota 27. Isso é coerente com o desenho atual: RLS está habilitado, não há policies públicas e as Edge Functions acessam o banco pelo backend/service role. Não alterar durante a migração sem uma mudança arquitetural explícita.

Performance Advisor: 4 índices reportados como ainda não utilizados:

- `rota27_sync_devices_store_status_seen_idx`
- `rota27_device_enrollments_active_code_idx`
- `rota27_whatsapp_inbound_reply_idx`
- `rota27_whatsapp_inbound_status_idx`

Nenhum deles será removido durante a migração. O banco ainda é pequeno e alguns índices foram introduzidos recentemente; a ausência de uso até agora não justifica mudança estrutural no momento do cutover.

## Publicação do repositório privado

A conexão GitHub disponível nesta sessão permite alterar repositórios existentes, mas não oferece criação de repositório. Por isso a criação do novo repositório privado é feita pelo script via GitHub CLI (`gh`) somente quando explicitamente usado com `-CreatePrivateRepo -PrivateRepo owner/nome`.

O script se recusa a reutilizar um repositório já existente, evitando sobrescrita acidental.

## Azure — ordem de promoção

1. gerar bundle e baseline local;
2. gerar backup lógico oficial do Supabase;
3. validar hashes e secret scan;
4. criar/pushar repositório privado;
5. subir uma URL Azure de preview sem DNS de produção;
6. validar PWA, service worker, sync, enroll, WhatsApp, campanhas e permissões;
7. selecionar aparelhos piloto;
8. somente depois preparar corte de domínio/DNS;
9. manter GitHub Pages e restore ref disponíveis durante a janela de rollback.

## Bloqueios independentes

- PR #279 continua bloqueada até `META_APP_SECRET` ser configurado e o verify token da Meta ser tratado de forma coordenada.
- o backup lógico real ainda precisa ser executado em máquina com Docker + Supabase CLI e acesso à Session Pooler, pois esta sessão não recebe a senha administrativa do banco e não deve armazená-la.

## Rollback

Enquanto o DNS não for alterado, rollback de frontend é imediato: manter GitHub Pages apontando para o repositório legado.

Após corte de DNS, preservar por toda a janela de estabilização:

- o commit `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`;
- a branch `archive/pre-azure-migration-v025224-20260909`;
- o bundle Git com SHA-256 validado;
- os arquivos `roles.sql`, `schema.sql` e `data.sql` do backup criado antes do corte;
- os secrets anteriores disponíveis no cofre/ambiente, nunca no Git.

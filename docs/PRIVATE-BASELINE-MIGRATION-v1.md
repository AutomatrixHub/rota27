# Rota 27 — Baseline Privado v1

Data: 2026-09-09

## Objetivo

Criar um novo repositório privado com histórico Git novo e sanitizado para a migração GitHub Pages → Azure, mantendo o mesmo Supabase e preservando rollback integral do sistema atual.

## Proveniência congelada

O novo baseline **não é uma cópia cega de `main`**. Ele tem duas origens explícitas e verificáveis:

- frontend + backend-base: `AutomatrixHub/rota27` no commit de produção `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72` — v0.25.224;
- overlay de segurança exclusivamente para `supabase/functions/rota27-whatsapp-inbound/index.ts`: commit `82a1f3067ef6660bff834d10dedb7cf4dbfc1979`, isolado na PR #279 e preservado também em `archive/security-overlay-meta-inbound-v025224-20260909`;
- tree de produção: `b80b1195ad5c5fb7042914a5d746582f1a020168`;
- restore ref: `archive/pre-azure-migration-v025224-20260909`;
- manifesto histórico: `archive/manifest-pre-azure-v025224-20260909`.

O overlay de segurança **não altera nem deploya a produção Supabase**. Ele existe apenas para impedir que o novo repositório privado nasça contendo o verify token Meta histórico hardcoded.

## Sanitização do webhook Meta

O `main` v0.25.224 ainda possui um fallback literal de `META_WEBHOOK_VERIFY_TOKEN`. Isso permanece somente no legado enquanto a produção atual não pode ser alterada antes da rotação coordenada com a Meta.

Antes do primeiro commit do repositório privado, `build-private-baseline.ps1`:

1. copia o backend-base do SHA de produção;
2. confirma que o SHA de segurança existe no clone;
3. substitui somente `rota27-whatsapp-inbound/index.ts` pela versão sanitizada;
4. confirma que `DEFAULT_VERIFY_TOKEN` e o marcador histórico não existem no arquivo final;
5. confirma que a função usa `META_WEBHOOK_VERIFY_TOKEN` e `META_APP_SECRET` por ambiente;
6. grava `security-overlay-verification.txt` fora do Git novo.

O deploy dessa versão continua bloqueado até os secrets da Meta estarem configurados e o verify token ser rotacionado de forma coordenada.

## Regra do frontend

O baseline não escolhe patches manualmente. O builder lê o `APP_SHELL` do `sw.js` do commit congelado, remove query strings e copia os arquivos realmente usados pelo PWA, acrescentando explicitamente:

- `index.html`;
- `base-v013.html`;
- `sw.js`;
- `manifest.webmanifest`;
- `VERSION`.

A arquitetura legada é preservada. `base-v013.html` não é reescrito. A meta de compatibilidade `rota27-version=0.22.0` continua intacta enquanto essa arquitetura existir.

A portabilidade de caminho foi verificada: manifest, ícones e Service Worker usam caminhos relativos. Referências ao antigo `/rota27/` encontradas no commit fonte pertencem a documentação/histórico, não à superfície operacional copiada.

## Regra do backend

O backend-base copia somente `supabase/functions` presente em `main`, incluindo `_shared`, e depois aplica o overlay sanitizado descrito acima.

Funções versionadas atuais:

- `_shared`;
- `rota27-access-control`;
- `rota27-audit`;
- `rota27-birthday-campaign`;
- `rota27-birthday-greeting`;
- `rota27-device-control`;
- `rota27-device-enroll`;
- `rota27-event-campaign`;
- `rota27-sync`;
- `rota27-whatsapp-inbound`;
- `rota27-whatsapp`.

As Edge Functions ACTIVE que não possuem mais fonte em `main` não são recriadas automaticamente no novo repositório. Seus fontes atuais foram preservados separadamente para recuperação. A maioria responde `410/disabled`; `rota27-event-delivery-status` ainda é funcional, mas não foi encontrada chamada operacional no frontend atual. Nenhuma delas será removida do runtime durante a migração inicial.

## Banco de dados

O projeto Supabase atual permanece como backend. Não recriar nem migrar o Supabase nesta fase.

O backup lógico deve ser executado antes do cutover e produzir:

- `roles.sql`;
- `schema.sql`;
- `data.sql`;
- `history_schema.sql`;
- `history_data.sql`;
- `SHA256SUMS.txt`;
- `backup-manifest.json`.

O script `backup-supabase-postgres.ps1` usa o fluxo `supabase db dump`, valida que a connection string pertence ao projeto esperado, aceita Session Pooler 5432 ou conexão direta 5432 e não persiste senha/connection string.

Por padrão o backup é criado em `%LOCALAPPDATA%\Rota27\Backups\...`, fora do repositório. O script recusa um destino dentro do Git atual e avisa quando um destino customizado parece estar sob OneDrive.

`data.sql` deve ser tratado como **arquivo sensível**: a tabela `public.rota27_automation_credentials` possui uma coluna `token`. O valor dessa coluna não foi lido durante o preflight, mas estará incluído no dump de dados para permitir recuperação completa.

As migrations históricas ficam preservadas no repositório legado, no bundle integral e no backup lógico. O novo repo inicia uma nova linha em `supabase/migrations`; arquivos `.sql` de novas migrations permanecem permitidos normalmente.

Preflight adicional em 09/09/2026:

- PostgreSQL 17, projeto `ACTIVE_HEALTHY`, região `sa-east-1`;
- Supabase Auth: 0 usuários, 0 identidades, 0 sessões;
- Supabase Storage: 0 buckets, 0 objetos;
- Vault: 0 secrets;
- nenhuma migration registrada contém referência a `auth.` ou `storage.`;
- nenhuma policy customizada foi encontrada em `auth`/`storage`;
- os triggers visíveis em Storage apontam para funções internas do próprio schema `storage`.

Não existe hoje uma camada adicional de usuários Auth ou binários de Storage a transportar, e não foi encontrada customização explícita de Auth/Storage no histórico do projeto. Isso reduz o risco, mas não substitui o teste de restauração em ambiente isolado.

### Assinatura do banco antes do backup

Contagens exatas observadas no preflight de 09/09/2026:

- `public.rota27_automation_credentials`: 1;
- `public.rota27_device_enrollments`: 5;
- `public.rota27_sync_devices`: 18;
- `public.rota27_sync_events`: 2784;
- `public.rota27_whatsapp_inbound`: 44;
- `public.whatsapp_message_log`: 1702;
- `supabase_migrations.schema_migrations`: 28.

Esses números são uma fotografia de referência, não valores que o restore deva forçar. No momento do backup real as contagens podem ter aumentado; a validação deve verificar coerência com o banco daquele instante.

### Inventário de recuperação fora do dump principal

Extensões instaladas no projeto em 09/09/2026:

- `pg_cron` 1.6.4;
- `pg_net` 0.20.4;
- `pg_stat_statements` 1.11;
- `pgcrypto` 1.3;
- `plpgsql` 1.0;
- `supabase_vault` 0.3.1;
- `uuid-ossp` 1.1.

Existe 1 job `pg_cron` ativo:

- job: `rota27-birthday-greeting-0930`;
- schedule armazenado: `30 12 * * *`;
- banco/usuário: `postgres` / `postgres`;
- usa `net.http_post` e referencia `rota27-birthday-greeting`;
- comprimento do comando: 529 caracteres;
- SHA-256 do comando, sem expor seu conteúdo: `717166ebc3f9ac51903c81663149faffa59df4ae3b7df2e394c2f5b0a6962c22`.

Não presumir que um dump lógico comum recriará corretamente configuração gerenciada de extensões como `pg_cron`. Em um cenário de disaster recovery, recriar primeiro as extensões compatíveis no ambiente de destino e restaurar/reconfigurar o job de aniversário de forma controlada. O comando do cron deve ser preservado somente em artefato privado/sensível de recuperação, nunca em documentação pública.

## Secrets

O baseline não copia `.env`, chaves privadas, dumps ou backups.

A varredura pré-commit bloqueia padrões de:

- chave privada;
- token Meta com aparência de access token;
- `sb_secret_*`;
- JWT de três partes;
- marcador do verify token histórico identificado na auditoria.

A varredura dirigida confirmou que `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_ACCESS_TOKEN`, `META_APP_SECRET` e `ROTA27_DEVICE_TOKEN` aparecem no código operacional como leituras de ambiente. O fallback literal relevante identificado foi o verify token antigo do inbound e é removido pelo overlay.

Valores de secrets e credenciais Azure/deploy nunca entram no Git.

## Histórico Git

O builder gera:

1. `git clone --mirror` do legado;
2. `rota27-history-20260909.bundle` com `--all`;
3. SHA-256 do bundle;
4. árvore sanitizada `baseline/`;
5. `git init` novo;
6. root commit sem ancestrais do repositório público.

O destino padrão fica em `%LOCALAPPDATA%\Rota27\Migration\ROTA27-PRE-AZURE-<timestamp>`. O builder recusa um destino localizado dentro do repositório Git atual. O bundle histórico e seus hashes ficam fora do novo Git e devem ser armazenados em local privado seguro.

## Kit preservado no novo repo

O root commit sanitizado inclui apenas o kit atual necessário para continuidade da migração:

- `ops/migration/build-private-baseline.ps1`;
- `ops/migration/backup-supabase-postgres.ps1`;
- `ops/migration/provision-azure-preview.ps1`;
- `ops/migration/prepare-azure-custom-domain.ps1`;
- `docs/migration/PRIVATE-BASELINE-MIGRATION-v1.md`;
- `docs/migration/PWA-PILOT-CUTOVER-RUNBOOK-v1.md`;
- `staticwebapp.config.json`.

Branches, tags, PRs, releases, handoffs e documentação histórica do repo público não são carregados para o novo histórico.

## Advisors Supabase

Security Advisor: nenhum alerta crítico. Há 6 itens INFO `rls_enabled_no_policy`, coerentes com o desenho atual server-side/service-role. Não mudar durante o cutover.

Performance Advisor: 4 índices ainda sem uso observado:

- `rota27_sync_devices_store_status_seen_idx`;
- `rota27_device_enrollments_active_code_idx`;
- `rota27_whatsapp_inbound_reply_idx`;
- `rota27_whatsapp_inbound_status_idx`.

Nenhum índice será removido durante a migração.

## Estado dos aparelhos antes do piloto

Em 09/09/2026 havia 3 aparelhos ativos. Todos estavam em `release_version=0.25.224`, `last_cursor=9303`, igual ao `latest_seq=9303` do servidor, e com telemetria WhatsApp `pending_count=0` / `failed_count=0`.

Papéis:

- iPhone: `owner` — primeiro piloto;
- Edge: `developer`;
- Windows: `staff`.

O estado remoto não substitui o preflight local de outboxes.

## Azure Static Web Apps

`staticwebapp.config.json` mantém revalidação dos entrypoints e evita cache prolongado do Service Worker.

O hostname `*.azurestaticapps.net` é **somente para homologação técnica**. Não migrar o iPhone operacional para ele, pois o domínio final será outra origem.

O primeiro PWA persistente deve ser instalado diretamente em:

`https://rota27.automatrixhub.com.br`

## Domínio final sem downtime

Depois de validar o hostname Azure padrão:

1. executar `prepare-azure-custom-domain.ps1` em dry-run;
2. confirmar se `rota27.automatrixhub.com.br` já possui A/AAAA/CNAME;
3. preparar no Azure a validação `dns-txt-token`;
4. publicar primeiro o TXT `_dnsauth.rota27.automatrixhub.com.br` no provedor DNS;
5. aguardar o domínio ficar validado no Azure;
6. somente depois alterar o CNAME do subdomínio para o hostname padrão da Static Web App;
7. validar TLS, `/sw.js` e `/manifest.webmanifest` no domínio final.

O script não altera DNS automaticamente. O GitHub Pages antigo continua funcionando em `automatrixhub.github.io/rota27/` durante todo o piloto.

## Re-enrollment

`rota27-device-enroll` permite `claim` por código sem master token. O novo aparelho recebe sua própria credencial derivada.

Não copiar manualmente `deviceToken`, localStorage, IndexedDB, Cache Storage ou Service Worker.

O QR gerado no PWA antigo usa `location.href` e aponta para a origem antiga. No primeiro piloto usar o **código manual de 8 dígitos** diretamente no domínio final.

## Ordem executiva

1. bundle histórico + hashes;
2. baseline sanitizado + overlay verificado;
3. backup lógico Supabase + hashes;
4. preservar inventário de extensões/cron e validar artefatos sensíveis fora do Git;
5. criar novo repo privado e push do root novo;
6. Azure Static Web Apps técnico;
7. validação TXT do domínio final;
8. CNAME somente após validação;
9. validar domínio final/TLS;
10. manter Pages antigo como fallback;
11. promover temporariamente a PR #281 para obter preflight local no PWA antigo;
12. iPhone owner: todas as outboxes = 0 e cursor convergente;
13. re-enrollment direto no domínio final por código manual;
14. homologar mantendo PWA antigo instalado;
15. migrar Edge/developer;
16. migrar Windows/staff;
17. retirar Pages somente em fase futura.

## Bloqueios independentes

- PR #279: sem deploy até `META_APP_SECRET` e `META_WEBHOOK_VERIFY_TOKEN` estarem coordenados;
- PR #281: não publicar enquanto Azure + domínio final não estiverem homologados;
- backup real, repo privado real e Azure real exigem credenciais locais/CLI e ainda não foram executados.

## Rollback

Durante a janela de estabilização preservar:

- commit de produção `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`;
- branch `archive/pre-azure-migration-v025224-20260909`;
- branch `archive/security-overlay-meta-inbound-v025224-20260909`;
- bundle histórico + SHA-256;
- cinco arquivos do backup lógico + hashes;
- inventário privado de extensões/cron;
- pacote privado de Edge Functions órfãs;
- secrets no cofre/ambiente;
- PWA antigo instalado nos aparelhos ainda não consolidados.

Se o novo PWA falhar, parar de operar nele e voltar ao PWA GitHub Pages. Como ambos usam o mesmo Supabase, eventos já enviados pelo domínio novo podem ser sincronizados pelo antigo; rollback de frontend não exige restauração do banco.

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

Isso preserva o PWA operacional, incluindo dependências indiretas carregadas pelo `roadmap-loader.js`.

A portabilidade de caminho foi verificada: `manifest.webmanifest` usa `id`, `start_url`, `scope` e ícones relativos (`./`), e `base-v013.html` registra o Service Worker como `./sw.js`. Referências a `/rota27/` encontradas no commit fonte pertencem a documentação/histórico, não à superfície operacional copiada.

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

Funções ACTIVE no Supabase que não possuem mais fonte em `main` são legado/órfãs e não devem ser recriadas automaticamente no repositório novo. Os fontes atuais desses endpoints foram preservados separadamente para recuperação. A maioria já responde `410/disabled`; `rota27-event-delivery-status` ainda é funcional, mas não foi encontrada chamada operacional no frontend atual. Nenhuma função órfã será removida durante a migração inicial.

## Banco de dados

O projeto Supabase atual permanece como backend durante a migração. O novo repositório não deve reaplicar automaticamente a cadeia histórica de migrations.

As migrations históricas continuam preservadas no repositório legado e no backup Git. No baseline novo, `supabase/migrations` começa uma nova linha após o corte.

O script `scripts/migration/backup-supabase-postgres.ps1` segue o fluxo lógico do Supabase CLI e deve produzir:

- `roles.sql`;
- `schema.sql`;
- `data.sql`;
- `history_schema.sql` para a estrutura de `supabase_migrations`;
- `history_data.sql` para o histórico de migrations;
- `SHA256SUMS.txt` e `backup-manifest.json` sem connection string/senha.

A conexão deve usar preferencialmente o Session Pooler na porta 5432, copiado do painel `Connect` do projeto. O backup deve ser testado em ambiente isolado antes de qualquer retirada do backend atual.

No preflight de 09/09/2026 também foi confirmado:

- 0 usuários, 0 identidades e 0 sessões no Supabase Auth;
- 0 buckets e 0 objetos no Supabase Storage.

Portanto não existe atualmente uma camada adicional de usuários Auth ou arquivos de Storage a transportar nesta migração.

## Secrets

O baseline não copia `.env`, chaves privadas, dumps ou backups. Antes do primeiro commit, o builder procura padrões típicos de JWT, token Meta, chave Supabase secreta e chave privada. Se encontrar algo, aborta antes do push.

Variáveis como `SUPABASE_SERVICE_ROLE_KEY`, `ROTA27_DEVICE_TOKEN`, `WHATSAPP_ACCESS_TOKEN`, `META_APP_SECRET` e similares permanecem apenas como nomes de variáveis no código; seus valores ficam no ambiente protegido.

## Histórico

O builder gera dois artefatos separados:

1. `rota27-history-20260909.bundle`: backup integral de refs/histórico do Git legado;
2. `baseline/`: árvore operacional sanitizada inicializada com `git init`, gerando novo root commit sem herdar o histórico público.

O SHA-256 do bundle e o SHA do root commit são registrados em `artifacts/baseline-verification.txt`.

## Advisors Supabase — preflight 2026-09-09

Security Advisor: nenhum alerta crítico. Foram reportados 6 itens `INFO` do tipo `rls_enabled_no_policy`, correspondentes às 6 tabelas públicas do Rota 27. Isso é coerente com o desenho atual: RLS está habilitado, não há policies públicas e as Edge Functions acessam o banco pelo backend/service role. Não alterar durante a migração sem mudança arquitetural explícita.

Performance Advisor: 4 índices reportados como ainda não utilizados:

- `rota27_sync_devices_store_status_seen_idx`
- `rota27_device_enrollments_active_code_idx`
- `rota27_whatsapp_inbound_reply_idx`
- `rota27_whatsapp_inbound_status_idx`

Nenhum será removido durante a migração.

## Estado dos aparelhos antes do piloto

Em 09/09/2026 o servidor registrava 3 aparelhos ativos. Todos estavam em `release_version=0.25.224`, com `last_cursor=9303`, exatamente igual ao `latest_seq=9303` do backend, e todos reportavam WhatsApp com `pending_count=0` e `failed_count=0`.

O iPhone ativo é o aparelho `owner`, portanto é o primeiro piloto recomendado. Os demais ativos são Edge/developer e Windows/staff.

Esse estado remoto não substitui o preflight local: antes da troca de origem cada aparelho deve comprovar também fila principal, `state.whatsappOutbox` e todas as outboxes de domínio em zero.

## Publicação do repositório privado

A conexão GitHub disponível nesta sessão permite alterar repositórios existentes, mas não oferece criação de repositório. A criação do novo privado é feita pelo builder via GitHub CLI (`gh`) somente quando explicitamente usado com `-CreatePrivateRepo -PrivateRepo owner/nome`.

O script se recusa a reutilizar um repositório já existente.

## Azure Static Web Apps — preview isolado

O alvo é Azure Static Web Apps, pois o frontend atual é estático e não requer build. O baseline recebe `staticwebapp.config.json` na raiz. A configuração:

- desabilita cache prolongado em `sw.js`;
- força revalidação de `index.html`, `assets/roadmap-loader.js` e `manifest.webmanifest`;
- define MIME `application/manifest+json` para `.webmanifest`;
- adiciona headers básicos de segurança;
- não adiciona CSP restritiva nesta fase;
- não usa `navigationFallback`, para não mascarar arquivo ausente.

O script `scripts/migration/provision-azure-preview.ps1` trabalha em dry-run por padrão. Somente `-Apply` autoriza criação do resource group e da Static Web App. O SKU padrão é `Free`; `Standard` exige `-ConfirmPaidSku`.

O hostname `*.azurestaticapps.net` é **somente de homologação técnica**. Nele devem ser testados HTTP, carregamento, service worker, offline, navegação e chamadas ao mesmo Supabase usando dispositivos descartáveis/de teste.

**Não instalar nem re-enrollar o iPhone operacional nesse hostname.** `*.azurestaticapps.net` e `rota27.automatrixhub.com.br` são origens distintas; fazer o piloto no hostname temporário criaria uma migração intermediária desnecessária.

## Domínio final antes do PWA piloto

Depois que o hostname Azure padrão estiver aprovado, configurar `rota27.automatrixhub.com.br` na mesma Static Web App e validar o domínio/TLS.

O GitHub Pages antigo continua em `https://automatrixhub.github.io/rota27/` e pode permanecer funcionando normalmente durante toda essa etapa, pois é outro hostname. Não criar redirect obrigatório do Pages durante o piloto.

O primeiro re-enrollment operacional deve ocorrer **diretamente no domínio final**.

## Ordem de promoção corrigida

1. gerar bundle e baseline local;
2. gerar backup lógico oficial do Supabase;
3. validar hashes e secret scan;
4. criar/pushar repositório privado;
5. executar provisionador Azure em dry-run;
6. criar Static Web App isolada;
7. homologar tecnicamente `*.azurestaticapps.net` sem migrar aparelho operacional;
8. configurar/validar `rota27.automatrixhub.com.br` e TLS;
9. manter GitHub Pages antigo funcionando em paralelo;
10. somente após o domínio final estar aprovado, disponibilizar o preflight local de aparelho;
11. no PWA antigo, garantir todas as outboxes = 0 e cursor convergente;
12. migrar primeiro o iPhone `owner` diretamente para o domínio final por código manual;
13. validar o novo PWA mantendo o antigo como fallback;
14. migrar Edge/developer e Windows/staff um por vez;
15. retirar o Pages somente em fase futura, após janela de estabilização.

O procedimento detalhado está em `docs/PWA-PILOT-CUTOVER-RUNBOOK-v1.md`.

## Re-enrollment

O fluxo `rota27-device-enroll` permite `claim` sem master token. O novo aparelho recebe credencial própria e faz bootstrap da base compartilhada. Não copiar manualmente `deviceToken`.

O convite por QR gerado na origem antiga incorpora `location.href`; portanto ele aponta de volta para o GitHub Pages. Para o primeiro piloto no domínio novo, usar o **código manual de 8 dígitos** criado pelo aparelho owner.

## Bloqueios independentes

- PR #279 continua bloqueada até `META_APP_SECRET` ser configurado e o verify token da Meta ser tratado de forma coordenada.
- o backup lógico real ainda precisa ser executado em máquina com Docker + Supabase CLI e acesso à Session Pooler;
- o Azure real ainda depende de uma sessão autenticada da Azure CLI;
- a candidata local de preflight v0.25.225 não deve ser promovida ao Pages antes de Azure + domínio final estarem validados.

## Rollback

Antes e durante o piloto, manter o PWA antigo instalado e seu device antigo ativo.

Se o PWA novo falhar, parar de operar nele e voltar ao PWA antigo. Como ambos usam o mesmo Supabase, eventos já enviados pelo novo domínio permanecem disponíveis para o antigo sincronizar; não é necessário restaurar banco apenas para rollback de frontend.

Preservar durante toda a janela:

- commit `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`;
- branch `archive/pre-azure-migration-v025224-20260909`;
- bundle Git com SHA-256;
- os cinco arquivos do backup lógico Supabase;
- pacote privado dos fontes de Edge Functions órfãs;
- secrets no cofre/ambiente, nunca no Git.

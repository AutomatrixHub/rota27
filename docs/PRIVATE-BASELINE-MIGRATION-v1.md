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

A portabilidade de caminho também foi verificada: `manifest.webmanifest` usa `id`, `start_url`, `scope` e ícones relativos (`./`), e `base-v013.html` registra o Service Worker como `./sw.js`. A busca por `/rota27/` no commit fonte encontrou referências de documentação/histórico, não uma dependência operacional do PWA. Assim, o preview pode ser servido na raiz do hostname Azure sem reescrever o escopo do aplicativo.

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

## Azure Static Web Apps — preview isolado

O alvo de preview é Azure Static Web Apps, porque o frontend atual é estático e não requer etapa de build. O baseline recebe `staticwebapp.config.json` na raiz. A configuração:

- desabilita cache prolongado em `sw.js`;
- força revalidação de `index.html`, `assets/roadmap-loader.js` e `manifest.webmanifest`;
- define MIME `application/manifest+json` para `.webmanifest`;
- adiciona `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` e `X-Frame-Options: DENY`;
- não adiciona CSP nesta fase, porque o legado contém scripts inline e integrações externas que precisam ser inventariadas antes de uma política restritiva;
- não usa `navigationFallback`, de modo que arquivo ausente continue retornando erro real em vez de ser mascarado por `index.html`.

O script `scripts/migration/provision-azure-preview.ps1` trabalha em dry-run por padrão. Somente `-Apply` autoriza criação do resource group e da Static Web App.

Para o piloto, o padrão é SKU `Free`. O SKU `Standard` exige também `-ConfirmPaidSku`. O script cria um recurso Azure isolado sem vincular DNS e publica diretamente com o deployment token obtido pela Azure CLI; o token fica apenas em variável de ambiente temporária e não é gravado em arquivos.

A publicação usa o ambiente `production` somente dentro do recurso chamado de preview. Isso fornece o hostname padrão `azurestaticapps.net` para homologação, sem qualquer relação com o domínio de produção do Rota 27. O script testa `/`, `/index.html`, `/sw.js` e `/manifest.webmanifest` e registra resultado sem token fora do repositório baseline.

A região padrão do script é `eastus2`, mas deve ser alterada se a assinatura tiver Azure Policy ou disponibilidade regional diferente. Azure Static Web Apps distribui os ativos estáticos globalmente; a região selecionada se relaciona à infraestrutura gerenciada/staging do serviço.

## Azure — ordem de promoção

1. gerar bundle e baseline local;
2. gerar backup lógico oficial do Supabase;
3. validar hashes e secret scan;
4. criar/pushar repositório privado;
5. executar o provisionador Azure primeiro sem `-Apply` e revisar o plano;
6. criar a Static Web App isolada de preview com `-Apply`;
7. validar os probes HTTP e abrir a URL `azurestaticapps.net` em desktop e Android;
8. homologar instalação PWA, atualização do Service Worker, operação offline, sync, enrollment, permissões, WhatsApp e campanhas;
9. selecionar aparelhos piloto;
10. somente depois preparar corte de domínio/DNS;
11. manter GitHub Pages e restore ref disponíveis durante toda a janela de rollback.

## Bloqueios independentes

- PR #279 continua bloqueada até `META_APP_SECRET` ser configurado e o verify token da Meta ser tratado de forma coordenada.
- o backup lógico real ainda precisa ser executado em máquina com Docker + Supabase CLI e acesso à Session Pooler, pois esta sessão não recebe a senha administrativa do banco e não deve armazená-la.
- o Azure preview real ainda depende de uma sessão autenticada da Azure CLI (`az login`); esta sessão do ChatGPT não possui acesso à assinatura Azure do usuário.

## Rollback

Enquanto o DNS não for alterado, rollback de frontend é imediato: manter GitHub Pages apontando para o repositório legado.

Após corte de DNS, preservar por toda a janela de estabilização:

- o commit `5d009bc10d6d5c0095cd70d21dfcf5f7d995dc72`;
- a branch `archive/pre-azure-migration-v025224-20260909`;
- o bundle Git com SHA-256 validado;
- os arquivos `roles.sql`, `schema.sql` e `data.sql` do backup criado antes do corte;
- os secrets anteriores disponíveis no cofre/ambiente, nunca no Git.

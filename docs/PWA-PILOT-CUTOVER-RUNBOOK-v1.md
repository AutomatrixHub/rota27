# Rota 27 — Runbook PWA piloto e virada

Data: 2026-09-09

## Princípio central

O GitHub Pages antigo e o Azure podem coexistir porque usam hostnames diferentes. A virada não exige desligar `https://automatrixhub.github.io/rota27/`.

O hostname padrão `*.azurestaticapps.net` é apenas ambiente de homologação técnica. **Não migrar o iPhone/gerente para esse hostname**, porque o domínio final `https://rota27.automatrixhub.com.br` será outra origem e exigiria um segundo re-enrollment.

A sequência correta é:

1. validar o Azure no hostname padrão;
2. configurar e validar o domínio final no Azure;
3. manter o GitHub Pages antigo funcionando;
4. instalar/vincular o primeiro PWA real diretamente em `https://rota27.automatrixhub.com.br`;
5. migrar aparelho por aparelho;
6. decidir explicitamente o plano Azure de produção antes de retirar o fallback;
7. retirar o Pages somente em etapa futura.

## Estado verificado antes do piloto

Em 09/09/2026, o backend registrava 3 aparelhos ativos. Todos estavam em `release_version=0.25.224`, com cursor remoto `9303`, igual ao `latest_seq=9303` do servidor. Todos reportavam WhatsApp com `pending_count=0` e `failed_count=0`.

O iPhone ativo está com papel `owner`, portanto é o aparelho indicado para primeiro piloto controlado. Os outros dois aparelhos ativos são Windows/staff e Edge/developer.

Supabase adicional:

- PostgreSQL 17, projeto `ACTIVE_HEALTHY`;
- 0 usuários/identidades/sessões no Supabase Auth;
- 0 buckets e 0 objetos no Supabase Storage;
- 0 secrets no Vault;
- 1 job `pg_cron` ativo para a saudação de aniversário, preservado no inventário de recuperação.

Isso elimina necessidade de migração separada de Auth ou objetos binários de Storage nesta fase, mas o cron deve permanecer inventariado para disaster recovery.

## Gate 0 — backups obrigatórios

Antes de qualquer re-enrollment real:

- gerar `git bundle --all` do repositório legado e validar SHA-256;
- gerar baseline sanitizado com root commit novo;
- gerar backup lógico Supabase com `roles.sql`, `schema.sql`, `data.sql`, `history_schema.sql` e `history_data.sql`;
- validar SHA-256 dos cinco arquivos;
- preservar o inventário de extensões/cron;
- manter o pacote privado das Edge Functions órfãs;
- tratar `data.sql` como sensível, pois inclui a tabela de credencial de automação;
- não armazenar senha, connection string, service role ou tokens em Git.

Sem esse gate aprovado, não prosseguir.

## Gate 1 — Azure no hostname padrão

Publicar o baseline no recurso Azure Static Web Apps isolado e validar no hostname `*.azurestaticapps.net`:

- `/`, `/index.html`, `/sw.js` e `/manifest.webmanifest` retornam HTTP 200;
- `sw.js` não recebe cache prolongado;
- manifest recebe MIME correto;
- interface abre sem 404;
- navegação principal funciona;
- service worker instala e atualiza;
- modo offline abre o app shell;
- chamadas às Edge Functions do mesmo Supabase funcionam;
- nenhuma alteração é feita no GitHub Pages antigo.

Neste gate, usar desktop/Android descartável para testes. Não mover o iPhone operacional para esse hostname.

### Plano Azure durante o piloto

O provisionador usa **Free por padrão** e exige confirmação explícita para Standard.

O plano Free atualmente oferece domínio personalizado e certificado SSL, portanto é suficiente para a homologação técnica e para um piloto operacional controlado com GitHub Pages ainda disponível como fallback. Porém o Free não possui SLA e é posicionado pela Microsoft para projetos pessoais/hobby; Standard é o plano indicado para cargas de produção em geral.

Assim:

- não assumir custo Standard apenas para homologar;
- não exigir upgrade antes do primeiro piloto controlado;
- **não retirar o GitHub Pages nem declarar o Azure como único frontend de produção sem uma decisão explícita Free versus Standard**;
- se o Rota 27 passar a depender exclusivamente do Azure para operação diária, avaliar Standard antes da retirada definitiva do fallback, considerando SLA, tráfego e criticidade operacional.

## Gate 2 — domínio final

Depois do hostname Azure estar validado, configurar `rota27.automatrixhub.com.br` na mesma Static Web App.

Para migração sem interrupção, validar primeiro a propriedade do domínio por DNS/TXT quando aplicável e somente então apontar o registro do subdomínio para o hostname Azure. O GitHub Pages antigo continua em `automatrixhub.github.io/rota27/` e não é afetado por esse CNAME/TXT.

Critérios:

- `https://rota27.automatrixhub.com.br` abre o mesmo build validado no Azure;
- TLS válido;
- `/sw.js` e `/manifest.webmanifest` funcionam no domínio final;
- nenhuma configuração faz redirect automático do GitHub Pages antigo para o domínio novo durante o piloto.

## Gate 3 — preflight do aparelho antigo

Antes de migrar cada aparelho, operar somente no PWA antigo do GitHub Pages e garantir:

- internet disponível;
- release esperada carregada;
- sincronização habilitada e inicializada;
- nenhuma mensagem de erro de sync;
- cursor local igual ao latest seq do servidor;
- fila principal = 0;
- `state.whatsappOutbox` = 0;
- todas as filas de domínio = 0;
- nenhum conflito pendente para revisão.

As filas de domínio conhecidas são:

- `rota27_cancel_outbox_v0151`;
- `rota27_v017_domain_outbox_v1`;
- `rota27_v017_manager_outbox_v1`;
- `rota27_v019_turn_outbox_v1`;
- `rota27_v021_stock_outbox_v1`;
- `rota27_v022_purchase_outbox_v1`;
- `rota27_v023_inventory_outbox_v1`;
- `rota27_v0255_fixed_copy_outbox_v1`;
- `rota27_v02512_receivable_outbox_v1`;
- `rota27_v02537_internal_marker_outbox_v1`;
- `rota27_v02573_cancel_whatsapp_outbox_v1`.

A candidata v0.25.225, preparada separadamente, adiciona um diagnóstico local que verifica essas filas e qualquer outra chave `outbox` encontrada, sem mostrar conteúdo nem token. Ela **não deve ser promovida antes do Azure e do domínio final estarem validados**.

## Gate 4 — iPhone owner piloto

Com o PWA antigo ainda instalado e o preflight retornando **APTO PARA MIGRAÇÃO**:

1. no PWA antigo, abrir Painel → Aparelhos sincronizados → Autorizar novo aparelho;
2. criar convite temporário com papel `owner`;
3. anotar o código manual de 8 dígitos;
4. **não usar o QR Code gerado no domínio antigo**, porque o link usa `location.href` e apontará para o GitHub Pages;
5. abrir `https://rota27.automatrixhub.com.br` no Safari do mesmo iPhone;
6. adicionar à Tela de Início com nome distinguível, por exemplo `Rota 27 Novo` durante o piloto;
7. abrir o novo PWA e informar o código manual;
8. o novo domínio deve executar `claim` sem master token, receber credencial própria do aparelho, baixar snapshot inicial + replay de eventos e gravar seu novo estado local;
9. manter o PWA antigo instalado e o aparelho antigo ACTIVE como fallback.

Não copiar manualmente `deviceToken`, `localStorage`, IndexedDB, Cache Storage ou Service Worker.

## Gate 5 — homologação do iPhone novo

No PWA do domínio final:

- confirmar papel `owner` e permissões;
- confirmar comandas abertas e histórico;
- confirmar cardápio/categorias;
- confirmar clientes;
- confirmar estoque/compras/inventário;
- confirmar recebíveis;
- confirmar WhatsApp configurado;
- abrir gestão de aparelhos e confirmar que o novo device aparece ACTIVE;
- confirmar que o cursor converge ao latest seq;
- fechar e reabrir o PWA;
- testar abertura offline do app shell;
- voltar online e confirmar nova sincronização.

Durante o piloto, evitar operação simultânea no PWA antigo e no novo. O antigo existe apenas como fallback.

## Rollback do aparelho piloto

Se o novo PWA apresentar qualquer erro:

1. parar de operar no novo PWA;
2. não apagar nenhum dos dois PWAs;
3. reabrir o PWA antigo do GitHub Pages;
4. sincronizar e confirmar cursor atualizado;
5. continuar a operação no antigo;
6. manter o novo device registrado para diagnóstico ou removê-lo somente depois de entender a falha.

Como ambos os frontends usam o mesmo Supabase, eventos que o novo PWA já tenha enviado ao servidor continuam disponíveis para o PWA antigo baixar. O rollback não requer restaurar banco.

## Gate 6 — demais aparelhos

Após o iPhone owner estar validado, repetir o processo um por vez:

1. preflight no PWA antigo;
2. outboxes = 0;
3. gerar convite a partir do owner;
4. instalar diretamente o domínio final;
5. claim com código manual;
6. validar papel/permissões e sincronização;
7. manter PWA antigo como fallback;
8. somente então passar ao próximo aparelho.

Ordem sugerida no estado atual:

1. iPhone owner;
2. Edge developer;
3. Windows staff.

## Gate 7 — estabilização, plano de produção e retirada futura do Pages

Durante a estabilização:

- GitHub Pages permanece publicado;
- restore ref e bundle histórico permanecem preservados;
- nenhum redirect obrigatório do Pages para o domínio novo;
- devices antigos podem permanecer ACTIVE durante a janela inicial de rollback;
- depois de cada aparelho consolidado no domínio final, o device antigo correspondente pode ser aposentado de forma controlada.

Antes de retirar o Pages, registrar a decisão do plano Azure:

- manter Free somente se os limites, ausência de SLA e criticidade forem aceitáveis; ou
- promover a Static Web App para Standard antes de torná-la o único frontend operacional.

Somente quando nenhum aparelho operacional depender mais do GitHub Pages, nenhum fallback antigo for necessário, os backups estiverem validados e a decisão de plano Azure estiver fechada deve ser planejada a retirada definitiva do Pages e o arquivamento do repositório público legado.

## Bloqueios paralelos

A migração de hosting não depende de trocar o Supabase. O mesmo projeto e os mesmos dados permanecem em uso.

A PR de segurança do `rota27-whatsapp-inbound` permanece um trabalho separado: não implantar a exigência de assinatura Meta até `META_APP_SECRET` e `META_WEBHOOK_VERIFY_TOKEN` estarem configurados/rotacionados de forma coordenada.

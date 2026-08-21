# Rota 27 Bodega — Documento de Contexto / Handoff

**Projeto:** Rota 27 — Comandas  
**Repositório:** `AutomatrixHub/rota27`  
**Produção:** `https://automatrixhub.github.io/rota27/`  
**Baseline atual:** **v0.15.1**  
**Data do handoff:** 21/08/2026  
**Objetivo deste documento:** permitir que outro chat/assistente continue o projeto sem reconstruir o histórico.

---

## 1. Resumo executivo

O Rota 27 é um aplicativo mobile-first para comandas da **Rota 27 Bodega**, em Jardim Camburi/ES.

O fluxo central é simples:

**abrir comanda → lançar produtos → conferir/editar → fechar e informar pagamento**

Regras operacionais importantes:

- sem taxa de 10%;
- sem impressão;
- PWA/offline-first;
- uso em iPhone, Android e desktop;
- sincronização multidispositivo;
- WhatsApp opcional mediante consentimento;
- o atendente não deve depender de telas técnicas para trabalhar.

A versão **v0.15.1** está em produção e foi validada em desktops, Android físico, laboratório público e iPhone/PWA. O sistema passou por teste de stress multidispositivo, smoke test, gate de produção, envio real de WhatsApp e validação do cancelamento seguro de comanda.

Neste momento, a v0.15.1 está **congelada para piloto em ambiente real**. Durante o turno, só devem ser publicadas correções P0/P1 realmente necessárias.

---

## 2. Estado atual do GitHub

Repositório:

`AutomatrixHub/rota27`

Branch de produção:

`main`

HEAD da `main` no fechamento deste handoff:

`c73e6013bbe6f50cf869a79ccc9a9636423395e0`

Commit funcional da v0.15.1 promovida:

`08ac9b8bd2db098dae22d74e20bc1de9545fc615`

PR principal da hotfix:

- **PR #7 — Rota 27 v0.15.1 — WhatsApp no iPhone + cancelar comanda**
- status: merged
- merge commit: `08ac9b8bd2db098dae22d74e20bc1de9545fc615`

PR da v0.15 multidispositivo:

- **PR #6**
- merged antes da v0.15.1.

PR histórico da v0.14:

- **PR #1**
- foi encerrado como superseded;
- não representa trabalho pendente.

Estado no fechamento:

- PRs abertos: **nenhum**;
- issues abertas: **nenhuma**;
- branches históricas podem existir, mas não são trabalho ativo;
- não há pendência funcional conhecida bloqueando o piloto real.

Antes de qualquer alteração futura, o novo chat deve **reconsultar o GitHub** para confirmar que `main` continua nesse estado.

---

## 3. Documentação de referência no repositório

Ler primeiro, nesta ordem:

1. `README.md`
2. `docs/STATUS-PRODUCAO.md`
3. `docs/PILOTO-REAL-v0.15.1.md`
4. `docs/ROADMAP-POST-PILOTO.md`
5. `docs/PRODUCT-PRINCIPLES.md`
6. `docs/RELEASE-v0.15.1.md`
7. `docs/PUBLICACAO.md`
8. `docs/V0.15-MULTIDEVICE.md`
9. `docs/V0.15-PRODUCTION-GATE.md`
10. `docs/V0.15-RC3-ITENS.md`

Esses documentos são parte da fonte de verdade do projeto.

---

## 4. Filosofia de produto

Regra principal:

> **Respeitar o tempo do cliente.**

Uma funcionalidade só deve entrar quando fizer pelo menos uma destas coisas:

1. reduzir tempo ou número de toques;
2. evitar erro, perda, retrabalho ou cobrança incorreta;
3. aumentar ou recuperar receita de forma direta;
4. cumprir obrigação operacional necessária;
5. substituir uma tarefa manual por um fluxo claramente mais simples.

Não criar funções apenas porque são tecnicamente possíveis.

Evitar:

- telas novas sem necessidade;
- métricas que não mudam a próxima decisão;
- relatórios extensos se a empresa já possui outra ferramenta para isso;
- avisos permanentes em estado saudável;
- configuração adicional sem ganho operacional;
- CRM, estoque completo ou módulo financeiro sem evidência do piloto;
- login individual pesado sem benefício comprovado.

O **Painel** é resumo operacional, não uma segunda área de relatórios.

---

## 5. UX atual

Navegação inferior:

**Comandas | Painel | Cardápio | Histórico**

O botão flutuante `+` é a ação única de **Nova comanda**.

Locais rápidos:

- Balcão
- Mesa 1–5
- Parklet 1–6

A tela de comanda possui:

- cabeçalho com mesa/local e cliente;
- busca de produtos;
- categorias horizontais;
- seção **Mais lançados**;
- cards do cardápio;
- barra inferior fixa com:
  - quantidade de itens;
  - total;
  - chip **Ver itens**;
  - **Editar itens**;
  - **Fechar**.

### Ver itens

Foi criada porque no uso real era difícil conferir tudo que já havia sido lançado sem navegar categoria por categoria.

O chip **Ver itens** possui:

- ícone;
- maior peso visual;
- microanimação;
- estado ativo quando o quadro está aberto.

O quadro **Itens da comanda** exibe a lista completa dos lançamentos sem iniciar fechamento.

### Cancelar comanda

Entrou na v0.15.1.

Fluxo:

**Editar comanda → Cancelar comanda → confirmação**

Comportamento:

- usar para comanda aberta por engano;
- remove das comandas abertas;
- não registra venda;
- não entra no faturamento;
- não entra no Histórico de vendas;
- remove envios pendentes de WhatsApp daquela comanda;
- tenta propagar o cancelamento aos outros aparelhos;
- botão que antes dizia “Cancelar” na edição foi renomeado para **Voltar**, evitando ambiguidade.

---

## 6. Funcionalidades de produção

### Comandas

- abrir por mesa/local/cliente;
- editar mesa/local/cliente;
- lançar produtos por toque;
- alterar quantidades;
- remover itens;
- proteção contra abertura duplicada acidental;
- retomada de comanda ativa após recarga;
- conferir itens sem fechar;
- fechar com forma de pagamento obrigatória;
- cancelar comanda aberta por engano.

Formas de pagamento:

- Pix
- Dinheiro
- Crédito
- Débito
- Outro

### Histórico

- Hoje / 7 dias / 30 dias / Todos;
- busca por cliente, mesa/local, produto e pagamento;
- faturamento;
- quantidade de comandas;
- ticket médio;
- unidades vendidas;
- rankings;
- detalhes de comanda fechada;
- exportação CSV.

### Cardápio

- categorias editáveis;
- produtos editáveis;
- importação/exportação CSV/TXT;
- validação de importação;
- normalização de categorias;
- fuzzy/unificação reversível de categorias semelhantes;
- produtos frequentes / Mais lançados.

### Dados e backup

- backup/restauração JSON;
- proteção para não exportar device token;
- diagnóstico de integridade;
- localStorage como base local.

---

## 7. Arquitetura frontend/PWA

Tecnologia principal:

- HTML/CSS/JavaScript;
- sem framework pesado;
- PWA;
- mobile-first;
- local-first.

Entrada pública:

`index.html`

Base histórica preservada:

`base-v013.html`

A produção é composta por camadas injetadas pelo `index.html`.

Camadas relevantes atuais:

- `assets/v014.css`
- `assets/v014.js`
- `assets/v014-dev3.css`
- `assets/v014-dev3.js`
- `assets/v014-rc2-category-fix.js`
- `assets/v014-final.js`
- `assets/v015.css`
- `assets/v015-sync.js`
- `assets/v015-dev2.css`
- `assets/v015-dev2.js`
- `assets/v015-dev3.css`
- `assets/v015-dev3.js`
- `assets/v015-dev4.css`
- `assets/v015-dev4.js`
- `assets/v015-rc2-ops.css`
- `assets/v015-rc2-ops.js`
- `assets/v015-rc3-items.css`
- `assets/v015-rc3-items.js`
- `assets/v0151-hotfix.css`
- `assets/v0151-hotfix.js`
- `assets/v015-final.js`

Há nomes DEV/RC em arquivos históricos, mas a release pública é v0.15.1. Não “limpar” isso em pleno piloto apenas por estética técnica.

### Service Worker

Cache atual:

`rota27-comandas-v0.15.1`

A atualização remove caches antigos sem apagar `localStorage`.

### Atualização da PWA

No iPhone/Android **não reinstalar** para atualizar.

Fluxo:

1. conectar à internet;
2. abrir a PWA instalada;
3. aguardar alguns segundos;
4. fechar completamente;
5. abrir novamente;
6. conferir selo da versão e sincronização.

**Nunca limpar dados do Safari/Chrome durante atualização.**

---

## 8. Dados locais / chaves importantes

Estado principal:

`rota27_comandas_v01`

WhatsApp:

`rota27_whatsapp_config_v1`

Sincronização:

`rota27_sync_config_v1`

Backup pré-adoção da base compartilhada:

`rota27_sync_pre_adopt_backup_v1`

Retomada de tela/comanda:

`rota27_ui_resume_v015`

Fila local de cancelamento v0.15.1:

`rota27_cancel_outbox_v0151`

A fila do WhatsApp é local por aparelho e **não é sincronizada** para evitar mensagens duplicadas.

---

## 9. Sincronização multidispositivo

Arquitetura:

**PWA local → Supabase Edge Function `rota27-sync` → log remoto idempotente → outros aparelhos**

Endpoint:

`https://owkvwsiblbzlpxjwybrt.supabase.co/functions/v1/rota27-sync`

Projeto Supabase:

`owkvwsiblbzlpxjwybrt`

Autenticação:

header customizado:

`x-rota27-device-token`

`verify_jwt=false` é intencional porque a autenticação é feita dentro da função.

O token real **não deve aparecer no GitHub nem no chat**.

Store padrão:

`rota27-bodega`

Parâmetros operacionais aproximados:

- sync periódico: ~15 s;
- debounce após alteração: ~1,4 s;
- outbox máxima: 1200;
- conflitos preservados: até 30.

Eventos atuais:

- `state_snapshot`
- `command_opened`
- `command_patch`
- `item_delta`
- `command_closed`
- `history_upsert`
- `catalog_upsert`
- `catalog_delete`
- `categories_replace`

Quantidades concorrentes usam **deltas**, não sobrescrita total.

Se chega alteração para uma comanda já fechada, o conflito deve ser preservado, não descartado silenciosamente.

### Cancelamento na v0.15.1

O cancelamento atual não possui ainda um evento nativo `command_cancelled`.

A hotfix usa uma fila própria e envia `command_patch` com marcação de cancelamento.

Isso foi validado e está funcional, mas é um candidato de evolução pós-piloto para tombstone/evento nativo com auditoria.

---

## 10. WhatsApp Cloud API

Arquitetura validada:

**Rota 27 → Supabase Edge Function → Meta WhatsApp Cloud API**

Endpoint:

`https://owkvwsiblbzlpxjwybrt.supabase.co/functions/v1/rota27-whatsapp`

Função:

`rota27-whatsapp`

Configuração:

- autenticação via `x-rota27-device-token`;
- `verify_jwt=false` intencional;
- secrets Meta ficam no Supabase;
- nunca pedir ao usuário para colar access token da Meta no chat.

Identificadores de infraestrutura já usados:

- WABA ID: `2184585049047021`
- Phone Number ID: `1092922273903039`
- Graph API: `v25.0`
- remetente validado: +55 (27) 98803-0835

Templates aprovados para blocos de 1 a 5 itens:

- `atualizacao_comanda_rota27_v3_1`
- `atualizacao_comanda_rota27_v3_2`
- `atualizacao_comanda_rota27_v3_3`
- `atualizacao_comanda_rota27_v3_4`
- `atualizacao_comanda_rota27_v3`

Lotes maiores que 5 itens são divididos em chunks.

Há idempotência por event/chunk para evitar duplicação em retry.

### Hotfix v0.15.1 do iPhone

Foi descoberto que um iPhone estava com a configuração do WhatsApp apontando por engano para:

`rota27-sync`

O sintoma era:

`deviceId obrigatório.`

A v0.15.1:

- detecta URL terminando em `rota27-sync` na configuração de WhatsApp;
- troca automaticamente o sufixo para `rota27-whatsapp`;
- preserva o token já salvo;
- retoma a outbox;
- impede salvar novamente um endpoint incorreto.

Esse fluxo foi testado no iPhone e funcionou.

---

## 11. Histórico de validação

### v0.14

Foi a baseline estável anterior, com:

- Histórico;
- pagamentos;
- CSV;
- backup/restauração;
- cardápio import/export;
- frequent products.

### v0.15

Introduziu:

- multidispositivo;
- Painel;
- locais completos;
- melhorias operacionais;
- consulta rápida de itens.

Validação realizada com:

- MAP-PC;
- MAP-PC-B;
- Android físico;
- Android public lab;
- iPhone/PWA.

Foi feito teste de stress multidispositivo e aprovado.

### Bugs relevantes já resolvidos

#### Android freeze

Uma versão inicial do `v015-dev2.js` tinha um `MutationObserver` observando atributos como `class/disabled`, criando loop/freeze no Android.

Foi removido.

**Não reintroduzir esse padrão.**

#### Selo de versão regredindo para DEV.3 / RC.2.1

Camadas antigas reaplicavam selo/título.

A camada final `v015-final.js` virou a autoridade do selo público.

Hoje deve permanecer:

`v0.15.1`

#### Classificação offline

`navigator.onLine` sozinho não foi suficiente.

A camada operacional também classifica erros de conexão com a nuvem e mostra mensagem orientada ao operador:

**Sem conexão com a nuvem**

sem impedir o trabalho local.

#### WhatsApp apontando para sync

Resolvido na v0.15.1 conforme seção anterior.

---

## 12. Estado saudável vs alertas

Regra:

**estado saudável deve ser silencioso.**

Não manter banner técnico permanente se tudo está funcionando.

Alertas só quando houver ação necessária:

- offline/nuvem indisponível;
- conflito;
- fila travada;
- sync não inicializado;
- erro persistente.

O atendente deve continuar lançando offline; dados ficam locais e sobem quando a conexão volta.

---

## 13. Piloto real — regra operacional

A v0.15.1 entra em piloto real **congelada**.

Durante o turno:

### P0 — interromper e corrigir

- perda/corrupção de dados;
- total/cobrança incorreta;
- fechamento registrando venda errada;
- duplicação grave;
- sistema indisponível em todos os aparelhos.

### P1 — registrar imediatamente e avaliar hotfix

- sync não converge após reconexão;
- cancelamento não propaga;
- WhatsApp duplica;
- comanda não aparece em outro aparelho após tempo razoável;
- ação frequente fica impraticável.

### P2/P3 — não alterar durante o turno

- layout;
- novo atalho;
- nova métrica;
- relatório;
- conveniência de baixa frequência.

No encerramento:

- aguardar sync convergir;
- filas principais em zero;
- revisar conflitos antes de limpar;
- conferir Histórico;
- confirmar que cancelamentos não entraram no faturamento;
- verificar falhas pendentes de WhatsApp;
- fazer backup JSON se houver qualquer dúvida.

---

## 14. Roadmap pós-piloto já registrado

Nada abaixo está automaticamente aprovado.

### P0 / integridade

1. Cancelamento como evento nativo/tombstone + auditoria.
2. Normalizar metadados internos DEV/RC para release real.
3. Refinar saúde de sincronização por exceção.

### P1 / velocidade

4. Busca rápida em comandas abertas, **somente se o volume real justificar**.
5. Conferência ultrarrápida da comanda direto da lista, somente se o fluxo atual ainda for lento.
6. Atalhos de lançamento baseados no turno, sem configuração manual.

### P2 / gestão

7. Resumo de encerramento do turno, apenas se substituir tarefa manual existente.
8. PIN simples para ações administrativas, somente se houver risco real.
9. Histórico de cancelamentos separado das vendas.

### P3

10. Refinamentos visuais e microinterações após estabilização.

---

## 15. Ambiente local do desenvolvedor/usuário

Windows / PowerShell.

Clone local conhecido:

`C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git`

Servidor local usado:

`npx --yes http-server . -p 3000 -c-1`

Abrir:

`http://localhost:3000/`

### Atenção: OneDrive + Git

Esse clone já apresentou locks em `.git/objects` durante `git pull`/auto-gc.

Foi aplicado:

`git config gc.auto 0`

Se ocorrer novamente:

- **não apagar manualmente `.git/objects`**;
- parar e diagnosticar;
- `supabase\.temp` pode ser removido quando for apenas temp do CLI;
- evitar ações destrutivas em `.git`.

Depois de estabilizar o piloto, pode fazer sentido mover o clone de desenvolvimento para algo como:

`C:\Dev\Rota27\rota27`

Mas **não fazer migração durante um turno real sem necessidade**.

---

## 16. Preferências de trabalho do usuário

Muito importante para o próximo chat:

- o usuário **não vai implementar nem mexer em código**;
- não despejar código no chat quando a mudança pode ser implementada diretamente;
- quando uma correção/melhoria estiver clara e aprovada, usar GitHub e implementar;
- apresentar ao usuário:
  - o que mudou;
  - onde foi salvo;
  - versão/branch/PR;
  - passos curtos de teste;
  - resultado esperado;
- não ficar pedindo confirmação a cada pequena etapa;
- para mudanças de risco, preservar `main` com branch + PR draft até validação;
- não alterar produção no meio do piloto por melhoria estética;
- não apagar `localStorage`;
- não mandar reinstalar PWA por rotina;
- não pedir secrets/tokens reais;
- evitar preview pesado no chat;
- se gerar arquivo, preferir arquivo direto, não ZIP, salvo quando possível no GitHub.

O usuário testa com screenshots e às vezes cria situações de erro deliberadamente para revelar falhas de UX.

---

## 17. Regras para qualquer nova mudança

Antes de desenvolver:

1. confirmar no GitHub a versão/HEAD atual;
2. verificar se o problema foi realmente observado no piloto;
3. classificar P0/P1/P2/P3;
4. se não for P0/P1 durante o turno, registrar e não publicar;
5. se for correção:
   - criar branch;
   - manter PR DRAFT até teste;
   - preservar backends validados quando não precisam de alteração;
   - não tocar em secrets;
   - não limpar dados dos aparelhos;
6. testar desktop + aparelho relevante;
7. só então fazer merge;
8. atualizar VERSION/cache/docs quando a release exigir.

---

## 18. O que não fazer

- não reabrir v0.14 como linha ativa;
- não usar `rawcdn.githack.com` como instalação de produção;
- não criar uma segunda PWA no iPhone de operação;
- não limpar Safari para “forçar atualização”;
- não reinstalar PWA sem razão;
- não sincronizar a outbox do WhatsApp entre aparelhos;
- não reintroduzir MutationObserver que causou freeze Android;
- não publicar endpoint/secret da Meta;
- não pedir token de acesso da Meta no chat;
- não mexer em `rota27-whatsapp`/`rota27-sync` apenas por refatoração durante o piloto;
- não criar funcionalidades que aumentem o trabalho do atendente.

---

## 19. Fonte de verdade atual

No início de um novo chat, usar estas fontes, nesta prioridade:

1. GitHub `AutomatrixHub/rota27`, branch `main`;
2. `docs/STATUS-PRODUCAO.md`;
3. `docs/PILOTO-REAL-v0.15.1.md`;
4. `docs/ROADMAP-POST-PILOTO.md`;
5. `README.md`;
6. este handoff.

Se houver divergência, **o estado atual do GitHub prevalece**.

---

## 20. Próxima missão do novo chat

A próxima fase não é “inventar mais funcionalidades”.

É:

1. acompanhar o piloto real da v0.15.1;
2. classificar feedback/incidentes;
3. corrigir apenas P0/P1 durante o turno;
4. registrar P2/P3 para pós-piloto;
5. depois do primeiro período real de uso, revisar evidências;
6. escolher no máximo 1–2 melhorias P1 de maior impacto;
7. manter v0.15.1 como baseline estável enquanto a próxima versão é desenvolvida isoladamente.

---

# Prompt para iniciar o novo chat

Use o texto abaixo como primeira mensagem no novo chat, anexando também este documento:

> Continue o projeto **Rota 27 Bodega — Comandas** a partir da baseline de produção **v0.15.1**.
>
> Leia integralmente o documento de handoff anexado antes de qualquer ação. Em seguida, acesse o GitHub conectado e confira o estado atual do repositório `AutomatrixHub/rota27`, especialmente `main`, `README.md`, `docs/STATUS-PRODUCAO.md`, `docs/PILOTO-REAL-v0.15.1.md`, `docs/ROADMAP-POST-PILOTO.md` e `docs/PRODUCT-PRINCIPLES.md`.
>
> A v0.15.1 está em **piloto real** e deve permanecer congelada durante o turno. Não publique novas funcionalidades ou refinamentos não críticos. Se eu relatar um problema, primeiro classifique como P0/P1/P2/P3 conforme o roteiro do piloto. P0/P1 podem justificar hotfix; P2/P3 devem ser registrados para depois do turno.
>
> Regras importantes:
> - eu não vou implementar nem editar código;
> - quando uma alteração estiver clara e aprovada, implemente você diretamente no GitHub;
> - para alterações de software, use branch + PR draft antes de tocar na `main`, salvo documentação puramente informativa quando for seguro;
> - não apague `localStorage`;
> - não mande reinstalar a PWA como procedimento normal;
> - não peça nem exponha tokens/secrets;
> - preserve `rota27-whatsapp` e `rota27-sync` se não houver necessidade real de alterá-los;
> - não sincronize a outbox do WhatsApp entre aparelhos;
> - mantenha a interface silenciosa quando tudo estiver saudável;
> - priorize velocidade do atendente, prevenção de erro/perda e simplicidade.
>
> Situação conhecida no handoff: produção v0.15.1 funcionando em desktop, Android e iPhone; WhatsApp real validado; cancelamento de comanda validado; sincronização multidispositivo validada; nenhum PR ou issue aberto no fechamento; piloto real autorizado.
>
> Primeiro, confirme o estado atual do GitHub e me responda com um resumo curto da baseline e do protocolo de atuação durante o piloto. Depois, aguarde minhas observações do ambiente real e conduza o projeto a partir delas.

---

## 21. Nota final

Este documento não contém tokens de dispositivo, access token da Meta, service role key ou qualquer secret.

Se o novo chat precisar intervir em produção, deve consultar o repositório atual e os backends conectados antes de assumir que qualquer SHA, endpoint ou configuração permanece igual.

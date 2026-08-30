# Rota 27 Bodega — Handoff de Continuidade

Data do handoff: 30/08/2026

## 1. Leia isto antes de qualquer alteração

Este documento é a referência de continuidade do projeto **Rota 27 Bodega — Comandas** após o encerramento do chat de desenvolvimento que levou a produção até a **v0.25.74**.

Antes de alterar código no próximo chat:

1. Leia este arquivo integralmente.
2. Confira `main`, `VERSION`, `README.md`, `docs/STATUS-PRODUCAO.md` e `docs/RELEASE-v0.25.74.md`.
3. Confira os PRs mais recentes, em especial #109, #108, #107, #106 e #105.
4. Confira o Supabase do projeto `owkvwsiblbzlpxjwybrt` antes de qualquer alteração de backend.
5. Não assuma que algo está em produção só porque um PR foi mesclado: confirme `index.html`, `VERSION`, Service Worker e GitHub Pages.
6. Não edite `main` diretamente para novas funcionalidades/correções. Use branch curta -> implementação -> revisão do diff -> PR -> merge -> Pages -> verificação de produção.

## 2. Identidade do projeto

- Produto: **Rota 27 Bodega — Comandas**
- Repositório: `AutomatrixHub/rota27`
- Branch de produção: `main`
- Produção: `https://automatrixhub.github.io/rota27/`
- Supabase: `owkvwsiblbzlpxjwybrt`
- Arquitetura: PWA mobile-first, offline-first e multidispositivo
- Persistência local + sincronização por eventos
- Público de operação: bar/loja Rota 27 Bodega

## 3. Baseline oficial de produção

A baseline oficial no momento deste handoff é:

- **Versão:** `v0.25.74`
- **Título:** Consentimento persistente de WhatsApp
- **PR:** #109
- **Merge:** `3e291ef5fe118f69f7f85a7c287a6f7e29487679`
- **GitHub Pages:** run #145 / id `33336820520`
- **Pages:** `completed / success`
- **build:** success
- **report-build-status:** success
- **deploy:** success
- **Service Worker:** `rota27-comandas-v0.25.74-r1`
- **Rollback funcional imediato:** v0.25.73 / merge `ca64b52e7197c332e5f9f12022a6b94784d7e8e6`

A release v0.25.74 está documentada em `docs/RELEASE-v0.25.74.md`.

## 4. Regra de publicação — não negociar

O projeto já teve um incidente em que o código existia no repositório e o Pages ficou verde, mas o shell/PWA ainda carregava assets antigos. Portanto, para toda release:

1. criar branch a partir do `main` atual;
2. implementar somente o escopo aprovado;
3. conferir `compare` contra `main` e garantir `behind_by = 0` antes do PR;
4. atualizar `VERSION`;
5. atualizar `meta[name="rota27-release-version"]` em `index.html`;
6. carregar o asset novo diretamente no shell quando a correção for crítica;
7. atualizar `assets/roadmap-loader.js`;
8. renovar o cache do Service Worker;
9. criar/atualizar documentação da release;
10. abrir PR;
11. conferir mergeability e arquivos alterados;
12. mesclar;
13. confirmar o merge real em `main`;
14. confirmar Pages para **aquele SHA**;
15. só dizer “em produção” depois de `build`, `report-build-status` e `deploy` concluírem com sucesso.

Evitar `MutationObserver`, polling contínuo e varreduras pesadas a cada `save()`. Isso já causou lentidão, principalmente no iPhone/Safari.

## 5. Estado funcional do produto

O aplicativo já cobre, entre outros:

- comandas por mesa/local/cliente;
- Lista e Mapa de comandas;
- lançamento rápido de produtos;
- cancelamento de itens e comandas;
- histórico;
- fechamento por data operacional de turno;
- visão gerencial;
- estoque;
- compras/recebimento;
- custos e margem;
- A Receber;
- clientes e fidelização;
- aniversários;
- eventos e convites;
- consumo interno;
- sincronização multidispositivo;
- WhatsApp com templates Meta;
- status Enviado/Entregue/Lido/Falhou;
- backup/Sandbox.

O roadmap original 0-10 já foi encerrado integralmente antes deste handoff.

## 6. Data operacional de turno — regra crítica

Não voltar à lógica de “dia civil = turno”.

Regra oficial:

> Toda métrica operacional de venda pertence ao turno/data operacional da abertura da comanda, e não à data civil em que ela foi fisicamente fechada.

Contexto que originou a correção:

- turno de 28/08/2026 foi fechado em 29/08 às ~08:25;
- fechamento oficial no banco: **R$ 2.350,55**;
- 22 comandas;
- 165 itens;
- ticket médio R$ 106,84;
- dentro desse fechamento, **R$ 680,80** eram vendas “A receber”.

A UI antiga mostrava R$ 680,80 como “faturamento hoje” porque cinco comandas foram fisicamente fechadas na manhã seguinte. A v0.25.63 corrigiu o eixo visual para **Turno atual / Último turno** e separou a data operacional de `closedAt`.

Nunca “corrigir” o snapshot oficial de R$ 2.350,55: ele estava certo.

## 7. Painel — estado atual

O Painel foi simplificado por exceção.

- `Hoje precisa de atenção` mostra apenas problemas que pedem ação.
- O card isolado de **A Receber** foi removido na v0.25.72 quando a mesma informação já aparecia em Operação.
- A linha de recebíveis dentro de `Hoje precisa de atenção` recebeu maior contraste/cor e continua abrindo A Receber.
- `Turno atual` usa data operacional.
- Pré-fechamento mostra exceções reais e “Tudo certo para fechar” quando aplicável.

## 8. Cardápio e categorias

A v0.25.69/v0.25.71 definiu:

### Cardápio administrativo
- produtos em ordem alfabética;
- abas de categoria;
- prioridade fixa: **Todos -> Cervejas -> Bebidas -> Charcutaria -> Vinhos**;
- demais categorias em ordem alfabética.

### Lançamento na comanda
- prioridade fixa: **Todos -> Cervejas -> Bebidas -> Charcutaria -> Vinhos**;
- demais categorias ordenadas por quantidade histórica vendida, da mais consumida para a menos consumida;
- empate: ordem alfabética;
- consumo interno/nonRevenue não entra no ranking.

## 9. Nova comanda e seletor de clientes

Houve regressões recorrentes por coexistência de três mecanismos antigos:

- `<datalist>` legado de v0.17;
- picker v0.25.13;
- picker novo v0.25.71.

A v0.25.72 consolidou a regra:

- Nova comanda **não deve usar datalist nativo**;
- o picker sincronizado/rolável v0.25.71 é a fonte de sugestões;
- lista deve ser tocável e rolável normalmente no mobile;
- seleção preenche nome + WhatsApp;
- ao abrir, pode solicitar `syncDomainNow()`;
- não reintroduzir `pointerdown.preventDefault()` que bloqueie rolagem.

Também existe a v0.25.70 para abertura canônica da Nova comanda e proteção contra autofocus. O formulário deve abrir sem focar automaticamente Mesa/Local e sem abrir teclado até o usuário tocar num campo.

## 10. WhatsApp de comandas

### Atualizações normais
Quando autorizado, o cliente recebe atualizações da comanda usando os templates Utility já aprovados.

### Cancelamento
A v0.25.73 corrigiu uma lacuna importante: o fluxo legado cancelava a comanda, desligava `whatsappOptIn` e apagava a fila antes de gerar aviso ao cliente.

Agora, para novos cancelamentos feitos em v0.25.73+:

- captura o snapshot antes da limpeza legada;
- cria fila independente/persistente;
- usa os templates Utility existentes;
- identifica a comanda como **CANCELADA**;
- envia itens como **REMOVIDO**;
- informa **Total atual: R$ 0,00**;
- `eventId` é determinístico/idempotente;
- há retry orientado a eventos se offline/falha.

Não reenviar cancelamentos históricos automaticamente.

Caso real usado na investigação: cliente Mamute recebeu a mensagem inicial da comanda, a comanda foi cancelada logo depois e antes da v0.25.73 não recebeu aviso de cancelamento.

## 11. v0.25.74 — Consentimento persistente de atualizações da comanda

Esta é a mudança mais recente e deve ser preservada.

Antes da v0.25.74, `whatsappOptIn` existia apenas na comanda. Toda nova comanda começava desmarcada mesmo para cliente já autorizado anteriormente.

Agora existe consentimento persistente do cliente, específico para o escopo:

`command_updates`

Estados:

- `granted`;
- `revoked`;
- ausência de registro.

Regras:

- cliente `granted`: ao selecionar na Nova comanda, checkbox vem marcado automaticamente;
- UI informa que a autorização já estava registrada;
- desmarcar o checkbox afeta **somente aquela comanda**;
- desmarcar não revoga globalmente;
- revogação global é ação explícita;
- cliente `revoked` só volta a `granted` após nova autorização explícita;
- cliente sem registro exige autorização manual;
- cliente novo com checkbox marcado grava a autorização no cadastro;
- autorização de comanda **não** autoriza marketing, aniversários, eventos ou campanhas.

Migração dos clientes antigos:

- só migra quem ainda não tem registro persistente;
- reconhece comandas locais com `whatsappOptIn=true`;
- reconhece também eventos históricos `command_opened` com `whatsappOptIn=true`;
- isso funciona mesmo se a comanda depois foi cancelada e removida localmente;
- identifica prioritariamente por WhatsApp canônico;
- comparação usa `updatedAt`, depois `seq`; em empate, `revoked` prevalece sobre `granted`.

Persistência/sincronização:

- storage: `rota27_v02574_whatsapp_consent_v1`;
- cursor: `rota27_v02574_whatsapp_consent_cursor_v1`;
- reutiliza `client_upsert`;
- campos: `whatsappCommandConsent`, `whatsappCommandConsentAt`, `whatsappCommandConsentUpdatedAt`, `whatsappCommandConsentSource`, `whatsappCommandConsentVersion`;
- sem migration;
- sem tabela nova;
- sem Edge Function nova.

### Testes prioritários que o próximo chat deve acompanhar

1. Selecionar cliente previamente autorizado -> checkbox deve vir marcado.
2. Desmarcar na comanda -> não enviar naquela comanda, mas manter autorização global.
3. Abrir outra comanda do mesmo cliente -> deve voltar marcado.
4. Revogar globalmente -> próximas comandas devem vir desmarcadas.
5. Autorizar novamente -> estado deve voltar a `granted`.
6. Validar convergência em outro aparelho após sync.
7. Confirmar que marketing/aniversário/eventos não são alterados pela autorização de `command_updates`.

## 12. Aniversários e relacionamento

### Parabéns automático
Foi criada a Edge Function `rota27-birthday-greeting`.

Template Meta:

- nome: `aniversario_cliente_rota27_v1`
- categoria: MARKETING
- idioma: pt_BR
- status verificado durante implantação: APPROVED

Mensagem é apenas cumprimento, sem desconto/mimo/oferta.

Agendamento:

- cron diário às 12:30 UTC;
- corresponde a **09:30 America/Sao_Paulo**;
- backend revalida horário local;
- envia somente no dia;
- exige WhatsApp válido + `relationshipMarketingOptIn=true`;
- no máximo uma vez por cliente/ano.

### Consentimento de relacionamento
É separado de atualizações da comanda.

Na v0.25.66 foi feito backfill aprovado: todo cliente que já havia fornecido data de nascimento recebeu `relationshipMarketingOptIn=true`. Naquele momento foram 21 clientes.

### Solicitação de data de nascimento
A campanha `rota27-birthday-campaign` foi revisada:

- até 3 solicitações bem-sucedidas por cliente;
- intervalo mínimo de 7 dias;
- falha técnica não consome tentativa;
- ao informar data válida, cliente sai da audiência;
- histórico anterior conta como tentativa 1;
- recontato permanece sob ação do operador, não cron automático;
- clientes sem evidência de contato autorizado continuam fora.

O inbound foi atualizado para gravar data + autorização de relacionamento quando o cliente responde validamente.

## 13. Backend Supabase — inventário verificado neste handoff

Projeto: `owkvwsiblbzlpxjwybrt`

Edge Functions ACTIVE verificadas em 30/08/2026:

- `rota27-whatsapp` v23, verify_jwt=false
- `rota27-sync` v9, verify_jwt=false
- `rota27-lab` v1, verify_jwt=false
- `rota27-whatsapp-inbound` v4, verify_jwt=false
- `rota27-meta-webhook-bootstrap` v4, verify_jwt=true
- `rota27-audit` v1, verify_jwt=false
- `rota27-birthday-campaign` v3, verify_jwt=false
- `rota27-birthday-bootstrap` v4, verify_jwt=false
- `rota27-event-campaign` v4, verify_jwt=false
- `rota27-event-delivery-status` v1, verify_jwt=false
- `rota27-birthday-greeting` v1, verify_jwt=false

Funções administrativas temporárias ainda aparecem ACTIVE no control-plane:

- `rota27-admin-replay-beto-20260827` v3, verify_jwt=true
- `rota27-admin-resend-mamute-20260828` v5, verify_jwt=true
- `rota27-admin-retry-mamute-20260828` v13, verify_jwt=true

Em auditoria anterior essas funções estavam internamente neutralizadas/tombstonadas e respondiam 410. **Não deletar/redeployar cegamente.** Antes de qualquer limpeza, ler o conteúdo atual e confirmar ausência de dependência.

## 14. Eventos e convites

Evento de referência usado no desenvolvimento:

- evento: Degustação de Costela com Aipim
- id: `evt_bd3ea894-9f86-4260-b931-ff6a62270134`
- template: `convite_evento_rota27_v1`

A infraestrutura atual registra funil:

- Registrados
- Aceitos Meta
- Enviados
- Entregues
- Lidos
- Falharam

`rota27-whatsapp-inbound` processa statuses e grava delivery no log.

## 15. Consumo interno

Consumo interno deve:

- ser registrado para referência operacional;
- não entrar em faturamento;
- não entrar em ticket médio;
- não entrar em formas de pagamento;
- não entrar em ranking de vendas/consumo usado para categorias;
- ser `internalConsumption=true` e `nonRevenue=true`.

Houve bug de dois `command_opened` concorrentes em que o segundo podia perder as flags. A v0.25.63/v0.25.64 fortaleceu a leitura/fechamento. Se regressar, conferir ordem dos wrappers de `finalizeCommand` e os eventos reais no Supabase.

## 16. A Receber

Conceito financeiro:

- venda “A receber” pertence ao faturamento do turno da venda;
- pagamento posterior é recebimento financeiro, não nova venda;
- card/atenção deve deixar claro que representa saldo ainda não recebido.

A v0.25.58 adicionou vencimento rápido: Sem data / Hoje / Amanhã / 7 dias.

## 17. Releases recentes — mapa rápido

- v0.25.63 — Coerência operacional de turnos
- v0.25.64 — Estabilidade mobile + fechamento de consumo interno
- v0.25.65 — Parabéns automático 09:30
- v0.25.66 — Elegibilidade/backfill de aniversário
- v0.25.67 — Estado visual de aniversários
- v0.25.68 — Recontato de cadastro, até 3 tentativas / 7 dias
- v0.25.69 — Organização do cardápio/categorias
- v0.25.70 — Abertura canônica de Nova comanda
- v0.25.71 — Categorias prioritárias + seletor real de clientes
- v0.25.72 — Seletor persistente + Painel sem redundância
- v0.25.73 — Aviso de cancelamento por WhatsApp
- v0.25.74 — Consentimento persistente de WhatsApp

## 18. Preferências de implementação / decisões já tomadas

- Não transformar o app em sistema burocrático.
- Lançamento de produtos deve ser rápido e objetivo.
- Não adicionar telas/campos quando o comportamento existente já resolve o problema.
- Preservar Lista e Mapa de comandas.
- Não reativar “Mapa rápido” com atalhos extras.
- Não usar 10% de serviço.
- Não imprimir comandas.
- Não disparar mensagens reais de teste amplamente.
- Sandbox não deve sincronizar/enviar.
- Não resetar dados reais.
- Não limpar `localStorage` como solução de atualização.
- Para PWA, preferir bump de Service Worker/cache e shell explícito.
- Em correções críticas, preferir corrigir a causa raiz em vez de empilhar wrappers.
- Cuidado com ordem de carregamento dos assets: já houve conflitos entre wrappers/bridges antigos.

## 19. Pontos que merecem observação no próximo ciclo

1. Validar v0.25.74 em uso real, especialmente consentimento persistente entre aparelhos.
2. Continuar observando responsividade no iPhone/Safari.
3. Confirmar que o picker de clientes não volta a reativar datalist legado após sincronização.
4. Testar cancelamento WhatsApp em v0.25.73+ com cliente autorizado e confirmar entrega do aviso CANCELADA/REMOVIDO/R$0,00.
5. Conferir o próximo aniversário automático após 09:30 pelo `whatsapp_message_log` e statuses Meta.
6. Antes de um novo roadmap, fazer uma revisão de uso real e priorizar regressões/UX sobre novas funcionalidades.
7. Se houver limpeza das funções admin temporárias, tratar como tarefa separada e auditada.

## 20. Como o próximo chat deve começar

O próximo chat deve receber a seguinte instrução:

> Continue o projeto Rota 27 Bodega — Comandas a partir da baseline de produção v0.25.74. Antes de qualquer alteração, leia integralmente `docs/HANDOFF-v0.25.74.md`, `docs/STATUS-PRODUCAO.md`, `docs/RELEASE-v0.25.74.md`, `README.md` e confira `main`, os PRs recentes e o Supabase `owkvwsiblbzlpxjwybrt`. Não altere `main` diretamente. Preserve dados reais e não faça disparos reais de WhatsApp para teste amplo. Para qualquer mudança aprovada, siga branch -> implementação -> revisão -> PR -> merge -> GitHub Pages -> verificação da produção. A primeira tarefa é validar o estado real de produção v0.25.74 e então continuar a partir da solicitação que eu enviar.

## 21. Fonte de verdade

Em caso de conflito entre memória do chat e repositório:

1. `main` atual;
2. `VERSION` + `index.html` + `sw.js`;
3. release mais recente em `docs/RELEASE-*`;
4. `docs/STATUS-PRODUCAO.md`;
5. eventos reais no Supabase;
6. este handoff.

Não inferir estado de produção apenas por número de versão mencionado em conversa antiga.

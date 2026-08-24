# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.20.0**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.20.0`

A v0.20.0 preserva toda a operação validada da v0.19.0 e acrescenta a **Visão Gerencial histórica e comparativa**, construída sobre os snapshots imutáveis do Fechamento do Turno.

## Recursos principais

### Comandas
- abertura por Balcão, Mesa 1–5, Parklet 1–6 e nome do cliente;
- lançamento rápido por toque, busca, categorias e Mais lançados;
- consulta `Ver itens`, correção em `Editar itens`, fechamento com forma de pagamento e cancelamento seguro;
- proteção contra duplicidade acidental;
- nome do cliente como informação principal e local/mesa como informação secundária quando houver cliente;
- cards com identidade visual oficial em laranja, preto e creme.

### Resumo do Turno, Auditoria e Fechamento
Na tela Histórico:
- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- itens vendidos;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- botão **Ver auditoria** com linha do tempo operacional;
- botão **Fechar turno** com conferência antes do encerramento;
- bloqueio do fechamento enquanto houver comanda aberta ou cancelamento ainda pendente;
- snapshot imutável por data;
- consulta posterior em **Fechamentos**;
- bloqueio de nova comanda após o encerramento do dia.

O fechamento funciona localmente offline. Quando a sincronização está configurada, usa uma outbox própria e o evento `turn_closed` para convergir entre aparelhos sem sincronizar filas de WhatsApp.

### Visão Gerencial
No `Painel`, o acesso **Visão Gerencial** usa exclusivamente os fechamentos imutáveis da v0.19.0 como fonte de verdade e oferece:
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento acumulado;
- média por turno fechado;
- ticket médio;
- comandas fechadas, itens vendidos e cancelamentos;
- comparação com o período anterior equivalente quando existe base suficiente;
- gráfico de faturamento por turno fechado;
- melhor dia do período;
- consolidação de produtos mais vendidos;
- consolidação de formas de pagamento;
- exportação CSV dos dados reais do período.

Dias sem fechamento não são inventados como faturamento zero.

### Modo demonstração da Visão Gerencial
A v0.20.0 mantém em produção um recurso opcional **Modo demonstração**:
- começa sempre desligado;
- é ativado manualmente dentro da Visão Gerencial;
- gera uma amostra simulada somente em memória para explorar gráficos, comparações e rankings;
- não grava em `localStorage`;
- não entra em sincronização;
- não altera comandas, histórico ou fechamentos reais;
- não altera WhatsApp;
- a exportação CSV fica bloqueada enquanto o modo demonstração estiver ativo;
- ao recarregar o app, os dados reais voltam automaticamente.

O modo demonstração é identificado visualmente para evitar confusão com números reais.

### Clientes
- cadastro manual;
- criação/captura automática quando uma comanda contém nome + WhatsApp válido;
- importação TXT/CSV com prévia e validação;
- exportação CSV;
- autocomplete de nome/telefone;
- cadastro sincronizado entre aparelhos.

### WhatsApp
- envio opcional ao cliente mediante consentimento;
- templates UTILITY `atualizacao_comanda_rota27_mini2_1` a `_5`;
- envio incremental e agrupado;
- outbox local por aparelho com retry e idempotência;
- configuração sincronizada do WhatsApp do gerente;
- respostas dos clientes encaminhadas ao gerente pelo template `resposta_cliente_rota27_gerente_v1`;
- webhook inbound com correlação por `context.id`, idempotência e bloqueio de loop.

### Sincronização e offline
- gravação local-first;
- sincronização multidispositivo de comandas, histórico, cardápio, categorias, clientes, configuração do gerente e fechamento do turno;
- `item_delta` para preservar lançamentos concorrentes;
- outbox/cursor/log remoto idempotente;
- operação local continua disponível sem internet;
- filas de WhatsApp nunca são sincronizadas entre aparelhos;
- a v0.20.0 não adiciona tabela, migration ou Edge Function nova.

## Tema oficial da marca

### Tema Operação Rota 27
Tema padrão da aplicação:
- laranja da marca para ação e destaque;
- preto para títulos, valores e hierarquia;
- creme/marfim para fundos e superfícies;
- verde/amarelo/vermelho reservados para estados funcionais.

### Ajuda v4.4 — Tema Capixaba
A seção `Ajuda` usa azul, branco e rosa inspirados na identidade capixaba e inclui **Fechamento do turno**, **Visão Gerencial** e **Modo demonstração**, além de operação, clientes, WhatsApp, Resumo do Turno, Auditoria, sincronização, offline, backup/restauração e atualização da PWA.

No celular, a Ajuda usa viewport dinâmico para permanecer integralmente visível e não ficar sobreposta pela barra do navegador.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: **versão 3 ACTIVE**, com suporte compatível ao evento `turn_closed`;
- `rota27-audit`: consulta somente leitura da trilha operacional;
- `rota27-whatsapp`: envio de templates;
- `rota27-whatsapp-inbound`: callback público das respostas;
- `whatsapp_message_log`: auditoria/idempotência outbound;
- `rota27_whatsapp_inbound`: auditoria/idempotência inbound.

A v0.20.0 não exigiu migration, alteração de Edge Function ou mudança dos contratos do WhatsApp.

## Atualização da PWA

Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. conectar à internet;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.20.0` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Segurança

- nenhum token/App Secret é versionado;
- credenciais reais não devem ser gravadas no GitHub;
- o fluxo de operação continua local-first;
- o Modo demonstração é somente leitura/em memória e não contamina dados reais;
- nenhuma migração destrutiva foi necessária para a v0.20.0.

## Documentos principais

- `docs/RELEASE-v0.20.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.20.0.md`
- `docs/ESPEC-v0.20.0.md`
- `docs/RELEASE-v0.19.0.md`
- `docs/MARCA-TEMA-v0.18.2.md`
- `docs/PILOTO-REAL-v0.17.1.md`
- `docs/PRODUCT-PRINCIPLES.md`
- `docs/V0.15-MULTIDEVICE.md`

## Versão

Produção: **0.20.0**

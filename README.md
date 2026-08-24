# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.18.0**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.18.0`

A v0.18.0 preserva a operação validada da v0.17.1 e acrescenta o **Resumo do Turno**, com indicadores gerenciais do dia e alertas apenas quando existe ação necessária. A Ajuda passa a v4.

## Recursos principais

### Comandas
- abertura por Balcão, Mesa 1–5, Parklet 1–6 e nome do cliente;
- lançamento rápido por toque, busca, categorias e Mais lançados;
- consulta `Ver itens`, correção em `Editar itens`, fechamento com forma de pagamento e cancelamento seguro;
- proteção contra comanda duplicada acidental;
- nome do cliente como informação principal e local/mesa como informação secundária quando houver cliente;
- histórico, filtros, indicadores, rankings e exportação CSV.

### Resumo do Turno
Na tela Histórico, a v0.18.0 mostra uma visão rápida do dia com:
- faturamento fechado hoje;
- comandas fechadas e comandas ainda abertas;
- valor atualmente em aberto;
- ticket médio;
- itens vendidos;
- produtos mais vendidos do dia;
- totais por forma de pagamento;
- alertas operacionais somente quando há algo que precisa de atenção, como offline, sync ou fila de WhatsApp com falha.

A primeira entrega não inventa um contador de cancelamentos: a baseline anterior não mantém histórico consolidado desse evento após a remoção operacional da comanda.

### Clientes
- cadastro manual de clientes;
- criação/captura automática quando uma comanda contém nome + WhatsApp válido;
- importação TXT/CSV com validação e prévia;
- exportação CSV;
- autocomplete de nome/telefone em Nova comanda e Editar comanda;
- consentimento para mensagens continua específico de cada comanda e nunca é ativado automaticamente pelo cadastro;
- cadastro sincronizado entre aparelhos.

### WhatsApp do cliente
- envio opcional mediante consentimento;
- mensagens UTILITY compactas usando `atualizacao_comanda_rota27_mini2_1` a `_5`;
- cabeçalho `Comanda: <local>`;
- lançamentos positivos no formato `1x Produto - R$ ...`;
- remoções no formato `REMOVIDO: 1x Produto - R$ ...`;
- até 5 alterações por mensagem; lotes maiores são divididos em blocos de 5;
- envio incremental: não reenvia toda a comanda acumulada, somente as mudanças novas + total atual;
- outbox local por aparelho, com retry e idempotência.

### WhatsApp do gerente
- configuração de nome, telefone e `Receber lançamentos` no Cardápio;
- configuração sincronizada entre aparelhos;
- cópia agrupada de adições, remoções e correções;
- proteção contra duplicidade concorrente;
- outbox do gerente local por aparelho;
- bloqueio de cópia redundante quando cliente e gerente usam o mesmo número na operação.

### Respostas dos clientes
- template UTILITY aprovado: `resposta_cliente_rota27_gerente_v1` (`pt_BR`);
- Edge Function `rota27-whatsapp-inbound`;
- correlação da resposta pelo `context.id` com o `wa_message_id` real da mensagem enviada pela comanda;
- identificação automática de cliente e comanda;
- encaminhamento ao gerente com comanda, cliente, WhatsApp e conteúdo recebido;
- texto, botão/interativo e indicação de mídia suportados;
- idempotência por `meta_message_id` para ignorar retries repetidos;
- loop bloqueado quando a origem é o próprio gerente;
- modo seguro inicial `context-bound`: somente respostas vinculadas a uma mensagem outbound conhecida do Rota 27 são encaminhadas.

### Sincronização e offline
- local-first: cada aparelho grava primeiro localmente;
- sync multidispositivo de comandas, histórico, cardápio, categorias, clientes e configuração do gerente;
- `item_delta` para preservar lançamentos concorrentes;
- outbox, cursor e log remoto idempotente;
- continua operando localmente quando a internet cai;
- filas do WhatsApp do cliente e do gerente **não são sincronizadas**, evitando envios duplicados.

### Ajuda v4
O botão `? Ajuda` fica no cabeçalho e funciona offline. A Ajuda inclui:
- Primeiros 3 minutos e mapa rápido;
- abrir, lançar, conferir, editar, fechar e cancelar;
- clientes, cadastro, importação/exportação e autocomplete;
- WhatsApp do cliente e formato atual das mensagens;
- WhatsApp do gerente;
- respostas dos clientes encaminhadas ao gerente;
- Resumo do Turno e seus indicadores/alertas;
- sincronização, uso offline, backup/restauração e atualização da PWA;
- seção `Se acontecer isso…`, boas práticas e glossário.

## Backend Supabase

Projeto: `owkvwsiblbzlpxjwybrt`

- `rota27-sync`: sincronização multidispositivo com autenticação própria;
- `rota27-whatsapp`: envio de templates do cliente/gerente;
- `rota27-whatsapp-inbound`: callback público para respostas do cliente;
- tabela `whatsapp_message_log`: auditoria/idempotência outbound;
- tabela `rota27_whatsapp_inbound`: auditoria/idempotência inbound;
- tabelas de sincronização com RLS habilitado; acesso operacional ocorre pelas Edge Functions com service role.

As funções que usam `verify_jwt=false` possuem autenticação/validação própria adequada ao contrato: token de dispositivo nas APIs da PWA e validação contextual no callback público da Meta.

## Configuração Meta do webhook de respostas

O repositório contém `scripts/rota27-ativar-webhook-respostas.ps1`. O script registra o objeto `whatsapp_business_account`, campo `messages`, vincula a WABA ao app `Rota27` e fixa o callback da Edge Function. Credenciais são solicitadas via `Read-Host -AsSecureString` e não são gravadas no repositório.

## Atualização da PWA

Quem já possui o Rota 27 instalado **não precisa reinstalar**:
1. conectar à internet;
2. abrir a PWA e aguardar cerca de 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.18.0` e sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar.

## Dados e segurança

Comandas, catálogo, categorias, histórico e filas técnicas continuam locais no aparelho. `clients` e `managerWhatsapp` integram o `state` e entram no Backup JSON. Tokens e secrets reais nunca devem ser commitados no GitHub.

## Documentos principais

- `docs/RELEASE-v0.18.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/TESTE-v0.18.0.md`
- `docs/PILOTO-REAL-v0.17.1.md`
- `docs/PRODUCT-PRINCIPLES.md`
- `docs/V0.15-MULTIDEVICE.md`

## Versão

Produção: **0.18.0**

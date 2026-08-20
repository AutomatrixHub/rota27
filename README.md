# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**Produção: PWA v0.14**  
**Desenvolvimento: v0.15-dev.1 — sincronização multidispositivo**

A `main` continua sendo a produção estável v0.14. A branch `feature/v0.15-multidispositivo` adiciona a primeira fundação para compartilhar comandas, histórico e cardápio entre aparelhos mantendo o funcionamento offline-first.

## Principais recursos da produção v0.14

- abertura de comanda por mesa/local/cliente;
- lançamento rápido de produtos;
- edição de quantidade e remoção de itens;
- fechamento com confirmação e forma de pagamento;
- histórico com filtros Hoje / 7 dias / 30 dias / Todos;
- busca por cliente, mesa/local, produto e forma de pagamento;
- faturamento, número de comandas, ticket médio e itens vendidos;
- ranking de produtos e vendas por categoria;
- detalhes completos de comandas fechadas;
- exportação de vendas em CSV;
- backup/restauração JSON com diagnóstico de integridade;
- importação de cardápio por CSV/TXT com prévia e validação;
- exportação do cardápio e modelos CSV/TXT;
- detecção de categorias semelhantes, incluindo singular/plural e erros de digitação;
- unificação reversível de categorias sem alterar comandas históricas;
- atalhos de produtos mais lançados;
- cardápio e categorias editáveis;
- instalação como PWA no iPhone/Android;
- funcionamento offline para a operação local;
- envio opcional de atualizações da comanda por WhatsApp mediante consentimento;
- agrupamento de lançamentos por aproximadamente 8 segundos;
- retry automático sem perder lançamentos da comanda;
- templates dinâmicos de WhatsApp para 1 a 5 itens por mensagem;
- divisão automática em múltiplos blocos quando houver mais de 5 itens agrupados.

## v0.15-dev.1 — multidispositivo

A nova camada usa uma outbox local e um log remoto idempotente no Supabase. Cada aparelho continua gravando primeiro no `localStorage`; quando há conexão, publica os eventos pendentes e busca os eventos que ainda não recebeu.

Recursos já preparados na DEV.1:

- identificação persistente por aparelho;
- configuração separada da Edge Function `rota27-sync`;
- reaproveitamento opcional do token já configurado no WhatsApp;
- publicação explícita do primeiro aparelho como base compartilhada;
- adoção segura da base em aparelhos novos, com backup local prévio;
- fila offline de alterações;
- sincronização automática ao voltar online/primeiro plano e em intervalos curtos;
- eventos aditivos de quantidade para reduzir perda de lançamentos simultâneos;
- sincronização de comandas, histórico, cardápio e categorias;
- registro dos aparelhos ativos;
- preservação de conflitos quando chega alteração para comanda já fechada;
- fila do WhatsApp mantida local para evitar duplicidade de mensagens.

Documentação: `docs/V0.15-MULTIDEVICE.md`.

## Estrutura

A entrada de produção v0.14 continua em `index.html`. A v0.15 é testada apenas pelo preview dedicado.

```text
rota27/
├── index.html                  # produção v0.14
├── base-v013.html              # base estável preservada
├── v015-preview.html           # preview v0.15-dev.1
├── manifest.webmanifest
├── sw.js
├── VERSION
├── assets/
│   ├── v014.css
│   ├── v014.js
│   ├── v014-dev3.css
│   ├── v014-dev3.js
│   ├── v014-rc2-category-fix.js
│   ├── v014-final.js
│   ├── v015.css
│   └── v015-sync.js
├── docs/
│   └── V0.15-MULTIDEVICE.md
└── supabase/
    ├── functions/
    │   ├── rota27-whatsapp/
    │   └── rota27-sync/
    └── migrations/
        ├── 20260817_create_whatsapp_message_log.sql
        └── 20260819_create_rota27_sync.sql
```

## GitHub Pages

A produção continua publicada por:

1. **Settings → Pages**
2. **Build and deployment → Deploy from a branch**
3. Branch: `main`
4. Pasta: `/(root)`

**Não publicar a v0.15 na `main` antes da validação multidispositivo.**

## Instalar no iPhone

1. Abra o endereço HTTPS no **Safari**.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Ative **Abrir como App da Web**, se a opção aparecer.
5. Toque em **Adicionar**.

Quem já possui a PWA v0.14 instalada não precisa reinstalar. O Service Worker de produção continua usando `rota27-comandas-v0.14` até a futura promoção da v0.15.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp continuam armazenados localmente no dispositivo.

Na v0.15, a configuração/fila de sincronização usa a chave local `rota27_sync_config_v1`. A fila do WhatsApp não é compartilhada entre aparelhos.

## WhatsApp Cloud API

Arquitetura validada de produção:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Os lançamentos são agrupados por aproximadamente **8 segundos** antes do envio. A Edge Function escolhe automaticamente o template aprovado adequado à quantidade de itens do lote.

Templates em produção:

- `atualizacao_comanda_rota27_v3_1` — 1 item;
- `atualizacao_comanda_rota27_v3_2` — 2 itens;
- `atualizacao_comanda_rota27_v3_3` — 3 itens;
- `atualizacao_comanda_rota27_v3_4` — 4 itens;
- `atualizacao_comanda_rota27_v3` — 5 itens.

Quando um lote contém mais de 5 itens, a Edge Function divide o envio em blocos de até 5 itens, preservando idempotência por bloco.

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens permanecem somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

As Edge Functions usam autenticação própria pelo header `x-rota27-device-token` e são implantadas com `verify_jwt=false`. As tabelas de backend permanecem com RLS habilitado e sem policies públicas; as funções usam service role no servidor.

## Versão

Produção: **0.14**  
Branch atual: **0.15-dev.1**

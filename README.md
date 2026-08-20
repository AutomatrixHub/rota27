# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**PWA v0.14 — candidata final preparada, ainda não publicada na `main`**

A v0.14 mantém a operação local/offline da v0.13 e acrescenta gestão local, histórico analítico, importação/exportação do cardápio e backup/restauração reforçados. A integração com WhatsApp continua validada ponta a ponta.

## Principais recursos

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

## Estrutura da v0.14

A entrada de produção é `index.html`. A base visual/operacional congelada da v0.13 foi preservada em `base-v013.html`, e a v0.14 é aplicada em camadas versionadas.

```text
rota27/
├── index.html                  # entrada de produção v0.14
├── base-v013.html              # base estável preservada
├── manifest.webmanifest
├── sw.js
├── VERSION
├── assets/
│   ├── v014.css
│   ├── v014.js
│   ├── v014-dev3.css
│   ├── v014-dev3.js
│   ├── v014-rc2-category-fix.js
│   └── v014-final.js
├── icons/
├── docs/
└── supabase/
```

## GitHub Pages

1. **Settings → Pages**
2. **Build and deployment → Deploy from a branch**
3. Branch: `main`
4. Pasta: `/(root)`
5. **Save**

A v0.14 só entra em produção quando o pacote final for mesclado na `main`.

## Instalar no iPhone

1. Abra o endereço HTTPS no **Safari**.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Ative **Abrir como App da Web**, se a opção aparecer.
5. Toque em **Adicionar**.

Quem já possui a PWA instalada não precisa reinstalar. O Service Worker da v0.14 usa o cache `rota27-comandas-v0.14`; após a publicação, o aparelho deve atualizar ao abrir online e reabrir o app.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp ficam armazenados localmente no dispositivo.

O backup JSON da v0.14 não inclui o token secreto do dispositivo. A restauração preserva o token local atual.

**Ainda não há sincronização automática das comandas entre celulares.**

## WhatsApp Cloud API

Arquitetura validada:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Os lançamentos são agrupados por aproximadamente **8 segundos** antes do envio. A Edge Function escolhe automaticamente o template aprovado adequado à quantidade de itens do lote.

Templates em produção:

- `atualizacao_comanda_rota27_v3_1` — 1 item;
- `atualizacao_comanda_rota27_v3_2` — 2 itens;
- `atualizacao_comanda_rota27_v3_3` — 3 itens;
- `atualizacao_comanda_rota27_v3_4` — 4 itens;
- `atualizacao_comanda_rota27_v3` — 5 itens.

Quando um lote contém mais de 5 itens, a Edge Function divide o envio em blocos de até 5 itens, preservando idempotência por bloco.

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens da Meta e tokens de dispositivo permanecem somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

A Edge Function usa autenticação própria pelo header `x-rota27-device-token`. Por isso, a função é implantada com `verify_jwt=false`, enquanto o acesso continua protegido pelo token do dispositivo e os Secrets permanecem no Supabase.

## Versão

Versão preparada: **0.14**

# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**PWA v0.13**

Funciona como aplicativo instalável no iPhone/Android, mantém os dados operacionais localmente no aparelho e possui integração validada com WhatsApp para atualização automática da comanda do cliente.

## Principais recursos

- abertura de comanda por mesa/local/cliente;
- lançamento rápido de produtos;
- edição de quantidade e remoção de itens;
- fechamento com confirmação de pagamento;
- histórico local de comandas;
- cardápio e categorias editáveis;
- instalação como PWA no iPhone/Android;
- funcionamento offline para a operação local;
- envio opcional de atualizações da comanda por WhatsApp mediante consentimento;
- agrupamento de lançamentos por aproximadamente 8 segundos;
- retry automático sem perder lançamentos da comanda;
- templates dinâmicos de WhatsApp para 1 a 5 itens por mensagem;
- divisão automática em múltiplos blocos quando houver mais de 5 itens agrupados.

## Estrutura do repositório

```text
rota27/
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
├── .gitignore
├── README.md
├── VERSION
├── assets/
│   └── logo-rota27.png
├── icons/
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-192-maskable.png
│   ├── icon-512-maskable.png
│   └── favicon-32.png
├── docs/
│   ├── PUBLICACAO.md
│   ├── WHATSAPP-SUPABASE.md
│   └── TEMPLATE-WHATSAPP.md
└── supabase/
    ├── functions/
    │   └── rota27-whatsapp/
    │       └── index.ts
    └── migrations/
        └── 20260817_create_whatsapp_message_log.sql
```

## GitHub Pages

1. **Settings → Pages**
2. **Build and deployment → Deploy from a branch**
3. Branch: `main`
4. Pasta: `/(root)`
5. **Save**

## Instalar no iPhone

1. Abra o endereço HTTPS no **Safari**.
2. Toque em **Compartilhar**.
3. Escolha **Adicionar à Tela de Início**.
4. Ative **Abrir como App da Web**, se a opção aparecer.
5. Toque em **Adicionar**.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp ficam armazenados localmente no dispositivo.

**Ainda não há sincronização das comandas entre celulares.**

## WhatsApp Cloud API

A integração está validada ponta a ponta com a arquitetura:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Os lançamentos são agrupados por aproximadamente **8 segundos** antes do envio. A Edge Function escolhe automaticamente o template aprovado adequado à quantidade de itens do lote.

Templates em produção:

- `atualizacao_comanda_rota27_v3_1` — 1 item;
- `atualizacao_comanda_rota27_v3_2` — 2 itens;
- `atualizacao_comanda_rota27_v3_3` — 3 itens;
- `atualizacao_comanda_rota27_v3_4` — 4 itens;
- `atualizacao_comanda_rota27_v3` — 5 itens.

Quando um lote contém mais de 5 itens, a Edge Function divide o envio em blocos de até 5 itens, preservando idempotência por bloco.

Arquivos principais:

- `supabase/functions/rota27-whatsapp/index.ts`
- `supabase/migrations/20260817_create_whatsapp_message_log.sql`
- `docs/WHATSAPP-SUPABASE.md`
- `docs/TEMPLATE-WHATSAPP.md`

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens da Meta e tokens de dispositivo devem permanecer somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

A Edge Function usa autenticação própria pelo header `x-rota27-device-token`. Por isso, a função é implantada com `verify_jwt=false`, enquanto o acesso continua protegido pelo token do dispositivo e os Secrets permanecem no Supabase.

## Versão

Versão atual: **0.13**

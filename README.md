# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**Produção: PWA v0.15.1 — multidispositivo offline-first + Painel + consulta rápida de itens + WhatsApp + cancelamento seguro**

A `main` contém a produção v0.15.1. A release foi validada em desktops, Android físico, laboratório público e iPhone/PWA, incluindo teste de stress multidispositivo, smoke test, gate de produção, envio real pelo WhatsApp e cancelamento seguro de comanda.

## Principais recursos da produção v0.15.1

- abertura de comanda por mesa/local/cliente;
- lançamento rápido de produtos;
- edição de quantidade e remoção de itens;
- fechamento com confirmação e forma de pagamento;
- cancelamento seguro de comanda aberta por engano, sem registrar venda/faturamento;
- histórico com filtros e busca;
- faturamento, ticket médio, itens vendidos e rankings;
- exportação de vendas em CSV;
- backup/restauração JSON com diagnóstico de integridade;
- importação/exportação de cardápio CSV/TXT;
- detecção e unificação reversível de categorias semelhantes;
- cardápio e categorias editáveis;
- instalação como PWA no iPhone/Android;
- funcionamento offline-first;
- sincronização multidispositivo de comandas, histórico, cardápio e categorias;
- fila offline e reconexão automática;
- eventos aditivos de quantidade para preservar lançamentos concorrentes;
- conflitos preservados quando chega alteração para comanda já fechada;
- identificação persistente por aparelho;
- publicação explícita e adoção segura da base compartilhada;
- Painel operacional;
- bottom bar `Comandas | Painel | Cardápio | Histórico`;
- FAB `+` como ação única de Nova comanda;
- nomes completos Mesa 1–5 e Parklet 1–6;
- proteção contra comanda duplicada acidental;
- retomada de comanda ativa após recarga;
- avisos técnicos somente por exceção;
- consulta rápida **Itens da comanda** pela barra inferior;
- chip **Ver itens** com ícone, microanimação e estado ativo;
- envio opcional de atualizações da comanda por WhatsApp mediante consentimento;
- templates dinâmicos de WhatsApp para 1 a 5 itens por mensagem;
- fila do WhatsApp mantida local por aparelho para evitar duplicidade;
- correção automática de configuração legada que apontava o WhatsApp para `rota27-sync`, preservando o token local.

## Arquitetura

A produção mantém a operação local-first. Cada aparelho grava primeiro no `localStorage`; quando há conexão, a camada `rota27-sync` publica eventos pendentes e busca alterações dos demais aparelhos.

A sincronização usa:

- outbox local;
- log remoto idempotente no Supabase;
- pull incremental por cursor;
- snapshot inicial e adoção de base;
- `item_delta` para alterações de quantidade concorrentes;
- detecção de conflitos após fechamento;
- fila separada para propagar cancelamentos com segurança.

A fila do WhatsApp **não é sincronizada** entre aparelhos para impedir envios duplicados.

## GitHub Pages

A produção é publicada a partir de:

- branch: `main`;
- pasta: `/(root)`.

URL de produção:

`https://automatrixhub.github.io/rota27/`

## Atualização no iPhone / Android

Quem já possui a PWA instalada **não precisa reinstalar**.

Após uma nova publicação:

1. conectar o aparelho à internet;
2. abrir a PWA uma vez e aguardar alguns segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar o selo da versão e a sincronização saudável.

Não limpar dados do navegador e não remover a PWA para atualizar. O Service Worker da v0.15.1 usa o cache `rota27-comandas-v0.15.1` e remove caches antigos sem tocar no `localStorage`.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp continuam armazenados localmente no dispositivo.

A configuração/fila de sincronização usa a chave local `rota27_sync_config_v1`. A fila do WhatsApp continua separada por aparelho. Cancelamentos pendentes de propagação usam uma fila local própria até a sincronização concluir.

## WhatsApp Cloud API

Arquitetura validada:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens permanecem somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

As Edge Functions usam autenticação própria pelo header `x-rota27-device-token` e permanecem com `verify_jwt=false` porque a autenticação customizada é feita dentro das funções. As tabelas de backend permanecem com RLS habilitado e sem policies públicas; as funções usam service role no servidor.

## Operação real

A v0.15.1 é a baseline congelada para o piloto em ambiente real. Durante o turno, alterações de software só devem ser publicadas para corrigir falha crítica, risco de perda/cobrança incorreta ou indisponibilidade operacional. Melhorias não críticas devem ser registradas para avaliação depois do turno.

Documentos principais:

- `docs/PILOTO-REAL-v0.15.1.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/RELEASE-v0.15.1.md`
- `docs/V0.15-MULTIDEVICE.md`
- `docs/V0.15-PRODUCTION-GATE.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão

Produção: **0.15.1**

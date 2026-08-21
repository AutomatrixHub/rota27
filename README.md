# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**Produção: PWA v0.14**  
**Desenvolvimento: v0.15 RC.3 — multidispositivo offline-first + Painel + consulta rápida de itens**

A `main` continua sendo a produção estável v0.14. A branch `feature/v0.15-multidispositivo` concentra a release candidate da v0.15 e **não deve ser mesclada antes da aprovação explícita**.

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

## v0.15 RC.3

A v0.15 mantém a operação offline-first e compartilha comandas, histórico, cardápio e categorias entre aparelhos por meio de uma outbox local e um log remoto idempotente no Supabase.

Recursos consolidados:

- identificação persistente por aparelho;
- publicação explícita do primeiro aparelho como base compartilhada;
- adoção segura da base em aparelhos novos, com backup local prévio;
- fila offline de alterações;
- sincronização automática ao voltar online/primeiro plano e em intervalos curtos;
- eventos aditivos de quantidade para preservar lançamentos concorrentes;
- sincronização de comandas, histórico, cardápio e categorias;
- preservação de conflitos quando chega alteração para comanda já fechada;
- fila do WhatsApp mantida local para evitar duplicidade de mensagens;
- bottom bar `Comandas | Painel | Cardápio | Histórico`;
- FAB `+` como ação única de Nova comanda;
- Painel operacional com informações de uso rápido;
- proteção contra comanda duplicada acidental;
- retomada de comanda ativa após recarga;
- avisos técnicos somente por exceção;
- nomes completos Mesa 1–5 e Parklet 1–6;
- **consulta rápida “Itens da comanda”** diretamente pela barra inferior da tela de lançamentos.

Na RC.3, o bloco que mostra `N itens` e o total da comanda pode ser tocado para abrir uma lista única com quantidade, produto, valor unitário, subtotal e total, sem navegar pelas categorias e sem entrar no fechamento. O fluxo já existente de **Editar itens** permanece separado.

Documentação principal:

- `docs/V0.15-MULTIDEVICE.md`
- `docs/V0.15-RC2-OPS.md`
- `docs/V0.15-RC3-ITENS.md`

## Desenvolvimento local

```powershell
cd "C:\Users\marco\OneDrive\Documentos\Rota27\mvp\Rota27-comandas-git"
npx --yes http-server . -p 3000 -c-1
```

Em outra janela:

```powershell
Start-Process "http://localhost:3000/v015-preview.html?rc=3"
```

## GitHub Pages

A produção continua publicada a partir de `main`/`/(root)`.

**Não publicar a v0.15 na `main` antes da validação final e aprovação explícita.**

## Instalar no iPhone / Android

Quem já possui a PWA v0.14 instalada não deve limpar dados do site nem reinstalar durante os testes. A atualização final será preparada para preservar o `localStorage` existente.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp continuam armazenados localmente no dispositivo.

Na v0.15, a configuração/fila de sincronização usa a chave local `rota27_sync_config_v1`. A fila do WhatsApp não é compartilhada entre aparelhos.

## WhatsApp Cloud API

Arquitetura validada:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Os lançamentos são agrupados por aproximadamente **8 segundos** antes do envio. A Edge Function escolhe automaticamente o template aprovado adequado à quantidade de itens do lote.

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens permanecem somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

As Edge Functions usam autenticação própria pelo header `x-rota27-device-token` e são implantadas com `verify_jwt=false`. As tabelas de backend permanecem com RLS habilitado e sem policies públicas; as funções usam service role no servidor.

## Versão

Produção: **0.14**  
Branch atual: **0.15-rc.3**

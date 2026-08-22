# Rota 27 Bodega — Comandas

Aplicativo mobile-first para controle rápido de comandas da **Rota 27 Bodega**.

## Estado atual

**Produção: PWA v0.16.1 — baseline v0.15.1 + Ajuda completa integrada + hotfix preventivo de versão**

A `main` contém a produção v0.16.1. Ela preserva o comportamento operacional validado da v0.15.1, mantém a Ajuda completa introduzida na v0.16.0 e elimina a sobreposição entre protetores de versão legados.

**Próxima versão em validação: v0.17.0** na branch `feature/v0.17.0-clientes-gerente-layout`.

A v0.17.0 adiciona cadastro/importação de clientes, autocomplete, sincronização dos novos dados, cópia agrupada dos lançamentos para o WhatsApp do gerente e uma hierarquia visual melhor para cliente/local. Ela **não está publicada em produção** até concluir o roteiro de testes e receber autorização de merge.

## Principais recursos da produção v0.16.1

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
- correção automática de configuração legada que apontava o WhatsApp para `rota27-sync`, preservando o token local;
- **Ajuda completa dentro do aplicativo**, com busca por intenção, exemplos de atendimento, comparações entre ações, mini-representações da interface, respostas rápidas e glossário;
- seção **Se acontecer isso…** com primeira ação segura para situações comuns;
- Ajuda disponível também offline pelo Service Worker;
- protetor final único de versão em `assets/v0161-final.js`, evitando disputa com finals legados.

## v0.17.0 em validação

Escopo implementado na branch de desenvolvimento:

- cadastro compartilhado de clientes;
- captura automática de nome + WhatsApp informados na comanda;
- importação TXT/CSV de clientes com validação e prévia;
- exportação CSV de clientes;
- autocomplete de cliente/telefone na abertura e edição da comanda;
- consentimento do cliente continua específico por comanda e nunca é ativado automaticamente pelo cadastro;
- eventos de sync próprios para clientes e configuração do gerente;
- configuração **WhatsApp do gerente** no Cardápio;
- cópia agrupada dos lançamentos para o gerente com retry e eventId próprio;
- fila de mensagens do gerente local por aparelho, sem sincronização da outbox;
- nome do cliente como informação principal e mesa/local na linha abaixo na lista e na comanda aberta;
- cache PWA candidato `rota27-comandas-v0.17.0`;
- protetor final candidato `assets/v017-final.js`.

A nova paleta de cores e o novo logo ficam fora desta versão.

## Ajuda do sistema

O botão `? Ajuda` fica no cabeçalho e não altera dados nem configurações. A Ajuda foi desenhada para quem nunca participou do desenvolvimento do sistema e inclui:

- **Primeiros 3 minutos**;
- mapa rápido do aplicativo;
- abrir comanda;
- lançar produtos;
- diferença entre **Ver itens**, **Editar itens** e **Fechar**;
- diferença entre **Fechar** e **Cancelar**;
- Painel, Histórico e Cardápio;
- sincronização e uso offline;
- WhatsApp;
- backup/restauração;
- atualização da PWA;
- respostas rápidas para situações de erro;
- boas práticas e glossário.

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

Na v0.17.0, clientes e configuração do gerente usam eventos adicionais no mesmo log remoto com cursor/outbox próprios da nova camada. A fila do WhatsApp do cliente e a fila de mensagens do gerente **não são sincronizadas** entre aparelhos para impedir envios duplicados.

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

Não limpar dados do navegador e não remover a PWA para atualizar. O Service Worker da produção v0.16.1 usa o cache `rota27-comandas-v0.16.1` e remove caches antigos sem tocar no `localStorage`.

## Dados locais

Comandas, cardápio, categorias, histórico e fila de envio do WhatsApp continuam armazenados localmente no dispositivo.

A configuração/fila de sincronização usa a chave local `rota27_sync_config_v1`. A fila do WhatsApp continua separada por aparelho. Cancelamentos pendentes de propagação usam uma fila local própria até a sincronização concluir.

Na v0.17.0, `clients` e `managerWhatsapp` passam a integrar o objeto `state`, portanto entram no Backup JSON existente. Outboxes técnicas continuam separadas.

## WhatsApp Cloud API

Arquitetura validada:

`Rota 27 PWA/APK → Supabase Edge Function → WhatsApp Cloud API`

Credenciais reais **nunca** devem ser commitadas no GitHub. Tokens permanecem somente nos Secrets do Supabase e na configuração local autorizada do aparelho.

## Segurança

As Edge Functions usam autenticação própria pelo header `x-rota27-device-token` e permanecem com `verify_jwt=false` porque a autenticação customizada é feita dentro das funções. As tabelas de backend permanecem com RLS habilitado e sem policies públicas; as funções usam service role no servidor.

## Operação real

A v0.16.1 permanece a baseline oficial de produção. Durante o piloto, só publicar hotfix se surgir P0/P1 com impacto real em integridade, cobrança, sincronização, WhatsApp ou continuidade da operação.

A v0.17.0 deve ser validada fora da produção conforme `docs/TESTE-v0.17.0.md` antes de qualquer merge.

Documentos principais:

- `docs/PILOTO-REAL-v0.16.1.md`
- `docs/RELEASE-v0.16.1.md`
- `docs/RELEASE-v0.17.0.md`
- `docs/TESTE-v0.17.0.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/V0.15-MULTIDEVICE.md`
- `docs/V0.15-PRODUCTION-GATE.md`
- `docs/PRODUCT-PRINCIPLES.md`

## Versão

Produção: **0.16.1**

Em validação: **0.17.0**

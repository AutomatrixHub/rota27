# Rota 27 — Status de produção

Última revisão: 23/08/2026

## Produção atual

- versão atualmente publicada na `main`: **v0.17.0**;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- templates `mini2_1` a `mini2_5`: APPROVED / UTILITY / `pt_BR`;
- sincronização v0.17 ativa para comandas, catálogo, histórico, clientes e configuração do gerente.

## Release v0.17.1 pronta para promoção

Branch: `feature/whatsapp-inbound-forwarding`  
PR: #14

A v0.17.1 adiciona:

- Ajuda v3 atualizada com todos os recursos v0.17;
- documentação consolidada;
- cache PWA `rota27-comandas-v0.17.1`;
- selo/versão pública `0.17.1`;
- infraestrutura de respostas do cliente encaminhadas ao gerente;
- script seguro para registrar o webhook `messages` na Meta.

## WhatsApp final

### Atualizações da comanda

Produção usa a família `atualizacao_comanda_rota27_mini2_1` a `_5`:

- cabeçalho `Comanda: <local>`;
- lançamentos sem `Item:` e sem `+`;
- remoção `REMOVIDO: 1x Produto - R$ ...`;
- lote máximo de 5 alterações por mensagem;
- lotes maiores divididos em blocos de 5;
- total atual em cada atualização.

### Gerente

- configuração sincronizada entre aparelhos;
- cópia agrupada dos lançamentos;
- proteção de duplicidade;
- fila local por aparelho;
- retry offline.

### Respostas dos clientes

Template aprovado:

- `resposta_cliente_rota27_gerente_v1`;
- status `APPROVED`;
- categoria `UTILITY`;
- idioma `pt_BR`.

Backend já implantado:

- Edge Function `rota27-whatsapp-inbound` v1 ACTIVE;
- tabela `rota27_whatsapp_inbound` criada;
- correlação por `context.id` + `wa_message_id` + telefone do cliente;
- idempotência por `meta_message_id`;
- bloqueio de loop do gerente;
- suporte a texto/interativo e indicação de mídia.

## Gate externo Meta

O app Meta `Rota27` está vinculado à WABA, mas a API da Meta exige **App Access Token/App Secret** para registrar o objeto `whatsapp_business_account` no campo `messages`. O token operacional de WhatsApp existente não possui permissão para concluir esse endpoint.

Para não armazenar segredo no GitHub/Supabase, a ativação final é feita localmente com:

`scripts/rota27-ativar-webhook-respostas.ps1`

O script solicita App Secret e WhatsApp Access Token de forma segura, registra o callback e confere a inscrição. Após essa confirmação, o PR #14 pode ser promovido para `main` sem pendência funcional.

## Segurança

- nenhum token/App Secret é versionado;
- o bootstrap temporário usado no diagnóstico foi desativado e protegido por JWT;
- a extensão PostgreSQL `http` usada somente no diagnóstico foi removida;
- o inbound opera em modo `context-bound` enquanto `META_APP_SECRET` não estiver configurado como secret do runtime: somente respostas a mensagens outbound reconhecidas são processadas.

## Atualização da PWA após promoção

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.17.1` e sync saudável.

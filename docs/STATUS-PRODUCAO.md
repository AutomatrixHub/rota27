# Rota 27 — Status de produção

Última revisão: 23/08/2026

## Produção

- versão: **v0.17.1**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.17.1`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 2 ACTIVE;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

A v0.17.1 consolida clientes/autocomplete, WhatsApp do gerente, formato final `mini2_*`, Ajuda v3 e respostas do cliente encaminhadas ao gerente.

## WhatsApp final

### Atualizações da comanda

Família `atualizacao_comanda_rota27_mini2_1` a `_5`, APPROVED / UTILITY / `pt_BR`:

- cabeçalho `Comanda: <local>`;
- lançamentos sem `Item:` e sem `+`;
- remoção `REMOVIDO: 1x Produto - R$ ...`;
- lote máximo de 5 alterações por mensagem;
- lotes maiores divididos em blocos de 5;
- total atual em cada atualização.

### Gerente

- configuração sincronizada entre aparelhos;
- cópia agrupada de adições, remoções e correções;
- proteção de duplicidade;
- fila local por aparelho;
- retry offline.

### Respostas dos clientes

Template aprovado:

- `resposta_cliente_rota27_gerente_v1`;
- status `APPROVED`;
- categoria `UTILITY`;
- idioma `pt_BR`.

Infraestrutura implantada e validada em produção:

- tabela `rota27_whatsapp_inbound`;
- Edge Function `rota27-whatsapp-inbound` v1 ACTIVE;
- correlação por `context.id` + `wa_message_id` + telefone do cliente;
- idempotência por `meta_message_id`;
- bloqueio de loop do gerente;
- suporte a texto/interativo e indicação de mídia;
- callback Meta registrado para o app Rota27 e WABA com override apontando para a Edge Function;
- teste real em 23/08/2026: resposta de cliente na comanda `Parklet 5` foi identificada, persistida com status `forwarded` e encaminhada com sucesso ao gerente em uma única mensagem.

## Ativação do callback Meta

O callback está ativo em produção. A Meta exige **App Access Token/App Secret** para registrar o app no objeto `whatsapp_business_account`, campo `messages`; o token operacional de WhatsApp não pode executar esse endpoint sozinho.

A ativação é feita localmente, sem armazenar segredo, por:

`scripts/rota27-ativar-webhook-respostas.ps1`

O script solicita App Secret e WhatsApp Access Token via `Read-Host -AsSecureString`, registra/confere `messages`, a WABA e o callback da Edge Function.

## Ajuda v3

A Ajuda agora cobre:

- cadastro/importação/exportação de clientes;
- autocomplete;
- hierarquia cliente/local;
- WhatsApp final do cliente;
- WhatsApp do gerente;
- respostas dos clientes;
- sincronização dos novos domínios;
- filas locais de WhatsApp;
- novos cenários em `Se acontecer isso…`.

## Segurança

- nenhum token/App Secret é versionado;
- o bootstrap temporário usado no diagnóstico foi desativado e protegido por JWT;
- a extensão PostgreSQL `http` usada somente no diagnóstico foi removida;
- o inbound opera em modo `context-bound` enquanto `META_APP_SECRET` não estiver configurado como secret do runtime: somente respostas a mensagens outbound reconhecidas do mesmo cliente podem ser processadas.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.17.1` e sync saudável.

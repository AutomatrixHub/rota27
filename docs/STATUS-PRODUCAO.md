# Rota 27 — Status de produção

Última revisão: 23/08/2026

## Produção

- versão: **v0.18.1**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.18.1`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 2 ACTIVE;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura e com autenticação própria por token de dispositivo.

A v0.18.1 preserva a operação validada da v0.18.0 e acrescenta auditoria operacional rastreável, contador de cancelamentos no Resumo do Turno e Ajuda v4.1.

## Validação da v0.18.1

Em 23/08/2026 a candidata foi validada no fluxo operacional. Foram testados abertura de comanda, lançamentos, remoção de item, cancelamento, atualização do Resumo do Turno e consulta em `Ver auditoria`. O resultado reportado foi **tudo funcionando perfeitamente**.

A v0.18.0 permanece como baseline anterior de rollback.

## Resumo do Turno

A v0.18.1 inclui:

- faturamento fechado hoje;
- comandas fechadas hoje;
- comandas abertas agora e valor em aberto;
- ticket médio;
- unidades vendidas;
- produtos mais vendidos;
- distribuição por forma de pagamento;
- **cancelamentos do turno** calculados a partir da trilha de auditoria;
- botão **Ver auditoria**;
- alertas somente quando existe ação necessária.

## Auditoria operacional

A nova camada registra e apresenta:

- abertura de comanda;
- fechamento de comanda;
- cancelamento;
- adição e remoção de itens;
- alteração de cliente/local;
- horário e aparelho de origem quando disponível.

O registro local funciona offline. Quando a sincronização está configurada, a PWA reconcilia a visão local com os eventos compartilhados já armazenados em `rota27_sync_events`.

A Edge Function `rota27-audit` é somente leitura e não altera comandas, histórico, catálogo, sincronização ou WhatsApp.

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

Template aprovado `resposta_cliente_rota27_gerente_v1`, categoria `UTILITY`, idioma `pt_BR`.

Infraestrutura implantada e validada em produção:

- tabela `rota27_whatsapp_inbound`;
- Edge Function `rota27-whatsapp-inbound` v1 ACTIVE;
- correlação por `context.id` + `wa_message_id` + telefone do cliente;
- idempotência por `meta_message_id`;
- bloqueio de loop do gerente;
- suporte a texto/interativo e indicação de mídia;
- callback Meta ativo apontando para a Edge Function.

## Ajuda v4.1

A Ajuda cobre os recursos anteriores e agora também inclui `Auditoria operacional`, explicando cancelamentos, linha do tempo, horário/aparelho, comportamento offline e reconciliação multidispositivo.

## Segurança

- nenhum token/App Secret é versionado;
- `rota27-audit` usa autenticação própria por `x-rota27-device-token`;
- o bootstrap temporário usado no diagnóstico continua protegido por JWT e não participa do fluxo operacional;
- o inbound opera em modo `context-bound` enquanto `META_APP_SECRET` não estiver configurado como secret do runtime;
- credenciais expostas durante a ativação devem ser rotacionadas fora do horário operacional, com substituição antes da revogação para evitar indisponibilidade.

## Próxima etapa

1. observar a v0.18.1 em produção e tratar apenas P0/P1 como hotfix;
2. usar a trilha de auditoria como fundação do **Fechamento do Turno**;
3. impedir fechamento de turno enquanto houver comanda aberta ou pendência operacional relevante;
4. depois evoluir para visão gerencial histórica e comparativa.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.18.1` e sync saudável.

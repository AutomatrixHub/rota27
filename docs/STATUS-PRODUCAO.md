# Rota 27 — Status de produção

Última revisão: 23/08/2026

## Produção

- versão: **v0.18.0**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.18.0`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 2 ACTIVE;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE.

A v0.18.0 preserva a baseline operacional validada da v0.17.1 e adiciona o **Resumo do Turno** na tela Histórico, além da Ajuda v4.

## Validação da v0.18.0

Em 23/08/2026 a candidata foi aberta localmente na porta dedicada da v0.18.0 e validada com dados de teste. O Resumo do Turno exibiu corretamente faturamento, comandas fechadas, comandas abertas, valor em aberto, ticket médio, itens vendidos, ranking de produtos e forma de pagamento. O visual foi aprovado para produção.

A v0.17.1 permanece como baseline anterior validada e referência de rollback.

## Resumo do Turno

A v0.18.0 inclui:

- faturamento fechado hoje;
- comandas fechadas hoje;
- comandas abertas agora;
- valor atualmente em aberto;
- ticket médio das comandas fechadas;
- unidades vendidas hoje;
- produtos mais vendidos do dia;
- distribuição por forma de pagamento;
- alertas somente quando há ação necessária: offline, erro conhecido de sync, fila de WhatsApp com falha ou cancelamento aguardando sincronização.

Cancelamentos ainda não aparecem como contador histórico porque a arquitetura anterior não mantém histórico consolidado desse evento após a remoção operacional. Esse número só será adicionado quando houver trilha de auditoria confiável.

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
- teste real em 23/08/2026: resposta de cliente foi identificada, persistida com status `forwarded` e encaminhada com sucesso ao gerente.

## Ajuda v4

A Ajuda cobre:

- cadastro/importação/exportação de clientes;
- autocomplete;
- hierarquia cliente/local;
- WhatsApp final do cliente;
- WhatsApp do gerente;
- respostas dos clientes;
- Resumo do Turno;
- sincronização dos novos domínios;
- filas locais de WhatsApp;
- cenários em `Se acontecer isso…`.

## Segurança

- nenhum token/App Secret é versionado;
- o bootstrap temporário usado no diagnóstico está protegido por JWT e não participa do fluxo operacional;
- a extensão PostgreSQL `http` usada somente no diagnóstico foi removida;
- o inbound opera em modo `context-bound` enquanto `META_APP_SECRET` não estiver configurado como secret do runtime;
- credenciais expostas durante a ativação devem ser rotacionadas fora do horário operacional, com substituição antes da revogação para evitar indisponibilidade.

## Próxima etapa

1. observar a v0.18.0 em produção sem mexer no fluxo rápido de atendimento;
2. tratar apenas P0/P1 como hotfix;
3. preparar trilha de auditoria de cancelamentos antes de exibir esse indicador;
4. evoluir a camada gerencial sem transformar a PWA em um ERP pesado;
5. priorizar recursos que reduzam conferência manual e risco operacional.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.18.0` e sync saudável.

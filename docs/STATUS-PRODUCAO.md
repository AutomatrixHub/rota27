# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção

- versão: **v0.19.0**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.19.0`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 3 ACTIVE** (`rota27-sync-v0.19.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura e com autenticação própria por token de dispositivo.

A v0.19.0 preserva a operação validada da v0.18.3 e acrescenta o **Fechamento do Turno**, sem alterar cálculo de total, fechamento/cancelamento de comandas ou fluxos de WhatsApp.

## Validação da v0.19.0

Em 24/08/2026 a candidata foi testada e validada no fluxo definido para desktop/celular, incluindo:

- bloqueio de fechamento com comandas abertas;
- liberação do fechamento somente após zerar pendências bloqueantes;
- conferência final de faturamento, fechadas, canceladas, ticket, itens, produtos e formas de pagamento;
- criação do registro imutável do turno;
- consulta em `Fechamentos`;
- bloqueio de nova comanda depois do fechamento do dia;
- preservação da Ajuda Tema Capixaba com nova seção de Fechamento do Turno;
- smoke de navegação e operação anterior.

Resultado final reportado: **tudo testado e validado**.

A v0.18.3 permanece como baseline anterior de rollback.

## Fechamento do Turno

A v0.19.0 inclui:

- botão `Fechar turno` dentro do Histórico/Resumo do Turno;
- bloqueio quando há comanda aberta;
- bloqueio quando há cancelamento aguardando confirmação;
- conferência final antes da confirmação;
- snapshot imutável identificado pela data operacional;
- armazenamento local-first;
- histórico de fechamentos;
- bloqueio de novas comandas no mesmo dia após encerramento;
- funcionamento offline com outbox própria;
- sincronização multidispositivo via evento `turn_closed`;
- proteção contra duplicação e conflito de fechamento por data.

## Resumo do Turno e Auditoria

Permanecem ativos:

- faturamento fechado hoje;
- comandas fechadas e abertas;
- valor em aberto;
- ticket médio;
- unidades vendidas;
- produtos mais vendidos;
- formas de pagamento;
- cancelamentos do turno;
- botão `Ver auditoria`;
- linha do tempo de abertura, fechamento, cancelamento, itens e alterações.

## Ajuda v4.3 — Tema Capixaba

A Ajuda preserva a identidade azul, branco e rosa e passa a incluir uma seção específica explicando:

- quando fechar o turno;
- por que comandas abertas bloqueiam o encerramento;
- registro imutável;
- consulta posterior em `Fechamentos`;
- comportamento offline e sincronização entre aparelhos.

No celular, continua usando viewport dinâmico (`100dvh`) para evitar sobreposição com as barras do navegador.

## WhatsApp e sincronização

- família `atualizacao_comanda_rota27_mini2_1` a `_5` permanece em uso;
- template `resposta_cliente_rota27_gerente_v1` permanece ativo;
- callback inbound permanece implantado;
- filas de WhatsApp continuam locais por aparelho e nunca são sincronizadas;
- `rota27-sync` v3 adiciona somente suporte compatível ao evento `turn_closed`;
- não houve migration destrutiva.

## Segurança

- nenhum token/App Secret é versionado;
- nenhuma alteração destrutiva foi aplicada;
- outbox do fechamento é separada das filas de WhatsApp;
- a operação continua local-first.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.19.0` e sync saudável.

## Próxima etapa

Com o Fechamento do Turno consolidado, a próxima evolução funcional recomendada é a **Visão Gerencial histórica e comparativa**, usando os snapshots encerrados como fonte confiável por dia.

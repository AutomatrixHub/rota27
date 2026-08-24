# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção

- versão: **v0.20.0**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.20.0`;
- backend `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 3 ACTIVE** (`rota27-sync-v0.19.0`), reutilizado sem mudança pela v0.20.0;
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura e com autenticação própria por token de dispositivo.

A v0.20.0 preserva a operação validada da v0.19.0 e acrescenta a **Visão Gerencial histórica e comparativa**, sem alterar cálculo de total, fechamento/cancelamento de comandas, contratos de sincronização ou fluxos de WhatsApp.

## Validação da v0.20.0

Em 24/08/2026 a candidata foi testada e aprovada, com destaque positivo para a nova visão gerencial. Foram validados:

- acesso pelo Painel;
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento, média por turno, ticket médio, comandas, itens e cancelamentos;
- comparação com o período anterior;
- gráfico de faturamento por turno fechado;
- melhor dia do período;
- produtos mais vendidos e formas de pagamento;
- exportação CSV;
- navegação e leitura em desktop/celular;
- preservação do Fechamento do Turno da v0.19.0;
- preservação da operação, Auditoria, WhatsApp e sincronização.

Resultado final reportado: **Visão Gerencial aprovada e autorizada para promoção**.

A v0.19.0 permanece como baseline anterior de rollback.

## Visão Gerencial

A v0.20.0 usa os snapshots imutáveis de Fechamento do Turno como fonte de verdade. Isso evita recalcular o passado a partir do estado atual do cardápio ou das comandas.

Disponível em `Painel → Visão Gerencial`:

- filtros `7 dias`, `30 dias`, `90 dias` e `Todos`;
- faturamento acumulado;
- média por turno fechado;
- ticket médio;
- comandas fechadas;
- itens vendidos;
- cancelamentos;
- comparação com período anterior equivalente quando há base;
- gráfico de faturamento por turno;
- melhor dia;
- consolidação de mais vendidos;
- consolidação de formas de pagamento;
- exportação CSV por período.

Dias sem fechamento não são convertidos artificialmente em faturamento zero.

## Modo demonstração

A pedido da operação, a v0.20.0 mantém em produção um **Modo demonstração** dentro da Visão Gerencial.

Regras de segurança:

- desligado por padrão;
- ativação manual;
- amostra gerada somente em memória;
- não grava `localStorage`;
- não envia eventos de sincronização;
- não altera comandas, histórico, fechamentos reais, cardápio ou clientes;
- não participa de WhatsApp;
- CSV fica bloqueado enquanto o modo estiver ativo;
- recarregar o app restaura automaticamente os dados reais;
- banner visual identifica claramente quando a demonstração está ativa.

A finalidade é permitir apresentação, treinamento e exploração dos gráficos mesmo antes de existir histórico real suficiente.

## Fechamento do Turno

Permanece ativo e validado:

- botão `Fechar turno` dentro do Histórico/Resumo do Turno;
- bloqueio com comanda aberta ou cancelamento pendente;
- conferência final;
- snapshot imutável por data;
- armazenamento local-first;
- histórico de fechamentos;
- bloqueio de novas comandas no mesmo dia após encerramento;
- funcionamento offline com outbox própria;
- sincronização multidispositivo via evento `turn_closed`.

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

## Ajuda v4.4 — Tema Capixaba

A Ajuda preserva a identidade azul, branco e rosa e passa a incluir:

- Fechamento do Turno;
- Visão Gerencial;
- Modo demonstração e sua separação dos dados reais;
- períodos, comparações, gráficos e exportação;
- comportamento offline e sincronização.

No celular, continua usando viewport dinâmico (`100dvh`) para evitar sobreposição com as barras do navegador.

## WhatsApp e sincronização

- família `atualizacao_comanda_rota27_mini2_1` a `_5` permanece em uso;
- template `resposta_cliente_rota27_gerente_v1` permanece ativo;
- callback inbound permanece implantado;
- filas de WhatsApp continuam locais por aparelho e nunca são sincronizadas;
- `rota27-sync` v3 continua sendo o backend de sincronização de `turn_closed`;
- a v0.20.0 não adicionou migration nem Edge Function.

## Segurança

- nenhum token/App Secret é versionado;
- nenhuma alteração destrutiva foi aplicada;
- o Modo demonstração não persiste nem sincroniza dados simulados;
- a operação continua local-first.

## Atualização da PWA

Não reinstalar e não limpar dados:

1. internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.20.0` e sync saudável.

## Próxima etapa

Com Fechamento do Turno e Visão Gerencial consolidados, a próxima evolução deve ser escolhida a partir do uso real da operação e das necessidades gerenciais observadas, evitando adicionar complexidade sem benefício claro.

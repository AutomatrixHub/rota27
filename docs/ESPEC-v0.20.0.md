# Rota 27 v0.20.0 — Especificação da Visão Gerencial

## Objetivo
Transformar os fechamentos imutáveis da v0.19.0 em uma leitura gerencial simples, confiável e útil, sem acrescentar passos ao atendimento.

## Fonte de verdade
A visão usa exclusivamente os registros de `Fechamento do Turno` sincronizados pela v0.19.0. Dias sem fechamento não são tratados artificialmente como faturamento zero.

## Escopo
- acesso pela tela `Painel`;
- períodos de 7, 30, 90 dias e todo o histórico;
- faturamento acumulado;
- média por turno fechado;
- ticket médio consolidado;
- comandas fechadas, itens vendidos e cancelamentos;
- comparação com o período anterior equivalente;
- gráfico de faturamento por turno fechado;
- melhor dia do período;
- consolidação de produtos mais vendidos a partir do resumo salvo nos fechamentos;
- consolidação integral das formas de pagamento;
- exportação CSV dos fechamentos reais do período;
- Ajuda v4.4 com seção específica;
- Modo demonstração opcional e isolado dos dados reais.

## Modo demonstração

Finalidade: apresentação, treinamento e exploração da Visão Gerencial quando ainda não existe histórico real suficiente.

Regras obrigatórias:
- desligado por padrão;
- ativação somente por ação explícita do usuário;
- amostra simulada gerada em memória;
- nenhuma escrita em `localStorage`;
- nenhum evento de sincronização;
- nenhum efeito em comandas, histórico, cardápio, clientes, auditoria ou Fechamento do Turno;
- nenhuma interação com WhatsApp;
- identificação visual persistente enquanto ativo;
- exportação CSV bloqueada no modo demonstração;
- recarregar o aplicativo encerra a demonstração e restaura a leitura dos dados reais.

## Regras de confiança
- não recalcular nem alterar um fechamento já encerrado;
- não inventar zero para dia sem registro;
- comparação só é considerada completa quando existe base no período anterior;
- dados simulados nunca podem ser mesclados com dados reais na fonte persistente;
- a v0.20.0 não altera cálculo de total, fechamento de comanda, cancelamento, WhatsApp ou sincronização principal;
- nenhum backend novo é necessário: a visão consome os fechamentos já sincronizados pela v0.19.0.

## UX
A operação do dia continua no Painel existente. A Visão Gerencial aparece como um acesso separado, evitando misturar indicadores históricos com decisões operacionais imediatas.

Quando o Modo demonstração está ativo, um aviso explícito identifica que os números exibidos são simulados e não representam a operação real.

# Rota 27 — Especificação v0.19.0

## Objetivo

Transformar o Resumo do Turno e a Auditoria da v0.18.x em um **Fechamento do Turno** operacional, simples e confiável.

A v0.19.0 não adiciona passos ao atendimento normal. O novo fluxo aparece no Histórico e é usado apenas no fim da operação.

## Regras do fechamento

O turno do dia só pode ser encerrado quando:

- não houver comanda aberta;
- não houver cancelamento aguardando confirmação da sincronização.

Condições como aparelho offline ou erro recente de sincronização são mostradas como atenção, mas não destroem a capacidade local de fechamento. O app continua local-first.

## Registro imutável

Ao confirmar o fechamento, a aplicação grava um snapshot com:

- data do turno;
- data/hora do fechamento;
- aparelho de origem;
- faturamento;
- comandas fechadas;
- comandas canceladas;
- ticket médio;
- unidades vendidas;
- formas de pagamento;
- produtos mais vendidos;
- quantidade de eventos da auditoria disponível no momento.

O snapshot financeiro não é editado depois de criado.

## Bloqueio após fechamento

Depois que o turno do dia é fechado:

- a abertura de novas comandas naquele aparelho é bloqueada até o próximo dia;
- o fechamento continua consultável em `Histórico → Fechamentos`;
- se um fechamento for recebido de outro aparelho, o bloqueio passa a valer localmente também.

Comandas remotas que apareçam depois de um fechamento representam uma anomalia operacional e continuam visíveis para resolução, evitando ocultar dados.

## Offline e sincronização

O fechamento funciona offline.

- o registro é salvo primeiro no aparelho;
- entra em uma outbox específica de fechamento;
- quando `rota27-sync` estiver configurado e a conexão voltar, o evento `turn_closed` é enviado;
- outros aparelhos recebem o mesmo registro pela trilha compartilhada;
- o identificador do evento é determinístico por data, reduzindo risco de fechamento duplicado concorrente.

A Edge Function `rota27-sync` passa a aceitar `turn_closed`. Não há migration de banco e não há alteração no contrato das comandas, catálogo, clientes ou WhatsApp.

## Segurança operacional

A v0.19.0 preserva:

- cálculo de total existente;
- fechamento e cancelamento de comandas existentes;
- sincronização `item_delta`;
- outboxes do WhatsApp locais por aparelho;
- auditoria operacional;
- Tema Operação Rota 27 e Ajuda Capixaba.

## Ajuda

A Ajuda passa para v4.3 e inclui a seção `Fechamento do turno`, explicando conferência, bloqueios, comportamento offline e consulta dos fechamentos anteriores.

## Não incluído nesta versão

- fechamento de caixa por operador;
- sangria/suprimento;
- conferência de dinheiro físico vs. sistema;
- reabertura administrativa de turno;
- gráficos gerenciais históricos.

Esses itens ficam para versões posteriores, depois da validação do fechamento operacional básico.

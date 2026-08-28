# Rota 27 v0.25.37 — Consumo interno

## Objetivo
Permitir registrar produtos consumidos pela própria operação sem criar cliente fictício e sem contaminar faturamento, ticket médio, formas de pagamento, A receber ou relacionamento com clientes.

## Fluxo
1. Abrir **Nova comanda**.
2. Marcar **Consumo interno / próprio**.
3. Lançar os produtos normalmente.
4. Finalizar pelo botão **Finalizar consumo interno**.

Não é necessário informar cliente, WhatsApp, aniversário ou forma de pagamento.

## Tratamento financeiro
O registro fechado recebe marcações próprias de consumo interno e mantém o valor dos itens apenas como **valor de referência**.

Para garantir isolamento dos indicadores já existentes:
- o fechamento interno usa `closedAt: 0` na trilha financeira padrão;
- a data operacional real fica em `internalBusinessDate`;
- o horário real fica em `internalClosedAt` / `operationalClosedAt`;
- o registro usa `businessDate: 0000-00-00`, fora das datas operacionais válidas de vendas;
- o valor de referência permanece em `internalReferenceTotal` / `referenceTotal`;
- `v02537-history-financial-guard.js` remove temporariamente registros internos da visão financeira padrão e da exportação de vendas CSV, restaurando o estado logo depois da renderização/exportação.

Com isso, o registro não participa do Painel de vendas, Histórico financeiro padrão, CSV de vendas nem dos snapshots de Fechamento do Turno.

## Histórico
O Histórico ganhou um bloco separado **Consumo interno**, filtrado pelos mesmos períodos (Hoje, Ontem, 7 dias, 30 dias e Todos) e pela busca.

Cada registro mostra:
- quantidade de itens;
- data e hora reais;
- valor de referência;
- indicação **Não faturado**;
- detalhe dos produtos ao tocar no registro.

## Multidispositivo
A comanda interna continua usando a sincronização existente de comandas e histórico.

Como a marcação `internalConsumption` é um campo adicional ao modelo legado, a release inclui uma pequena garantia de sincronização (`v02537-internal-sync-guard.js`) que envia um `command_opened` idempotente adicional com o estado completo da comanda interna. Não foi criado novo tipo de evento e não há migração de banco.

## Estoque
Os lançamentos de itens continuam seguindo o mesmo fluxo operacional de uma comanda comum. Portanto, os produtos permanecem rastreáveis pelo fluxo de estoque já existente; a diferença é apenas a classificação do fechamento como não faturado.

## WhatsApp e clientes
Consumo interno força:
- cliente vazio;
- WhatsApp vazio;
- opt-in desativado.

Assim, não gera mensagens nem cria relacionamento artificial com clientes.

## Ajuda
A Ajuda recebeu a seção **Consumo interno**, explicando quando usar e o que entra ou não nos indicadores.

## Arquivos principais
- `assets/v02537-internal-consumption.js`
- `assets/v02537-internal-consumption.css`
- `assets/v02537-internal-sync-guard.js`
- `assets/v02537-history-financial-guard.js`
- `assets/v0256-release.js`
- `VERSION`
- `sw.js`

## Backend
Sem alteração em Supabase, Edge Functions ou constraints do banco.

## Rollback
Baseline anterior: **v0.25.36** / `06f5ffbeae8f134b6605cdbb7d36f6dabf7e1fa0`.

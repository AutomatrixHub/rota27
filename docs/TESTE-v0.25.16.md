# Testes — Rota 27 v0.25.16

## Objetivo
Validar o reparo histórico de fechamento sem apagar eventos, sem limpar dados locais e sem permitir que um aparelho antigo reintroduza `turn_2026-08-26` como fechamento operacional efetivo.

## Cenários obrigatórios

### 1. Reparo local com fechamento antigo presente
Pré-condição simulada: `rota27_v019_turn_closures_v1` contém `turn_2026-08-26` com R$ 145,00.

Resultado esperado:
- fechamento antigo é copiado para `rota27_v02516_turn_repair_state_v1.archivedClosures`;
- fechamento antigo sai apenas da lista operacional efetiva;
- fechamento `turn_2026-08-25_repair_fred_20260826_v1` é instalado;
- `businessDate = 2026-08-25`;
- faturamento = R$ 448,00;
- comandas fechadas = 8;
- itens = 33.

Resultado executado em simulação local: **APROVADO**.

### 2. Idempotência
Executar o módulo de reparo repetidamente.

Resultado esperado:
- não duplicar fechamento substituto;
- não duplicar arquivo auditável;
- manter apenas uma verdade operacional efetiva.

Implementação: repair ID e closure ID fixos, com upsert local por identidade.

### 3. Reintrodução de estado antigo
Após o reparo, simular reaparecimento de `turn_2026-08-26` no store de fechamentos e acionar um ciclo de vida suportado.

Resultado esperado:
- regra de enforcement remove novamente o fechamento supersedido da visão efetiva;
- substituto permanece.

O módulo executa enforcement em inicialização, retorno online, retorno à visibilidade, evento de fechamento e tentativas finitas após carregamento. Não existe polling contínuo.

### 4. Cursor independente
O cursor `rota27_v02516_turn_repair_cursor_v1` inicia independente do cursor antigo de fechamento.

Resultado esperado:
- um aparelho cujo cursor antigo já tenha ultrapassado seq 539 ainda consegue localizar seq 635 `turn_closure_repair`;
- um aparelho que atualize dias depois converge para a mesma regra.

### 5. Histórico Fred
Evento administrativo seq 633.

Resultado esperado:
- `businessDate = 2026-08-25`;
- `operationalDate = 2026-08-25`;
- `closedAt = 1787746782300` permanece inalterado;
- `administrativeClosedAt = 1787746782300`.

### 6. A receber Fred
Evento administrativo seq 634.

Resultado esperado:
- recebível `recv_c1787690191876` continua com `originalAmount = 145`;
- `businessDate = operationalDate = 2026-08-25`;
- nenhuma baixa é criada;
- saldo permanece aberto até `receivable_payment` real.

### 7. Event log / auditoria
Resultado esperado:
- seq 539 continua presente;
- seq 635 registra a supersessão administrativa;
- não existe DELETE de eventos históricos.

### 8. Backend
Resultado esperado:
- `turn_closure_repair` aceito pelo CHECK do PostgreSQL;
- `turn_closure_repair` aceito pelo `ALLOWED_TYPES` da Edge;
- Edge version `rota27-sync-v0.25.16`;
- função versão 9 ACTIVE.

### 9. Regressão funcional
Confirmar preservação de:
- A receber / Paga depois e baixa parcial/total;
- seletor pesquisável de clientes;
- múltiplos turnos no mesmo dia;
- data operacional pela abertura;
- rankings por ID/código;
- referência de produtos em categorias;
- cópia fixa de WhatsApp;
- replay hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Validações estáticas executadas
- sintaxe de `v02516-repair.js`: aprovada;
- sintaxe do loader `v019-turn-close.js`: aprovada;
- sintaxe da identidade de release: aprovada;
- sintaxe do Service Worker: aprovada.

## Teste de produção após deploy
Em cada PWA, sem limpar dados:
1. abrir online por 20–30 segundos;
2. fechar completamente;
3. abrir novamente;
4. confirmar v0.25.16;
5. abrir Fechamentos e conferir 25/08 = R$ 448,00;
6. conferir que 26/08 não mantém o fechamento espúrio de R$ 145,00;
7. conferir A receber de Fred = R$ 145,00;
8. conferir Histórico de Fred com data operacional 25/08 e fechamento real 26/08.

# Rota 27 v0.23.0 — Inventário & Conferência

## Estado
**CANDIDATA EM DESENVOLVIMENTO — NÃO PUBLICADA EM PRODUÇÃO.**

Baseline preservada: **v0.22.0 — Compras & Reposição**.

## Objetivo
Fechar o ciclo físico do Estoque Essencial com uma conferência rápida, segura e auditável: comparar o saldo esperado pelo sistema com a quantidade realmente contada na loja, sem alterar o estoque durante a contagem e sem transformar o Rota 27 em ERP.

## Escopo aprovado
- acesso pelo Estoque Essencial;
- iniciar uma conferência com produtos de controle ativo;
- snapshot do saldo esperado no início da conferência;
- quantidade contada por produto;
- diferença calculada em tempo real;
- fluxo mobile-first com ação Próximo;
- busca e filtros por categoria e divergência;
- pausar e continuar depois;
- resumo antes da confirmação final;
- nenhum saldo é alterado enquanto a conferência estiver aberta;
- finalização gera movimentos `Ajuste de inventário` somente para divergências;
- IDs determinísticos por `inventário + produto`, evitando ajuste duplicado;
- histórico de inventários;
- CSV da conferência;
- indicador discreto de última conferência no Estoque Essencial;
- offline-first;
- multidispositivo;
- sem custo médio, fiscal, lote, validade ou código de barras nesta versão.

## Regra de saldo
Durante uma conferência aberta:

`diferença = quantidade contada - saldo esperado no snapshot`

A quantidade contada não modifica o Estoque Essencial.

Na confirmação final, para cada produto com diferença diferente de zero, criar um movimento imutável de estoque:

`inventory_adjust_<inventoryId>_<productId>`

com `delta = diferença` e motivo `Ajuste de inventário <código>`.

Reaplicar a mesma finalização não pode criar movimento duplicado.

## Modelo local proposto
Uma sessão de inventário contém, no mínimo:
- `id`;
- `code`;
- `status`: `open`, `finalized`, `cancelled`;
- `createdAt`, `updatedAt`, `finalizedAt`;
- aparelho de criação/finalização;
- itens com `productId`, `productName`, categoria, `expectedQty`, `countedQty` e observação opcional;
- resumo final.

Persistência local separada do saldo de estoque.

## Sincronização
Preferir o menor contrato possível.

Novo evento proposto:
- `inventory_upsert`.

A própria sessão carrega seu status e itens. A correção de saldo continua usando o evento existente `stock_movement`.

Não criar migration nem tabela nova se `rota27_sync_events` continuar suficiente.

O backend de produção permanece `rota27-sync-v0.22.0` durante o primeiro gate local. A allowlist v0.23 só será ampliada depois da validação local.

## UX
### Tela inicial
Mostrar:
- conferência em andamento, se houver;
- última conferência concluída;
- quantidade de produtos controlados;
- atalhos `Iniciar conferência`, `Continuar` e `Histórico`.

### Contagem
Cada item deve priorizar celular:
- produto e categoria;
- saldo esperado;
- campo grande para `Contado`;
- diferença imediatamente visível;
- botões `Anterior` / `Próximo`;
- contador de progresso;
- busca/filtro como apoio, não como obstáculo.

### Resumo
Antes de finalizar:
- produtos conferidos;
- não conferidos;
- sem diferença;
- faltas;
- sobras;
- lista de divergências;
- confirmação explícita.

## Segurança operacional
- não sobrescrever saldo diretamente;
- não alterar estoque durante a contagem;
- não apagar histórico anterior;
- não permitir finalização acidental sem confirmação;
- ajustes finais idempotentes;
- preservar toda a lógica validada da v0.21/v0.22;
- não introduzir polling visual ou novo `MutationObserver` concorrente.

## Fora de escopo
- custo de aquisição;
- CMV/margem;
- inventário financeiro;
- lote/validade;
- leitura de código de barras;
- fiscal/contábil;
- reposição automática por IA.

Esses temas ficam para versões posteriores. A próxima direção já aprovada, após a v0.23, é **v0.24 — Custos & Margem**.

# Rota 27 v0.22.0 — Especificação de Compras & Reposição

## Estado
CANDIDATA EM DESENVOLVIMENTO — não publicada em produção.

## Objetivo
Transformar os alertas do Estoque Essencial em uma rotina curta de reposição: identificar o que comprar, montar um pedido, registrar o que chegou e converter o recebimento em Entrada de estoque sem duplicidade.

A v0.22.0 não é um ERP. Compras não pode bloquear o atendimento normal.

## Princípios de produto
- mostrar primeiro apenas o que exige ação;
- reduzir digitação e número de toques;
- quantidade sugerida sempre editável;
- fornecedor é opcional;
- recebimento é rápido e idempotente;
- estado saudável permanece silencioso;
- operação, estoque e compras continuam separados;
- nenhuma falha em Compras & Reposição pode impedir abrir, lançar, editar, fechar ou cancelar comandas.

## Fila de reposição
A fila deriva apenas de produtos com controle de estoque ativo na v0.21.0.

Um produto entra em atenção quando o `Disponível projetado` está igual ou abaixo do estoque mínimo.

Quantidade sugerida inicial:

`max(0, estoque mínimo + 1 - disponível projetado)`

O `+1` apenas retira o produto da faixa crítica `<= mínimo`. O operador pode alterar livremente a quantidade antes de criar o pedido.

Nesta primeira versão não haverá configuração adicional de estoque alvo; isso evita criar mais uma configuração sem evidência de necessidade real.

## Fornecedores
Cadastro leve:
- nome obrigatório;
- WhatsApp/telefone opcional;
- observação opcional;
- produtos associados opcionalmente;
- arquivamento lógico em vez de exclusão destrutiva.

A associação produto → fornecedor é mantida no próprio registro sincronizado do fornecedor. Um produto pode ter no máximo um fornecedor padrão nesta etapa.

## Pedidos
Estados permitidos:
- `Rascunho`;
- `Enviado`;
- `Recebido`;
- `Cancelado`.

Cada pedido contém snapshot dos itens no momento da criação:
- produto;
- quantidade pedida;
- fornecedor quando houver;
- observação opcional;
- timestamps e aparelho de origem.

A lista pode ser agrupada por fornecedor. Itens sem fornecedor continuam válidos.

## Recebimentos
- parcial ou total;
- nunca recebe quantidade negativa;
- não permite receber além do saldo pendente do item;
- pedido cancelado não recebe;
- ao completar todos os itens, o pedido passa automaticamente para `Recebido`;
- recebimento parcial mantém o pedido pendente.

Cada recebimento é imutável e possui ID próprio. Para cada produto recebido é criada uma Entrada no Estoque Essencial com ID determinístico:

`purchase_entry_<receiptId>_<productId>`

Assim, reaplicar o mesmo recebimento não duplica saldo.

## Persistência local
Novas chaves locais ficam separadas da v0.21.0:
- `rota27_v022_suppliers_v1`;
- `rota27_v022_purchase_orders_v1`;
- `rota27_v022_purchase_receipts_v1`;
- `rota27_v022_purchase_outbox_v1`;
- `rota27_v022_purchase_cursor_v1`;
- `rota27_v022_purchase_meta_v1`.

Nenhuma chave existente é apagada ou renomeada.

## Sincronização
Reutilizar `rota27_sync_events`, sem migration nem tabela nova.

Conjunto mínimo de novos eventos:
- `supplier_upsert`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Não usar `supplier_delete`: fornecedor é arquivado por `supplier_upsert` com `active=false`.

Regras:
- IDs imutáveis para recebimentos;
- upsert de pedido/fornecedor por `updatedAt`;
- recebimento aplicado uma única vez;
- eventos desconhecidos continuam ignorados por clientes antigos;
- outbox do WhatsApp permanece fora deste fluxo.

A ampliação da allowlist do `rota27-sync` será aditiva e retrocompatível, porém só deve ser implantada quando a candidata estiver pronta para teste multidispositivo; a implementação inicial da branch não altera o backend de produção.

## Interface
Acesso principal em `Painel → Compras & Reposição`.

Visões:
1. `Reposição` — itens que exigem compra e criação rápida de pedido;
2. `Pedidos` — pendentes e histórico;
3. `Fornecedores` — cadastro leve e associação a produtos.

A tela mostra alertas somente quando existe ação necessária ou erro de sincronização.

## Compartilhamento
- copiar texto simples do pedido/lista para a área de transferência;
- exportar CSV do histórico;
- sem automação direta de envio ao fornecedor nesta etapa.

## Preservações obrigatórias
Não alterar comportamento de:
- comandas e cálculo financeiro;
- pagamento e cancelamento;
- Fechamento do Turno;
- Visão Gerencial e Modo demonstração;
- WhatsApp cliente/gerente e inbound;
- outbox local de WhatsApp;
- baixa de venda do Estoque Essencial.

Não reintroduzir polling visual frequente nem MutationObservers concorrentes no Painel.

## Critérios de aceite
1. produto controlado em faixa crítica aparece em `Reposição`;
2. quantidade sugerida é transparente e editável;
3. pedido pode ser criado com ou sem fornecedor;
4. fornecedor pode ser cadastrado e associado a produtos;
5. pedido pode ir de Rascunho para Enviado, Recebido ou Cancelado conforme regras;
6. recebimento parcial mantém saldo pendente;
7. recebimento total gera Entrada uma única vez no Estoque Essencial;
8. reaplicar o mesmo receipt não duplica estoque;
9. dados permanecem funcionais offline e entram em fila para sync;
10. segundo aparelho converge sem duplicar pedido, recebimento ou Entrada após backend compatível;
11. Comandas, Histórico, Auditoria, Fechamento do Turno, Visão Gerencial e WhatsApp permanecem sem regressão.

## Baseline
Branch de desenvolvimento deve partir da produção validada **v0.21.0**. A `main` permanece intocada até validação e autorização de merge.
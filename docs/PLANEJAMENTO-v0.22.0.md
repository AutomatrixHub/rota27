# Rota 27 v0.22.0 — Planejamento inicial

## Tema
**Compras & Reposição**

## Objetivo
Transformar os alertas do Estoque Essencial em uma rotina simples de compra, recebimento e reposição, sem transformar o Rota 27 em um ERP completo.

## Problema a resolver
A v0.21.0 já informa o que está abaixo do mínimo ou indisponível. A v0.22.0 deve responder:
- o que preciso comprar;
- quanto preciso comprar;
- de quem costumo comprar;
- o que já foi pedido;
- o que já chegou;
- como a entrada recebida atualiza o estoque sem duplicidade.

## Escopo recomendado
- fila `Reposição` derivada de produtos controlados abaixo do mínimo;
- quantidade sugerida de compra;
- quantidade editável antes de confirmar;
- fornecedor opcional por produto;
- cadastro leve de fornecedor: nome, WhatsApp/telefone e observação;
- agrupamento da lista por fornecedor;
- pedido simples com estados `Rascunho`, `Enviado`, `Recebido` e `Cancelado`;
- recebimento parcial ou total;
- recebimento gera movimento `Entrada` no Estoque Essencial;
- ID determinístico por pedido/item/recebimento para evitar entrada duplicada;
- histórico de pedidos e recebimentos;
- filtro por pendência, fornecedor e período;
- exportação CSV e/ou texto simples para compartilhamento;
- ação rápida para copiar lista de compra para WhatsApp sem automatizar envio nesta primeira etapa;
- operação offline-first;
- sincronização multidispositivo idempotente.

## Regra sugerida para quantidade de compra
Começar simples:

`quantidade sugerida = max(0, estoque alvo - disponível projetado)`

O estoque alvo pode começar como um valor configurável por produto. Se não existir, usar inicialmente o estoque mínimo como referência e sugerir apenas o necessário para sair da zona crítica. A regra deve permanecer transparente e editável pelo operador.

## Não incluir na v0.22.0
- emissão fiscal;
- contas a pagar;
- conciliação bancária;
- integração contábil;
- custo médio complexo;
- múltiplos centros de estoque;
- pedido automático sem confirmação humana;
- integração direta com fornecedor sem necessidade validada.

## Princípios de UX
- lista saudável permanece silenciosa;
- mostrar primeiro o que exige ação;
- criar pedido em poucos toques;
- recebimento deve ser rápido;
- nunca gerar Entrada duplicada;
- não bloquear atendimento por problema no módulo de compras;
- manter estoque, compras e operação claramente separados.

## Arquitetura sugerida
Reutilizar `rota27-sync` com novos eventos compatíveis, se necessário:
- `supplier_upsert`;
- `supplier_delete`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Antes de implantar, revisar se todos esses eventos são realmente necessários. Preferir o menor conjunto possível e evitar migrations se a infraestrutura de eventos existente continuar suficiente.

## Critérios de aceite iniciais
1. produto abaixo do mínimo aparece na fila de reposição;
2. usuário cria pedido com quantidade sugerida/editada;
3. pedido pode ser agrupado por fornecedor;
4. recebimento gera entrada de estoque uma única vez;
5. recebimento parcial mantém saldo pendente;
6. segundo aparelho converge sem duplicar pedido ou entrada;
7. offline permite preparar pedido/recebimento e sincronizar depois;
8. comandas, WhatsApp, Fechamento do Turno e Visão Gerencial continuam inalterados.

## Baseline
Desenvolver a v0.22.0 somente a partir da **v0.21.0 de produção validada**.

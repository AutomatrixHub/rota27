# Rota 27 — Release v0.25.45

Data: 28/08/2026

## Objetivo

Aproveitar melhor a altura disponível na visualização **Comandas → Lista**, permitindo visualizar mais comandas na mesma tela sem alterar o desenho geral dos cartões.

## Alteração

Nos cartões da Lista:

- o local da comanda (`Balcão`, `Parklet`, `Mesa` etc.) passa para a mesma linha do nome do cliente;
- a altura vertical do cartão é reduzida discretamente;
- os espaçamentos internos são compactados sem remover informação;
- preço, quantidade de itens, tempo em aberto, último lançamento e botão `Abrir →` são preservados;
- a faixa lateral preta/vermelha existente é preservada;
- a visualização **Mapa** não é alterada.

## Implementação

A mudança é aplicada por uma camada versionada própria:

- `assets/v02545-command-list-compact.css`;
- `assets/v02545-command-list-compact.js`.

A camada reutiliza o renderer já existente e apenas reposiciona o elemento de local após cada renderização. Não existe `MutationObserver`, polling contínuo ou alteração do modelo de dados.

## Segurança operacional

Não há alterações em:

- cálculo de comandas;
- abertura, lançamento, edição, fechamento ou cancelamento;
- sincronização;
- fechamento de turno;
- estoque, compras ou inventário;
- clientes/fidelização;
- WhatsApp;
- Supabase ou Edge Functions.

## PWA

- `VERSION = 0.25.45`;
- cache `rota27-comandas-v0.25.45-r1`.

Não reinstalar o PWA e não limpar dados locais. A atualização segue o fluxo normal do Service Worker.

## Rollback

Baseline anterior: **v0.25.44**.

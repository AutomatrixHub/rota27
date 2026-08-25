# Rota 27 — Status de produção

Última revisão: 24/08/2026

## Produção
- versão: **v0.23.0 — Inventário & Conferência**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.23.0`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: **versão 7 ACTIVE** (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

A v0.23.0 preserva a operação validada da v0.22.0 e acrescenta **Inventário & Conferência** ao Estoque Essencial.

## Validação da v0.23.0
Em 24/08/2026 a candidata foi testada e aprovada em desktop, celular e em dois aparelhos com sincronização A→B.

Foram validados:
- estabilidade de Painel, Estoque e Compras;
- início de uma única conferência por vez;
- snapshot do saldo esperado dos produtos controlados;
- contagem rápida mobile;
- diferença em tempo real;
- atalhos Igual ao sistema / Sem unidade;
- busca, categoria, Pendentes e Divergentes;
- pausar/continuar;
- nenhuma alteração de saldo durante a contagem;
- revisão de corretos, faltas e sobras;
- bloqueio se houver item não contado;
- bloqueio se o estoque se movimentar durante a conferência;
- finalização sem divergência sem movimento desnecessário;
- finalização com divergência gerando ajuste correto;
- idempotência por `inventory_adjust_<inventoryId>_<productId>`;
- histórico e CSV;
- offline local;
- sincronização da sessão por `inventory_upsert`;
- convergência A→B das contagens e da finalização;
- saldo final igual entre aparelhos e sem duplicidade relevante de ajustes.

Baseline anterior de rollback: **v0.22.0**.

## Inventário & Conferência
Disponível dentro de `Painel → Estoque Essencial`.

Regras principais:
- somente produtos com controle de estoque ativo entram;
- uma única conferência aberta por vez;
- o saldo esperado é congelado no início da sessão;
- o estoque não muda enquanto a contagem está em andamento;
- quantidade contada pode ser registrada produto a produto;
- diferença = `contado - esperado`;
- faltas são negativas; sobras são positivas;
- a finalização exige todos os produtos conferidos;
- se houver movimentação de estoque posterior ao início, a finalização é bloqueada;
- somente divergências confirmadas geram movimentos de tipo `adjust`;
- movimento usa ID determinístico `inventory_adjust_<inventoryId>_<productId>`;
- histórico preserva esperado, contado e diferença;
- CSV disponível;
- sessão funciona offline e sincroniza depois.

## Backend e sincronização
A v0.23.0 reutiliza `rota27_sync_events`; não há migration nem tabela nova.

Novo evento:
- `inventory_upsert`.

Ajustes físicos continuam usando:
- `stock_movement`.

A Edge Function `rota27-sync` está na **versão 7 ACTIVE** com `EDGE_VERSION = rota27-sync-v0.23.0` e `verify_jwt=false`, preservando a autenticação própria por `x-rota27-device-token`.

Todos os contratos anteriores permanecem ativos, incluindo Comandas, Clientes, Fechamento do Turno, Estoque e Compras.

## Estoque Essencial
Permanece com:
- controle opcional por produto;
- estoque inicial e mínimo;
- saldo = estoque inicial + movimentos imutáveis;
- comprometido em comandas abertas;
- disponível projetado = estoque - comprometido;
- baixa de venda no fechamento;
- Entrada, Perda, Consumo interno e Ajuste;
- integração com Compras & Reposição;
- Central gerencial e layout mobile compacto.

A v0.23 acrescenta:
- acesso direto ao Inventário;
- indicador de última conferência / conferência em andamento.

## Compras & Reposição
Permanece validado:
- fila automática de reposição;
- fornecedor opcional/padrão;
- pedidos Rascunho/Enviado/Recebido/Cancelado;
- recebimento parcial/total;
- Entrada automática idempotente no estoque;
- histórico, copiar pedido e CSV;
- visão gerencial e mobile.

## Estabilidade do Painel
A solução estabilizada na v0.21.0 continua preservada:
- sem polling visual novo;
- sem novo `MutationObserver` concorrente;
- compatibilidade limitada aos filhos diretos de `screenPanel`;
- Inventário não adiciona observer visual.

## Fechamento do Turno, Visão Gerencial e Modo demonstração
Permanecem ativos e sem mudança funcional na v0.23.0.

## WhatsApp
Sem mudança funcional na v0.23.0:
- templates mini2 preservados;
- inbound ativo;
- outbox permanece local por aparelho e nunca é sincronizada.

## Ajuda v4.7
Inclui Inventário & Conferência, além de Estoque Essencial, Compras & Reposição e demais fluxos já existentes.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.23.0` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration destrutiva;
- local-first preservado;
- ajustes de inventário somente após confirmação;
- outbox do WhatsApp permanece local.

## Próxima etapa
Direção aprovada: **v0.24.0 — Custos & Margem**.

O escopo detalhado da v0.24 deve ser fechado a partir do uso real da v0.23 e deve evitar confundir preço de venda com custo de aquisição.

Ver `docs/RELEASE-v0.23.0.md`.

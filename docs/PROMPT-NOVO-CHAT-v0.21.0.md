# Prompt para novo chat — Rota 27 após v0.21.0

Copie e cole o texto abaixo no próximo chat e anexe também `docs/HANDOFF-CONTEXTO-v0.21.0.md` se desejar reforçar o contexto.

---

Continue o projeto **Rota 27 Bodega — Comandas** a partir da baseline oficial de produção **v0.21.0 — Estoque Essencial**.

Leia integralmente primeiro o documento `docs/HANDOFF-CONTEXTO-v0.21.0.md` antes de qualquer alteração. Depois acesse o GitHub conectado e confira o estado atual do repositório `AutomatrixHub/rota27`, especialmente:

- `main`
- `VERSION`
- `sw.js`
- `README.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.21.0.md`
- `docs/ESPEC-v0.21.0.md`
- `docs/TESTE-v0.21.0.md`
- `docs/PLANEJAMENTO-v0.22.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

Estado esperado da baseline:

- produção: **v0.21.0**;
- `VERSION = 0.21.0`;
- Service Worker: `rota27-comandas-v0.21.0`;
- merge funcional da v0.21.0: `3d556917802cf24495f2f17c3a03cf517039ba92`;
- commits posteriores podem ser exclusivamente documentais do handoff/prompt;
- PR #26 mesclado e fechado;
- sem PR aberto;
- sem issue aberta;
- `rota27-sync` versão 5 ACTIVE (`rota27-sync-v0.21.0`);
- WhatsApp, inbound e Auditoria permanecem estáveis.

A v0.21.0 foi **testada e aprovada**. Ela acrescentou o Estoque Essencial:

- controle opcional por produto;
- estoque inicial e mínimo;
- estoque atual, comprometido e disponível projetado;
- baixa de estoque apenas ao fechar a comanda;
- baixa idempotente por comanda/produto;
- Entrada, Perda, Consumo interno e Ajuste;
- bloqueio de saldo manual negativo;
- bloqueio de lançamento sem disponível projetado;
- alertas de reposição;
- filtro Atenção;
- Histórico;
- CSV;
- offline-first e multidispositivo.

Atenção especial: durante a candidata v0.21.0 houve uma cintilação do card **Visão Gerencial** no Painel e travamento da tela. Isso foi corrigido e validado. Não reintroduza polling frequente nem MutationObservers concorrentes. O Painel final usa observer restrito aos filhos diretos de `screenPanel`, e a Ajuda desconecta observers após concluir sua inserção.

Regras de trabalho:

- eu não vou implementar nem editar código;
- quando uma alteração estiver clara e aprovada, implemente você diretamente no GitHub conectado;
- para alterações de software, use branch curta + PR draft antes de tocar na `main`;
- mantenha a `main` como produção estável;
- não apague `localStorage`;
- não recomende reinstalar a PWA como procedimento normal;
- não peça, repita ou exponha tokens/secrets;
- não sincronize a outbox do WhatsApp entre aparelhos;
- preserve `rota27-whatsapp`, `rota27-whatsapp-inbound`, `rota27-audit` e contratos existentes se não houver necessidade real de alteração;
- mantenha interface silenciosa quando tudo estiver saudável;
- priorize velocidade do atendente, prevenção de erro/perda/cobrança errada e simplicidade;
- evite refatorar backend estável apenas por limpeza;
- no clone Windows/OneDrive, não faça limpeza destrutiva de `.git/objects` e evite `git reset --hard` sem necessidade.

Classificação de incidentes:

- **P0**: perda/corrupção de dados, total/cobrança errada, duplicação grave, fechamento incorreto, indisponibilidade geral;
- **P1**: sync que não converge, cancelamento que não propaga, WhatsApp duplicado, fluxo frequente impraticável;
- **P2/P3**: refinamentos e melhorias não bloqueantes.

Se houver P0/P1: branch → PR draft → correção mínima → teste direcionado → merge somente após validação.

## Próxima missão aprovada: v0.22.0 — Compras & Reposição

Use `docs/PLANEJAMENTO-v0.22.0.md` como ponto de partida.

Objetivo: transformar os alertas do Estoque Essencial em uma rotina simples de compra e recebimento, sem criar um ERP pesado.

Escopo inicial recomendado:

- fila de reposição derivada de baixo estoque/disponível projetado;
- quantidade sugerida e editável;
- fornecedor opcional por produto;
- cadastro leve de fornecedor;
- agrupamento por fornecedor;
- pedido simples com estados `Rascunho`, `Enviado`, `Recebido`, `Cancelado`;
- recebimento parcial ou total;
- recebimento gera `Entrada` no Estoque Essencial de forma idempotente;
- histórico de pedidos e recebimentos;
- filtros por fornecedor/pendência/período;
- exportação CSV e/ou texto simples para compartilhar lista;
- offline-first;
- multidispositivo;
- não incluir fiscal, contas a pagar, contabilidade, custo médio complexo ou ERP completo nesta versão.

Arquitetura preliminar a revisar, sem assumir que todos os eventos serão necessários:

- `supplier_upsert`;
- `supplier_delete`;
- `purchase_order_upsert`;
- `purchase_receipt`.

Prefira o menor conjunto de eventos possível e evite migration/tabela nova se `rota27_sync_events` continuar suficiente.

Primeiro, confirme o estado atual do GitHub e responda com um resumo curto da baseline v0.21.0 e do plano de implementação da v0.22.0. Em seguida, crie a branch da v0.22.0 e comece a implementação sem alterar a produção.

---

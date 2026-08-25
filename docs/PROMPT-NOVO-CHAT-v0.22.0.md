# Prompt para novo chat — Rota 27 após v0.22.0

Copie e cole o texto abaixo no próximo chat e, se desejar, anexe também `docs/HANDOFF-CONTEXTO-v0.22.0.md`.

---

Continue o projeto **Rota 27 Bodega — Comandas** a partir da baseline oficial de produção **v0.22.0 — Compras & Reposição**.

Leia integralmente primeiro `docs/HANDOFF-CONTEXTO-v0.22.0.md`. Depois acesse o GitHub conectado e confira o estado atual do repositório `AutomatrixHub/rota27`, especialmente:

- `main`
- `VERSION`
- `sw.js`
- `README.md`
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.22.0.md`
- `docs/TESTE-v0.22.0.md`
- `docs/ESPEC-v0.22.0.md`
- `docs/REVISAO-GERENCIAL-v0.22.0.md`
- `docs/REVISAO-GERENCIAL-ESTOQUE-v0.22.0.md`
- `docs/PRODUCT-PRINCIPLES.md`

Estado esperado:
- produção: **v0.22.0**;
- `VERSION = 0.22.0`;
- Service Worker: `rota27-comandas-v0.22.0`;
- `rota27-sync` versão **6 ACTIVE** (`rota27-sync-v0.22.0`);
- Compras & Reposição em produção;
- Estoque Essencial com visão gerencial ampliada;
- WhatsApp, inbound, Auditoria, Fechamento do Turno e Visão Gerencial preservados.

A v0.22.0 acrescentou:
- fila automática de reposição;
- quantidade sugerida/editável;
- fornecedores;
- pedidos por fornecedor;
- estados Rascunho/Enviado/Recebido/Cancelado;
- recebimento parcial/total;
- Entrada idempotente no estoque;
- histórico/cópia/CSV;
- central gerencial de Compras;
- central gerencial do Estoque;
- refinamento mobile após teste em aparelho real;
- sync pelos eventos `supplier_upsert`, `purchase_order_upsert`, `purchase_receipt`.

Atenção de estabilidade:
- não reintroduzir polling visual frequente;
- não criar `MutationObserver` concorrente sobre o Painel;
- manter a solução restrita aos filhos diretos de `screenPanel`;
- a lógica funcional do Estoque v0.21 permanece a base validada.

Regras de trabalho:
- eu não vou implementar nem editar código;
- implemente diretamente no GitHub quando a alteração estiver clara e aprovada;
- use branch curta + PR draft para mudanças não triviais;
- mantenha `main` como produção estável;
- não apague `localStorage`;
- não recomende reinstalar a PWA como procedimento normal;
- não peça nem exponha tokens/secrets;
- não sincronize outbox do WhatsApp;
- preserve contratos de backend estáveis se não houver necessidade real de mudança;
- priorize velocidade, prevenção de erro/perda/cobrança errada e simplicidade.

O backend v0.22 foi publicado sem migration. No fechamento do release ainda não havia evento de Compras no log remoto após o deploy; portanto, se o primeiro uso real multidispositivo revelar falha P0/P1 de convergência, trate como hotfix imediato.

Classificação:
- **P0**: perda/corrupção de dados, total/cobrança errada, duplicação grave, fechamento incorreto, indisponibilidade geral;
- **P1**: sync não converge, cancelamento não propaga, WhatsApp duplica, fluxo frequente impraticável;
- **P2/P3**: refinamentos e melhorias não bloqueantes.

**Não existe escopo aprovado da v0.23.0.** Primeiro confirme a baseline e depois aguarde/ajude a definir a próxima prioridade com base no uso real da v0.22.0.

---

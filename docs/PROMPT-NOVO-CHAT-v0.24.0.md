# Prompt para novo chat — Rota 27 após v0.24.0

Continue o projeto **Rota 27 Bodega — Comandas** a partir da baseline de produção **v0.24.0 — Custos & Margem**.

Antes de qualquer alteração:
1. leia `README.md`;
2. leia `docs/STATUS-PRODUCAO.md`;
3. leia `docs/RELEASE-v0.24.0.md`;
4. leia `docs/HANDOFF-CONTEXTO-v0.24.0.md`;
5. confira `main` e o estado real do GitHub/Supabase.

## Regras
- preserve `main` durante desenvolvimento;
- use branch curta + PR draft para mudanças relevantes;
- não limpe dados/localStorage para resolver bugs;
- não reintroduza polling visual frequente nem `MutationObserver` concorrente no Painel;
- custos só podem vir de aquisição real registrada; nunca inferir pelo preço de venda;
- backend de sync da baseline é Edge Function v7 (`rota27-sync-v0.23.0`) e já transporta os payloads da v0.24;
- não criar nova migration/evento sem necessidade demonstrada.

## Próxima decisão de produto
Não existe v0.25 automaticamente definida.

Avalie o uso real da v0.24 e recomende a melhor próxima evolução entre, principalmente:
- inteligência de giro/reposição;
- relacionamento/fidelização de clientes.

Mantenha o produto leve, rápido e operacional; não transformar o Rota 27 em ERP.

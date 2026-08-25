# Rota 27 v0.25.0 — Registro de validação

## Estado
**CANDIDATA — gate local aprovado; convergência A→B ainda pendente.**

Produção preservada: **v0.24.0 — Custos & Margem**.

PR: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Gate local
Em 25/08/2026, o proprietário testou a candidata v0.25.0, incluindo os lotes de Relacionamento & Fidelização, o modo demonstração seguro e o incremento R3 `Preferido chegou recentemente`, e informou: **“Perfeito. Testado e aprovado.”**

Considerar aprovados no gate local:
- acesso e identidade visual v0.25.0;
- Visão geral, Clientes e Para lembrar;
- níveis Novo / Recorrente / Frequente / Cliente da casa;
- sinal Sumido;
- ritmo médio e Leitura do momento;
- produtos/categorias preferidos;
- marcos recentes de 5/10 visitas;
- cadastro a completar;
- perfil do cliente e histórico recente;
- WhatsApp contextual sob ação humana;
- modo demonstração `?preview=v0250` sem persistência;
- R3 `Preferido chegou recentemente`;
- apresentação desktop/mobile observada no teste local;
- ausência de regressão crítica relatada pelo usuário durante o gate.

## R3 — regra aprovada
A oportunidade `Preferido chegou recentemente` permanece estritamente derivada e só existe quando todos os critérios forem verdadeiros:
1. cliente com 2+ visitas;
2. WhatsApp cadastrado;
3. produto é o primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponibilidade atual maior que zero;
7. cliente ainda não voltou depois do recebimento.

Nenhum envio é automático.

## Arquitetura confirmada
A v0.25.0 continua sem:
- novo tipo de evento de sincronização;
- tabela nova;
- migration nova;
- nova Edge Function;
- disparo em massa;
- rotina automática de marketing.

As métricas e oportunidades são derivadas dos dados existentes de clientes, histórico, catálogo/itemMeta, recebimentos e estoque.

## Gate restante antes de produção
Ainda é obrigatório validar a convergência **A→B**:
- mesmos clientes/histórico → mesmas visitas, totais, níveis, ritmo e preferências;
- recebimentos/estoque convergentes → mesma oportunidade R3 nos dois aparelhos;
- nova comanda do cliente após o recebimento remove a oportunidade nos dois aparelhos depois do sync;
- nenhum novo evento específico de fidelização deve aparecer no backend.

## Promoção
Não promover para `main` apenas com este gate local.

A promoção exige:
1. A→B aprovado;
2. documentação final/release/handoff atualizada;
3. autorização explícita de merge/publicação.

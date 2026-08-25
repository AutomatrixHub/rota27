# Rota 27 v0.25.0 — Registro de validação

## Estado
**APROVADA PARA PRODUÇÃO em 25/08/2026.**

Produção anterior preservada durante todo o desenvolvimento: **v0.24.0 — Custos & Margem**.

PR: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Gate local
Em 25/08/2026, o proprietário testou a candidata v0.25.0, incluindo Relacionamento & Fidelização, modo demonstração seguro e o incremento R3 `Preferido chegou recentemente`, e informou: **“Perfeito. Testado e aprovado.”**

Foram aprovados:
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
- apresentação desktop/mobile;
- ausência de regressão P0/P1 relatada no gate.

## Gate A→B
Em 25/08/2026, após sincronização entre os aparelhos A e B, o proprietário confirmou:

**“Dados totalmente sincronizados. A -> B passou. Pode publicar. APROVADO.”**

A convergência foi aceita para:
- cadastro e histórico dos clientes;
- visitas e totais identificados;
- níveis de recorrência;
- ritmo médio;
- preferências;
- sinais derivados de relacionamento;
- dados de recebimento/estoque já transportados pelo sync atual, base necessária para as oportunidades R3.

A v0.25 não cria dado persistente de fidelização separado. Portanto, quando as fontes existentes convergem entre aparelhos, as métricas e oportunidades convergem por cálculo local.

## R3 — regra aprovada
A oportunidade `Preferido chegou recentemente` só existe quando todos os critérios forem verdadeiros:
1. cliente com 2+ visitas;
2. WhatsApp cadastrado;
3. produto é o primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponibilidade atual maior que zero;
7. cliente ainda não voltou depois do recebimento.

Proteções aprovadas:
- estoque zero remove a oportunidade;
- nova visita após o recebimento remove a oportunidade;
- produto sem controle de estoque não gera afirmação de disponibilidade;
- nenhum envio automático;
- nenhum disparo em massa;
- nenhuma promessa automática de desconto/brinde.

## Arquitetura confirmada
A v0.25.0 permanece sem:
- novo tipo de evento de sincronização;
- tabela nova;
- migration nova;
- nova Edge Function;
- disparo em massa;
- rotina automática de marketing.

As métricas e oportunidades são derivadas de:
- `state.clients`;
- `state.history`;
- `state.catalog` / `itemMeta`;
- recebimentos de Compras & Reposição;
- disponibilidade do Estoque Essencial.

As camadas novas não introduzem `setInterval` nem `MutationObserver`.

## Autorização
O proprietário autorizou explicitamente a publicação da v0.25.0 em 25/08/2026.

A release pode ser marcada como ready e mesclada na `main`, preservando a v0.24.0 como baseline de rollback.
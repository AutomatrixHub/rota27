# Handoff — Rota 27 v0.25.0

## Baseline oficial
Versão: **v0.25.0 — Clientes & Fidelização**  
Branch de produção após promoção: `main`  
Service Worker: `rota27-comandas-v0.25.0-r3`  
Rollback: **v0.24.0 — Custos & Margem**.

## Backend
Supabase: `owkvwsiblbzlpxjwybrt`.

`rota27-sync` permanece:
- versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- `verify_jwt=false`;
- autenticação por `x-rota27-device-token`.

A v0.25 não adiciona evento, tabela, migration ou Edge Function. A inteligência de relacionamento é derivada de fontes já sincronizadas.

Permanece aplicada a migration de constraint da v0.23:
`20260825012842_expand_rota27_sync_event_types_v023`.

## Módulos operacionais
- Comandas;
- Clientes/WhatsApp;
- Clientes & Fidelização;
- Fechamento do Turno/Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Clientes & Fidelização
Acesso em:
`Cardápio/Menu → Clientes → Relacionamento & Fidelização`.

A Central possui:
- Visão geral;
- Clientes;
- Para lembrar.

Perfil derivado:
- visitas;
- total identificado;
- ticket médio;
- itens;
- primeira/última visita;
- ritmo médio;
- produtos/categorias preferidos;
- últimas compras.

Classificação:
- Novo: 0–1;
- Recorrente: 2–4;
- Frequente: 5–9;
- Cliente da casa: 10+;
- Sumido: 2+ visitas e 30+ dias sem retorno.

## Associação cliente ↔ comanda
Regra:
1. quando o cliente possui WhatsApp, exigir o mesmo telefone normalizado na comanda;
2. fallback por nome somente quando cliente e comanda estão sem telefone.

Não afrouxar essa regra sem novo gate, pois ela evita mistura entre homônimos.

## Para lembrar
Sinais:
- cliente recorrente sumido;
- marco recente de 5/10 visitas;
- cliente frequente sem WhatsApp;
- `Preferido chegou recentemente`.

Os sinais devem continuar explicáveis e acionáveis; evitar alertas abstratos.

## Preferido chegou recentemente
Só existe quando:
1. cliente tem 2+ visitas;
2. possui WhatsApp;
3. produto recebido é seu primeiro preferido calculado;
4. recebimento positivo ocorreu nos últimos 7 dias;
5. controle de Estoque Essencial está ativo;
6. disponibilidade atual > 0;
7. cliente não voltou depois do recebimento.

Se estoque zerar ou cliente retornar, a oportunidade deve desaparecer.

A lógica usa:
- `window.Rota27V022.getReceipts()`;
- `window.Rota27V021.getConfigs()`;
- `window.Rota27V021.availableQty()`;
- perfis derivados por `window.Rota27V025.dataset()`.

## WhatsApp de relacionamento
A v0.25 somente abre `wa.me` por ação humana.

Nunca transformar automaticamente em:
- disparo em massa;
- campanha automática;
- agenda automática;
- promessa de desconto/brinde.

## Modo demonstração
`?preview=v0250` usa dados fictícios somente em memória.

Regras:
- nada persistido;
- nada sincronizado;
- clientes fictícios não podem ser editados;
- WhatsApp real não abre em preview.

## Estabilidade crítica
O Painel já sofreu cintilação/travamento por polling visual e `MutationObserver` concorrentes.

Preservar:
- sem polling visual frequente;
- sem observers concorrentes;
- preferir eventos existentes e renderização sob demanda.

As novas camadas v0.25 não adicionam `setInterval` nem `MutationObserver`.

## Assets principais da v0.25
- `assets/v025-relationship.js`;
- `assets/v025-relationship.css`;
- `assets/v025-relationship-r2.css`;
- `assets/v025-relationship-r3.js`;
- `assets/v025-relationship-r3.css`;
- `assets/v025-release-identity.css`.

## Validações
Em 25/08/2026 foram aprovados:
- gate local;
- desktop/mobile;
- métricas e preferências;
- níveis/ritmo/Sumido;
- marcos;
- WhatsApp manual;
- preview seguro;
- R3;
- convergência A→B.

Autorização explícita de publicação recebida.

## Custos & Margem preservados
A regra da v0.24 permanece inegociável:
**não inferir custo pelo preço de venda.**

Pedidos em `draft` continuam editáveis; custos trafegam em `purchase_order_upsert` e `purchase_receipt`.

## Próximo desenvolvimento
Gestão avançada de estoque/giro foi deliberadamente adiada porque a escala atual do negócio não justifica mais complexidade agora.

Próximos incrementos de relacionamento só devem entrar se:
- reduzirem esforço;
- aumentarem retorno do cliente;
- forem simples de operar;
- evitarem CRM pesado e marketing automático.

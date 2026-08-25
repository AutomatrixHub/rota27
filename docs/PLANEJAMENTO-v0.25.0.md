# Rota 27 v0.25.0 — Planejamento

## Tema
**Clientes & Fidelização**

## Estado
Planejamento aprovado em 25/08/2026. Candidata deve permanecer fora de `main` até validação explícita.

## Contexto de produto
A v0.24.0 já cobre de forma suficiente para a escala atual do negócio o ciclo operacional de comandas, estoque, compras, inventário e custos. A próxima frente prioriza retorno do cliente e relacionamento, com ganho direto de receita e sem aprofundar gestão avançada de estoque nesta etapa.

A implementação deve seguir `docs/PRODUCT-PRINCIPLES.md`: cada informação precisa mudar uma próxima decisão do dono; evitar CRM pesado, telas administrativas e configurações que não tragam ação clara.

## Objetivo
Transformar o cadastro de clientes já existente em uma central simples que responda:
- quem voltou e com que frequência;
- quem não aparece há algum tempo;
- o que cada cliente costuma consumir;
- qual cliente merece atenção agora;
- qual contexto pode ajudar o dono a fazer um contato pessoal pelo WhatsApp.

## Escopo inicial aprovado
### 1. Central Clientes & Fidelização
Acesso a partir da área de Clientes existente, sem criar um grande fluxo paralelo no Painel.

### 2. Ficha do cliente
Usar dados já existentes para mostrar:
- nome e WhatsApp;
- observação já cadastrada;
- número de visitas/comandas fechadas;
- total histórico identificado;
- ticket médio identificado;
- primeira e última visita;
- dias desde a última visita;
- produtos preferidos;
- categorias preferidas;
- últimas visitas/compras.

### 3. Classificação automática simples
Sem pontos configuráveis:
- **Novo**: até 1 visita;
- **Recorrente**: 2 a 4 visitas;
- **Frequente**: 5 ou mais visitas;
- **Cliente da casa**: 10 ou mais visitas;
- **Sumido**: cliente com pelo menos 2 visitas e 30 ou mais dias sem retorno.

Os rótulos são apoio operacional, não status comercial rígido.

### 4. Clientes para lembrar
Gerar somente oportunidades com motivo claro, por exemplo:
- cliente recorrente/frequente há 30+ dias sem visita;
- marco recente de 5 ou 10 visitas;
- cliente frequente sem WhatsApp cadastrado pode aparecer como pendência de cadastro, mas nunca como alerta crítico.

Evitar alertas sem ação.

### 5. Preferências
Calcular automaticamente a partir das comandas fechadas identificadas:
- produtos mais comprados;
- categorias mais consumidas quando o catálogo permitir resolver a categoria;
- última compra.

Não pedir ao operador para preencher preferências manualmente se o sistema já consegue inferir do histórico.

### 6. WhatsApp contextual, sempre manual
A Central pode montar uma sugestão de texto e abrir o WhatsApp (`wa.me`) com a mensagem preenchida.

Regras:
- nunca enviar automaticamente;
- nunca disparar em massa;
- dono decide cliente por cliente;
- mensagem deve ser editável no próprio WhatsApp antes do envio;
- usar apenas dados já conhecidos do cliente;
- não reutilizar a Edge Function/template transacional para mensagens comerciais genéricas nesta primeira versão.

### 7. Fidelização leve
Não criar programa de pontos/milhas nesta versão. A fidelização inicial é baseada em frequência real e marcos de visita, com reconhecimento simples do relacionamento.

## Dados e arquitetura
Prioridade: **derivar inteligência dos dados existentes**, principalmente:
- `state.clients`;
- `state.history`;
- `state.catalog`;
- `itemMeta` preservado nas comandas fechadas.

A candidata deve evitar novo evento, tabela, migration ou Edge Function se não forem necessários. Nesta primeira fase, métricas e oportunidades são calculadas localmente sobre dados que já sincronizam.

Matching de cliente:
1. WhatsApp normalizado quando disponível;
2. fallback por nome normalizado somente quando o cliente não possui WhatsApp.

## Fora de escopo
- CRM, lead, funil e pipeline;
- campanhas em massa;
- disparos automáticos/agendados;
- automação de marketing;
- programa complexo de pontos, cashback ou cupons;
- aniversário nesta primeira candidata se exigir novo modelo persistente/sync;
- gestão avançada de estoque/giro nesta etapa.

## UX
- mobile-first;
- leitura rápida;
- uma ação principal por oportunidade;
- perfil do cliente sem excesso de métricas;
- filtros curtos: Todos, Para lembrar, Frequentes, Sumidos;
- busca por nome/WhatsApp;
- nenhuma nova rotina obrigatória para atendente.

## Estabilidade
Preservar integralmente a correção do Painel:
- sem polling visual frequente novo;
- sem `MutationObserver` concorrente;
- preferir eventos e renderização sob demanda.

## Gate
Antes de produção validar:
1. métricas com histórico real;
2. matching correto por telefone/nome;
3. preferências coerentes;
4. classificação e regra de 30 dias;
5. WhatsApp apenas manual;
6. desktop e celular;
7. nenhum impacto em Comandas, Estoque, Compras, Inventário, Custos e sync;
8. comportamento correto quando cliente não possui histórico suficiente;
9. documentação final;
10. autorização explícita de merge.

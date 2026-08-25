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
- qual é o ritmo aproximado de retorno;
- qual cliente merece atenção agora;
- quando um recebimento real cria uma oportunidade pessoal de relacionamento;
- qual contexto pode ajudar o dono a fazer um contato manual pelo WhatsApp.

## Escopo aprovado
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
- ritmo médio quando houver histórico suficiente;
- produtos preferidos;
- categorias preferidas;
- últimas visitas/compras;
- leitura simples do momento.

### 3. Classificação automática simples
Sem pontos configuráveis:
- **Novo**: até 1 visita;
- **Recorrente**: 2 a 4 visitas;
- **Frequente**: 5 a 9 visitas;
- **Cliente da casa**: 10 ou mais visitas;
- **Sumido**: cliente com pelo menos 2 visitas e 30 ou mais dias sem retorno.

Os rótulos são apoio operacional, não status comercial rígido.

### 4. Clientes para lembrar
Gerar somente oportunidades com motivo claro:
- cliente recorrente/frequente há 30+ dias sem visita;
- marco recente de 5 ou 10 visitas;
- cliente frequente sem WhatsApp como conveniência de cadastro;
- produto preferido recebido recentemente, quando ainda houver disponibilidade real e o cliente não tiver voltado depois do recebimento.

Evitar alertas sem ação.

### 5. Preferências
Calcular automaticamente a partir das comandas fechadas identificadas:
- produtos mais comprados;
- categorias mais consumidas quando o catálogo permitir resolver a categoria;
- última compra.

Não pedir ao operador para preencher preferências manualmente se o sistema já consegue inferir do histórico.

### 6. Ritmo
Calcular intervalo médio entre visitas para uma leitura descritiva:
- quase semanal;
- a cada 1–2 semanas;
- quase mensal;
- mais espaçado.

Não transformar ritmo em agenda automática ou previsão garantida.

### 7. WhatsApp contextual, sempre manual
A Central pode montar uma sugestão de texto e abrir o WhatsApp (`wa.me`) com a mensagem preenchida.

Regras:
- nunca enviar automaticamente;
- nunca disparar em massa;
- dono decide cliente por cliente;
- mensagem deve ser editável no próprio WhatsApp antes do envio;
- usar apenas dados já conhecidos do cliente;
- não reutilizar a Edge Function/template transacional para mensagens comerciais genéricas nesta primeira versão.

### 8. Fidelização leve
Não criar programa de pontos/milhas nesta versão. A fidelização inicial é baseada em frequência real e marcos de visita, com reconhecimento simples do relacionamento.

### 9. Oportunidade por recebimento
Cruzar dados já existentes de relacionamento, compras e estoque somente quando houver evidência forte.

Um sinal `Preferido chegou recentemente` exige:
1. cliente com 2+ visitas;
2. WhatsApp cadastrado;
3. produto como primeiro preferido calculado;
4. recebimento positivo nos últimos 7 dias;
5. Estoque Essencial ativo;
6. disponibilidade atual > 0;
7. cliente sem visita depois desse recebimento.

A oportunidade desaparece quando deixa de ser verdadeira. Não persistir score ou estado paralelo.

## Dados e arquitetura
Prioridade: **derivar inteligência dos dados existentes**, principalmente:
- `state.clients`;
- `state.history`;
- `state.catalog`;
- `itemMeta` preservado nas comandas fechadas;
- recebimentos existentes de Compras & Reposição;
- disponibilidade do Estoque Essencial.

A candidata evita novo evento, tabela, migration ou Edge Function. Métricas e oportunidades são calculadas localmente sobre dados que já sincronizam.

Matching de cliente:
1. WhatsApp normalizado quando disponível;
2. fallback por nome normalizado somente quando o cliente não possui WhatsApp.

## Modo demonstração
`?preview=v0250` pode exibir cenários fictícios somente em memória para testar:
- cliente Sumido;
- marco de 5 visitas;
- marco de 10 visitas;
- frequente sem WhatsApp;
- preferido recebido recentemente.

O preview não deve salvar nem sincronizar os dados fictícios e não deve abrir WhatsApp real.

## Fora de escopo
- CRM, lead, funil e pipeline;
- campanhas em massa;
- disparos automáticos/agendados;
- automação de marketing;
- programa complexo de pontos, cashback ou cupons;
- aniversário nesta candidata se exigir novo modelo persistente/sync;
- gestão avançada de estoque/giro nesta etapa;
- rastreamento persistente de contatos comerciais nesta versão.

## UX
- mobile-first;
- leitura rápida;
- uma ação principal por oportunidade;
- perfil do cliente sem excesso de métricas;
- filtros curtos;
- busca por nome/WhatsApp;
- nenhuma nova rotina obrigatória para atendente;
- nunca afirmar disponibilidade se o produto não estiver sob controle de estoque.

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
5. marcos e ritmo coerentes;
6. oportunidade por recebimento somente com evidência real;
7. oportunidade removida com estoque zero ou nova visita;
8. WhatsApp apenas manual;
9. desktop e celular;
10. nenhum impacto em Comandas, Estoque, Compras, Inventário, Custos e sync;
11. comportamento correto quando cliente não possui histórico suficiente;
12. preview não persistente;
13. documentação final;
14. autorização explícita de merge.

# Rota 27 v0.25.0 — Especificação funcional

## Estado
**CANDIDATA — NÃO PUBLICADA EM PRODUÇÃO.**

Produção preservada: **v0.24.0 — Custos & Margem**.

PR: **#31 — Rota 27 v0.25.0 — Clientes & Fidelização**.

## Objetivo
Dar ao proprietário uma visão simples de relacionamento usando dados que o Rota 27 já possui, sem criar CRM pesado nem uma rotina administrativa nova.

A Central deve responder rapidamente:
- quem está voltando;
- quem deixou de aparecer;
- o que cada cliente costuma consumir;
- quem merece atenção agora;
- qual contexto pode ajudar em um contato pessoal.

## Fonte de verdade
A v0.25 deriva as informações de:
- `state.clients` — cadastro existente;
- `state.history` — comandas fechadas;
- `state.catalog` — catálogo atual;
- `itemMeta` da comanda — nome/preço preservados no histórico quando disponível.

Não existe banco paralelo de fidelização nesta candidata.

## Associação cliente ↔ comanda
A associação segue esta ordem:
1. se o cliente possui WhatsApp, a comanda precisa possuir o mesmo WhatsApp normalizado;
2. somente quando o cliente não possui WhatsApp é permitido fallback por nome normalizado, e a comanda também precisa estar sem WhatsApp.

Isso reduz o risco de misturar pessoas com nomes iguais quando existe identificador telefônico disponível.

## Métricas do perfil
Para cada cliente:
- visitas = número de comandas fechadas associadas;
- total identificado = soma do total dessas comandas;
- ticket médio = total identificado / visitas;
- itens = soma das quantidades positivas dessas comandas;
- primeira visita = menor data associada;
- última visita = maior data associada;
- dias sem voltar = diferença em dias civis até a última visita.

Clientes cadastrados sem compra identificada permanecem no cadastro, mas não recebem métricas inventadas.

## Classificação automática
- **Novo:** 0 ou 1 visita identificada;
- **Recorrente:** 2 a 4 visitas;
- **Frequente:** 5 a 9 visitas;
- **Cliente da casa:** 10 ou mais visitas;
- **Sumido:** pelo menos 2 visitas e 30 dias ou mais desde a última visita.

`Sumido` é um sinal adicional; o cliente continua tendo seu nível de recorrência.

## Preferências
### Produto preferido
Agrupar as quantidades vendidas por produto nas comandas associadas. Ordenar por:
1. maior quantidade;
2. maior valor identificado em caso de empate;
3. nome.

### Categoria preferida
Quando a categoria puder ser resolvida por `itemMeta` ou catálogo, agregar a quantidade por categoria. Se a categoria não estiver disponível, o produto continua válido; o sistema não inventa categoria.

## Central Clientes & Fidelização
Acesso:
`Cardápio/Menu → Clientes → Relacionamento & Fidelização`.

Não criar card grande novo no Painel nesta primeira versão.

### Visão geral
Indicadores:
- Clientes;
- Recorrentes;
- Frequentes;
- Clientes da casa;
- Para lembrar.

Blocos:
- `Clientes para lembrar`;
- `Quem mais volta`;
- explicação curta dos níveis de fidelização.

### Clientes
- busca por nome/WhatsApp;
- filtros `Todos`, `Recorrentes`, `Frequentes`, `Sumidos`;
- cards com visitas, total identificado, última visita e produto preferido;
- `Ver perfil`;
- `WhatsApp` quando houver número cadastrado.

### Para lembrar
Somente clientes com:
- pelo menos 2 visitas;
- 30 ou mais dias sem retorno.

Cada linha deve explicar o motivo, por exemplo:
`42 dias sem voltar • 6 visitas • prefere IPA`.

## Perfil do cliente
Mostrar:
- nome e WhatsApp;
- nível + sinal de Sumido quando aplicável;
- visitas;
- total identificado;
- ticket médio;
- itens;
- produtos preferidos;
- categorias preferidas quando conhecidas;
- observação do cadastro existente;
- últimas visitas e resumo de itens.

O botão `Abrir cadastro do cliente` deve reutilizar o editor existente, não criar um segundo cadastro.

## WhatsApp contextual
A v0.25 não envia mensagem pelo backend.

O botão abre `wa.me` com uma mensagem sugerida e o proprietário decide se vai editar/enviar.

Contextos iniciais:
- Faz tempo que não vem;
- Agradecer frequência;
- Contar novidades.

Regras:
- zero disparo automático;
- zero envio em massa;
- zero promessa automática de desconto/brinde;
- usar somente nome e preferência que o sistema realmente conhece;
- fechar o WhatsApp sem enviar não altera nenhum estado do Rota 27.

## Fidelização
A primeira versão usa reconhecimento de frequência, não pontos.

Não existem nesta candidata:
- saldo de pontos;
- cashback;
- cupom automático;
- prêmio obrigatório;
- carteira/milhas;
- configuração de regras pelo atendente.

## Offline e multidispositivo
As métricas são derivadas localmente dos dados existentes. Portanto:
- funcionam offline com a base disponível no aparelho;
- convergem entre aparelhos quando `clients` e `history` convergem pelo sync atual;
- não há novo evento de sincronização;
- não há tabela/migration nova;
- não há nova versão de Edge Function.

## Ajuda
Ajuda candidata **v4.9**, com seção `Clientes & Fidelização` e explicação de níveis, preferências, clientes sumidos e contato manual.

## Estabilidade
A v0.25 não pode adicionar:
- polling visual frequente;
- `MutationObserver` concorrente;
- processo automático de envio de relacionamento.

A Central renderiza sob demanda e reage a eventos já existentes.

## Fora de escopo
- CRM/funil/pipeline;
- campanha em massa;
- automação/agendamento de marketing;
- aniversário nesta primeira candidata se exigir novo dado persistente;
- programa de pontos/cashback;
- aprofundamento de estoque/giro nesta etapa.

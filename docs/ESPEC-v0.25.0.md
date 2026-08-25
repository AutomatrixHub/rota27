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
- qual é o ritmo aproximado de retorno;
- quem merece atenção agora;
- quando um recebimento real cria uma boa oportunidade pessoal;
- qual contexto pode ajudar em um contato pelo WhatsApp.

## Fonte de verdade
A v0.25 deriva as informações de:
- `state.clients` — cadastro existente;
- `state.history` — comandas fechadas;
- `state.catalog` — catálogo atual;
- `itemMeta` da comanda — nome/preço/categoria preservados no histórico quando disponível;
- recebimentos existentes de Compras & Reposição;
- disponibilidade atual do Estoque Essencial para oportunidades que afirmam produto disponível.

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
- dias sem voltar = diferença em dias civis até a última visita;
- intervalo médio = média aproximada, em dias, entre visitas identificadas quando houver pelo menos duas.

Clientes cadastrados sem compra identificada permanecem no cadastro, mas não recebem métricas inventadas.

## Classificação automática
- **Novo:** 0 ou 1 visita identificada;
- **Recorrente:** 2 a 4 visitas;
- **Frequente:** 5 a 9 visitas;
- **Cliente da casa:** 10 ou mais visitas;
- **Sumido:** pelo menos 2 visitas e 30 dias ou mais desde a última visita.

`Sumido` é um sinal adicional; o cliente continua tendo seu nível de recorrência.

## Ritmo de visitas
Quando houver pelo menos duas visitas associadas, o sistema calcula o intervalo médio e traduz para uma leitura simples:
- até 7 dias: `Quase semanal`;
- 8 a 15 dias: `A cada 1–2 semanas`;
- 16 a 31 dias: `Quase mensal`;
- acima de 31 dias: `Mais espaçado`.

O ritmo é apenas uma leitura do histórico. Não é previsão garantida nem agenda automática de contato.

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

`Para lembrar` soma sinais de relacionamento com ação pessoal possível, como:
- clientes sumidos;
- marcos recentes de 5 ou 10 visitas.

Blocos:
- `Clientes para lembrar`;
- `Quem mais volta`;
- explicação curta dos níveis;
- `Preferido chegou recentemente`, quando houver evidência válida.

### Clientes
- busca por nome/WhatsApp;
- filtros `Todos`, `Recorrentes`, `Frequentes`, `Sumidos`;
- cards com visitas, total identificado, última visita e produto preferido;
- `Ver perfil`;
- `WhatsApp` quando houver número cadastrado.

### Para lembrar
A tela separa sinais diferentes:

#### 1. Faz tempo que não vem
Cliente com:
- pelo menos 2 visitas;
- 30 ou mais dias sem retorno.

Cada linha explica o motivo, por exemplo:
`42 dias sem voltar • 6 visitas • prefere IPA`.

#### 2. Marcos recentes
Cliente que acabou de atingir:
- 5 visitas; ou
- 10 visitas;
- e cuja última visita ocorreu há no máximo 14 dias.

O objetivo é permitir reconhecimento simples da frequência. Não há recompensa automática.

#### 3. Cadastro a completar
Cliente:
- frequente, com 5 ou mais visitas;
- ainda sem WhatsApp cadastrado.

Este bloco é conveniência, não alerta crítico. A ação abre o cadastro existente.

#### 4. Preferido chegou recentemente
Oportunidade comercial derivada de dados reais de relacionamento, recebimento e estoque.

## Preferido chegou recentemente — R3
A oportunidade só aparece quando TODOS os critérios são verdadeiros:
1. cliente possui pelo menos 2 visitas identificadas;
2. possui WhatsApp cadastrado;
3. o produto recebido é o primeiro produto preferido calculado do cliente;
4. houve recebimento positivo do produto nos últimos 7 dias;
5. o produto possui Estoque Essencial ativo;
6. a disponibilidade atual é maior que zero;
7. a última visita do cliente ocorreu antes do recebimento.

Proteções:
- produto sem controle de estoque não gera afirmação de disponibilidade;
- estoque zerado remove a oportunidade;
- cliente que voltou após o recebimento deixa de aparecer para aquele recebimento;
- recebimento com mais de 7 dias deixa de gerar oportunidade;
- cliente sem WhatsApp não recebe ação de mensagem R3;
- o sistema não inventa promoção, desconto, brinde, cupom ou reserva.

## Perfil do cliente
Mostrar:
- nome e WhatsApp;
- nível + sinal de Sumido quando aplicável;
- leitura do momento;
- visitas;
- total identificado;
- ticket médio;
- itens;
- ritmo/intervalo médio;
- produtos preferidos;
- categorias preferidas quando conhecidas;
- observação do cadastro existente;
- últimas visitas e resumo de itens;
- `NOVIDADE RELEVANTE` quando a oportunidade R3 existir.

### Leitura do momento
Prioridade da mensagem exibida no perfil:
1. cliente Sumido;
2. marco recente de 5/10 visitas;
3. ritmo médio quando houver base;
4. ausência de histórico suficiente.

A leitura explica o dado; não prescreve uma ação obrigatória.

O botão `Abrir cadastro do cliente` reutiliza o editor existente, não cria um segundo cadastro.

## WhatsApp contextual
A v0.25 não envia mensagem pelo backend.

O botão abre `wa.me` com uma mensagem sugerida e o proprietário decide se vai editar/enviar.

Contextos:
- Faz tempo que não vem;
- Agradecer frequência;
- Contar novidades;
- Produto preferido recebido recentemente.

Regras:
- zero disparo automático;
- zero envio em massa;
- zero promessa automática de desconto/brinde;
- usar somente nome, preferência e recebimento que o sistema realmente conhece;
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

## Modo demonstração seguro
Para testar cenários raros sem alterar dados reais, a candidata aceita:
`?preview=v0250`.

Nesse modo:
- a Central usa clientes e comandas fictícios apenas em memória;
- existem exemplos de Sumido, marco de 5 visitas, marco de 10 visitas e cliente frequente sem WhatsApp;
- o R3 também gera chegadas fictícias para validar a interface;
- nenhum dado é salvo em `localStorage`;
- nada é sincronizado;
- o cadastro fictício não pode ser editado;
- tocar em WhatsApp mostra somente a mensagem sugerida e não abre número real.

Sair do parâmetro de preview devolve imediatamente a base real.

## Offline e multidispositivo
As métricas e oportunidades são derivadas localmente dos dados existentes. Portanto:
- funcionam offline com a base disponível no aparelho;
- convergem entre aparelhos quando `clients`, `history`, recebimentos e estoque convergem pelo sync atual;
- não há novo evento de sincronização;
- não há tabela/migration nova;
- não há nova versão de Edge Function.

## Ajuda
Ajuda candidata **v5.1**, com seção `Clientes & Fidelização` e explicação de níveis, ritmo, preferências, clientes sumidos, marcos recentes, produto preferido recebido, contato manual e preview seguro.

## Estabilidade
A v0.25 não adiciona:
- polling visual frequente;
- `MutationObserver` concorrente;
- processo automático de envio de relacionamento.

A Central renderiza sob demanda e reage a eventos já existentes.

## Fora de escopo
- CRM/funil/pipeline;
- campanha em massa;
- automação/agendamento de marketing;
- aniversário nesta candidata se exigir novo dado persistente;
- programa de pontos/cashback;
- aprofundamento de estoque/giro nesta etapa;
- rastreamento persistente de contatos comerciais nesta versão.

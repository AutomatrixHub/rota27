# Rota 27 v0.25.83 — Paridade visual Painel / Histórico

Data: 31/08/2026

## Objetivo
Fazer a tela **Histórico & resultados** adotar a mesma linguagem visual já consolidada na tela **Painel**, usando o Painel como referência de tipografia, pesos, cartões, densidade e hierarquia.

## Diagnóstico
O Painel já utilizava o acabamento visual da v0.25.25, enquanto o Histórico ainda combinava:
- o acabamento v0.25.24 do cabeçalho/listas;
- o componente legado `v018` para **Último turno fechado / Resumo do turno**.

Isso gerava diferenças perceptíveis em tamanho de fonte, negrito, altura dos cards, espaçamento, raios e hierarquia visual.

## Correção
Novo asset: `assets/v02583-history-panel-parity.css`.

O Histórico passa a seguir os mesmos tokens visuais do Painel:
- título principal: 24 px, peso 900, `line-height:1.05`;
- subtítulo: 12 px, mesma cor secundária;
- títulos de seção/resumo: 18 px, peso 900;
- cartões métricos: altura mínima 80 px, padding 9×10 px, raio 14 px;
- rótulos métricos: 10,5 px, peso 750;
- valores métricos: 22 px, peso 950;
- hints: 10,5 px;
- seções principais: raio 18 px e sombra equivalente ao Painel;
- painéis **Mais vendidos** e **Formas de pagamento** recebem densidade, tipografia e raios compatíveis com os cartões operacionais do Painel;
- lista e rankings do Histórico também recebem pequenos ajustes de escala para manter consistência interna.

Nenhum conteúdo, cálculo ou regra operacional foi alterado.

## Modo Teste Global
A alteração é automática no Modo Teste porque a tela e o DOM são os mesmos nos dados reais e fictícios. O sandbox apenas troca a fonte dos dados.

A nova folha usa as variáveis de tema e contém uma adaptação explícita para `body.v02581-test-mode`, mantendo a mesma hierarquia visual com a paleta azul/violeta do sandbox.

## Segurança
- sem alteração de `state`;
- sem alteração de localStorage;
- sem alteração de Supabase;
- sem alteração de sync;
- sem alteração de WhatsApp;
- sem migration ou Edge Function;
- mudança visual/CSS.

## PWA
- `VERSION`: `0.25.83`;
- roadmap loader: `0.25.83`;
- cache: `rota27-comandas-v0.25.83-r1`;
- novo asset incluído no APP_SHELL.

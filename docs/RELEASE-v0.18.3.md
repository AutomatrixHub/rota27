# Rota 27 — Release v0.18.3

Data: 24/08/2026

## Estado

**PRODUÇÃO — VALIDADA**

A v0.18.3 foi validada em desktop e celular e promovida sobre a v0.18.1.

## Objetivo

Consolidar a identidade oficial do Rota 27 sem alterar o fluxo operacional, trazendo um tema principal coerente com o escudo oficial e uma identidade capixaba específica para a seção Ajuda.

## Tema Operação Rota 27

A interface passa a usar de forma consistente:

- laranja da marca para ações e destaque;
- preto para títulos, valores e hierarquia;
- creme/marfim para fundo e superfícies;
- cores funcionais reservadas para estados de sucesso, atenção e erro.

A navegação inferior foi consolidada em:

`Comandas → Cardápio → Painel → Histórico`

## Cards de comandas

O desenho final aprovado possui:

- curvatura externa refinada;
- faixa lateral laranja fina;
- trecho preto inferior discreto;
- remoção do traço horizontal artificial que apareceu durante a candidata;
- manutenção integral de textos, valores, botão `Abrir` e área clicável.

## Topbar e logo

- proporções da topbar preservadas;
- logo validado da base mantido;
- imagem interna arredondada;
- quadro branco eliminado;
- moldura integrada ao tom bege predominante da própria arte do logo.

## Ajuda v4.2 — Tema Capixaba

A Ajuda recebe identidade institucional inspirada no Espírito Santo:

- azul, branco e rosa em tons suaves;
- cabeçalho temático;
- busca e chips coloridos;
- atalhos e cards com variações controladas;
- manutenção de verde/amarelo/vermelho apenas para significado funcional;
- conteúdo operacional completo preservado.

No celular, o painel usa viewport dinâmico (`100dvh`) e abre no topo para evitar sobreposição com barras do navegador.

## Performance

Durante a candidata foi identificado e corrigido um conflito entre scripts de versão que provocava `MutationObserver` concorrente, alto uso de CPU e travamento. A v0.18.3 final carrega apenas o controlador de versão correto e foi validada sem regressão de desempenho.

## Preservações

A v0.18.3 não altera:

- cálculo de total;
- lançamento/remoção de itens;
- fechamento/cancelamento;
- sincronização multidispositivo;
- outboxes de WhatsApp;
- templates Meta;
- webhook inbound;
- Edge Functions Supabase;
- banco de dados.

## Validação

A candidata foi validada no PC e em celular real. O resultado final reportado foi:

**“PERFEITO! Funcionou tudo.”**

## Atualização

Não reinstalar a PWA e não limpar dados. Abrir com internet por 10–20 segundos, fechar completamente e reabrir até confirmar `v0.18.3`.

## Rollback

A v0.18.1 permanece como baseline anterior de rollback.

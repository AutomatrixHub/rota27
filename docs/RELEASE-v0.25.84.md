# Rota 27 v0.25.84 — Paridade visual da Visão Gerencial

Data: 31/08/2026

## Objetivo
Alinhar a tela **Visão Gerencial** ao mesmo sistema visual já consolidado no **Painel** e no **Histórico & resultados**.

## Diagnóstico
A Visão Gerencial ainda usava majoritariamente o acabamento original da v0.20.0, com:
- título e subtítulo em escalas diferentes;
- rótulos de métricas em 10 px e valores em 16 px;
- títulos de seção em 13 px;
- cartões e comparações com densidade, raios e pesos distintos do Painel.

## Correção
Novo asset: `assets/v02584-manager-visual-parity.css`.

A tela passa a seguir a gramática visual atual:
- título principal: 24 px / peso 900;
- subtítulo: 12 px;
- métricas principais: 80 px de altura mínima, raio 14 px;
- rótulos: 10,5 px / peso 750;
- valores: 22 px / peso 950;
- títulos de seção: 18 px / peso 900;
- contêineres principais: raio 18 px e sombra discreta;
- comparação, gráfico, Mais vendidos e Formas de pagamento recebem a mesma densidade e hierarquia;
- botões mantêm área de toque confortável e passam a usar raios/tipografia coerentes.

## Modo Teste Global
A alteração vale automaticamente em dados reais e fictícios porque a Visão Gerencial usa o mesmo DOM nos dois estados. O novo CSS inclui adaptação explícita à paleta azul/violeta de `body.v02581-test-mode`, preservando geometria e tipografia.

## Segurança
- nenhuma alteração em cálculos gerenciais;
- nenhuma alteração em fechamentos;
- nenhuma alteração em dados locais;
- nenhuma alteração no Supabase;
- nenhuma alteração em sync, Edge Functions ou WhatsApp;
- mudança exclusivamente visual, mais versionamento/cache PWA.

## Cache
`rota27-comandas-v0.25.84-r1`

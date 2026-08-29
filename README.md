# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.62 — Alertas de custo/margem
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.62-r1`
- **Baseline anterior:** v0.25.61

## Estado funcional atual

### Comandas e Fechamento
- Lista e Mapa preservados;
- consumo interno/próprio preservado;
- Nova comanda sem foco automático obrigatório;
- pré-fechamento por exceção no card **Fechamento do turno**;
- comandas abertas e cancelamentos pendentes continuam obedecendo às regras de bloqueio já existentes;
- quando não há pendências, o card informa **Tudo certo para fechar**.

### A Receber
- vencimento opcional **Sem data / Hoje / Amanhã / 7 dias**;
- vencidas e vencimentos do dia destacados;
- baixas parciais preservadas.

### Cardápio, Estoque e Compras
- **Mais usados hoje** em Top 3;
- dias de cobertura do Estoque calculados com consumo recente;
- Reposição com referência para aproximadamente 7 dias;
- recebimento de Compras já pré-preenche integralmente as quantidades pendentes, deixando somente exceções para edição.

### Clientes & Fidelização
- cards enriquecidos e **Aniversários próximos**;
- níveis **Novo / Recorrente / Frequente / Cliente da casa / Sumido** reutilizando `Rota27V025.profileFor`;
- ordenação por **Nome / Última visita / Mais frequentes / Aniversário próximo**.

### Custos & Margem
- custos reais de aquisição e margem bruta estimada preservados;
- produtos sem custo conhecido continuam fora das estimativas financeiras;
- **margem bruta negativa** gera alerta por exceção;
- **aumento de 10% ou mais no último custo efetivo**, quando ocorrido nos últimos 30 dias, gera alerta;
- alertas detalhados aparecem em **Custos & Margem**;
- o Painel recebe apenas uma linha consolidada em **Hoje precisa de atenção**;
- quando não há exceções, o bloco de alertas não ocupa espaço.

### WhatsApp
- fluxo transacional, aniversários e Eventos & Convites preservados;
- callbacks `sent`, `delivered`, `read`, `failed` e funil real de entrega preservados.

## Backend
Projeto Supabase: `owkvwsiblbzlpxjwybrt`. A v0.25.62 não altera Edge Function, migration, schema ou tipo de evento.

## Roadmap original — encerrado

Concluídos:
0. Lista compacta;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. Funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — atendido pelo pré-preenchimento integral já existente;
7. Dias de cobertura do Estoque;
8. Inteligência de Clientes;
9. Pré-fechamento por exceção;
10. Alertas de custo/margem.

**Planejamento original 0–10: concluído.**

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.62.md`
- `docs/RELEASE-v0.25.61.md`
- `docs/RELEASE-v0.25.60.md`

## Versão
Produção: **0.25.62**

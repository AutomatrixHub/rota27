# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.61 — Pré-fechamento por exceção
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.61-r1`
- **Baseline anterior:** v0.25.60

## Estado funcional atual

### Comandas e Fechamento
- Lista e Mapa preservados;
- consumo interno/próprio preservado;
- Nova comanda sem foco automático obrigatório;
- o card **Fechamento do turno** agora antecipa o estado operacional:
  - comandas abertas;
  - cancelamentos aguardando confirmação;
  - fechamento anterior aguardando sincronização;
  - sem movimento;
  - **Tudo certo para fechar**;
- nenhuma nova etapa obrigatória foi criada; as regras de bloqueio do fechamento permanecem as existentes.

### A Receber
- vencimento opcional **Sem data / Hoje / Amanhã / 7 dias**;
- vencidas e vencimentos do dia destacados;
- baixas parciais preservadas.

### Cardápio e Estoque
- Mais usados hoje em Top 3;
- dias de cobertura do Estoque;
- Reposição com referência para aproximadamente 7 dias;
- recebimento de Compras já pré-preenche pendências integralmente.

### Clientes & Fidelização
- cards enriquecidos e Aniversários próximos;
- níveis Novo / Recorrente / Frequente / Cliente da casa / Sumido reutilizando `Rota27V025.profileFor`;
- ordenação por Nome / Última visita / Mais frequentes / Aniversário próximo.

### WhatsApp
- fluxo transacional, aniversários e Eventos & Convites preservados;
- callbacks `sent`, `delivered`, `read`, `failed` e funil real de entrega.

## Backend
Projeto Supabase: `owkvwsiblbzlpxjwybrt`. Nenhuma Edge Function ou migration foi alterada na v0.25.61.

## Roadmap
Concluídos:
0. Lista compacta;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. Funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — já atendido pelo pré-preenchimento existente;
7. Dias de cobertura do Estoque;
8. Inteligência de Clientes;
9. Pré-fechamento por exceção.

Próximo:
10. **Alertas de custo/margem**.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.61.md`
- `docs/RELEASE-v0.25.60.md`

## Versão
Produção: **0.25.61**

# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

- **Versão:** v0.25.60 — Inteligência de Clientes
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.60-r1`
- **Baseline anterior:** v0.25.59

## Navegação
- **Comandas = atender**
- **Cardápio = o que é vendido**
- **Painel = administrar o negócio**
- **Histórico = o que aconteceu**

## Estado funcional atual

### Comandas e A Receber
- Lista e Mapa preservados;
- consumo interno/próprio sem faturamento;
- A receber com baixas parciais;
- vencimento opcional **Sem data / Hoje / Amanhã / 7 dias**;
- vencidas e vencimentos do dia destacados;
- Nova comanda sem foco automático obrigatório.

### Cardápio
- catálogo, categorias, busca e histórico de preços;
- **Mais usados hoje** em Top 3.

### Estoque, Compras e Custos
- Estoque Essencial;
- recebimento de compras já pré-preenche integralmente as quantidades pendentes, deixando só exceções para edição;
- **dias de cobertura** calculados com até 7 dias operacionais recentes;
- Reposição informa também quantidade aproximada para cerca de 7 dias, sem alterar o campo Comprar;
- inventário, custos reais e margem bruta estimada preservados.

### Clientes & Fidelização
- cadastro compartilhado, WhatsApp e nascimento;
- cards enriquecidos;
- **Aniversários próximos**: hoje e próximos 7 dias;
- a lista principal agora reutiliza os níveis oficiais da Fidelização: **Novo / Recorrente / Frequente / Cliente da casa** e, quando aplicável, **Sumido**;
- ordenação local por **Nome / Última visita / Mais frequentes / Aniversário próximo**;
- nenhuma classificação nova é gravada ou sincronizada; a UI usa `Rota27V025.profileFor`, que continua sendo a fonte da regra;
- Eventos & Convites preservados.

### WhatsApp
- transacional da comanda;
- aniversário e Eventos & Convites;
- callbacks `sent`, `delivered`, `read` e `failed`;
- funil real de entrega.

## Backend de produção
Projeto Supabase: `owkvwsiblbzlpxjwybrt`.

Permanecem:
- `rota27-whatsapp` — v23 ACTIVE;
- `rota27-sync` — v9 ACTIVE;
- `rota27-whatsapp-inbound` — v3 ACTIVE;
- `rota27-birthday-campaign` — v2 ACTIVE;
- `rota27-event-campaign` — v4 ACTIVE;
- `rota27-event-delivery-status` — v1 ACTIVE;
- `rota27-audit` — v1 ACTIVE.

## Roadmap retomado

Concluídos:
0. Lista compacta;
1. Hoje precisa de atenção;
2. Mais usados hoje;
3. Funil real de Eventos;
4. Aniversários próximos;
5. Vencimento rápido em A Receber;
6. Receber tudo em Compras — já atendido pelo pré-preenchimento existente;
7. Dias de cobertura do Estoque;
8. Inteligência de Clientes.

Próximos:
9. pré-fechamento por exceção;
10. alertas de custo/margem.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação principal
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.60.md`
- `docs/RELEASE-v0.25.59.md`
- `docs/RELEASE-v0.25.58.md`

## Versão
Produção: **0.25.60**

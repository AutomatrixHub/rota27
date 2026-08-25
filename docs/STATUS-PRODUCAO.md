# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.4 — Mapa Refinado**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.4-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.3 — Consistência Visual do Mapa**.

## v0.25.4 — Mapa refinado
A release ajusta apenas o acabamento dos cards compactos do Mapa.

A faixa lateral mantém a linguagem laranja + preto da Lista, mas foi adaptada ao tamanho menor do card:
- 4 px de largura;
- respiro no topo e base;
- laranja predominante;
- preto como acabamento inferior curto;
- transição suavizada;
- cantos internos arredondados.

O Mapa continua compacto e funcionalmente idêntico à v0.25.3.

## Navegação e módulos preservados
- Comandas: Lista + Mapa;
- Cardápio;
- Painel;
- Histórico;
- Clientes & Fidelização;
- WhatsApp transacional/inbound;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Backend e sincronização
A v0.25.4 não exige nova Edge Function, evento, tabela ou migration.

Permanece:
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Ajuda
Ajuda **v5.5**, identificando Rota 27 v0.25.4.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.4` e sincronização saudável.

Ver `docs/RELEASE-v0.25.4.md`.

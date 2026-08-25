# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.3 — Consistência Visual do Mapa**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.3-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**.

## Navegação oficial
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.3 — Consistência visual Lista / Mapa
A release é um refinamento visual sobre a v0.25.2.

Os cards compactos do Mapa passam a usar a mesma gramática visual dos cards da Lista:
- superfície creme;
- borda de 1 px com a mesma linha do tema;
- sombra leve equivalente;
- cantos arredondados coerentes;
- faixa lateral de 6 px;
- gradiente vertical com laranja nos 68% superiores e preto nos 32% inferiores.

As antigas cores de faixa por zona do Mapa deixam de definir a identidade do card. Mesa, Balcão, Parklet, Clientes e Outros locais continuam sendo categorias funcionais, mas o card passa a representar visualmente a mesma entidade operacional exibida na Lista.

Nenhuma dimensão estrutural do Mapa foi ampliada de forma relevante; a visão permanece compacta para celular.

## Comandas
Permanecem:
- modo Lista;
- modo Mapa;
- zonas Mesas, Balcão, Parklet, Clientes e Outros locais;
- cards compactos clicáveis;
- atalhos `+ Mesa`, `+ Balcão`, `+ Parklet`, `+ Cliente`;
- preferência Lista/Mapa local por aparelho.

Lista e Mapa continuam usando o mesmo `state.commands`.

## Painel
Permanece a normalização da v0.25.2:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

O badge visual legado `v0.22.0` de Compras continua oculto.

## Estabilidade
A v0.25.3 não adiciona:
- polling visual;
- `setInterval`;
- `MutationObserver`;
- estado paralelo;
- nova lógica de persistência.

A alteração principal está em `assets/v0253-map-visual.css`. `assets/v0253-release.js` apenas atualiza identidade de release/Ajuda por eventos já existentes.

## Backend e sincronização
A v0.25.3 não exige nova Edge Function, evento, tabela ou migration.

Permanece:
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Módulos preservados
- Comandas;
- Clientes & Fidelização;
- WhatsApp transacional/inbound;
- Fechamento do Turno;
- Auditoria;
- Visão Gerencial;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

Regra financeira preservada: **custo nunca é inferido do preço de venda**.

## Ajuda
Ajuda **v5.4**, identificando Rota 27 v0.25.3.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.3` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration nova na v0.25.3;
- operação local-first preservada;
- nenhuma alteração de backend nesta release.

Ver `docs/RELEASE-v0.25.3.md`.

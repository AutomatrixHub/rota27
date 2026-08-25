# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.2 — Mapa Rápido de Comandas & Painel Padronizado**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.2-r7`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.1 — Navegação & Configurações**.

## Navegação oficial
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.2 — Comandas
A tela de Comandas agora possui:
- modo Lista;
- modo Mapa;
- zonas Mesas, Balcão, Parklet, Clientes e Outros locais;
- cards compactos clicáveis;
- atalhos `+ Mesa`, `+ Balcão`, `+ Parklet`, `+ Cliente`;
- preferência Lista/Mapa local por aparelho.

Lista e Mapa usam o mesmo `state.commands`.

## v0.25.2 — Painel
Os quatro acessos iniciais estão normalizados no mesmo padrão visual:
1. Visão Gerencial;
2. Estoque Essencial;
3. Compras & Reposição;
4. Clientes & Fidelização.

Padronização R7:
- mesma moldura e altura-base;
- mesma tipografia de título/descrição;
- ícones lineares monocromáticos;
- ações com a mesma caixa;
- mobile com ação em largura total;
- badge visual `v0.22.0` removido de Compras.

Clientes & Fidelização reutiliza o mesmo fluxo já existente; não existe segundo cadastro.

## Estabilidade do Painel
Preservar:
- sem polling visual frequente novo;
- sem `MutationObserver` concorrente;
- ícones via CSS, não reinjetados por JavaScript.

A ponte específica em `v0252-panel-polish.js` existe apenas para restaurar o quarto card após o `innerHTML` legado de `screenPanel`.

## Backend e sincronização
A v0.25.2 não exige nova Edge Function, evento, tabela ou migration.

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
Ajuda **v5.3**, incluindo Mapa Rápido de Comandas.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 10–20 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.2` e sincronização saudável.

## Segurança
- nenhum token/App Secret versionado;
- nenhuma migration nova na v0.25.2;
- operação local-first preservada;
- nenhuma alteração de backend nesta release.

Ver `docs/RELEASE-v0.25.2.md`.

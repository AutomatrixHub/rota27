# Rota 27 v0.25.2 — Release

Data: 25/08/2026  
Título: **Mapa Rápido de Comandas & Painel Padronizado**

## Objetivo
Acelerar a operação no celular e consolidar o acabamento visual do Painel sem adicionar complexidade de backend.

## Entregas
### Comandas — Lista + Mapa
- nova alternância `Lista / Mapa`;
- Mapa Rápido com Mesas, Balcão, Parklet, Clientes e Outros locais;
- cards compactos com identificação, valor, cliente/local, itens e tempos;
- toque em qualquer ponto do card abre a comanda existente;
- atalhos `+ Mesa`, `+ Balcão`, `+ Parklet`, `+ Cliente`;
- preferência do modo salva apenas no aparelho.

### Painel
- botões de Visão Gerencial, Estoque e Compras com dimensões equivalentes;
- Relacionamento reposicionado imediatamente após Compras;
- correção da estabilidade do Relacionamento diante dos renders legados;
- ícones lineares e monocromáticos para os principais acessos;
- R7 normaliza Visão Gerencial, Estoque Essencial, Compras & Reposição e Clientes & Fidelização para a mesma linguagem visual;
- badge visual legado `v0.22.0` removido do card de Compras;
- Clientes & Fidelização passa a usar o mesmo padrão de card, tipografia, ícone e ação.

## Mobile
- redução de rolagem para localizar comandas;
- cards do Painel sem texto espremido;
- ações em largura total quando necessário;
- sem novo overflow horizontal esperado.

## Backend
Sem alterações.

Permanecem:
- `rota27-sync` versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- migration `20260825012842_expand_rota27_sync_event_types_v023`;
- eventos/tabelas existentes;
- operação local-first e multidispositivo.

## Estabilidade
A camada v0.25.2 não adiciona `setInterval` nem novo `MutationObserver`.

A ponte específica do Painel intercepta apenas o `innerHTML` de `screenPanel` para recolocar o quarto card após renders legados. Os ícones são CSS e não dependem de reinjeção de DOM.

## PWA
- `VERSION = 0.25.2`;
- Service Worker: `rota27-comandas-v0.25.2-r7`;
- assets v0.25.2 carregados com query `0252r7`.

## Aprovação
A publicação foi autorizada explicitamente pelo proprietário em 25/08/2026 após a rodada de refinamentos R2–R7.

## Rollback
Baseline anterior: **v0.25.1 — Navegação & Configurações**.

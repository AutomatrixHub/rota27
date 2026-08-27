# Rota 27 v0.25.31 — Ícones no padrão do Painel + Painel simplificado

## Objetivo
Unificar a linguagem visual dos ícones do Cardápio com os ícones gerenciais do Painel e reduzir redundância na aba Painel.

## Cardápio
Os pictogramas continuam sendo os mesmos SVGs vetoriais e o mapeamento por categoria/nome permanece intacto, mas o acabamento muda para o mesmo padrão visual dos cards gerenciais:
- caixa arredondada em vez de badge circular;
- fundo pastel suave por família de produto;
- pictograma escuro com traço mais fino e consistente;
- contraste discreto, sem aparência de emoji;
- produtos inativos continuam neutros/desaturados.

## Painel
O bloco **Acessos rápidos** foi removido por redundância com a navegação inferior e com os demais atalhos administrativos.

A organização passa a ser:
- **Visão Gerencial** no topo;
- **Clientes & Fidelização** imediatamente abaixo;
- seções operacionais **Agora**, **Hoje** e **Operação**;
- no espaço antes ocupado por **Acessos rápidos** ficam **Estoque Essencial** e **Compras & Reposição**, nessa ordem.

A normalização usa a ponte de redraw já existente e um assentamento curto e finito, sem novo `MutationObserver` e sem polling contínuo.

## PWA
- VERSION: `0.25.31`
- Service Worker: `rota27-comandas-v0.25.31-r1`
- novo asset: `assets/v02531-product-icons-panel.css`

## Backend
Sem alteração em Supabase, Edge Functions, event log, sincronização, catálogo, estoque, compras, clientes, recebíveis ou fechamento de turno.

## Rollback
Baseline anterior: v0.25.30 / HEAD `cb45eb9c264d7c9ed3cc4ab047bcfdb9ae857ab9`.

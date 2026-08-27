# Rota 27 v0.25.32 — Bootstrap limpo

## Objetivo
Eliminar o quadro transitório **“Rota 27 v0.25.13”** que aparecia por uma fração de segundo ao abrir a PWA.

## Causa raiz
O `index.html` ainda continha um loader visual legado, criado na release v0.25.13. Esse loader era exibido enquanto `base-v013.html` era buscado e, logo depois, substituído pela aplicação completa via `document.write()`. Em aparelhos rápidos o quadro aparecia por aproximadamente 0,1 s; em conexões mais lentas poderia permanecer visível por mais tempo.

## Correção
- remove o loader/card visual legado do bootstrap;
- o bootstrap normal fica visualmente neutro, mantendo apenas o fundo da aplicação até a interface real ser carregada;
- erros reais de carregamento continuam visíveis em um cartão específico de falha;
- remove textos públicos hardcoded de v0.25.13 no shell inicial;
- atualiza o cache-buster do carregador da release;
- VERSION `0.25.32`;
- Service Worker `rota27-comandas-v0.25.32-r1`.

## Impacto funcional
Nenhuma alteração em comandas, catálogo, clientes, estoque, compras, histórico, fechamento de turno, recebíveis, sincronização, Supabase ou Edge Functions.

## Rollback
v0.25.31 / HEAD `8c5a28376710795283c5365004ccdfed57d456fe`.

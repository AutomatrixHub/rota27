# Rota 27 — Release v0.25.26

## Acabamento visual do Cardápio

Release dedicada ao refinamento visual da aba **Cardápio**, aplicando a mesma gramática aprovada em **Fechamentos**, **Histórico & resultados** e **Painel**.

## Cardápio

- cabeçalho mais compacto, preservando contador, **Categorias** e **+ Produto**;
- aviso sobre histórico de preço com menor altura e melhor contraste;
- busca mais compacta;
- cards de produtos com menos altura, maior destaque para nome e preço e metadados mais suaves;
- emoji/ícone de produto reduzido e melhor alinhado;
- status **Produto ativo/inativo** e **Categoria inativa** mais discretos;
- botão **Editar** preserva área de toque com menor peso visual;
- produtos inativos continuam claramente diferenciados, sem ficarem ilegíveis;
- estado vazio também foi compactado.

## Gerenciar categorias

- cabeçalho, botão voltar e **+ Nova** mais compactos;
- aviso operacional com menor altura;
- cards de categorias mais densos e consistentes;
- nome da categoria ganha maior hierarquia;
- contagem de produtos e status ficam mais discretos;
- botões **Editar** e **Ativar/Desativar** preservam usabilidade no celular;
- layout mobile mantém ações confortáveis sem desperdiçar espaço vertical.

## Escopo técnico

- novo asset visual: `assets/v02526-menu-finish.css`;
- `VERSION`: `0.25.26`;
- Service Worker: `rota27-comandas-v0.25.26-r1`;
- sem novo JavaScript de domínio;
- sem alteração em `renderMenu`, catálogo, categorias, preços ou histórico de preço;
- sem `MutationObserver` novo;
- sem polling visual adicional.

## Backend

Nenhuma alteração em Supabase, Edge Functions, event log, sincronização, A receber ou fechamento de turno.

## Rollback

Baseline anterior: **v0.25.25**, HEAD `bd18e982e599d3b6581715c927dde622ad361e4d`.

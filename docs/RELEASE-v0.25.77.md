# Rota 27 — Release v0.25.77

Data: 30/08/2026

## Título
**Cardápio sem ícones + cards Opção B**

## Objetivo
Aplicar na tela administrativa **Cardápio** a segunda proposta visual aprovada, removendo os ícones dos produtos e melhorando hierarquia, legibilidade e densidade dos cards sem alterar comportamento ou dados.

## Opção B aprovada
Nos cards de produto do Cardápio:
- todos os ícones ficam ocultos;
- a antiga coluna do ícone é eliminada do grid visual;
- o card passa a usar duas áreas: informações à esquerda e preço/ação à direita;
- uma barra vertical laranja de 4px cria o destaque lateral;
- nome do produto permanece como informação principal;
- categoria e status permanecem logo abaixo;
- preço passa a aparecer em pill terracota suave;
- botão **Editar** ganha contorno laranja e fica abaixo do preço;
- altura permanece compacta para reduzir rolagem;
- produtos inativos preservam acabamento visual distinto.

## Implementação
A solução é exclusivamente CSS:
- novo asset: `assets/v02577-menu-option-b.css`;
- sem alteração do `renderMenu()` ou das regras de produto;
- os antigos elementos `.menu-emoji` permanecem no DOM apenas por compatibilidade e são ocultados em `#screenMenu`;
- nenhuma varredura, observer ou polling novo.

## Preservação funcional
Permanecem inalterados:
- criação e edição de produtos;
- categorias e filtros;
- busca no Cardápio;
- ativação/inativação de produtos;
- importação e exportação;
- preços e dados existentes;
- lançamento de itens em comandas;
- Lista e Mapa de comandas;
- WhatsApp e consentimentos;
- estoque, histórico e recebíveis.

## Backend
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum schema ou tabela alterado;
- nenhum dado real modificado para teste.

## PWA
- `VERSION`: `0.25.77`;
- release meta do shell: `0.25.77`;
- roadmap loader: `0.25.77`;
- Service Worker: `rota27-comandas-v0.25.77-r1`;
- `v02577-menu-option-b.css` incluído no APP_SHELL.

## Rollback
Baseline anterior: **v0.25.76** / PR #112 / merge `a45c7772716a4f7434fd1a3b8ad413f259fd2d85`.

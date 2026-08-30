# Rota 27 — Status de produção

Última revisão: 30/08/2026

## Produção
- versão: **v0.25.69 — Organização do cardápio e categorias**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.69-r1`;
- baseline anterior: **v0.25.68**, merge `9d5a930ee72afb1abcede3c82bcacef1104ebd79`.

## Cardápio
A tela administrativa do Cardápio passa a exibir os produtos em **ordem alfabética por nome**, independentemente de ativo/inativo ou categoria.

Acima da lista existem filtros em chips:
- **Todos**;
- **Cervejas**;
- **Bebidas**;
- demais categorias em ordem alfabética.

A busca continua combinável com a categoria selecionada.

## Lançamento em comandas
As categorias do lançamento usam uma prioridade operacional:
1. **Todos**;
2. **Cervejas**;
3. **Bebidas**;
4. demais categorias ordenadas pelo total histórico de unidades vendidas;
5. empate por ordem alfabética.

O ranking considera somente comandas fechadas faturáveis. Registros com `internalConsumption=true` ou `nonRevenue=true` ficam fora. A categoria histórica usa `itemMeta` da comanda quando disponível, com fallback para o catálogo atual.

## Preservação
- nenhuma alteração nos registros do catálogo;
- nenhum preço modificado;
- nenhuma categoria criada, removida ou renomeada;
- nenhuma migration;
- nenhuma Edge Function alterada;
- nenhum polling ou `MutationObserver` novo;
- somente ordenação e filtros de apresentação.

## Backend de relacionamento preservado
- `rota27-birthday-campaign`: v3 ACTIVE;
- `rota27-whatsapp-inbound`: v4 ACTIVE;
- parabéns automático às 09:30 preservado;
- rotina de solicitação de data de nascimento em até 3 tentativas / 7 dias preservada.

## Atualização PWA
- shell declara `rota27-release-version=0.25.69`;
- `v02569-menu-category-order.css/js` são carregados diretamente pelo shell e pelo roadmap loader;
- cache `rota27-comandas-v0.25.69-r1`;
- não limpar `localStorage` de produção.

## Regras de operação
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.68** / merge `9d5a930ee72afb1abcede3c82bcacef1104ebd79`.

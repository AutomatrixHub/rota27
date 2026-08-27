# Rota 27 — Status de produção

Última revisão: 27/08/2026

## Produção
- versão: **v0.25.28 — Novo estilo dos ícones do Cardápio**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.28-r1`;
- `rota27-whatsapp`: versão **23 ACTIVE** (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão **9 ACTIVE** (`rota27-sync-v0.25.16`);
- `rota27-whatsapp-inbound`: versão **2 ACTIVE** (`rota27-whatsapp-inbound-v2-birthday`);
- `rota27-birthday-campaign`: versão **2 ACTIVE** (`rota27-birthday-campaign-v2`);
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback do código: **v0.25.27**, HEAD `d9bfbc0283b6f798d85b46579af3212643162710`.

## v0.25.28 — Novo estilo dos ícones do Cardápio
Refinamento exclusivamente visual em resposta ao feedback sobre o acabamento da v0.25.27.

### Acabamento
- badges circulares substituem as caixas bege/monocromáticas;
- famílias de produtos recebem cores terrosas suaves e consistentes;
- pictogramas ficam brancos, com traço mais firme e leitura rápida;
- produtos inativos usam acabamento neutro/desaturado;
- espaçamento entre ícone e conteúdo foi refinado;
- o mapeamento por categoria/nome da v0.25.27 permanece intacto;
- o dado `emoji` original continua preservado no catálogo.

### Estabilidade
- novo asset visual `assets/v02528-product-icons-soft.css`;
- sem novo JavaScript de domínio;
- sem `MutationObserver`;
- sem polling contínuo;
- sem alteração em catálogo, categorias, preços, histórico de preço, Supabase, Edge Functions, event log ou sincronização.

Ver `docs/RELEASE-v0.25.28.md`.

## v0.25.27 — Ícones profissionais no Cardápio
Refinamento visual da apresentação dos produtos na aba **Cardápio**.

### Acabamento
- emojis dos produtos substituídos visualmente por ícones SVG monocromáticos;
- conjunto único de traço, tamanho, alinhamento e contraste;
- seleção do ícone considera categoria e nome do produto;
- famílias específicas para cerveja, vinho, bebidas, café, queijo, frios/embutidos, molhos/temperos, castanhas, biscoitos, doces, pães e petiscos;
- fallback neutro de produto para casos sem correspondência;
- produtos inativos usam o mesmo desenho em acabamento neutro;
- o dado `emoji` original do catálogo não é removido nem alterado.

### Estabilidade
- assets `assets/v02527-product-icons.css` e `assets/v02527-product-icons.js`;
- decoração aplicada sobre a saída existente de `renderMenu()`;
- reaplicações somente em interações finitas relevantes;
- sem `MutationObserver`;
- sem polling contínuo;
- sem alteração de catálogo, categorias, preços, histórico de preço, Supabase, Edge Functions, event log ou sincronização.

Ver `docs/RELEASE-v0.25.27.md`.

## v0.25.26 — Acabamento visual do Cardápio
Refinamento exclusivamente visual da aba **Cardápio**, seguindo o mesmo padrão aprovado em **Fechamentos**, **Histórico & resultados** e **Painel**.

### Acabamento
- cabeçalho do Cardápio mais compacto, mantendo contador, **Categorias** e **+ Produto**;
- aviso sobre histórico de preços e campo de busca com menor altura;
- cards de produtos mais densos, com nome e preço em maior destaque;
- categoria e status operacionais mais suaves;
- botão **Editar** preserva área de toque com menor peso visual;
- produtos inativos continuam claramente diferenciados;
- estado vazio foi compactado;
- a tela **Gerenciar categorias** recebeu o mesmo tratamento em cabeçalho, avisos, cards e ações;
- botões **Editar** e **Ativar/Desativar** continuam confortáveis no mobile.

### Estabilidade
- novo asset apenas visual: `assets/v02526-menu-finish.css`;
- sem alteração em `renderMenu`, catálogo, categorias, preços ou histórico de preço;
- sem novo JavaScript de domínio;
- sem `MutationObserver` novo;
- sem polling visual adicional;
- sem alteração de Supabase, Edge Functions, event log ou sincronização.

Ver `docs/RELEASE-v0.25.26.md`.

## v0.25.25 — Acabamento visual do Painel
Refinamento exclusivamente visual da aba **Painel**, seguindo o mesmo padrão aprovado nas telas **Fechamentos** e **Histórico & resultados**.

### Acabamento
- cabeçalho do Painel mais compacto e hierárquico;
- bloco **A receber** com menor altura, mantendo o destaque da pendência e a área de toque do botão;
- seções **Agora**, **Hoje** e **Operação** com menos área ociosa;
- valores dos indicadores mais destacados e rótulos mais suaves;
- **Comandas** no bloco Hoje é apresentado visualmente como **Comandas fechadas**;
- cards de Internet, Sincronização, WhatsApp e Conflitos ficam mais compactos e legíveis;
- **Acessos rápidos** ganha menor peso visual sem perder usabilidade;
- cards **Visão Gerencial**, **Estoque Essencial**, **Compras & Reposição** e **Clientes & Fidelização** ficam mais densos e consistentes;
- espaçamentos verticais e sombras foram suavizados para mostrar mais informação por tela.

### Estabilidade
- novo asset apenas visual: `assets/v02525-panel-finish.css`;
- sem alteração dos cálculos do Painel;
- sem novo JavaScript de domínio;
- sem `MutationObserver` novo;
- sem polling visual adicional;
- sem alteração de Supabase, Edge Functions, event log ou sincronização.

Ver `docs/RELEASE-v0.25.25.md`.

## v0.25.24 — Acabamento visual do Histórico & resultados
Refinamento exclusivamente visual da tela principal **Histórico & resultados**, seguindo o padrão aprovado na tela **Fechamentos**.

### Acabamento
- título, subtítulo e contador com hierarquia mais clara;
- barra **Hoje / Ontem / 7 dias / 30 dias / Todos** e busca mais compactas;
- bloco de **Ontem** com marcador discreto de **Último fechamento**;
- métricas mais densas, com valores maiores e rótulos mais suaves;
- **Comandas** é apresentado visualmente como **Comandas fechadas**;
- ações de CSV/backup mantêm área de toque confortável com menor peso visual;
- painéis de produtos/categorias, rankings e lista de comandas fechadas ficam mais compactos e fáceis de escanear.

### Estabilidade
- sem alteração da lógica de períodos ou dos cálculos;
- sem `MutationObserver`;
- sem polling visual frequente;
- sem alteração de Supabase, Edge Functions ou event log;
- sem limpeza de `localStorage` e sem reinstalação da PWA.

Ver `docs/RELEASE-v0.25.24.md`.

## v0.25.23 — Acabamento visual dos Fechamentos
A tela **Fechamentos** foi validada em aparelho real com:
- data operacional dominante e horário físico mais discreto;
- valores mais destacados e rótulos mais suaves;
- cards/status/rodapé mais compactos;
- marcador **Último fechamento**;
- **Ajuste administrativo** apresentado de forma amigável;
- proteção contra reaparecimento do ID técnico `turn_...`;
- sem alteração de domínio ou backend.

Ver `docs/RELEASE-v0.25.23.md`.

## v0.25.22 — Refinamento dos Fechamentos
A grade dos fechamentos permanece:
- **Faturamento | Ticket médio**;
- **Comandas fechadas | Comandas canceladas**;
- **Itens vendidos | Formas de pagamento**.

Os hotfixes r2–r4 eliminaram a disputa visual do renderer legado sem `MutationObserver` ou polling contínuo. Ver `docs/RELEASE-v0.25.22.md` e `docs/HOTFIX-v0.25.22-r4.md`.

## v0.25.21 — Ontem no Histórico
A tela **Histórico** possui **Hoje / Ontem / 7 dias / 30 dias / Todos**. A aba **Ontem** usa o fechamento operacional do dia anterior e, quando necessário, respeita o corte do fechamento anterior.

## Funcionalidades preservadas
- data operacional pela abertura da comanda;
- múltiplos turnos no mesmo dia;
- reparo histórico do fechamento de 25/08;
- `A receber / Paga depois`, inclusive baixas parciais sem duplicar faturamento;
- seletor pesquisável de clientes;
- data de nascimento no cadastro e na abertura da comanda;
- campanha de aniversário via WhatsApp;
- rankings por ID/código usando nome atual;
- referência de produtos ao editar categorias;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado;
- Lista + Mapa;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Reparo histórico de 25/08
O reparo administrativo relacionado à comanda `c1787690191876` permanece ativo e rastreável. O fechamento canônico de 25/08 permanece em **R$ 448,00 / 8 comandas / 33 unidades**.

## Backend
Nenhuma alteração na v0.25.28. Permanecem:
- `rota27-sync` v9 ACTIVE;
- `rota27-whatsapp` v23 ACTIVE;
- `rota27-whatsapp-inbound` v2 ACTIVE;
- `rota27-birthday-campaign` v2 ACTIVE;
- sem novo tipo de evento de sync e sem alteração de `rota27_sync_events_type_ck`.

## Ajuda
Ajuda **v7.0**, identificando Rota 27 v0.25.28.

## Atualização da PWA
Não reinstalar e não limpar dados. Em cada aparelho:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.28`.

## Releases recentes
- `docs/RELEASE-v0.25.28.md`
- `docs/RELEASE-v0.25.27.md`
- `docs/RELEASE-v0.25.26.md`
- `docs/RELEASE-v0.25.25.md`
- `docs/RELEASE-v0.25.24.md`
- `docs/RELEASE-v0.25.23.md`
- `docs/RELEASE-v0.25.22.md`
- `docs/RELEASE-v0.25.21.md`
- `docs/RELEASE-v0.25.20.md`
- `docs/RELEASE-v0.25.19.md`
- `docs/RELEASE-v0.25.18.md`
- `docs/RELEASE-v0.25.17.md`
- `docs/RELEASE-v0.25.16.md`

# Rota 27 Bodega — v0.25.50

## Hotfix — estabilidade de UI em Comandas, Painel e Cardápio

Release de urgência para corrigir três regressões visuais/operacionais observadas em produção após v0.25.45–v0.25.49.

### 1. Lista de comandas

- mantém o local da comanda (Balcão, Parklet, Mesa) na mesma linha do nome;
- restaura a cor original terracota/vermelha usando `--brand-2`;
- preserva a compactação de altura;
- preserva a borda lateral preta/vermelha e o restante do desenho do card.

### 2. Painel — “Hoje precisa de atenção”

- elimina a alternância entre o Painel com e sem o bloco de atenção;
- a camada passa a acompanhar o ciclo legado de `screenPanel.innerHTML`;
- após qualquer redraw do Painel, o bloco é recolocado imediatamente;
- atualização é idempotente: a lista interna só é recriada quando o conteúdo das exceções realmente muda;
- mantém o comportamento por exceção: se não há pendência relevante, o bloco fica oculto.

### 3. Cardápio — “Mais usados hoje”

- aposenta o renderer v0.25.49 que reaproveitava `#v14QuickProducts`;
- usa novo container próprio `#v02550QuickProducts`;
- CSS é aplicado por ID sem depender da hierarquia de `#screenMenu`;
- remove qualquer bloco legado deixado pelas v0.25.47/v0.25.49;
- mostra até 6 atalhos horizontais compactos;
- cada atalho mostra ícone SVG, nome, preço e quantidade usada;
- considera comandas abertas e fechadas do dia;
- exclui cancelamentos e consumo interno/não faturável do ranking;
- usa histórico recente como fallback quando ainda não há movimento do dia;
- durante busca textual o bloco é ocultado para não competir com o resultado da busca;
- o lançamento continua usando o fluxo normal de `addProduct`.

### Compatibilidade de cache

- `v02546-attention-panel.js`, `v02547-turn-favorites.js` e `v02549-turn-favorites-hotfix.js` passam a atuar como pontes para `v02550-ui-stability.js`;
- o bootstrap carrega a camada v0.25.50 diretamente e com query versionada;
- cache PWA: `rota27-comandas-v0.25.50-r1`.

### Escopo

Frontend somente. Não altera Supabase, WhatsApp, estoque, preços, sincronização, fechamento de turno ou dados de produção.

### Rollback

Retornar à v0.25.49 / merge `8bf4f2940959ac1d794e64d9bf3c2020bb28c221`.

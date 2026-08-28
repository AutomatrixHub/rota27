# Rota 27 Bodega — v0.25.51

## Hotfix — UX do lançamento e estabilidade visual

Release de correção baseada nos testes reais em Android após a v0.25.50.

### Lista de comandas

- mantém Balcão/Parklet/Mesa na mesma linha do nome;
- mantém a cor terracota/vermelha original;
- aumenta o texto do local em 1 ponto;
- acrescenta visualmente ` - ` antes do local;
- preserva a compactação do card e a borda lateral preta/vermelha.

### Painel — sem cintilação

A v0.25.50 havia estabilizado a presença de `Hoje precisa de atenção`, mas ainda existiam duas camadas interceptando o redraw do Painel.

A v0.25.51:

- remove a segunda ponte de `screenPanel.innerHTML`;
- mantém apenas a ponte histórica de `v0252-panel-polish.js`;
- integra `Hoje precisa de atenção` no mesmo ciclo de normalização do Painel;
- não cria polling, `MutationObserver` ou re-render concorrente;
- mantém atualização idempotente do conteúdo.

### Cardápio — Mais usados hoje

- a faixa legada `Mais lançados` da v0.14 é ocultada desde o CSS inicial, impedindo o flash de uma segunda linha;
- `Mais usados hoje` passa de 6 itens com rolagem horizontal para **Top 3**;
- os 3 atalhos ficam todos visíveis na mesma linha;
- ícones removidos para priorizar o nome do produto;
- nome pode ocupar até 3 linhas dentro do card;
- preço e quantidade lançada permanecem visíveis;
- sem rolagem lateral;
- cancelamentos e consumo interno/não faturável continuam fora do ranking;
- histórico recente continua como fallback quando ainda não houve movimento no dia.

### Rolagem do lançamento

- `screenSale` recebe folga inferior adicional;
- a última linha de produtos pode ser rolada completamente acima da barra preta fixa;
- a barra deixa de esconder o nome dos últimos itens.

### Barra preta da comanda

- a consulta rápida `Ver itens` da v0.15 RC.3 é aposentada;
- o `setInterval` legado de 1,5 s associado a esse recurso foi removido;
- o botão `Editar itens` passa a se chamar **Ver/Editar itens**;
- o botão continua abrindo o editor já validado da comanda.

### PWA

- VERSION: `0.25.51`;
- cache: `rota27-comandas-v0.25.51-r1`;
- cache busting específico para as camadas alteradas.

### Escopo

Frontend somente. Não altera Supabase, WhatsApp, estoque, preços, sincronização, fechamento de turno, clientes ou dados de produção.

### Rollback

Baseline anterior: v0.25.50 / merge `2c0d40a70eb788df839c3b32ac89a5c31d7a93a2`.

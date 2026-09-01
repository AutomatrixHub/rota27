# Rota 27 v0.25.98 — estado vazio canônico

## Estado
Produção homologada no Android e promovida pelo PR #142.

## Problemas corrigidos
1. O quadro legado com ícone de estrada e botão **Abrir primeira comanda** aparecia durante o carregamento.
2. No modo Mapa, o quadro vazio da Lista podia aparecer junto ao quadro próprio do Mapa.

## Causa
O shell `base-v013.html` ainda continha o componente antigo. A v0.25.80 reconstruía esse componente depois do carregamento. Em paralelo, a v0.25.88 forçava sua exibição global com estilo inline `!important`, sobrepondo a separação visual do Mapa.

## Substituição estrutural
- `base-v013.html` passa a nascer com a marcação e o visual canônicos;
- a reconstrução tardia foi removida da v0.25.80;
- `v02580-r4-list-empty-parity.css` foi eliminado;
- `v02588-list-empty-visibility.js` foi eliminado;
- `v02598-command-empty-state.js` assume somente a visibilidade do estado vazio da Lista;
- o Mapa continua criando e controlando exclusivamente seu próprio estado vazio;
- a folha v0.25.80-r3 mantém apenas as regras ainda ativas da Topbar.

## Preservações
- nenhuma migration ou alteração de schema;
- nenhuma alteração em Supabase, Edge Functions ou WhatsApp;
- nenhuma alteração em criação, edição, lançamento ou fechamento de comandas;
- nenhuma alteração no isolamento do Modo Teste.

## Testes obrigatórios
1. Primeiro carregamento com zero comandas: nunca exibir o quadro antigo.
2. Lista vazia: exibir exatamente um quadro atual.
3. Mapa vazio: exibir exatamente um quadro atual, pertencente ao Mapa.
4. Alternar Lista/Mapa repetidamente sem duplicação.
5. Com uma ou mais comandas: nenhum estado vazio visível.
6. Repetir os cenários em Modo Teste.
7. Validar atualização e reabertura do PWA.

## Rollback
Produção anterior: v0.25.97 / PR #140 / merge `e26a14274808425507da784527e47607f8171e1f`.

# v0.25.126 — remoção do autoatualizador substituído

## Alteração

- remove `assets/v02587-auto-update.js`;
- remove a entrada do módulo no roadmap e no App Shell;
- remove a injeção transitória do Service Worker que só neutralizava esse módulo.

## Motivo

O coordenador v0.25.90 já substitui integralmente a v0.25.87: verifica versões, atualiza o Service Worker, trata pedidos remotos e bloqueia reload repetido. Manter os dois não adicionava fallback; apenas preservava código morto.

## Garantias

- `v02590-update-coordinator.js` permanece carregado antes de qualquer fluxo de atualização;
- telemetria e gestão remota de aparelhos permanecem em `v02589-device-release.js` e v0.25.90;
- não há alteração de dados operacionais, comandas, histórico, sincronização ou Modo Teste.

## Homologação sugerida

1. Atualize o app para v0.25.126.
2. Use-o normalmente por alguns minutos, inclusive abrindo e fechando uma comanda sem ficar em campo de texto.
3. Confirme que não há reload repetido e que **Painel → Aparelhos sincronizados** abre normalmente.

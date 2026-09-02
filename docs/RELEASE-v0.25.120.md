# v0.25.120 — limpeza de identidades legadas do Mapa

## Removido

- `assets/v0253-release.js`
- `assets/v0254-release.js`

Ambos apenas substituíam o rótulo de versão na Ajuda por versões antigas. Não possuíam consumidores fora do bootstrap e do Service Worker e eram sobrepostos pelo carregador atual.

## Preservado

- Mapa de comandas, Lista/Mapa e abertura de comandas;
- estilos do Mapa e refinamentos visuais posteriores;
- dados, sincronização e recursos operacionais.

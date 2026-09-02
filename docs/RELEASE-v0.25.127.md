# v0.25.127 — Service Worker sem injeção legada

## Alteração

- remove `ROADMAP_SUFFIX` do Service Worker;
- o Service Worker volta a entregar o `roadmap-loader.js` sem anexar código;
- os módulos `v02590-update-coordinator.js` e `v02590-device-clarity.js` continuam carregados pelo roadmap oficial.

## Motivo

A injeção era uma ponte de migração da v0.25.90. Após as releases posteriores, ela duplicava carregamento e identidade sem servir como fallback adicional.

## Garantias

- atualização remota, proteção contra reload repetido e gestão de aparelhos permanecem no coordenador v0.25.90;
- a versão continua definida pelo `VERSION`, pelo `index.html`, pelo roadmap e pelo Service Worker;
- não há alteração em dados, operação, sincronização ou Modo Teste.

## Homologação sugerida

1. Atualize o app para v0.25.127.
2. Confirme o selo da versão e abra **Painel → Aparelhos sincronizados**.
3. Navegue entre Comandas, Painel e Histórico; confirme ausência de reload repetido.

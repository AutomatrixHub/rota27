# Rota 27 v0.25.90 — Hotfix de atualização e clareza dos aparelhos

## Motivo
Dois problemas foram observados em produção após a introdução da atualização automática e da telemetria de release:

1. alguns aparelhos entravam em ciclo de reload a cada poucos segundos e voltavam para a tela de Comandas;
2. a tela **Aparelhos sincronizados** ainda podia misturar a versão interna legada (`app_version`) com a release oficial do Rota 27.

## Causa raiz
O coordenador v0.25.87 usava o `meta[name="rota27-release-version"]` como fonte primária da versão carregada. Camadas históricas ainda podem alterar esse meta durante o bootstrap. Quando o Service Worker já estava atualizado, mas a página acreditava estar numa versão mais antiga, o coordenador voltava a agendar `location.reload()`, criando um ciclo aproximado de 2–3 segundos.

A mesma leitura instável podia ser enviada à telemetria como `release_version`, produzindo valores como `0.25.71` mesmo em uma interface posterior.

## Correção
- a versão autoritativa passa a ser a release do roadmap/Service Worker da v0.25.90;
- o coordenador antigo v0.25.87 é suprimido antes de iniciar;
- novo coordenador v0.25.90 protege contra segundo reload para o mesmo alvo durante 5 minutos;
- o Service Worker informa explicitamente `0.25.90` e injeta a hotfix mesmo durante a transição de caches antigos;
- o novo coordenador envia `releaseVersion` separadamente ao backend;
- a tela de aparelhos deixa de tratar `app_version` como versão instalada;
- a UI passa a explicar **Versão do Rota 27**, **Última atividade**, **Diagnóstico** e **ID técnico**;
- solicitações remotas de atualização continuam disponíveis.

## Compatibilidade
- `rota27-sync` permanece v10, sem alteração;
- `rota27-device-control` permanece v3;
- nenhuma migration adicional;
- nenhuma comanda, cliente, produto, estoque, recebível, pagamento ou histórico é alterado;
- Modo Teste permanece isolado.

## Release
- versão: `0.25.90`;
- cache: `rota27-comandas-v0.25.90-r1`;
- baseline anterior: v0.25.89;
- rollback: reverter o merge desta release e restaurar o cache anterior.

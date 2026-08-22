# Rota 27 — Status de produção

Última revisão: 21/08/2026

## Baseline atual

- versão: **v0.16.1**
- branch de produção: `main`
- entrada pública: `index.html`
- Service Worker: cache `rota27-comandas-v0.16.1`
- base funcional herdada da v0.15.1
- Ajuda integrada promovida pelo PR #8
- hotfix preventivo de identidade/versionamento preparado antes do piloto
- piloto real da v0.16.1 previsto para **22/08/2026**

## Estado do GitHub

- PR #8: **mesclado**;
- v0.16.0 introduziu a Ajuda completa;
- v0.16.1 substitui a v0.16.0 como baseline do piloto;
- nenhuma alteração de backend foi necessária;
- documentação de release e piloto atualizada.

## Motivo da v0.16.1

A v0.15.1 possuía um observador final que forçava continuamente o selo/título de versão. A v0.16.0 também introduziu um protetor final. Para evitar que duas camadas de releases diferentes disputem o mesmo selo/título, a v0.16.1 remove os finals legados do carregamento ativo e usa somente `assets/v0161-final.js` como protetor final da release.

## Estado funcional

A v0.16.1 preserva as funções já validadas da v0.15.1:

- operação desktop, Android e iPhone/PWA;
- abertura, lançamento, edição, fechamento e cancelamento;
- sincronização multidispositivo;
- operação offline-first;
- WhatsApp real;
- Histórico, Painel, Cardápio, backup e importação/exportação.

A evolução funcional de interface continua sendo a Ajuda integrada. O hotfix v0.16.1 não altera dados, totais, fechamento, cancelamento, sync ou WhatsApp.

## Ajuda integrada

- botão `? Ajuda` no cabeçalho;
- busca por intenção;
- atalhos de ação;
- Primeiros 3 minutos;
- exemplos reais;
- mini-guias visuais;
- respostas rápidas;
- glossário;
- conteúdo offline;
- refinamento da seção **Se acontecer isso…** para impedir quebra palavra por palavra e melhorar legibilidade;
- destaque especial para situações em que o usuário deve parar antes de fechar a venda.

## Backends

- `rota27-whatsapp`: versão validada permanece implantada;
- `rota27-sync`: versão validada permanece implantada;
- nenhum backend foi alterado pela v0.16.0/v0.16.1;
- secrets/tokens não são armazenados no GitHub;
- autenticação customizada por `x-rota27-device-token` preservada.

## PWA / dados locais

- atualizar sem reinstalar;
- não limpar dados do Safari/Chrome;
- `localStorage` continua sendo a base local do aparelho;
- sync e WhatsApp possuem filas separadas;
- cancelamento possui fila própria para propagação quando necessário;
- Service Worker troca caches antigos pelo `rota27-comandas-v0.16.1` sem tocar no `localStorage`.

## Pendências funcionais conhecidas

**Nenhuma pendência funcional conhecida bloqueia o piloto real da v0.16.1 neste momento.**

A Ajuda e o hotfix de identidade ainda devem ser observados no ambiente real em desktop/Android/iPhone durante o piloto de 22/08/2026.

## Pontos de evolução já registrados

Continuam pós-piloto, salvo evidência real:

- cancelamento como evento nativo/tombstone com trilha de auditoria;
- normalização adicional de metadados históricos DEV/RC, quando necessário;
- busca em comandas abertas somente se o volume justificar;
- proteção por PIN para ações administrativas somente se houver risco real de uso indevido;
- resumo de turno somente se substituir tarefa manual existente.

## Regra para o piloto de 22/08/2026

Ao iniciar o turno, a v0.16.1 fica congelada.

- P0/P1 podem justificar hotfix;
- P2/P3 devem ser registrados para depois do turno;
- não reinstalar PWA;
- não limpar `localStorage`;
- não alterar `rota27-sync` ou `rota27-whatsapp` sem necessidade real;
- manter a interface silenciosa quando tudo estiver saudável.

Documentos de referência:

- `docs/PILOTO-REAL-v0.16.1.md`
- `docs/RELEASE-v0.16.1.md`
- `docs/RELEASE-v0.16.0.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/PRODUCT-PRINCIPLES.md`

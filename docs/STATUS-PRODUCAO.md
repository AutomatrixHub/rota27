# Rota 27 — Status de produção

Última revisão: 21/08/2026

## Baseline atual

- versão: **v0.16.0**
- branch de produção: `main`
- entrada pública: `index.html`
- Service Worker: cache `rota27-comandas-v0.16.0`
- base funcional herdada da v0.15.1
- Ajuda integrada promovida pelo PR #8
- piloto real da v0.16.0 previsto para **22/08/2026**

## Estado do GitHub

- PR #8: **mesclado**;
- `main` contém a v0.16.0;
- nenhuma alteração de backend foi necessária;
- documentação de release e piloto atualizada.

## Estado funcional

A v0.16.0 preserva as funções já validadas da v0.15.1:

- operação desktop, Android e iPhone/PWA;
- abertura, lançamento, edição, fechamento e cancelamento;
- sincronização multidispositivo;
- operação offline-first;
- WhatsApp real;
- Histórico, Painel, Cardápio, backup e importação/exportação.

A única evolução funcional de interface desta release é a Ajuda integrada. Ela não altera dados, totais, fechamento, cancelamento, sync ou WhatsApp.

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
- nenhum backend foi alterado pela v0.16.0;
- secrets/tokens não são armazenados no GitHub;
- autenticação customizada por `x-rota27-device-token` preservada.

## PWA / dados locais

- atualizar sem reinstalar;
- não limpar dados do Safari/Chrome;
- `localStorage` continua sendo a base local do aparelho;
- sync e WhatsApp possuem filas separadas;
- cancelamento possui fila própria para propagação quando necessário;
- Service Worker troca o cache antigo pelo `rota27-comandas-v0.16.0` sem tocar no `localStorage`.

## Pendências funcionais conhecidas

**Nenhuma pendência funcional conhecida bloqueia o piloto real da v0.16.0 neste momento.**

A Ajuda ainda deve ser validada no ambiente real em desktop/Android/iPhone durante o piloto de 22/08/2026.

## Pontos de evolução já registrados

Continuam pós-piloto, salvo evidência real:

- cancelamento como evento nativo/tombstone com trilha de auditoria;
- normalização adicional de metadados históricos DEV/RC, quando necessário;
- busca em comandas abertas somente se o volume justificar;
- proteção por PIN para ações administrativas somente se houver risco real de uso indevido;
- resumo de turno somente se substituir tarefa manual existente.

## Regra para o piloto de 22/08/2026

Ao iniciar o turno, a v0.16.0 fica congelada.

- P0/P1 podem justificar hotfix;
- P2/P3 devem ser registrados para depois do turno;
- não reinstalar PWA;
- não limpar `localStorage`;
- não alterar `rota27-sync` ou `rota27-whatsapp` sem necessidade real;
- manter a interface silenciosa quando tudo estiver saudável.

Documentos de referência:

- `docs/PILOTO-REAL-v0.16.0.md`
- `docs/RELEASE-v0.16.0.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/PRODUCT-PRINCIPLES.md`

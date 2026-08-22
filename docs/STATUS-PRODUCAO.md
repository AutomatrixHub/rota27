# Rota 27 — Status de produção

Última revisão: 22/08/2026

## Baseline atual

- versão em produção: **v0.16.1**
- branch de produção: `main`
- entrada pública: `index.html`
- Service Worker de produção: cache `rota27-comandas-v0.16.1`
- base funcional herdada da v0.15.1
- Ajuda integrada promovida pelo PR #8
- hotfix preventivo de identidade/versionamento ativo
- base de campo zerada e sincronizada para o piloto real de **22/08/2026**

## Desenvolvimento em validação

A próxima versão está isolada em:

- versão candidata: **v0.17.0**;
- branch: `feature/v0.17.0-clientes-gerente-layout`;
- produção permanece na v0.16.1 até testes e autorização explícita de merge.

Escopo v0.17.0:

- cadastro de clientes;
- captura automática de cliente quando a comanda possui nome + WhatsApp;
- importação/exportação TXT/CSV de clientes;
- autocomplete de cliente/WhatsApp na comanda;
- sincronização compartilhada de clientes;
- configuração compartilhada do WhatsApp do gerente;
- cópia agrupada dos lançamentos para o gerente;
- nome do cliente como destaque principal e mesa/local na linha abaixo;
- novo cache/protetor final de versão somente na branch de desenvolvimento.

A mudança de logo e paleta de cores fica fora da v0.17.0 e será tratada em atualização posterior.

## Estado do GitHub

- PR #8: **mesclado**;
- v0.16.0 introduziu a Ajuda completa;
- v0.16.1 substituiu a v0.16.0 como baseline do piloto;
- branch da v0.17.0 criada a partir do HEAD validado da v0.16.1;
- v0.17.0 ainda não deve ser publicada na `main` antes da validação.

## Motivo da v0.16.1

A v0.15.1 possuía um observador final que forçava continuamente o selo/título de versão. A v0.16.0 também introduziu um protetor final. Para evitar que duas camadas de releases diferentes disputem o mesmo selo/título, a v0.16.1 remove os finals legados do carregamento ativo e usa somente `assets/v0161-final.js` como protetor final da release.

## Estado funcional da produção

A v0.16.1 preserva as funções já validadas da v0.15.1:

- operação desktop, Android e iPhone/PWA;
- abertura, lançamento, edição, fechamento e cancelamento;
- sincronização multidispositivo;
- operação offline-first;
- WhatsApp real;
- Histórico, Painel, Cardápio, backup e importação/exportação.

A evolução funcional de interface da v0.16 foi a Ajuda integrada. O hotfix v0.16.1 não altera dados, totais, fechamento, cancelamento, sync ou WhatsApp.

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

Produção v0.16.1:

- `rota27-whatsapp`: versão validada permanece implantada;
- `rota27-sync`: versão validada permanece implantada;
- secrets/tokens não são armazenados no GitHub;
- autenticação customizada por `x-rota27-device-token` preservada.

Desenvolvimento v0.17.0:

- `rota27-whatsapp` não precisa de mudança para a cópia do gerente; a versão atual e os templates aprovados são reutilizados;
- `rota27-sync` na branch adiciona suporte aos eventos `client_upsert`, `client_delete` e `manager_config_replace`;
- a versão v0.17 do `rota27-sync` deve ser implantada de forma controlada antes do teste multidispositivo das novas entidades;
- nenhuma migração de tabela é necessária para esses novos eventos.

## PWA / dados locais

Produção:

- atualizar sem reinstalar;
- não limpar dados do Safari/Chrome;
- `localStorage` continua sendo a base local do aparelho;
- sync e WhatsApp possuem filas separadas;
- cancelamento possui fila própria para propagação quando necessário;
- Service Worker da v0.16.1 troca caches antigos sem tocar no `localStorage`.

v0.17 em desenvolvimento:

- clientes e configuração do gerente ficam no objeto `state` e entram no Backup JSON;
- eventos de clientes possuem cursor/outbox próprios para não interferir na fila principal;
- fila de mensagens do gerente fica local por aparelho e não é sincronizada;
- Service Worker candidato usa `rota27-comandas-v0.17.0` somente na branch de desenvolvimento.

## Preparação do piloto de 22/08/2026

A base compartilhada de campo foi zerada de forma controlada antes do uso real:

- 0 comandas abertas;
- histórico vazio;
- faturamento inicial R$ 0,00;
- 22/22 produtos preservados;
- Android e iPhones convergiram para a base limpa;
- PC de produção confirmou sincronização saudável.

## Pendências funcionais conhecidas

**Nenhuma pendência funcional conhecida bloqueia a produção v0.16.1 neste momento.**

A v0.17.0 é evolução funcional e deve passar pelo roteiro `docs/TESTE-v0.17.0.md` antes de qualquer promoção.

## Pontos de evolução registrados

Além da v0.17.0, continuam pós-piloto salvo evidência real:

- nova identidade visual, cores e logo;
- cancelamento como evento nativo/tombstone com trilha de auditoria;
- normalização adicional de metadados históricos DEV/RC, quando necessário;
- busca em comandas abertas somente se o volume justificar;
- proteção por PIN para ações administrativas somente se houver risco real de uso indevido;
- resumo de turno somente se substituir tarefa manual existente.

## Regra para produção/piloto

A v0.16.1 permanece congelada durante o piloto.

- P0/P1 podem justificar hotfix;
- P2/P3 devem ser incorporados à evolução v0.17+;
- não reinstalar PWA;
- não limpar `localStorage`;
- não publicar a v0.17.0 na `main` sem validação;
- manter a interface silenciosa quando tudo estiver saudável.

Documentos de referência:

- `docs/PILOTO-REAL-v0.16.1.md`
- `docs/RELEASE-v0.16.1.md`
- `docs/RELEASE-v0.17.0.md`
- `docs/TESTE-v0.17.0.md`
- `docs/ROADMAP-POST-PILOTO.md`
- `docs/PRODUCT-PRINCIPLES.md`

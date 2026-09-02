# Rota 27 — Release v0.25.115

## Objetivo

Excluir os scripts históricos `testar-v018`, `testar-v0181`, `testar-v0182`, `testar-v0183`, `testar-v0190`, `testar-v0200` e `testar-v0210`.

## Evidências

- nenhum script é chamado fora de documentação histórica;
- todos exigem branches `feature/` v0.18–v0.21 ausentes do remoto;
- todos recusam a versão `main` atual antes de iniciar qualquer servidor;
- não integram App Shell, Service Worker ou produção.

## Preservado

Os assets e funções operacionais v0.18–v0.21 continuam carregados pela aplicação atual.

## Rollback

Recuperar scripts do histórico Git se for necessário reproduzir um laboratório legado.

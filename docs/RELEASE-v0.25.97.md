# Rota 27 v0.25.97 — Limpeza controlada do App Shell

## Objetivo

Executar a primeira fase conservadora da limpeza pós-v0.25.96, retirando do pré-cache apenas assets sem caminho executável conhecido. Nenhum arquivo é apagado nesta release.

## Alteração

Deixam de integrar `APP_SHELL`:

- `assets/brand/rota27-logo-oficial.png`;
- `assets/v021-compat.js`;
- `assets/v021-help-compat.js`;
- `assets/v02547-turn-favorites.css`;
- `assets/v02547-turn-favorites.js`;
- `assets/v02549-turn-favorites-hotfix.js`.

Os seis arquivos permanecem no repositório e acessíveis por URL. A release serve para observar acessos, erros 404, instalação, atualização e comportamento offline antes de qualquer exclusão física.

## Preservações

- nenhuma exclusão de arquivo;
- nenhuma alteração em comandas, turnos, clientes, produtos, estoque, recebíveis ou histórico;
- nenhuma migration ou alteração em Supabase/Edge Functions;
- nenhuma alteração em sync, WhatsApp ou Modo Teste;
- nenhuma alteração funcional ou visual.

## PWA

- `VERSION`: `0.25.97`;
- cache: `rota27-comandas-v0.25.97-r1`;
- metadados do shell e roadmap alinhados em `0.25.97`;
- baseline congelada: tag `production-v0.25.96-freeze`, commit `8b382bff82d103a257cd0b34ecb2c71ca0df93c2`.

## Validação obrigatória antes do merge

1. Instalação limpa online e abertura offline.
2. Atualização de v0.25.96 para v0.25.97 sem loop de reload.
3. Primeiro paint sem topbar antiga.
4. Nenhum request 404 e nenhum erro de Service Worker.
5. Smoke de comandas, turno, sync e Modo Teste → dados reais.

## Rollback

Restaurar as seis entradas no App Shell por uma nova release com versão/cache crescentes. Não reutilizar o cache v0.25.96.

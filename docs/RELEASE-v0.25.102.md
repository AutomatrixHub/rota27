# Rota 27 v0.25.102 — Ajuda sem foco na origem

## Objetivo

Substituir a compensação v0.25.94 por um comportamento correto na Ajuda-base.

## Alterações

- removido o `focus()` agendado 30 ms após abrir a Ajuda;
- excluído `assets/v02594-help-no-autofocus.js`;
- removidas suas referências no roadmap e no App Shell;
- mantidos o foco manual no campo, a limpeza da busca e a restauração do foco ao fechar.

## Critérios de promoção

- abrir a Ajuda sem mover o foco para a busca;
- teclado virtual não deve ser solicitado automaticamente;
- tocar na busca deve permitir digitação normal;
- fechar deve devolver o foco ao acionador;
- Ajuda v11 e botões X devem permanecer funcionais;
- nenhum erro no navegador.

Não há alteração em dados, Supabase, sincronização, WhatsApp ou regras operacionais. Rollback: v0.25.101.

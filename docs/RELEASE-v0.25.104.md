# Release v0.25.104 — edição sem compensação de foco

## Objetivo

Eliminar uma correção compensatória da v0.25.76 sem alterar o comportamento aprovado da tela **Editar comanda**.

## Alterações

- removido da origem o agendamento de foco automático no campo Mesa/Local;
- excluído `assets/v02576-edit-command-no-autofocus.js`;
- removidas as referências ao asset no roadmap, no HTML e no App Shell do Service Worker;
- atualizadas a identidade da versão e a chave do cache para v0.25.104-r1.

## Critérios de homologação

- a tela Editar comanda abre sem teclado ou foco automático;
- o campo Mesa/Local continua recebendo foco por toque e aceitando edição;
- cancelar e salvar continuam funcionando;
- nenhuma exceção aparece no navegador;
- o asset removido deixa de ser publicado.

## Risco e rollback

A mudança não toca dados, Supabase, sincronização ou regras operacionais. Em caso de regressão, o rollback funcional é a v0.25.103.

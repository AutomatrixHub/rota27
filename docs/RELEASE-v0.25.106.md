# Release v0.25.106 — clientes sem foco automático

## Objetivo

Alinhar **Novo cliente** e **Editar cliente** ao padrão aprovado das demais telas de edição: nenhum campo recebe foco ou abre o teclado automaticamente.

## Alterações

- removido da origem o `focus()` tardio do campo Nome em `openClientEditor()`;
- atualizado o cache-buster de `v017-core.js` para v0.25.106-r1;
- atualizadas a identidade da versão e a chave do Service Worker.

## Critérios de homologação

- Novo cliente abre sem foco automático;
- Editar cliente abre sem foco automático;
- Nome, WhatsApp e Observação continuam recebendo foco manual;
- Voltar fecha sem alteração;
- salvar um cliente de teste continua funcionando;
- nenhuma exceção aparece no navegador.

## Risco e rollback

Não há mudança em dados, Supabase, sincronização ou regras de cadastro. O rollback funcional é a v0.25.105.

# Rota 27 v0.25.17 — Aniversário no cadastro de clientes

Data: 26/08/2026

## Objetivo
Adicionar **Data de nascimento** opcional ao cadastro compartilhado de clientes, preservando a arquitetura offline-first e multidispositivo.

## Implementação
- novo módulo: `assets/v02517-client-birthday.js`;
- campo `type="date"` inserido no editor existente de cliente;
- formato canônico: `AAAA-MM-DD`;
- datas inválidas, futuras ou anteriores a 1900 são rejeitadas;
- exibição no perfil de Relacionamento & Fidelização em `DD/MM/AAAA`;
- armazenamento local complementar em `rota27_v02517_birthdays_v1` para sobreviver às camadas legadas do cadastro;
- cursor próprio de leitura: `rota27_v02517_birthdays_cursor_v1`;
- sincronização pelo evento já existente `client_upsert`;
- payload com `birthDate` e `birthDateUpdatedAt`;
- eventos antigos de `client_upsert` que não possuem `birthDate` são tratados como “sem alteração” e não apagam o aniversário já cadastrado;
- remoção explícita do campo gera `birthDate: ""`;
- exportação CSV passa a gerar `nome;whatsapp;data_nascimento;observacao`;
- importação reconhece `data_nascimento`, `nascimento`, `aniversario`, `birthdate` e `birthday`;
- ajuda contextual atualizada;
- sem `MutationObserver` e sem polling visual frequente.

## Backend
Não houve mudança de contrato de eventos.

- `rota27-sync`: permanece versão 9 ACTIVE;
- `EDGE_VERSION`: permanece `rota27-sync-v0.25.16`;
- evento utilizado: `client_upsert`;
- nenhuma migration nova;
- nenhuma alteração em `ALLOWED_TYPES`;
- nenhuma alteração em `rota27_sync_events_type_ck`.

## PWA
- versão: `0.25.17`;
- Service Worker: `rota27-comandas-v0.25.17-r1`;
- novo asset incluído no app shell: `assets/v02517-client-birthday.js`.

## Compatibilidade
A implementação foi feita como camada complementar sobre o cadastro v0.17 para não arriscar regressão nas funções já estabilizadas de:
- criação/edição de clientes;
- IDs canônicos por WhatsApp;
- seletor pesquisável da nova comanda;
- importação/exportação;
- sincronização `client_upsert`;
- Relacionamento & Fidelização.

## Validação esperada
1. abrir **Cardápio → Clientes**;
2. criar ou editar um cliente;
3. informar uma data de nascimento válida e salvar;
4. reabrir o cadastro e confirmar persistência;
5. abrir **Relacionamento & Fidelização → Ver perfil** e confirmar a data formatada;
6. em outro aparelho atualizado, sincronizar e confirmar a mesma data;
7. exportar CSV e confirmar a coluna `data_nascimento`;
8. importar um CSV com `data_nascimento` e confirmar atualização;
9. remover a data, salvar e confirmar remoção nos demais aparelhos.

## Preservado
- v0.25.16 — reparo histórico do fechamento;
- v0.25.15 — data operacional pela abertura da comanda;
- v0.25.14 — múltiplos turnos no mesmo dia;
- v0.25.13 — seletor pesquisável de clientes;
- A receber / Paga depois;
- rankings por ID/código com nome atual;
- referência de produtos por categoria;
- WhatsApp fixo da operação;
- replay histórico hibernado;
- estoque, compras, inventário, custos e relacionamento/fidelização.

## Rollback
Baseline de rollback de código: **v0.25.16**.

Como a v0.25.17 reutiliza `client_upsert`, não existe migration de backend para desfazer. Eventos com `birthDate` permanecem válidos como JSON mesmo se o frontend for revertido; versões antigas simplesmente ignoram o campo complementar.

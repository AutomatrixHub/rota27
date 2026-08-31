# Rota 27 v0.25.85 — Gestão de aparelhos sincronizados

## Objetivo

Permitir que o gerente controle os aparelhos registrados na sincronização sem depender do Table Editor do Supabase.

## Interface

No **Painel → Operação** passa a existir o acesso **Aparelhos sincronizados**.

A tela mostra nome, versão, última atividade, `device_id` e estado de cada aparelho.

Ações disponíveis para aparelhos que não sejam o aparelho atual:

- **Desativar** — bloqueia novas sincronizações até reativação;
- **Reativar** — devolve o aparelho ao estado ativo;
- **Remover** — remove da lista operacional e bloqueia o `device_id`, preservando todos os eventos históricos;
- **Mostrar removidos** — permite auditar e restaurar aparelhos removidos.

O aparelho atual é identificado por **Este aparelho** e não pode desativar/remover a si próprio.

## Backend

A tabela `rota27_sync_devices` recebe:

- `status`: `active`, `retired` ou `removed`;
- `retired_at`;
- `retired_reason`.

`removed` é um tombstone controlado. A linha não é apagada fisicamente porque isso permitiria que um aparelho antigo se registrasse novamente no próximo heartbeat.

A Edge Function `rota27-sync` passa para `v0.25.85` e:

- bloqueia `retired` e `removed` antes de `status`, `push` ou `pull`;
- expõe `devices_list`, `device_retire`, `device_reactivate` e `device_remove`;
- mantém `rota27_sync_events` intacta;
- impede autodesativação/autoremoção do aparelho que executa a ação.

## Modo Teste

Gerenciamento de aparelhos é uma operação administrativa real e fica indisponível enquanto o **Modo Teste Global** estiver ativo.

## Segurança e preservação

- nenhuma comanda, cliente, produto, fechamento ou evento histórico é apagado;
- remover um aparelho não apaga `rota27_sync_events`;
- o token de dispositivo existente continua sendo a autenticação customizada da Edge Function;
- a função permanece com `verify_jwt=false`, como na produção anterior, pois autentica via `x-rota27-device-token`.

## Rollback

A interface pode ser removida revertendo os assets v0.25.85. As novas colunas são retrocompatíveis. A Edge Function anterior pode ser restaurada sem perda de dados; registros `retired/removed` devem ser reavaliados antes de qualquer rollback que deixe de validar o lifecycle.

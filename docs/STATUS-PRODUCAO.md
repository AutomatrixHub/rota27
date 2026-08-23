# Rota 27 — Status de produção

Última revisão: 22/08/2026

## Produção atual

- versão: **v0.16.1**
- branch de produção: `main`
- entrada pública: `index.html`
- Service Worker: cache `rota27-comandas-v0.16.1`
- baseline oficial do piloto real

## Candidata v0.17.0

A evolução v0.17.0 está em desenvolvimento no PR #10, branch `feature/v0.17.0-clientes-gerente-layout`, ainda fora da `main`.

A Fase 1 local em `http://localhost:3002/` foi aprovada em 22/08/2026:

- cadastro manual de clientes: OK;
- importação TXT/CSV: OK;
- criação automática de cliente a partir de comanda com WhatsApp: OK;
- autocomplete em Nova/Editar comanda: OK;
- nome do cliente em destaque e mesa/local abaixo: OK;
- configuração do WhatsApp do gerente: OK;
- smoke operacional: OK.

Pendente no momento:

- envio real de itens para o WhatsApp do gerente;
- teste multidispositivo dos novos eventos de clientes/gerente;
- regressão final de sync e WhatsApp antes do merge.

## Backend

O `rota27-sync` v0.17.0 foi implantado de forma controlada no projeto Supabase em 22/08/2026. A alteração é retrocompatível com a v0.16.1 e apenas amplia a lista de eventos aceitos para:

- `client_upsert`;
- `client_delete`;
- `manager_config_replace`.

A função continua com autenticação própria por `x-rota27-device-token` e `verify_jwt=false`, como na produção anterior.

O backend `rota27-whatsapp` **não foi alterado** para a v0.17.0 até este ponto.

## Regra de promoção

A v0.17.0 só deve ser promovida para `main` após:

1. envio real ao gerente validado;
2. sincronização de clientes e gerente validada entre aparelhos;
3. smoke operacional sem regressões;
4. confirmação de que faturamento, comandas e histórico permanecem corretos;
5. versão/cache/selo coerentes em `0.17.0`.

## Próxima atualização visual

Nova paleta, novo logo e identidade visual ampla permanecem fora do escopo da v0.17.0 e ficam para a atualização posterior.

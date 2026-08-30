# Rota 27 — Status de produção

Última revisão: 29/08/2026

## Produção
- versão: **v0.25.68 — Recontato de cadastro**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.68-r1`;
- baseline anterior: **v0.25.67**, merge `35d6841f7be7e1de09ab371f91dbc073ecbbccf6`.

## Solicitação de data de nascimento
A campanha `birthday_request_v1` agora aceita até **3 solicitações bem-sucedidas por cliente**, com cooldown mínimo de **7 dias**.

### Elegibilidade
Para receber uma solicitação o cliente precisa:
- ter WhatsApp válido;
- ainda não possuir data de nascimento válida;
- possuir evidência anterior de contato autorizado, ou já ter sido elegível e recebido uma solicitação anterior desta campanha;
- não ter alcançado 3 solicitações bem-sucedidas;
- ter completado 7 dias desde a solicitação anterior, quando houver.

Falhas técnicas não contam para o limite de três. O disparo é manual pelo card de Clientes; não existe cron de reenvio para esta campanha.

## Interface
Em **Clientes → Solicitar data de nascimento pelo WhatsApp**, o painel informa:
- com WhatsApp sem aniversário;
- com histórico autorizado;
- já receberam 1+ solicitação;
- aguardando 7 dias;
- limite de 3 atingido;
- prontos agora;
- quantidade de primeiras solicitações e recontatos disponíveis.

Clientes sem evidência anterior de contato continuam bloqueados. Clientes sem WhatsApp válido são indicados para atualização manual.

## Respostas pelo WhatsApp
`rota27-whatsapp-inbound` v4 mantém o fluxo anterior de reconhecimento de `DD/MM/AAAA` e agora grava no mesmo `client_upsert`:
- `birthDate`;
- `relationshipMarketingOptIn=true`;
- `eventMarketingOptIn=true` por compatibilidade;
- fonte `birth_date_reply_whatsapp_v02568`.

Assim que a data é gravada, o cliente sai da audiência de novas solicitações.

## Edge Functions
- `rota27-birthday-campaign`: **v3 ACTIVE**, `verify_jwt=false`, autenticação própria por `x-rota27-device-token`;
- `rota27-whatsapp-inbound`: **v4 ACTIVE**, `verify_jwt=false`, webhook Meta com verificação de assinatura quando configurada;
- template `solicitar_aniversario_rota27_v1` permanece o mesmo já aprovado pela Meta;
- nenhuma mensagem foi enviada durante a implantação da v0.25.68.

## Parabéns automático
Preservado sem mudança:
- `rota27-birthday-greeting`;
- cron diário às 09:30 em `America/Sao_Paulo`;
- template `aniversario_cliente_rota27_v1` MARKETING aprovado;
- idempotência anual.

## Preservação
- nenhuma migration;
- nenhum reset de dados;
- histórico de solicitações antigas é reaproveitado como tentativa 1;
- v0.25.67 continua responsável pelo estado visual dos aniversários;
- v0.25.66 continua responsável pela elegibilidade/backfill;
- v0.25.65 continua responsável pelo parabéns automático.

## Regras de operação
- não limpar `localStorage` de produção;
- não reinstalar PWA como atualização normal;
- não resetar Supabase;
- Sandbox não envia WhatsApp real nem sincroniza produção;
- mudanças usam branch curta + PR + merge + confirmação do Pages.

## Rollback
Baseline anterior: **v0.25.67** / merge `35d6841f7be7e1de09ab371f91dbc073ecbbccf6`.

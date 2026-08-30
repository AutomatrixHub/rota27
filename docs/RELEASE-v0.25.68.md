# RELEASE v0.25.68 — Recontato de cadastro

## Objetivo
Permitir novas solicitações controladas de data de nascimento para clientes que não responderam à primeira mensagem, sem transformar a rotina em disparo insistente.

## Política
- máximo: **3 solicitações bem-sucedidas por cliente**;
- intervalo mínimo: **7 dias** entre solicitações;
- falha técnica não consome tentativa;
- data de nascimento válida encerra imediatamente a rotina para o cliente;
- primeira tentativa exige evidência anterior de contato autorizado;
- cliente sem evidência anterior continua fora do disparo;
- cliente sem WhatsApp válido não recebe mensagem;
- reenvios são manuais pelo operador, sem cron automático.

## Compatibilidade histórica
Os `birthday_request_v1::<clientId>` já enviados antes desta release são reconhecidos como **tentativa 1**. Tentativas posteriores usam:
- tentativa 2: `birthday_request_v1::<clientId>::2`;
- tentativa 3: `birthday_request_v1::<clientId>::3`.

O histórico anterior não é reescrito.

## Interface
O card de campanha passa a apresentar:
- com WhatsApp sem aniversário;
- com histórico autorizado;
- já receberam uma ou mais solicitações;
- aguardando cooldown;
- limite de três atingido;
- prontos para envio;
- primeiras solicitações versus recontatos.

## Backend
### rota27-birthday-campaign v3
- agrupa o histórico por cliente;
- calcula `requestCount`, `lastSentAt`, `nextEligibleAt` e `nextAttempt`;
- impede envio antes de 7 dias;
- impede 4ª solicitação;
- mantém idempotência por tentativa;
- preserva o template Meta já existente.

### rota27-whatsapp-inbound v4
Ao receber uma data válida:
- salva `birthDate`;
- grava `relationshipMarketingOptIn=true`;
- grava `eventMarketingOptIn=true` por compatibilidade;
- usa a fonte `birth_date_reply_whatsapp_v02568`;
- mantém a confirmação de atualização ao cliente.

## Segurança operacional
- nenhum disparo foi executado para publicar esta release;
- nenhuma migration;
- nenhum reset;
- clientes sem evidência anterior de contato autorizado não são incluídos automaticamente;
- Sandbox permanece sem envio real.

## PWA
- `VERSION`: `0.25.68`;
- cache: `rota27-comandas-v0.25.68-r1`;
- shell declara `rota27-release-version=0.25.68`;
- roadmap loader: v0.25.68 / Ajuda 9.3.

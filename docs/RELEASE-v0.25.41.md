# Rota 27 v0.25.41 — Hotfix do template Meta de Eventos & Convites

## Motivo
Ao tocar em **Solicitar template** no módulo Eventos & Convites, a Meta retornava `Invalid parameter` e o template permanecia como não enviado.

## Causa
O corpo submetido à Meta terminava com uma variável (`{{4}}`) e tinha pouca separação textual entre parâmetros. As regras de templates do WhatsApp exigem contexto fixo suficiente e não aceitam variável no final do corpo.

## Correção
- `rota27-event-campaign` atualizado para `rota27-event-campaign-v2`;
- corpo do template `convite_evento_rota27_v1` reescrito com texto fixo antes, entre e depois das variáveis;
- removido parâmetro opcional desnecessário do payload de criação;
- exemplos das quatro variáveis mantidos e ampliados;
- erros da Meta agora incluem também `error_user_title`, `error_user_msg` e detalhes quando disponíveis;
- template continua categoria `MARKETING`, idioma `pt_BR` e só poderá ser usado após `APPROVED`;
- nenhuma mensagem é disparada durante a solicitação do template;
- regras de consentimento e proteção contra duplicidade permanecem inalteradas.

## Template
Nome: `convite_evento_rota27_v1`

Corpo solicitado:

`Olá, {{1}}! A Rota 27 Bodega preparou um convite especial para você: {{2}}. Data e horário: {{3}}. Detalhes: {{4}}. Esperamos você no Rota 27!`

Footer: `Convites enviados com sua autorização.`

## Produção
- App: `0.25.41`
- PWA cache: `rota27-comandas-v0.25.41-r1`
- Edge Function: `rota27-event-campaign`, versão de código `rota27-event-campaign-v2`

## Validação esperada
1. abrir Eventos & Convites;
2. abrir o evento;
3. tocar em **Solicitar template**;
4. a Meta deve aceitar a submissão e o status passar para `PENDING`/`Aguardando Meta`;
5. nenhum convite pode ser enviado enquanto o status não for `APPROVED`.

## Rollback
Retornar à v0.25.40 e à Edge Function `rota27-event-campaign-v1`.

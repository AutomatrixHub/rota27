# Ativação dos templates compactos do WhatsApp

Data: 22/08/2026

## Templates aprovados na Meta

Os cinco templates compactos foram criados e aprovados na mesma WABA da Rota 27:

- `atualizacao_comanda_rota27_curta_1` — APPROVED
- `atualizacao_comanda_rota27_curta_2` — APPROVED
- `atualizacao_comanda_rota27_curta_3` — APPROVED
- `atualizacao_comanda_rota27_curta_4` — APPROVED
- `atualizacao_comanda_rota27_curta_5` — APPROVED

Categoria: `UTILITY`  
Idioma: `pt_BR`

## Ativação

A Edge Function `rota27-whatsapp` passa a selecionar a família `curta_1` a `curta_5` conforme a quantidade de itens do bloco, mantendo:

- autenticação própria por `x-rota27-device-token`;
- normalização de telefone;
- consentimento por comanda;
- agrupamento em blocos de até cinco itens;
- idempotência por `eventId`/chunk;
- log em `whatsapp_message_log`;
- retry pelo frontend;
- tratamento de erro da Meta;
- compatibilidade com cliente e cópia para gerente.

Versão técnica da Edge Function: `rota27-whatsapp-v4-compact`.

## Gate final

Após o deploy, executar um envio real para cliente e gerente e confirmar:

1. mensagem compacta recebida;
2. template `curta_*` correto conforme a quantidade de itens;
3. total acumulado correto;
4. remoção/correção continua clara;
5. sem duplicidade para o gerente.

O merge desta branch em `main` deve ocorrer após esse teste real.

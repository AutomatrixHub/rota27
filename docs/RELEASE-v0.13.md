# Rota 27 v0.13 — WhatsApp estável

Data: 2026-08-19

## Destaques

A v0.13 consolida a integração de atualização de comandas por WhatsApp como funcionalidade estável do Rota 27.

## Entregas

- integração validada ponta a ponta: `Rota 27 → Supabase Edge Function → WhatsApp Cloud API`;
- consentimento explícito por comanda;
- agrupamento de lançamentos por aproximadamente 8 segundos;
- fila persistente local com retry;
- autenticação própria por `x-rota27-device-token`;
- logs e idempotência no Supabase;
- templates Utility aprovados em `pt_BR`;
- seleção automática de template para 1, 2, 3, 4 ou 5 itens;
- um produto por linha na mensagem do cliente;
- divisão automática em blocos para lotes com mais de 5 itens;
- total acumulado da comanda exibido em cada atualização;
- código de produção sincronizado em `supabase/functions/rota27-whatsapp/index.ts`.

## Templates em produção

- `atualizacao_comanda_rota27_v3_1`
- `atualizacao_comanda_rota27_v3_2`
- `atualizacao_comanda_rota27_v3_3`
- `atualizacao_comanda_rota27_v3_4`
- `atualizacao_comanda_rota27_v3`

## Edge Function

Versão lógica:

`rota27-whatsapp-v3-dynamic`

A função permanece com `verify_jwt=false` porque implementa autenticação própria pelo token do dispositivo.

## Validação realizada

Foram validados envios reais com diferentes quantidades de produtos, incluindo lotes de 2 e 4 itens, confirmando:

- escolha correta do template;
- formatação em linhas separadas;
- ausência de linhas fantasmas;
- total acumulado correto;
- recebimento efetivo no WhatsApp do cliente.

## Observações

Credenciais da Meta e Secrets do Supabase não fazem parte do repositório e devem permanecer fora do código-fonte.

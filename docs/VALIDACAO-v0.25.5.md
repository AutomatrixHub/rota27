# Validação — Rota 27 v0.25.5

## Gate visual
- cards do Mapa permanecem compactos;
- faixa preta removida;
- acento laranja fino;
- Balcão exibe cliente como título principal quando houver;
- Mesas/Parklet preservam identificador espacial;
- toque continua abrindo a mesma comanda.

## Gate WhatsApp
- destino fixo normalizado: `5527997769279`;
- envio usa a mesma configuração `waConfig` do aparelho;
- payload usa a Edge Function `rota27-whatsapp` existente;
- fila persistente e retry próprios;
- se gerente = número fixo, não cria segunda cópia;
- se cliente opt-in = número fixo, não cria terceira cópia.

## Gate técnico
- sem migration;
- sem nova tabela;
- sem novo evento de sync;
- sem alteração de Edge Function;
- sem `MutationObserver` novo;
- sem `setInterval` novo na camada v0.25.5.

## Autorização
Implementação e promoção direta para produção autorizadas pelo proprietário em 25/08/2026.

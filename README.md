# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção
- **Versão:** v0.25.66 — Elegibilidade de aniversário
- **Branch:** `main`
- **GitHub Pages:** `https://automatrixhub.github.io/rota27/`
- **Service Worker:** `rota27-comandas-v0.25.66-r1`
- **Baseline anterior:** v0.25.65

## v0.25.66 — Elegibilidade de aniversário

### Regra aprovada
- cliente que fornece **data de nascimento** recebe `relationshipMarketingOptIn=true` no mesmo fluxo de cadastro;
- o mesmo evento consolida `birthDate` + autorização, evitando divergência entre a data mostrada no aparelho e a data conhecida pelo backend;
- um opt-out explícito posterior, sem alteração da data de nascimento, continua sendo respeitado;
- mensagens operacionais de comanda permanecem em consentimento separado.

### Backfill de produção
Em 29/08/2026 foi executado backfill append-only para os **21 clientes** que já possuíam data de nascimento registrada. Para cada cliente foi criado novo `client_upsert` com:
- `birthDate` preservado;
- `relationshipMarketingOptIn=true`;
- compatibilidade `eventMarketingOptIn=true`;
- fonte `birth_date_provided_v02566`.

Nenhum histórico foi apagado ou reescrito.

### Aniversários próximos
O card agora deixa explícito:
- parabéns automático às **09:30** no dia do aniversário;
- **Autorizado • 09h30 no dia** quando houver data, WhatsApp válido e autorização;
- **Sem autorização** quando o relacionamento estiver desabilitado;
- **Sem WhatsApp** quando não houver telefone válido.

No aniversário do dia, os estados de entrega da v0.25.65 continuam disponíveis: Agendado 09:30, Aceito pela Meta, Enviado, Entregue, Lido ou Falhou.

### WhatsApp
- template: `aniversario_cliente_rota27_v1`;
- categoria: **MARKETING**;
- idioma: `pt_BR`;
- template confirmado como **APPROVED**;
- cron backend: `rota27-birthday-greeting-0930`, às 09:30 em `America/Sao_Paulo`;
- idempotência anual preservada.

## Correções anteriores preservadas
- v0.25.65: parabéns automático de aniversário;
- v0.25.64: estabilidade mobile, FAB + e fechamento de Consumo interno;
- v0.25.63: coerência operacional de turnos;
- planejamento original 0–10 permanece concluído.

## Atualização da PWA
Não limpar `localStorage`, não reinstalar a PWA e não apagar dados de produção. Abra online, aguarde a atualização, feche completamente e abra novamente.

## Documentação
- `docs/STATUS-PRODUCAO.md`
- `docs/RELEASE-v0.25.66.md`
- `docs/RELEASE-v0.25.65.md`

## Versão
Produção: **0.25.66**

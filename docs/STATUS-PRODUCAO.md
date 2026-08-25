# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.5 — Mapa Refinado & Cópia Fixa de WhatsApp**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.5-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.4 — Mapa Refinado**.

## v0.25.5 — Mapa
A release abandona a reprodução literal da faixa da Lista no card compacto.

Novo padrão:
- acento lateral laranja de 3 px, sem bloco preto;
- fundo/moldura/sombra coerentes com a Lista;
- Balcão: nome do cliente como título principal e `Balcão` como contexto;
- Mesas e Parklet: identificador espacial permanece prioritário;
- cards continuam compactos e clicáveis.

## v0.25.5 — cópia fixa de WhatsApp
Além do WhatsApp do gerente, cada lote de lançamentos também gera uma cópia para:

`+55 27 99776-9279` (`5527997769279`)

A configuração fica fixa na release via `meta[name=rota27-fixed-copy-whatsapp]` no `index.html`.

Proteções:
- fila persistente própria e retry exponencial;
- reutiliza o mesmo `rota27-whatsapp` e os mesmos templates;
- não duplica se o gerente estiver configurado com o mesmo número;
- não duplica se o cliente da própria comanda estiver usando esse número com opt-in;
- sem novo evento de sync ou tabela.

## Navegação e módulos preservados
- Comandas: Lista + Mapa;
- Cardápio;
- Painel;
- Histórico;
- Clientes & Fidelização;
- WhatsApp transacional/inbound;
- Estoque Essencial;
- Compras & Reposição;
- Inventário & Conferência;
- Custos & Margem.

## Backend e sincronização
A v0.25.5 não exige nova Edge Function, migration, tabela ou tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Estabilidade
A camada nova não adiciona `setInterval` nem `MutationObserver`. O Mapa é refinado após renders/eventos existentes e a cópia fixa usa timers apenas para batching/retry da própria fila.

## Ajuda
Ajuda **v5.6**, identificando Rota 27 v0.25.5 e explicando a cópia fixa.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.5` e sincronização saudável.

Ver `docs/RELEASE-v0.25.5.md`.

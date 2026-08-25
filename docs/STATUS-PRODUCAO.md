# Rota 27 — Status de produção

Última revisão: 25/08/2026

## Produção
- versão: **v0.25.6 — Paridade Visual Lista / Mapa**;
- branch: `main`;
- GitHub Pages: `https://automatrixhub.github.io/rota27/`;
- Service Worker: `rota27-comandas-v0.25.6-r1`;
- `rota27-whatsapp`: versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync`: versão 7 ACTIVE (`rota27-sync-v0.23.0`);
- `rota27-whatsapp-inbound`: versão 1 ACTIVE;
- `rota27-audit`: versão 1 ACTIVE, somente leitura.

Baseline de rollback: **v0.25.5 — Mapa Refinado & Cópia Fixa de WhatsApp**.

## v0.25.6 — paridade visual Lista / Mapa
A release elimina a linguagem visual paralela que vinha sendo aplicada ao Mapa e passa a reutilizar diretamente a estrutura da Lista.

### Estrutura reutilizada
- `command-card` / `v017-command-card`;
- `v017-command-primary`;
- `command-title`;
- `v017-command-info` / `v017-command-copy`;
- `v017-command-location`;
- `command-sub`;
- `money`;
- `command-bottom` / `meta`.

### Faixa oficial
O Mapa usa a mesma regra do tema da Lista:
- 6 px de largura;
- laranja nos 68% superiores;
- preto nos 32% inferiores;
- faixa de ponta a ponta.

### Hierarquia
- cliente como título quando houver;
- local/mesa como título quando não houver cliente;
- local em linha secundária forte quando cliente + local coexistem;
- itens + tempo de abertura abaixo;
- valor à direita;
- último lançamento no rodapé com divisor tracejado.

O botão interno `Abrir →` não é repetido no Mapa porque o card inteiro já é clicável.

## WhatsApp
Permanece a cópia fixa da v0.25.5 para:

`+55 27 99776-9279` (`5527997769279`)

A fila, retry e proteção contra duplicidade continuam inalterados.

## Backend e sincronização
A v0.25.6 não exige nova Edge Function, migration, tabela ou tipo de evento.

Permanece:
- `rota27-whatsapp` versão 23 ACTIVE (`rota27-whatsapp-v6-mini2`);
- `rota27-sync` versão 7 ACTIVE;
- `EDGE_VERSION = rota27-sync-v0.23.0`;
- migration `20260825012842_expand_rota27_sync_event_types_v023` aplicada.

## Estabilidade
A camada v0.25.6 não adiciona `setInterval` nem `MutationObserver`; atua após renders/eventos já existentes.

## Ajuda
Ajuda **v5.7**, identificando Rota 27 v0.25.6.

## Atualização da PWA
Não reinstalar e não limpar dados:
1. manter internet ativa;
2. abrir a PWA por 20–30 segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.25.6` e sincronização saudável.

Ver `docs/RELEASE-v0.25.6.md`.

# Rota 27 — Release v0.15.1

Data de produção: 21/08/2026

## Status

**Produção estável / baseline do piloto real.**

Versão publicada em `main`: `0.15.1`.

## Escopo consolidado

A v0.15.1 reúne a evolução multidispositivo da v0.15 com a hotfix validada no iPhone.

Principais capacidades:

- operação offline-first em múltiplos aparelhos;
- sincronização de comandas, histórico, cardápio e categorias;
- outbox local e retomada automática;
- preservação de conflitos;
- Painel operacional;
- consulta rápida **Itens da comanda**;
- proteção contra comanda duplicada;
- retomada de comanda ativa após recarga;
- nomes completos de mesas e parklets;
- envio de atualizações por WhatsApp com templates dinâmicos;
- fila de WhatsApp local por aparelho para evitar duplicidade;
- correção automática de endpoint legado de WhatsApp no iPhone;
- cancelamento seguro de comanda sem registrar venda/faturamento.

## Validação executada

A release foi validada em:

- dois desktops/navegadores como aparelhos lógicos separados;
- Android físico;
- laboratório público;
- iPhone/PWA instalada;
- teste de stress multidispositivo;
- operação offline + reconexão;
- fechamento de comanda;
- envio real pelo WhatsApp;
- cancelamento de comanda;
- persistência após recarga/reabertura.

## Correção do WhatsApp na v0.15.1

No iPhone foi detectado que a configuração local do WhatsApp podia apontar para a função `rota27-sync`. Nesse cenário, a resposta era `deviceId obrigatório.` porque a requisição chegava ao backend de sincronização.

A v0.15.1 detecta esse caso, troca somente o endpoint para `rota27-whatsapp`, preserva o token local e retoma a fila de WhatsApp. A tela de configuração também bloqueia novos endpoints incorretos.

## Cancelamento de comanda

O fluxo de edição passou a oferecer **Cancelar comanda** com confirmação explícita.

Comportamento:

- remove da lista de comandas abertas;
- não entra no Histórico de vendas;
- não entra no faturamento;
- remove envios pendentes de WhatsApp daquela comanda;
- propaga o cancelamento aos demais aparelhos quando houver sincronização.

## Atualização PWA

A PWA existente não deve ser reinstalada para atualizar.

Fluxo:

1. abrir conectado à internet;
2. aguardar alguns segundos;
3. fechar completamente;
4. abrir novamente;
5. confirmar `v0.15.1` e sincronização saudável.

O Service Worker usa `rota27-comandas-v0.15.1` e não limpa `localStorage`.

## Backends preservados

- `rota27-whatsapp`: sem alteração de secrets/templates durante a promoção;
- `rota27-sync`: sem alteração funcional na hotfix v0.15.1;
- autenticação por `x-rota27-device-token` preservada.

## Regra para o piloto real

Esta release deve permanecer congelada durante o turno. Novas publicações só são justificadas por problema crítico de integridade, cobrança ou indisponibilidade operacional.

Melhorias não críticas serão avaliadas com base em evidências do piloto em `docs/ROADMAP-POST-PILOTO.md`.

# Rota 27 Bodega — Comandas

Aplicativo mobile-first, offline-first e multidispositivo para controle rápido de comandas da **Rota 27 Bodega**.

## Produção

**Versão: v0.25.13 — Seleção de cliente na nova comanda**  
Branch: `main`  
GitHub Pages: `https://automatrixhub.github.io/rota27/`  
Service Worker: `rota27-comandas-v0.25.13-r1`

## Navegação
- **Comandas = atender**;
- **Cardápio = o que é vendido**;
- **Painel = administrar o negócio**;
- **Histórico = o que aconteceu**.

## v0.25.13 — Cliente cadastrado na nova comanda
Ao abrir uma nova comanda, o campo **Cliente** oferece uma lista pesquisável própria, compatível com iPhone/PWA.

Regras:
- mostra os clientes já cadastrados ao tocar no campo;
- pesquisa por nome e WhatsApp enquanto digita;
- ao selecionar, preenche nome e WhatsApp cadastrados;
- o consentimento para mensagens continua manual;
- ainda é possível informar livremente um cliente novo.

A implementação não depende apenas do `<datalist>` nativo, cujo comportamento é inconsistente no Safari/iOS.

## v0.25.12 preservado
Permanece ativo **A receber / Paga depois**, com pendências, recebimentos parciais ou totais e sincronização entre aparelhos.

## Backend
A v0.25.13 não altera Supabase, Edge Functions, migrations ou tipos de evento. O `rota27-sync` permanece versão 8 ACTIVE (`rota27-sync-v0.25.12`).

## Preservado
- rankings por ID/código com nome atual do produto;
- referência somente leitura de produtos ao editar categorias;
- paridade Lista + Mapa;
- cópia fixa de WhatsApp para `+55 27 99776-9279` (`5527997769279`);
- replay histórico hibernado.

## Ajuda
Ajuda **v6.4** identifica a release v0.25.13.

## Atualização da PWA
Não limpar dados nem reinstalar. Abra a PWA online, aguarde 20–30 segundos, feche completamente e abra novamente em cada aparelho.

## Documentos
- `docs/RELEASE-v0.25.13.md`
- `docs/PLANEJAMENTO-v0.25.13.md`
- `docs/STATUS-PRODUCAO.md`

Baseline de rollback do código: **v0.25.12**.

## Versão
Produção: **0.25.13**
